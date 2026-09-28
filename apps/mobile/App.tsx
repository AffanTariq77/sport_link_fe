import type { Schemas } from '@sportslink/api-client';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { api, API_URL, currentUser, saveTokens, signOut } from './src/session';

type Screen = 'loading' | 'phone' | 'code' | 'signed-in';
const failed = 'Something went wrong. Please try again.';
const offline = `Cannot reach SportsLink. Check your connection and that the API is running at ${API_URL}.`;

// Placeholder styling until the SportsLink brand is chosen. Navigation comes with the next screens.
export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [user, setUser] = useState<Schemas['User'] | null>(null);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    currentUser()
      .then((u) => {
        setUser(u);
        setScreen(u ? 'signed-in' : 'phone');
      })
      .catch(() => {
        setMessage(offline);
        setScreen('phone');
      });
  }, []);

  async function run(task: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try {
      await task();
    } catch {
      setMessage(offline);
    } finally {
      setBusy(false);
    }
  }

  const sendCode = () =>
    run(async () => {
      const { error } = await api.POST('/auth/otp/request', { body: { phone } });
      if (error) return setMessage(error.message ?? failed);
      setCode('');
      setMessage(`We sent a 6-digit code to ${phone}.`);
      setScreen('code');
    });

  const verify = () =>
    run(async () => {
      const { data, error } = await api.POST('/auth/otp/verify', { body: { phone, code } });
      if (!data) return setMessage(error?.message ?? failed);
      await saveTokens(data);
      setUser(data.user);
      setScreen('signed-in');
    });

  const leave = () =>
    run(async () => {
      await signOut();
      setUser(null);
      setScreen('phone');
    });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SportsLink</Text>
      {screen === 'loading' && <ActivityIndicator />}

      {(screen === 'phone' || screen === 'code') && (
        <View style={styles.form}>
          <Text style={styles.label}>Mobile number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="0300 1234567"
            keyboardType="phone-pad"
            autoComplete="tel"
            editable={screen === 'phone' && !busy}
          />
          {screen === 'code' && (
            <>
              <Text style={styles.label}>Code</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="123456"
                keyboardType="number-pad"
                autoComplete="sms-otp"
                textContentType="oneTimeCode"
                maxLength={6}
                autoFocus
              />
            </>
          )}
          <Text style={styles.message} accessibilityLiveRegion="polite">
            {message}
          </Text>
          <Pressable
            style={[styles.button, busy && styles.disabled]}
            disabled={busy}
            onPress={screen === 'phone' ? sendCode : verify}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>{screen === 'phone' ? 'Send code' : 'Sign in'}</Text>
          </Pressable>
          {screen === 'code' && (
            <View style={styles.links}>
              <Pressable onPress={sendCode} disabled={busy} accessibilityRole="button">
                <Text style={styles.link}>Send a new code</Text>
              </Pressable>
              <Pressable onPress={() => setScreen('phone')} disabled={busy} accessibilityRole="button">
                <Text style={styles.link}>Change number</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {screen === 'signed-in' && (
        <View style={styles.form}>
          <Text style={styles.centre}>You are signed in{user?.name ? ` as ${user.name}` : ''}.</Text>
          {user?.status === 'pending_verification' && (
            <Text style={styles.centre}>Your identity is not verified yet.</Text>
          )}
          <Pressable onPress={leave} disabled={busy} accessibilityRole="button">
            <Text style={[styles.link, styles.centre]}>Sign out</Text>
          </Pressable>
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  title: { fontSize: 28, fontWeight: '600' },
  form: { width: '100%', maxWidth: 360, gap: 8 },
  label: { fontSize: 14, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#999', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  message: { minHeight: 20, fontSize: 14 },
  button: { backgroundColor: '#171717', borderRadius: 6, paddingVertical: 12, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  links: { flexDirection: 'row', justifyContent: 'space-between' },
  link: { fontSize: 14, textDecorationLine: 'underline', paddingVertical: 8 },
  centre: { textAlign: 'center' },
});
