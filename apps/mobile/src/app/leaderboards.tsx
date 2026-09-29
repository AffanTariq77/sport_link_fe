import type { Schemas } from '@sportslink/api-client';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { api, authHeaders } from '../session';
import { failed, Message, run, styles as ui } from '../ui';

export default function Leaderboards() {
  const [sports, setSports] = useState<Schemas['Sport'][]>([]);
  const [sport, setSport] = useState<string | undefined>();
  const [rows, setRows] = useState<Schemas['Leaderboard'] | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void api.GET('/sports').then(({ data }) => {
      setSports(data ?? []);
      setSport((s) => s ?? data?.[0]?.slug);
    });
  }, []);
  const load = useCallback(
    () =>
      run(setBusy, setMessage, async () => {
        if (!sport) return;
        const { data, error } = await api.GET('/leaderboards/{sport}', { params: { path: { sport } }, headers: await authHeaders() });
        if (!data) return setMessage(error?.message ?? failed);
        setMessage('');
        setRows(data);
      }),
    [sport],
  );
  useEffect(() => {
    void load();
  }, [load]);

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={rows ?? []}
      keyExtractor={(r) => r.id}
      refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}
      ListHeaderComponent={
        <View style={{ gap: 10 }}>
          <View style={ui.row}>
            {sports.map((s) => (
              <Pressable key={s.slug} style={[ui.chip, sport === s.slug && ui.chipOn]} onPress={() => setSport(s.slug)} accessibilityRole="button">
                <Text style={[ui.chipText, sport === s.slug && ui.chipTextOn]}>{s.name}</Text>
              </Pressable>
            ))}
          </View>
          <Message>{message}</Message>
          {rows?.length === 0 && <Text>No settled ratings yet. New players appear after a few rated matches.</Text>}
        </View>
      }
      renderItem={({ item: r }) => (
        <Pressable style={styles.card} onPress={() => router.push(`/players/${r.id}`)} accessibilityRole="button">
          <Text style={styles.rank}>{r.rank}</Text>
          <View style={{ flex: 1 }}>
            <Text style={ui.label}>{r.name}</Text>
            {r.city && <Text>{r.city}</Text>}
          </View>
          <Text>
            {r.rating} · {r.tier}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  rank: { width: 24, textAlign: 'right', fontWeight: '600' },
});
