import { formatMoney, type Schemas } from '@sportslink/api-client';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { api, API_URL } from '../../session';
import { failed, Message, run, styles as ui } from '../../ui';

export default function Venues() {
  const [sports, setSports] = useState<Schemas['Sport'][]>([]);
  const [sport, setSport] = useState<string | undefined>();
  const [venues, setVenues] = useState<Schemas['VenueSummary'][] | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () =>
      run(setBusy, setMessage, async () => {
        const { data, error } = await api.GET('/venues', { params: { query: { sport } } });
        if (!data) return setMessage(error?.message ?? failed);
        setVenues(data);
      }),
    [sport],
  );

  useEffect(() => {
    api.GET('/sports').then(({ data }) => data && setSports(data), () => undefined);
  }, []);
  useEffect(() => void load(), [load]);

  const chip = (label: string, value: string | undefined) => (
    <Pressable
      key={label}
      onPress={() => setSport(value)}
      style={[ui.chip, sport === value && ui.chipOn]}
      accessibilityRole="button"
      accessibilityState={{ selected: sport === value }}
    >
      <Text style={[ui.chipText, sport === value && ui.chipTextOn]}>{label}</Text>
    </Pressable>
  );

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={venues ?? []}
      keyExtractor={(v) => v.id}
      refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}
      ListHeaderComponent={
        <View style={{ gap: 12 }}>
          <View style={ui.row}>{[chip('All sports', undefined), ...sports.map((s) => chip(s.name, s.slug))]}</View>
          <Message>{message}</Message>
          {venues?.length === 0 && <Text>No venues for this sport yet.</Text>}
        </View>
      }
      renderItem={({ item: v }) => (
        <Pressable style={styles.card} onPress={() => router.push(`/venues/${v.id}`)} accessibilityRole="button">
          {v.photos[0] && <Image source={{ uri: API_URL + v.photos[0] }} style={styles.cover} accessibilityIgnoresInvertColors />}
          <Text style={styles.name}>{v.name}</Text>
          <Text>
            {v.city} · {v.sports.join(', ')} · {v.courtCount} {v.courtCount === 1 ? 'court' : 'courts'}
          </Text>
          {v.fromPricePerHour !== null && <Text>From {formatMoney(v.fromPricePerHour, v.currency)} an hour</Text>}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  card: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 16, gap: 4 },
  name: { fontSize: 16, fontWeight: '600' },
  cover: { width: '100%', aspectRatio: 16 / 9, borderRadius: 6, marginBottom: 4, backgroundColor: '#eee' },
});
