import { formatDay, formatTime, type Schemas } from '@sportslink/api-client';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { UNLISTED_WARNING } from '../../matchText';
import { api, authHeaders } from '../../session';
import { Button, failed, Field, Message, run, styles as ui } from '../../ui';

type Gender = 'female' | 'male' | null;

/** DD/MM/YYYY HH:MM typed in Pakistan time, to an ISO time with offset. */
const toIso = (typed: string) => {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/.exec(typed.trim());
  if (!m) return null;
  const pad = (s: string) => s.padStart(2, '0');
  return `${m[3]}-${pad(m[2]!)}-${pad(m[1]!)}T${pad(m[4]!)}:${m[5]}:00+05:00`; // ponytail: Pakistan time only for now
};

export default function NewMatch() {
  const [sports, setSports] = useState<Schemas['Sport'][]>([]);
  const [bookings, setBookings] = useState<Schemas['MyBooking'][]>([]);
  const [sport, setSport] = useState<string>();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [venue, setVenue] = useState({ name: '', address: '', latitude: '', longitude: '', start: '', end: '' });
  const [slotsTotal, setSlotsTotal] = useState('4');
  const [hostBrings, setHostBrings] = useState('1');
  const [genderFilter, setGenderFilter] = useState<Gender>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    run(setBusy, setMessage, async () => {
      const headers = await authHeaders();
      const [s, b, mine] = await Promise.all([
        api.GET('/sports'),
        api.GET('/bookings/mine', { headers }),
        api.GET('/matches/mine', { headers }),
      ]);
      setSports(s.data ?? []);
      setSport(s.data?.[0]?.slug);
      const used = new Set(mine.data?.map((m) => m.bookingId));
      const secured = (b.data ?? []).filter(
        (x) => (x.status === 'confirmed' || x.status === 'pending_payment') && !used.has(x.id) && x.startAt > new Date().toISOString(),
      );
      setBookings(secured);
      setBookingId(secured[0]?.id ?? null);
    });
  }, []);

  const create = (acceptedUnlistedWarning: boolean) =>
    run(setBusy, setMessage, async () => {
      const unlisted = bookingId
        ? undefined
        : {
            name: venue.name,
            address: venue.address,
            latitude: Number(venue.latitude),
            longitude: Number(venue.longitude),
            startAt: toIso(venue.start) ?? '',
            endAt: toIso(venue.end) ?? '',
          };
      if (unlisted && (!unlisted.startAt || !unlisted.endAt)) return setMessage('Enter start and end as DD/MM/YYYY HH:MM.');
      const { data, error } = await api.POST('/matches', {
        headers: await authHeaders(),
        body: {
          sport: sport ?? '',
          bookingId: bookingId ?? undefined,
          unlisted,
          acceptedUnlistedWarning,
          slotsTotal: Number(slotsTotal),
          hostBrings: Number(hostBrings),
          filters: { gender: genderFilter, verifiedOnly },
        },
      });
      if (!data) return setMessage(error?.message ?? failed);
      router.replace(`/matches/${data.id}`);
    });

  // Unlisted venues show the warning every time before creating (Foundation 4.3).
  const submit = () =>
    bookingId
      ? create(false)
      : Alert.alert('This venue is not listed on SportsLink', UNLISTED_WARNING, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'I understand', onPress: () => create(true) },
        ]);

  const chip = (key: string, label: string, selected: boolean, onPress: () => void) => (
    <Pressable key={key} onPress={onPress} style={[ui.chip, selected && ui.chipOn]} accessibilityRole="button">
      <Text style={[ui.chipText, selected && ui.chipTextOn]}>{label}</Text>
    </Pressable>
  );

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <Text style={ui.label}>Sport</Text>
      <View style={ui.row}>{sports.map((s) => chip(s.slug, s.name, s.slug === sport, () => setSport(s.slug)))}</View>
      <Text style={ui.label}>Where</Text>
      <View style={{ gap: 6 }}>
        {bookings.map((b) =>
          chip(
            b.id,
            `${b.venue.name}, ${formatDay(b.startAt, b.venue.timezone)} ${formatTime(b.startAt, b.venue.timezone)}`,
            b.id === bookingId,
            () => setBookingId(b.id),
          ),
        )}
        {chip('unlisted', 'A place that is not on SportsLink', bookingId === null, () => setBookingId(null))}
        {bookings.length === 0 && <Text>To play at a listed venue, book and pay the advance first.</Text>}
      </View>
      {bookingId === null && (
        <View style={{ gap: 8 }}>
          <Field label="Place name" value={venue.name} onChangeText={(name) => setVenue({ ...venue, name })} />
          <Field label="Address" value={venue.address} onChangeText={(address) => setVenue({ ...venue, address })} />
          <Field label="Latitude" value={venue.latitude} keyboardType="numbers-and-punctuation" onChangeText={(latitude) => setVenue({ ...venue, latitude })} />
          <Field label="Longitude" value={venue.longitude} keyboardType="numbers-and-punctuation" onChangeText={(longitude) => setVenue({ ...venue, longitude })} />
          <Field label="Starts (DD/MM/YYYY HH:MM)" value={venue.start} onChangeText={(start) => setVenue({ ...venue, start })} />
          <Field label="Ends (DD/MM/YYYY HH:MM)" value={venue.end} onChangeText={(end) => setVenue({ ...venue, end })} />
        </View>
      )}
      <Field label="Players in total" value={slotsTotal} onChangeText={setSlotsTotal} keyboardType="number-pad" />
      <Field label="Players you bring, you included" value={hostBrings} onChangeText={setHostBrings} keyboardType="number-pad" />
      <Text style={ui.label}>Who can join</Text>
      <View style={ui.row}>
        {chip('any', 'Anyone', genderFilter === null, () => setGenderFilter(null))}
        {chip('female', 'Women only', genderFilter === 'female', () => setGenderFilter('female'))}
        {chip('male', 'Men only', genderFilter === 'male', () => setGenderFilter('male'))}
        {chip('verified', 'Verified players only', verifiedOnly, () => setVerifiedOnly(!verifiedOnly))}
      </View>
      <Text style={{ fontSize: 12 }}>You approve every player. You pay for the players you bring; each player who joins pays their own share.</Text>
      <Message>{message}</Message>
      <Button title="Create match" onPress={submit} busy={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({ page: { padding: 16, gap: 12 } });
