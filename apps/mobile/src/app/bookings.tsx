import { bookingStatusText, describePolicy, formatDay, formatMoney, formatTime, type Schemas } from '@sportslink/api-client';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { api, authHeaders } from '../session';
import { failed, Message, run, TextButton } from '../ui';

export default function Bookings() {
  const [bookings, setBookings] = useState<Schemas['MyBooking'][] | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () =>
      run(setBusy, setMessage, async () => {
        const { data, error } = await api.GET('/bookings/mine', { headers: await authHeaders() });
        if (!data) return setMessage(error?.message ?? failed);
        setBookings(data);
      }),
    [],
  );
  // Reload when coming back, for example after paying.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={bookings ?? []}
      keyExtractor={(b) => b.id}
      refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}
      ListHeaderComponent={
        <View>
          <Message>{message}</Message>
          {bookings?.length === 0 && (
            <>
              <Text>No bookings yet.</Text>
              <TextButton title="Find a venue" onPress={() => router.replace('/venues')} />
            </>
          )}
        </View>
      }
      renderItem={({ item: b }) => {
        const tz = b.venue.timezone;
        return (
          <View style={styles.card}>
            <Text style={styles.name}>
              {b.venue.name} · {b.court.name}
            </Text>
            <Text>
              {formatDay(b.startAt, tz)}, {formatTime(b.startAt, tz)} to {formatTime(b.endAt, tz)}
            </Text>
            <Text>
              {bookingStatusText[b.status] ?? b.status} · {formatMoney(b.total, b.currency)}
              {b.advanceDue > 0 ? ` · advance ${formatMoney(b.advanceDue, b.currency)}` : ''}
            </Text>
            {b.status === 'held' && b.holdExpiresAt && (
              <Text style={{ marginTop: 6 }}>
                We are holding this slot until {formatTime(b.holdExpiresAt, tz)}. Pay the advance before then to keep it.
              </Text>
            )}
            {['held', 'pending_payment', 'confirmed'].includes(b.status) && (
              <TextButton
                title="Message the venue"
                onPress={async () => {
                  const { data } = await api.POST('/conversations/booking/{bookingId}', {
                    params: { path: { bookingId: b.id } },
                    headers: await authHeaders(),
                  });
                  if (data) router.push(`/chats/${data.id}`);
                }}
              />
            )}
            {(b.status === 'held' || b.status === 'pending_payment') && (
              <TextButton
                title={b.status === 'held' ? 'Pay advance' : 'Payment details'}
                onPress={() => router.push(`/pay/${b.id}`)}
              />
            )}
            {b.status === 'held' &&
              describePolicy(b.policy, b.currency).map((line) => <Text key={line}>{line}</Text>)}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  card: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 16, gap: 2 },
  name: { fontSize: 16, fontWeight: '600' },
});
