import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, authHeaders, signOut } from '../session';
import { Button, failed, Field, Message, run, styles as ui, TextButton } from '../ui';

export default function Account() {
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [oldCode, setOldCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [reason, setReason] = useState('');
  const [lost, setLost] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const post = (task: () => Promise<{ error?: { message?: string } }>, done: string, after?: () => void) =>
    run(setBusy, setMessage, async () => {
      const { error } = await task();
      if (error) return setMessage(error.message ?? failed);
      setMessage(done);
      after?.();
    });

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <Message>{message}</Message>
      <View style={styles.box}>
        <Text style={ui.label}>Change your phone number</Text>
        <Field label="New number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="0300 1234567" />
        {!lost && !sent && (
          <Button
            title="Send codes"
            busy={busy || !phone.trim()}
            onPress={() =>
              post(async () => api.POST('/me/phone/start', { headers: await authHeaders(), body: { phone } }), 'We sent a code to both numbers.', () => setSent(true))
            }
          />
        )}
        {!lost && sent && (
          <>
            <Field label="Code sent to your current number" value={oldCode} onChangeText={setOldCode} keyboardType="number-pad" maxLength={6} />
            <Field label="Code sent to the new number" value={newCode} onChangeText={setNewCode} keyboardType="number-pad" maxLength={6} />
            <Button
              title="Change number"
              busy={busy}
              onPress={() =>
                post(
                  async () => api.POST('/me/phone/confirm', { headers: await authHeaders(), body: { phone, oldCode, newCode } }),
                  'Your number is changed. Use it to sign in from now on.',
                  () => setSent(false),
                )
              }
            />
          </>
        )}
        {lost ? (
          <>
            <Field label="What happened to the old number?" value={reason} onChangeText={setReason} multiline />
            <Button
              title="Ask for a review"
              busy={busy}
              onPress={() =>
                post(
                  async () => api.POST('/me/phone/review', { headers: await authHeaders(), body: { phone, reason } }),
                  'Thanks. Our team will check your request and contact you on the new number.',
                )
              }
            />
          </>
        ) : (
          <TextButton title="I no longer have my old number" onPress={() => setLost(true)} />
        )}
      </View>

      <View style={styles.box}>
        <Text style={ui.label}>Delete your account</Text>
        <Text>
          Your name, number, date of birth and ID documents are removed. Past bookings, invoices and results are kept without your details. Cancel upcoming
          bookings and hand over any team you captain first.
        </Text>
        <TextButton
          title="Delete my account"
          busy={busy}
          onPress={() =>
            Alert.alert('Delete your account?', 'This cannot be undone.', [
              { text: 'Keep my account', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () =>
                  void run(setBusy, setMessage, async () => {
                    const { error } = await api.POST('/me/delete', { headers: await authHeaders(), body: { confirm: true } });
                    if (error) return setMessage(error.message ?? failed);
                    await signOut();
                    router.replace('/');
                  }),
              },
            ])
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 12 },
  box: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, gap: 8 },
});
