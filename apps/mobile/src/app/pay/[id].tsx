import { formatMoney, formatTime, paymentMethodName, type Schemas } from '@sportslink/api-client';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, authHeaders } from '../../session';
import { Button, failed, Field, Message, run, styles as ui, card, colors } from '../../ui';

type Method = Schemas['PaymentSubmission']['method'];

export default function Pay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [info, setInfo] = useState<Schemas['PayInfo'] | null>(null);
  const [method, setMethod] = useState<Method | null>(null);
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () =>
      run(setBusy, setMessage, async () => {
        const { data, error } = await api.GET('/bookings/{id}/payment', {
          params: { path: { id } },
          headers: await authHeaders(),
        });
        if (!data) return setMessage(error?.message ?? failed);
        setInfo(data);
        setMethod((m) => m ?? data.accounts[0]?.method ?? (data.payAtVenueAllowed ? 'cash' : null));
      }),
    [id],
  );
  useEffect(() => void load(), [load]);

  const submit = () =>
    run(setBusy, setMessage, async () => {
      if (!method) return;
      const { data, error } = await api.POST('/bookings/{id}/payment', {
        params: { path: { id } },
        headers: await authHeaders(),
        body: { method, txnReference: method === 'cash' ? undefined : reference },
      });
      if (!data) return setMessage(error?.message ?? failed);
      router.back();
    });

  if (!info) return <View style={styles.page}>{busy ? <Text>Loading…</Text> : <Message>{message}</Message>}</View>;
  const tz = info.timezone;
  const waiting = info.payments.some((p) => p.status === 'submitted');
  const rejected = info.payments.at(-1)?.status === 'rejected';
  const canPay = info.status === 'held' || (info.status === 'pending_payment' && !waiting);

  const option = (value: Method, lines: (string | null)[]) => (
    <Pressable
      key={value}
      onPress={() => setMethod(value)}
      style={[styles.option, method === value && styles.optionOn]}
      accessibilityRole="radio"
      accessibilityState={{ checked: method === value }}
    >
      {lines.filter(Boolean).map((line, i) => (
        <Text key={i} style={i === 0 ? ui.label : undefined} selectable>
          {line}
        </Text>
      ))}
    </Pressable>
  );

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <Text>
        Advance {formatMoney(info.advanceDue, info.currency)} of {formatMoney(info.total, info.currency)}. You pay the
        rest at the venue.
      </Text>
      {info.status === 'held' && info.holdExpiresAt && (
        <Text>Pay before {formatTime(info.holdExpiresAt, tz)} or the slot is released.</Text>
      )}
      {waiting && (
        <Text style={styles.note}>
          The venue is checking your payment
          {info.paymentDeadlineAt ? ` and should confirm by ${formatTime(info.paymentDeadlineAt, tz)}` : ''}.
        </Text>
      )}
      {rejected && (
        <Text style={styles.note}>
          The venue could not find your last payment. Check the transaction ID and submit it again.
        </Text>
      )}
      {info.status === 'confirmed' && <Text style={styles.note}>Your booking is confirmed.</Text>}
      {!canPay && !waiting && info.status !== 'confirmed' && <Text>This booking can no longer be paid.</Text>}

      {canPay && (
        <View style={{ gap: 10 }}>
          <Text style={ui.label}>How did you pay?</Text>
          {info.accounts.map((a) =>
            option(a.method, [paymentMethodName[a.method] ?? a.method, a.accountTitle, a.bankName, a.accountNumber]),
          )}
          {info.payAtVenueAllowed && option('cash', ['Pay everything at the venue'])}
          {method !== 'cash' && (
            <>
              <Field
                label="Transaction ID from your receipt"
                value={reference}
                onChangeText={setReference}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={40}
              />
              <Text style={{ fontSize: 12 }}>
                A screenshot is not enough: the venue checks this ID against its account.
              </Text>
            </>
          )}
          <Message>{message}</Message>
          <Button title={method === 'cash' ? 'Confirm booking' : 'I have paid'} onPress={submit} busy={busy || !method} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 12 },
  note: { ...card, padding: 10 },
  option: { borderWidth: 1, borderColor: colors.muted, borderRadius: 6, padding: 12, gap: 2 },
  optionOn: { borderColor: colors.navy, borderWidth: 2 },
});
