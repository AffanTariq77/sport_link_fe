import { formatDay, formatMoney, formatTime, type Schemas } from '@sportslink/api-client';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, authHeaders } from '../../session';
import { Button, failed, Message, run, styles as ui } from '../../ui';

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

  const card = (m: Match) => (
    <Pressable key={m.id} style={styles.card} onPress={() => router.push(`/matches/${m.id}`)} accessibilityRole="button">
      <Text style={styles.name}>
        {m.sport} · {formatDay(m.startAt, m.timezone)}, {formatTime(m.startAt, m.timezone)}
      </Text>
      <Text>
        {m.venue.name}, {m.venue.detail}
        {!m.listed ? ' · unlisted venue' : ''}
      </Text>
      <Text>
        {m.slotsFilled} of {m.slotsTotal} players · host {m.host.name ?? 'Player'}
        {m.pricePerPlayer !== null && m.currency ? ` · ${formatMoney(m.pricePerPlayer, m.currency)} each` : ''}
        {m.filters.gender === 'female' ? ' · women only' : ''}
      </Text>
    </Pressable>
  );
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
          <Text style={ui.label}>Your matches</Text>
          {mine.map(card)}
        </View>
      )}
      <Text style={ui.label}>Open matches</Text>
      <View style={ui.row}>{[chip('All sports', undefined), ...sports.map((s) => chip(s.name, s.slug))]}</View>
      {open.length === 0 && <Text>No open matches right now. Create one and invite players.</Text>}
      {open.map(card)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 12 },
  card: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 14, gap: 2 },
  name: { fontSize: 16, fontWeight: '600' },
});
