import { formatDay, formatMoney, formatTime, paymentMethodName, type Schemas } from '@sportslink/api-client';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { myStatusText, playerStatusText, UNLISTED_WARNING } from '../../matchText';
import { MatchResult } from '../../screens/MatchResult';
import { api, authHeaders, currentUser } from '../../session';
import { Button, failed, Field, Message, run, styles as ui, TextButton, card, colors } from '../../ui';

type Method = 'jazzcash' | 'easypaisa' | 'bank_transfer';

export default function MatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [m, setMatch] = useState<Schemas['MatchDetail'] | null>(null);
  const [pay, setPay] = useState<Schemas['MatchPayInfo'] | null>(null);
  const [method, setMethod] = useState<Method | null>(null);
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [me, setMe] = useState<string | null>(null);
  const [myTeams, setMyTeams] = useState<Schemas['MyTeam'][]>([]);

  const load = useCallback(
    () =>
      run(setBusy, setMessage, async () => {
        const headers = await authHeaders();
        const { data, error } = await api.GET('/matches/{id}', { params: { path: { id } }, headers });
        if (!data) return setMessage(error?.message ?? failed);
        setMatch(data);
        if (data.teams && !data.teams.away) setMyTeams((await api.GET('/teams/mine', { headers })).data ?? []);
        if (data.listed && data.me && ['approved', 'confirmed'].includes(data.me.status)) {
          const p = (await api.GET('/matches/{id}/pay', { params: { path: { id } }, headers })).data ?? null;
          setPay(p);
          setMethod((x) => x ?? ((p?.accounts[0]?.method as Method | undefined) ?? null));
        }
      }),
    [id],
  );
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  useEffect(() => {
    currentUser()
      .then((u) => setMe(u?.id ?? null))
      .catch(() => undefined);
  }, []);

  const act = (task: () => Promise<{ error?: { message?: string } }>) =>
    run(setBusy, setMessage, async () => {
      const { error } = await task();
      if (error) return setMessage(error.message ?? failed);
      await load();
    });
  const path = { params: { path: { id } } };

  const join = async () => {
    const send = (accepted: boolean) =>
      act(async () => api.POST('/matches/{id}/join', { ...path, headers: await authHeaders(), body: { acceptedUnlistedWarning: accepted } }));
    // Unlisted venues show the warning every time before joining (Foundation 4.3).
    if (m?.listed) return send(false);
    Alert.alert('This venue is not listed on SportsLink', UNLISTED_WARNING, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'I understand', onPress: () => void send(true) },
    ]);
  };

  if (!m) return <View style={styles.page}>{busy ? <Text>Loading…</Text> : <Message>{message}</Message>}</View>;
  const tz = m.timezone;
  const open = m.status === 'open' || m.status === 'full';

  return (
    <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />} keyboardShouldPersistTaps="handled">
      <Text style={ui.heading}>
        {m.sport} · {formatDay(m.startAt, tz)}, {formatTime(m.startAt, tz)} to {formatTime(m.endAt, tz)}
      </Text>
      <Text>
        {m.venue.name}, {m.venue.detail}
        {!m.listed ? ' · not listed on SportsLink' : ''}
      </Text>
      <Text>
        {m.slotsFilled} of {m.slotsTotal} players · host {m.host.name ?? 'Player'} · {m.status}
        {m.pricePerPlayer !== null && m.currency ? ` · ${formatMoney(m.pricePerPlayer, m.currency)} per player` : ''}
      </Text>
      {m.teams && (
        <Text style={ui.label}>
          Team match: {m.teams.home?.name} v{' '}
          {m.teams.away?.name ?? (m.teams.challenged ? `${m.teams.challenged.name} (not accepted yet)` : 'any team (open challenge)')}
        </Text>
      )}
      <Message>{message}</Message>
      {open &&
        m.teams &&
        !m.teams.away &&
        myTeams
          .filter(
            (t) =>
              t.status === 'active' &&
              t.role !== 'member' &&
              t.sport === m.sport &&
              t.id !== m.teams!.home?.id &&
              (!m.teams!.challenged || m.teams!.challenged.id === t.id),
          )
          .map((t) => (
            <Button
              key={t.id}
              title={`Accept the challenge as ${t.name}`}
              busy={busy}
              onPress={() => act(async () => api.POST('/matches/{id}/challenge', { ...path, headers: await authHeaders(), body: { teamId: t.id } }))}
            />
          ))}

      {m.canJoin && <Button title="Ask to join" onPress={join} busy={busy} />}
      {(m.isHost || (m.me && ['approved', 'confirmed'].includes(m.me.status))) && (
        <TextButton
          title="Open the match chat"
          onPress={() =>
            run(setBusy, setMessage, async () => {
              const { data } = await api.POST('/conversations/match/{matchId}', {
                params: { path: { matchId: id } },
                headers: await authHeaders(),
              });
              if (data) router.push(`/chats/${data.id}`);
            })
          }
        />
      )}
      {m.me && <Text style={ui.label}>{myStatusText[m.me.status] ?? m.me.status}</Text>}
      {me && (m.isHost || m.me?.status === 'confirmed') && <MatchResult id={id} tz={tz} me={me} />}

      {pay && m.me?.status === 'approved' && pay.shareStatus !== 'submitted' && (
        <View style={styles.box}>
          <Text style={ui.label}>Pay your share: {pay.amount !== null ? formatMoney(pay.amount, pay.currency) : ''}</Text>
          {pay.shareStatus === 'rejected' && <Text>The venue could not find your last payment. Check the ID and try again.</Text>}
          {pay.accounts.map((a) => (
            <Pressable
              key={a.method}
              onPress={() => setMethod(a.method as Method)}
              style={[styles.option, method === a.method && styles.optionOn]}
              accessibilityRole="radio"
              accessibilityState={{ checked: method === a.method }}
            >
              <Text style={ui.label}>{paymentMethodName[a.method]}</Text>
              <Text selectable>{a.accountTitle}</Text>
              {a.bankName && <Text selectable>{a.bankName}</Text>}
              {a.accountNumber && <Text selectable>{a.accountNumber}</Text>}
            </Pressable>
          ))}
          <Field label="Transaction ID from your receipt" value={reference} onChangeText={setReference} autoCapitalize="characters" />
          <Button
            title="I have paid"
            busy={busy || !method}
            onPress={() =>
              act(async () =>
                api.POST('/matches/{id}/pay', { ...path, headers: await authHeaders(), body: { method: method!, txnReference: reference } }),
              )
            }
          />
        </View>
      )}
      {pay?.shareStatus === 'submitted' && <Text>The venue is checking your payment.</Text>}
      {m.me && open && ['requested', 'approved', 'confirmed', 'waitlisted'].includes(m.me.status) && (
        <TextButton title="Leave this match" onPress={() => act(async () => api.POST('/matches/{id}/leave', { ...path, headers: await authHeaders() }))} />
      )}

      <Text style={ui.label}>{m.isHost ? 'Players and requests' : 'Players'}</Text>
      {m.players.length === 0 && <Text>No one has joined yet.</Text>}
      {m.players.map((p) => (
        <View key={p.userId} style={styles.box}>
          <Text onPress={() => router.push(`/players/${p.userId}`)} accessibilityRole="link">
            <Text style={{ textDecorationLine: 'underline' }}>{p.name ?? 'Player'}</Text> · {playerStatusText[p.status] ?? p.status}
            {m.isHost && p.shareStatus ? ` · payment ${p.shareStatus}` : ''}
          </Text>
          {m.isHost && open && ['requested', 'waitlisted'].includes(p.status) && (
            <View style={{ flexDirection: 'row', gap: 16 }}>
              {(['approve', 'decline'] as const).map((decision) => (
                <TextButton
                  key={decision}
                  title={decision === 'approve' ? 'Approve' : 'Decline'}
                  busy={busy}
                  onPress={() =>
                    act(async () =>
                      api.POST('/matches/{id}/requests/{userId}/{decision}', {
                        params: { path: { id, userId: p.userId, decision } },
                        headers: await authHeaders(),
                      }),
                    )
                  }
                />
              ))}
            </View>
          )}
          {m.isHost && open && ['approved', 'confirmed'].includes(p.status) && (
            <TextButton
              title="Remove"
              busy={busy}
              onPress={() =>
                act(async () =>
                  api.POST('/matches/{id}/players/{userId}/remove', { params: { path: { id, userId: p.userId } }, headers: await authHeaders() }),
                )
              }
            />
          )}
        </View>
      ))}
      {m.isHost && open && (
        <TextButton title="Cancel match" onPress={() => act(async () => api.POST('/matches/{id}/cancel', { ...path, headers: await authHeaders() }))} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 12 },
  box: { ...card, padding: 12, gap: 6 },
  option: { borderWidth: 1, borderColor: colors.muted, borderRadius: 6, padding: 10, gap: 2 },
  optionOn: { borderColor: colors.navy, borderWidth: 2 },
});
