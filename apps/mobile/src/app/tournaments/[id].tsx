import { formatDay, formatMoney, paymentMethodName, type Schemas } from '@sportslink/api-client';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, authHeaders } from '../../session';
import { entryText, formatName } from '../../tournamentText';
import { Button, failed, Field, Message, run, styles as ui, TextButton, card } from '../../ui';

const tz = 'Asia/Karachi';
type Method = 'jazzcash' | 'easypaisa' | 'bank_transfer';

export default function TournamentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [t, setT] = useState<Schemas['Tournament'] | null>(null);
  const [teams, setTeams] = useState<Schemas['MyTeam'][]>([]);
  const [method, setMethod] = useState<Method>('jazzcash');
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const path = { params: { path: { id } } };

  const load = useCallback(
    () =>
      run(setBusy, setMessage, async () => {
        const headers = await authHeaders();
        const { data, error } = await api.GET('/tournaments/{id}', { ...path, headers });
        if (!data) return setMessage(error?.message ?? failed);
        setT(data);
        if (data.teamEntry)
          setTeams(((await api.GET('/teams/mine', { headers })).data ?? []).filter((x) => x.status === 'active' && x.role !== 'member' && x.sport === data.sport));
      }),
    [id],
  );
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  const act = (task: () => Promise<{ error?: { message?: string } }>, done: string) =>
    run(setBusy, setMessage, async () => {
      const { error } = await task();
      if (error) return setMessage(error.message ?? failed);
      setMessage(done);
      await load();
    });

  if (!t) return <View style={styles.page}>{busy ? <Text>Loading…</Text> : <Message>{message}</Message>}</View>;
  const enter = (teamId?: string) =>
    act(async () => api.POST('/tournaments/{id}/entries', { ...path, headers: await authHeaders(), body: { teamId } }), 'You are entered.');
  return (
    <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: t.name }} />
      <Text>
        {t.sport} · {formatName[t.format]} · {t.teamEntry ? 'team entry' : 'individual'} · {t.status.replace('_', ' ')}
      </Text>
      <Text>
        {t.venue} · {formatDay(t.startsAt, tz)} to {formatDay(t.endsAt, tz)} · entries close {formatDay(t.registrationDeadline, tz)}
      </Text>
      <Text>
        Entry {t.entryFee ? formatMoney(t.entryFee, t.currency) : 'free'}
        {t.prize ? ` · prize: ${t.prize}` : ''}
      </Text>
      <Message>{message}</Message>

      {t.registrationOpen && t.mine.length === 0 && !t.teamEntry && <Button title="Enter" onPress={() => enter()} busy={busy} />}
      {t.registrationOpen && t.mine.length === 0 && t.teamEntry && teams.map((x) => <Button key={x.id} title={`Enter ${x.name}`} onPress={() => enter(x.id)} busy={busy} />)}
      {t.registrationOpen && t.mine.length === 0 && t.teamEntry && teams.length === 0 && <Text>Team captains enter this tournament.</Text>}

      {t.mine.map((m) => (
        <View key={m.id} style={styles.box}>
          <Text style={ui.label}>
            {m.name}: {entryText[m.status] ?? m.status}
          </Text>
          {(m.status === 'pending_payment' || m.status === 'rejected') && (
            <>
              <Text selectable>
                Pay {formatMoney(t.entryFee, t.currency)} to: {t.payTo}
              </Text>
              <View style={ui.row}>
                {(['jazzcash', 'easypaisa', 'bank_transfer'] as const).map((x) => (
                  <Pressable key={x} style={[ui.chip, method === x && ui.chipOn]} onPress={() => setMethod(x)} accessibilityRole="radio" accessibilityState={{ checked: method === x }}>
                    <Text style={[ui.chipText, method === x && ui.chipTextOn]}>{paymentMethodName[x]}</Text>
                  </Pressable>
                ))}
              </View>
              <Field label="Transaction ID from your receipt" value={reference} onChangeText={setReference} autoCapitalize="characters" />
              <Button
                title="I have paid"
                busy={busy}
                onPress={() =>
                  act(
                    async () =>
                      api.POST('/tournaments/{id}/entries/{entryId}/pay', { params: { path: { id, entryId: m.id } }, headers: await authHeaders(), body: { method, txnReference: reference } }),
                    'Thanks. SportsLink will check your payment.',
                  )
                }
              />
            </>
          )}
          {t.registrationOpen && (
            <TextButton
              title="Withdraw"
              onPress={() => act(async () => api.POST('/tournaments/{id}/entries/{entryId}/withdraw', { params: { path: { id, entryId: m.id } }, headers: await authHeaders() }), 'Entry withdrawn.')}
            />
          )}
        </View>
      ))}

      {t.tables.map((table) => (
        <View key={table.group ?? 0} style={styles.box}>
          <Text style={ui.label}>{table.group ? `Group ${table.group}` : 'Table'}</Text>
          {table.rows.map((r) => (
            <Text key={r.entryId}>
              {r.name}: {r.points} pts ({r.won}-{r.drawn}-{r.lost})
            </Text>
          ))}
        </View>
      ))}
      {t.fixtures.length > 0 && <Text style={ui.label}>Fixtures</Text>}
      {t.fixtures
        .filter((f) => f.status !== 'bye')
        .map((f) => (
          <Text key={f.id}>
            {f.stage} round {f.round}
            {f.groupNo ? ` · group ${f.groupNo}` : ''}: {f.a ?? 'to be decided'} v {f.b ?? 'to be decided'} ·{' '}
            {f.status === 'completed' ? `${f.scoreA}-${f.scoreB}` : f.status === 'walkover' ? `walkover to ${f.winner}` : 'to play'}
          </Text>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 10 },
  box: { ...card, padding: 12, gap: 6 },
});
