import { formatDay, formatMoney, formatTime, type Schemas } from '@sportslink/api-client';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, authHeaders } from '../../session';
import { Button, card, colors, failed, Message, run, styles as ui } from '../../ui';

type Match = Schemas['MatchSummary'];

export default function Matches() {
  const [sports, setSports] = useState<Schemas['Sport'][]>([]);
  const [sport, setSport] = useState<string | undefined>();
  const [open, setOpen] = useState<Match[]>([]);
  const [mine, setMine] = useState<Match[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    (s = sport) =>
      run(setBusy, setMessage, async () => {
        const headers = await authHeaders();
        const [o, m, sp] = await Promise.all([
          api.GET('/matches', { params: { query: { sport: s } }, headers }),
          api.GET('/matches/mine', { headers }),
          api.GET('/sports'),
        ]);
        if (!o.data) return setMessage(o.error?.message ?? failed);
        setOpen(o.data);
        setMine((m.data ?? []).filter((x) => x.status !== 'cancelled'));
        setSports(sp.data ?? []);
      }),
    [sport],
  );
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const card = (m: Match) => {
    const [weekday, day, month] = formatDay(m.startAt, m.timezone).split(' ');
    const left = m.slotsTotal - m.slotsFilled;
    return (
      <Pressable key={m.id} style={({ pressed }) => [styles.card, pressed && ui.pressed]} onPress={() => router.push(`/matches/${m.id}`)} accessibilityRole="button">
        <View style={styles.date}>
          <Text style={styles.weekday}>{weekday}</Text>
          <Text style={styles.day}>{day}</Text>
          <Text style={styles.month}>{month}</Text>
          <Text style={styles.time}>{formatTime(m.startAt, m.timezone)}</Text>
        </View>
        <View style={styles.body}>
          <View style={styles.tags}>
            <Text style={styles.sport}>{m.sport}</Text>
            {m.filters.gender === 'female' && <Text style={styles.tag}>Women only</Text>}
            {!m.listed && <Text style={styles.tag}>Unlisted venue</Text>}
          </View>
          <Text style={styles.name}>{m.venue.name}</Text>
          <Text style={styles.muted}>
            {m.venue.detail} · host {m.host.name ?? 'Player'}
          </Text>
          <View style={styles.slots}>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(m.slotsFilled / m.slotsTotal) * 100}%` }]} />
            </View>
            <Text style={styles.left}>{left > 0 ? `${left} left` : 'Full'}</Text>
          </View>
          {m.pricePerPlayer !== null && m.currency && <Text style={styles.price}>{formatMoney(m.pricePerPlayer, m.currency)} each</Text>}
        </View>
      </Pressable>
    );
  };
  const chip = (label: string, value: string | undefined) => (
    <Pressable
      key={label}
      onPress={() => (setSport(value), load(value))}
      style={[ui.chip, sport === value && ui.chipOn]}
      accessibilityRole="button"
    >
      <Text style={[ui.chipText, sport === value && ui.chipTextOn]}>{label}</Text>
    </Pressable>
  );

  return (
    <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={busy} onRefresh={() => load()} />}>
      <Button title="Create a match" onPress={() => router.push('/matches/new')} />
      <Message>{message}</Message>
      {mine.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={styles.section}>Your matches</Text>
          {mine.map(card)}
        </View>
      )}
      <Text style={styles.section}>Open matches</Text>
      <View style={ui.row}>{[chip('All sports', undefined), ...sports.map((s) => chip(s.name, s.slug))]}</View>
      {open.length === 0 && <Text>No open matches right now. Create one and invite players.</Text>}
      {open.map(card)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 12 },
  card: { ...card, flexDirection: 'row', overflow: 'hidden' },
  date: { width: 74, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  weekday: { color: colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  day: { color: '#fff', fontSize: 28, fontWeight: '900', lineHeight: 32 },
  month: { color: '#aab4cc', fontSize: 11, textTransform: 'uppercase' },
  time: { color: '#fff', fontSize: 14, fontWeight: '800', marginTop: 4 },
  body: { flex: 1, padding: 12, gap: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  sport: { backgroundColor: colors.accent, color: colors.navy, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
  tag: { backgroundColor: colors.surface, color: colors.text, fontSize: 11, fontWeight: '700', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
  name: { fontSize: 16, fontWeight: '800', color: colors.text },
  muted: { color: colors.muted, fontSize: 13 },
  slots: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.surface, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3, backgroundColor: colors.accent },
  left: { fontSize: 12, fontWeight: '800', color: colors.text },
  price: { fontSize: 14, fontWeight: '800', color: colors.text },
  section: { fontSize: 12, fontWeight: '800', color: colors.muted, letterSpacing: 1, textTransform: 'uppercase' },
});
