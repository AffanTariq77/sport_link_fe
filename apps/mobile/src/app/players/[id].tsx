import type { Schemas } from '@sportslink/api-client';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { tagName } from '../../screens/MatchResult';
import { api, authHeaders } from '../../session';
import { failed, Message, run, styles as ui } from '../../ui';

export default function Player() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [p, setPlayer] = useState<Schemas['PlayerProfile'] | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      run(setBusy, setMessage, async () => {
        const { data, error } = await api.GET('/players/{id}', { params: { path: { id } }, headers: await authHeaders() });
        if (!data) return setMessage(error?.message ?? failed);
        setPlayer(data);
      }),
    [id],
  );
  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}>
      <Stack.Screen options={{ title: p?.name ?? 'Player' }} />
      <Message>{message}</Message>
      {p && (
        <>
          <Text>
            {[p.city, p.verified ? 'ID verified' : null, `${p.matchesPlayed} ${p.matchesPlayed === 1 ? 'match' : 'matches'} played`]
              .filter(Boolean)
              .join(' · ')}
          </Text>
          <Text style={ui.label}>Skill ratings</Text>
          {p.ratings.length === 0 && <Text>No rated matches yet.</Text>}
          {p.ratings.map((r) => (
            <View key={r.slug} style={styles.card}>
              <Text style={ui.label}>{r.sport}</Text>
              <Text>
                {r.rating} · {r.provisional ? 'Provisional' : r.tier} · {r.games} {r.games === 1 ? 'game' : 'games'}
              </Text>
            </View>
          ))}
          <Text style={ui.label}>Behaviour</Text>
          {p.behaviour.count === 0 ? (
            <Text>No reviews yet.</Text>
          ) : (
            <>
              <Text>
                {p.behaviour.average} out of 5 from {p.behaviour.count} {p.behaviour.count === 1 ? 'review' : 'reviews'}
              </Text>
              <View style={ui.row}>
                {p.behaviour.topTags.map((t) => (
                  <Text key={t.tag} style={ui.chip}>
                    {tagName(t.tag)} ({t.count})
                  </Text>
                ))}
              </View>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 10 },
  card: { flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
});
