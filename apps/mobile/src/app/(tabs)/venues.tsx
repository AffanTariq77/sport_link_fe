import { formatMoney, type Schemas } from '@sportslink/api-client';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { api, API_URL } from '../../session';
import { failed, Message, run, styles as ui, card, colors } from '../../ui';

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
        <Pressable style={({ pressed }) => [styles.card, pressed && ui.pressed]} onPress={() => router.push(`/venues/${v.id}`)} accessibilityRole="button">
          <View style={styles.cover}>
            {v.photos[0] ? (
              <Image source={{ uri: API_URL + v.photos[0] }} style={StyleSheet.absoluteFill} accessibilityIgnoresInvertColors />
            ) : (
              <Text style={styles.initial}>{v.name.slice(0, 1)}</Text>
            )}
            {v.fromPricePerHour !== null && <Text style={styles.price}>From {formatMoney(v.fromPricePerHour, v.currency)}/hr</Text>}
          </View>
          <View style={styles.body}>
            <Text style={styles.name}>{v.name}</Text>
            <Text style={styles.muted}>
              {v.city} · {v.courtCount} {v.courtCount === 1 ? 'court' : 'courts'}
            </Text>
            <View style={ui.row}>
              {v.sports.map((sp) => (
                <Text key={sp} style={styles.sport}>
                  {sp}
                </Text>
              ))}
            </View>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  card: { ...card, overflow: 'hidden' },
  cover: { width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  initial: { color: colors.accent, fontSize: 48, fontWeight: '900' },
  price: { position: 'absolute', left: 12, bottom: 12, backgroundColor: colors.accent, color: colors.navy, fontWeight: '900', fontSize: 13, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, overflow: 'hidden' },
  body: { padding: 14, gap: 6 },
  name: { fontSize: 18, fontWeight: '800', color: colors.text },
  muted: { color: colors.muted },
  sport: { backgroundColor: colors.surface, color: colors.text, fontSize: 12, fontWeight: '700', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, overflow: 'hidden' },
});
