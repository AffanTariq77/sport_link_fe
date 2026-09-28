import { bookingStatusText, describePolicy, formatDay, formatMoney, formatTime, type Schemas } from '@sportslink/api-client';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { api, authHeaders } from '../session';
import { failed, Message, run, TextButton } from '../ui';

const refundText: Record<string, string> = {
  due: 'the venue will send it',
  sent: 'the venue says it has been sent',
  received: 'received',
  disputed: 'our support team is looking into it',
};

export default function Bookings() {
  const [bookings, setBookings] = useState<Schemas['MyBooking'][] | null>(null);
  const [myRefunds, setRefunds] = useState<Schemas['PlayerRefund'][]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () =>
      run(setBusy, setMessage, async () => {
        const headers = await authHeaders();
        const [{ data, error }, r] = await Promise.all([api.GET('/bookings/mine', { headers }), api.GET('/refunds/mine', { headers })]);
        if (!data) return setMessage(error?.message ?? failed);
        setBookings(data);
        setRefunds(r.data ?? []);
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
            {['held', 'pending_payment', 'confirmed'].includes(b.status) && (
              <TextButton
                title="Cancel booking"
                onPress={() =>
                  Alert.alert(
                    'Cancel this booking?',
                    b.status === 'held'
                      ? 'The slot will be released.'
                      : b.policy.cancelRefund
                        ? `You get your advance back if you cancel at least ${b.policy.cancelWindowHours} hours before.`
                        : 'This venue does not refund cancellations.',
                    [
                      { text: 'Keep booking', style: 'cancel' },
                      {
                        text: 'Cancel booking',
                        style: 'destructive',
                        onPress: () =>
                          run(setBusy, setMessage, async () => {
                            const { data, error } = await api.POST('/bookings/{id}/cancel', {
                              params: { path: { id: b.id } },
                              headers: await authHeaders(),
                            });
                            if (!data) return setMessage(error?.message ?? failed);
                            setMessage(data.refunds ? 'Cancelled. The venue will send your refund.' : 'Cancelled. No refund is due under the venue policy.');
                            await load();
                          }),
                      },
                    ],
                  )
                }
              />
            )}
            {myRefunds
              .filter((r) => r.bookingId === b.id)
              .map((r) => (
                <View key={r.id} style={{ marginTop: 6, gap: 2 }}>
                  <Text>
                    Refund {formatMoney(r.amount, r.currency)}: {refundText[r.status] ?? r.status}
                    {r.vendorReference ? ` · reference ${r.vendorReference}` : ''}
                  </Text>
                  {r.status === 'sent' && (
                    <View style={{ flexDirection: 'row', gap: 16 }}>
                      {([true, false] as const).map((received) => (
                        <TextButton
                          key={String(received)}
                          title={received ? 'I received it' : 'It did not arrive'}
                          onPress={() =>
                            run(setBusy, setMessage, async () => {
                              const headers = await authHeaders();
                              const path = { params: { path: { id: r.id } }, headers };
                              const { error } = received
                                ? await api.POST('/refunds/{id}/received', path)
                                : await api.POST('/refunds/{id}/dispute', { ...path, body: {} });
                              if (error) return setMessage(error.message);
                              await load();
                            })
                          }
                        />
                      ))}
                    </View>
                  )}
                </View>
              ))}
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
