import { formatDay, formatMoney, formatTime, paymentMethodName, type Schemas } from '@sportslink/api-client';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, authHeaders } from '../../session';
import { Button, failed, Field, Message, run } from '../../ui';

export default function VendorRefunds() {
  const [list, setList] = useState<Schemas['VendorRefund'][]>([]);
  const [refs, setRefs] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      run(setBusy, setMessage, async () => {
        const { data, error } = await api.GET('/vendor/refunds', { headers: await authHeaders() });
        if (!data) return setMessage(error?.message ?? failed);
        setList(data);
      }),
    [],
  );
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />} keyboardShouldPersistTaps="handled">
      <Text>Send each refund back the way the player paid, then enter the transfer reference.</Text>
      <Message>{message}</Message>
      {list.length === 0 && <Text>No refunds to send.</Text>}
      {list.map((r) => (
        <View key={r.id} style={styles.card}>
          <Text style={styles.name}>
            {formatMoney(r.amount, r.currency)} to {r.playerName ?? 'the player'}
            {r.paidMethod ? ` by ${paymentMethodName[r.paidMethod]}` : ''}
          </Text>
          <Text>
            {r.booking.branch}, {r.booking.court} · {formatDay(r.booking.startAt, r.booking.timezone)} {formatTime(r.booking.startAt, r.booking.timezone)}
            {r.status === 'disputed' ? ' · the player says it has not arrived' : ''}
          </Text>
          <Field label="Transfer reference" value={refs[r.id] ?? ''} onChangeText={(t) => setRefs({ ...refs, [r.id]: t })} autoCapitalize="characters" />
          <Button
            title="Mark as sent"
            busy={busy || (refs[r.id] ?? '').trim().length < 3}
            onPress={() =>
              run(setBusy, setMessage, async () => {
                const { error } = await api.POST('/vendor/refunds/{id}/sent', {
                  params: { path: { id: r.id } },
                  headers: await authHeaders(),
                  body: { reference: refs[r.id] ?? '' },
                });
                if (error) return setMessage(error.message);
                setMessage('Marked as sent. The player will confirm when it arrives.');
                await load();
              })
            }
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 12 },
  card: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, gap: 6 },
  name: { fontSize: 16, fontWeight: '600' },
});
