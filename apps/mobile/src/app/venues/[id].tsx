import {
  describePolicy,
  formatDay,
  formatMoney,
  formatTime,
  nextDates,
  paymentMethodName,
  type Schemas,
} from '@sportslink/api-client';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, API_URL, authHeaders } from '../../session';
import { failed, Message, run, styles as ui } from '../../ui';

type Slot = Schemas['CourtSlots']['slots'][number];

export default function VenueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [venue, setVenue] = useState<Schemas['Venue'] | null>(null);
  const [reviews, setReviews] = useState<Schemas['VenueReviews'] | null>(null);
  const [courtId, setCourtId] = useState<string>();
  const [date, setDate] = useState<string>();
  const [day, setDay] = useState<Schemas['CourtSlots'] | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    run(setBusy, setMessage, async () => {
      const { data, error } = await api.GET('/venues/{id}', { params: { path: { id } } });
      if (!data) return setMessage(error?.message ?? failed);
      setVenue(data);
      setReviews((await api.GET('/venues/{id}/reviews', { params: { path: { id } } })).data ?? null);
      setCourtId(data.courts[0]?.id);
      setDate(nextDates(data.timezone, 1)[0]);
    });
  }, [id]);

  const loadSlots = useCallback(() => {
    if (!courtId || !date) return;
    return run(setBusy, setMessage, async () => {
      const { data, error } = await api.GET('/courts/{id}/slots', {
        params: { path: { id: courtId }, query: { date } },
      });
      if (!data) return setMessage(error?.message ?? failed);
      setDay(data);
    });
  }, [courtId, date]);
  useEffect(() => void loadSlots(), [loadSlots]);

  function confirm(slot: Slot) {
    if (!venue || !day || !courtId) return;
    const when = `${formatDay(slot.startAt, venue.timezone)}, ${formatTime(slot.startAt, venue.timezone)} to ${formatTime(slot.endAt, venue.timezone)}`;
    // The refund policy is shown before the player commits (CLAUDE.md).
    Alert.alert(
      `Hold ${formatMoney(slot.price, day.currency)} slot?`,
      [when, '', ...describePolicy(venue.policy, venue.currency)].join('\n'),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Hold slot',
          onPress: () =>
            run(setBusy, setMessage, async () => {
              const { data, error } = await api.POST('/bookings', {
                headers: await authHeaders(),
                body: { courtId, startAt: slot.startAt, endAt: slot.endAt },
              });
              if (!data) {
                setMessage(error?.message ?? failed);
                return loadSlots();
              }
              router.push('/bookings');
            }),
        },
      ],
    );
  }

  if (!venue) return <View style={styles.page}>{busy ? <Text>Loading…</Text> : <Message>{message}</Message>}</View>;
  const chip = (key: string, label: string, selected: boolean, onPress: () => void) => (
    <Pressable
      key={key}
      onPress={onPress}
      style={[ui.chip, selected && ui.chipOn]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[ui.chipText, selected && ui.chipTextOn]}>{label}</Text>
    </Pressable>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      refreshControl={<RefreshControl refreshing={busy} onRefresh={loadSlots} />}
    >
      <Stack.Screen options={{ title: venue.name }} />
      <Text>
        {venue.address}, {venue.city}
      </Text>
      {venue.facilities.length > 0 && <Text>{venue.facilities.join(', ').replaceAll('_', ' ')}</Text>}
      {venue.photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ui.row}>
          {venue.photos.map((url, i) => (
            <Image
              key={url}
              source={{ uri: API_URL + url }}
              style={styles.photo}
              accessibilityLabel={`${venue.name} photo ${i + 1}`}
            />
          ))}
        </ScrollView>
      )}

      {reviews && reviews.count > 0 && (
        <View style={styles.box}>
          <Text style={ui.label}>
            {reviews.average} out of 5 · {reviews.count} {reviews.count === 1 ? 'review' : 'reviews'}
          </Text>
          {reviews.reviews.slice(0, 3).map((r) => (
            <Text key={r.id}>
              {'★'.repeat(r.stars)} {r.author}
              {r.comment ? `: ${r.comment}` : ''}
              {r.reply ? `\nVenue: ${r.reply}` : ''}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.box}>
        <Text style={ui.label}>Before you book</Text>
        {describePolicy(venue.policy, venue.currency).map((line) => (
          <Text key={line}>{line}</Text>
        ))}
        <Text>
          You pay the venue directly
          {venue.paymentMethods.length ? ` by ${venue.paymentMethods.map((m) => paymentMethodName[m] ?? m).join(', ')}` : ''}.
        </Text>
      </View>

      <View style={ui.row}>{venue.courts.map((c) => chip(c.id, c.name, c.id === courtId, () => setCourtId(c.id)))}</View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ui.row}>
        {nextDates(venue.timezone, 7).map((d) =>
          chip(d, formatDay(`${d}T12:00:00Z`, 'UTC'), d === date, () => setDate(d)),
        )}
      </ScrollView>

      <Message>{message}</Message>
      {day?.slots.length === 0 && <Text>No slots on this day.</Text>}
      <View style={styles.grid}>
        {day?.slots.map((s) => (
          <Pressable
            key={s.startAt}
            disabled={!s.available || busy}
            onPress={() => confirm(s)}
            style={[styles.slot, !s.available && styles.taken]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !s.available }}
          >
            <Text style={ui.label}>
              {formatTime(s.startAt, venue.timezone)} to {formatTime(s.endAt, venue.timezone)}
            </Text>
            <Text>{s.available ? formatMoney(s.price, day.currency) : 'Booked'}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 12 },
  photo: { width: 280, aspectRatio: 16 / 9, borderRadius: 8, backgroundColor: '#eee' },
  box: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, gap: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { width: '48%', borderWidth: 1, borderColor: '#999', borderRadius: 6, padding: 10, gap: 2 },
  taken: { opacity: 0.4 },
});
