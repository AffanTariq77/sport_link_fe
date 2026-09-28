import { formatDay, formatMoney, formatTime, paymentMethodName, type Schemas } from '@sportslink/api-client';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { api, authHeaders } from '../../session';
import { Button, failed, Field, Message, run, TextButton } from '../../ui';

type Item = Schemas['PaymentToCheck'];

export default function VendorPayments() {
  const [queue, setQueue] = useState<Item[] | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const load = useCallback(
    () =>
      run(setBusy, setMessage, async () => {
        const { data, error } = await api.GET('/vendor/payments', { headers: await authHeaders() });
        if (!data) return setMessage(error?.message ?? failed);
        setQueue(data);
      }),
    [],
  );
  useEffect(() => void load(), [load]);

  const decide = (id: string, decision: 'confirm' | 'reject') =>
    run(setBusy, setMessage, async () => {
      const headers = await authHeaders();
      const { error } =
        decision === 'confirm'
          ? await api.POST('/vendor/payments/{id}/confirm', { params: { path: { id } }, headers })
          : await api.POST('/vendor/payments/{id}/reject', { params: { path: { id } }, headers, body: { reason } });
      if (error) return setMessage(error.message);
      setRejecting(null);
      setReason('');
      setQueue((q) => q?.filter((x) => x.id !== id) ?? null);
    });

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={queue ?? []}
      keyExtractor={(q) => q.id}
      refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}
      ListHeaderComponent={
        <View style={{ gap: 8 }}>
          <Text>Check each transaction ID in your account before confirming. Your confirmation confirms the booking.</Text>
          <Message>{message}</Message>
          {queue?.length === 0 && <Text>Nothing to check right now.</Text>}
        </View>
      }
      renderItem={({ item: q }) => {
        const tz = q.branch.timezone;
        return (
          <View style={styles.card}>
            <Text style={styles.name}>
              {formatMoney(q.advanceAmount, q.booking.currency)} by {paymentMethodName[q.method ?? ''] ?? q.method}
            </Text>
            <Text selectable>Transaction ID {q.txnReference}</Text>
            <Text>
              {q.playerName ?? 'Player'} · {q.court} · {formatDay(q.booking.startAt, tz)},{' '}
              {formatTime(q.booking.startAt, tz)} to {formatTime(q.booking.endAt, tz)}
            </Text>
            {q.booking.paymentDeadlineAt && <Text>Confirm by {formatTime(q.booking.paymentDeadlineAt, tz)}</Text>}
            {rejecting === q.id ? (
              <View style={{ gap: 8, marginTop: 8 }}>
                <Field label="What was wrong?" value={reason} onChangeText={setReason} placeholder="No payment with this ID" />
                <Button title="Reject payment" onPress={() => decide(q.id, 'reject')} busy={busy} />
                <TextButton title="Back" onPress={() => setRejecting(null)} />
              </View>
            ) : (
              <View style={{ gap: 4, marginTop: 8 }}>
                <Button title="Money received" onPress={() => decide(q.id, 'confirm')} busy={busy} />
                <TextButton title="Not received" onPress={() => setRejecting(q.id)} busy={busy} />
              </View>
            )}
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
