import { formatDay, type Schemas } from '@sportslink/api-client';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, authHeaders, currentUser } from '../../session';
import { Button, failed, Field, Message, run, styles as ui, TextButton, card } from '../../ui';
import { roleName } from '../../teamText';

const resultText = { won: 'Won', lost: 'Lost', draw: 'Draw' } as const;

export default function TeamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [t, setTeam] = useState<Schemas['Team'] | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const path = { params: { path: { id } } };

  const load = useCallback(
    () =>
      run(setBusy, setMessage, async () => {
        const { data, error } = await api.GET('/teams/{id}', { ...path, headers: await authHeaders() });
        if (!data) return setMessage(error?.message ?? failed);
        setTeam(data);
      }),
    [id],
  );
  useEffect(() => {
    void load();
    currentUser()
      .then((u) => setMe(u?.id ?? null))
      .catch(() => undefined);
  }, [load]);
  const act = (task: () => Promise<{ error?: { message?: string } }>, done: string) =>
    run(setBusy, setMessage, async () => {
      const { error } = await task();
      if (error) return setMessage(error.message ?? failed);
      setMessage(done);
      await load();
    });

  if (!t) return <View style={styles.page}>{busy ? <Text>Loading…</Text> : <Message>{message}</Message>}</View>;
  const leader = t.myRole === 'captain' || t.myRole === 'vice_captain';
  return (
    <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: t.name }} />
      <Text>
        {t.sport}
        {t.city ? ` · ${t.city}` : ''}
        {t.rating ? ` · rating ${t.rating.rating} ${t.rating.provisional ? '(provisional)' : `· ${t.rating.tier}`}` : ''}
      </Text>
      <Message>{message}</Message>
      {t.invited && (
        <View style={styles.box}>
          <Text style={ui.label}>You are invited to join {t.name}.</Text>
          <Button
            title="Join the team"
            busy={busy}
            onPress={() => act(async () => api.POST('/teams/{id}/invites/respond', { ...path, headers: await authHeaders(), body: { accept: true } }), 'You joined the team.')}
          />
          <TextButton
            title="Decline"
            onPress={() => act(async () => api.POST('/teams/{id}/invites/respond', { ...path, headers: await authHeaders(), body: { accept: false } }), 'Invite declined.')}
          />
        </View>
      )}
      {t.myRole && (
        <TextButton
          title="Open the team chat"
          onPress={() =>
            run(setBusy, setMessage, async () => {
              const { data } = await api.POST('/conversations/team/{teamId}', { params: { path: { teamId: id } }, headers: await authHeaders() });
              if (data) router.push(`/chats/${data.id}`);
            })
          }
        />
      )}

      <Text style={ui.label}>Players</Text>
      {t.members.map((m) => (
        <View key={m.id} style={styles.box}>
          <Text onPress={() => router.push(`/players/${m.id}`)} accessibilityRole="link">
            <Text style={{ textDecorationLine: 'underline' }}>{m.name}</Text> · {m.status === 'invited' ? 'Invited' : roleName[m.role]}
            {m.id === me ? ' (you)' : ''}
          </Text>
          {t.myRole === 'captain' && m.id !== me && m.status === 'active' && (
            <View style={ui.row}>
              {(['member', 'vice_captain', 'captain'] as const)
                .filter((r) => r !== m.role)
                .map((role) => (
                  <TextButton
                    key={role}
                    title={role === 'captain' ? 'Make captain' : `Make ${roleName[role].toLowerCase()}`}
                    busy={busy}
                    onPress={() =>
                      act(
                        async () =>
                          api.POST('/teams/{id}/members/{userId}/role', { params: { path: { id, userId: m.id } }, headers: await authHeaders(), body: { role } }),
                        'Role changed.',
                      )
                    }
                  />
                ))}
            </View>
          )}
          {leader && m.id !== me && m.role !== 'captain' && (
            <TextButton
              title={m.status === 'invited' ? 'Cancel invite' : 'Remove'}
              busy={busy}
              onPress={() =>
                act(async () => api.POST('/teams/{id}/members/{userId}/remove', { params: { path: { id, userId: m.id } }, headers: await authHeaders() }), 'Removed.')
              }
            />
          )}
        </View>
      ))}

      {leader && (
        <View style={styles.box}>
          <Text style={ui.label}>Invite a player</Text>
          <Field label="Their SportsLink phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="0300 1234567" />
          <Button
            title="Send invite"
            busy={busy || !phone.trim()}
            onPress={() =>
              act(async () => {
                const r = await api.POST('/teams/{id}/invites', { ...path, headers: await authHeaders(), body: { phone } });
                if (!r.error) setPhone('');
                return r;
              }, 'Invite sent. They join once they accept.')
            }
          />
        </View>
      )}

      <Text style={ui.label}>Team matches</Text>
      {t.matches.length === 0 && <Text>No team matches yet.</Text>}
      {t.matches.map((m) => (
        <TextButton
          key={m.id}
          title={`${formatDay(m.startAt, 'Asia/Karachi')} · ${m.opponent ? `v ${m.opponent}` : 'waiting for an opponent'} · ${m.result ? resultText[m.result] : m.status.replace('_', ' ')}${m.score ? ` · ${m.score}` : ''}`}
          onPress={() => router.push(`/matches/${m.id}`)}
        />
      ))}
      {t.myRole && (
        <TextButton
          title="Leave the team"
          onPress={() =>
            run(setBusy, setMessage, async () => {
              const { error } = await api.POST('/teams/{id}/leave', { ...path, headers: await authHeaders() });
              if (error) return setMessage(error.message ?? failed);
              router.back();
            })
          }
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 10 },
  box: { ...card, padding: 12, gap: 6 },
});
