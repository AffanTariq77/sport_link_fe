import type { Schemas } from '@sportslink/api-client';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { GuardianStep, Wards } from '../screens/Family';
import { Profile } from '../screens/Profile';
import { SignIn } from '../screens/SignIn';
import { Verify } from '../screens/Verify';
import { registerDevice } from '../push';
import { api, authHeaders, currentUser, signOut } from '../session';
import { Button, Message, offline, run, styles as ui, TextButton } from '../ui';

// Onboarding goes sign in → profile → ID (when the verification.required_at setting asks for it at sign-up).
export default function Home() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Schemas['User'] | null>(null);
  const [verification, setVerification] = useState<Schemas['VerificationStatus'] | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [verifyNow, setVerifyNow] = useState(false); // user chose to verify before it is required
  const [isVendor, setIsVendor] = useState(false);
  const [unread, setUnread] = useState(0);

  async function load(u: Schemas['User'] | null) {
    setUser(u);
    const headers = await authHeaders();
    setVerification(u ? ((await api.GET('/me/verification', { headers })).data ?? null) : null);
    setIsVendor(!!u && !!(await api.GET('/vendor/setup', { headers })).data?.vendor);
    setUnread(u ? ((await api.GET('/notifications', { headers })).data?.unread ?? 0) : 0);
    if (u?.name) registerDevice().catch(() => undefined); // never blocks the home screen
  }

  useEffect(() => {
    currentUser()
      .then(load)
      .catch(() => setMessage(offline))
      .finally(() => setLoading(false));
  }, []);

  const signedIn = (u: Schemas['User']) => run(setBusy, setMessage, () => load(u));
  const leave = () => run(setBusy, setMessage, async () => (await signOut(), load(null)));
  const canSubmit = verification?.status === 'none' || verification?.status === 'rejected';
  const needsId = canSubmit && (verification?.requiredAt === 'signup' || verifyNow);

  let screen;
  if (loading) screen = <ActivityIndicator />;
  else if (!user) screen = <SignIn onSignedIn={signedIn} run={run} />;
  else if (!user.name) screen = <Profile onSaved={signedIn} run={run} />;
  else if (needsId && verification) screen = <Verify status={verification} onSubmitted={(v) => (setVerification(v), setVerifyNow(false))} run={run} />;
  else
    screen = (
      <View style={ui.form}>
        <Text style={ui.body}>You are signed in as {user.name}.</Text>
        {verification?.status === 'pending' && (
          <Text style={ui.body}>We are checking your ID and will let you know when it is done.</Text>
        )}
        {canSubmit && <TextButton title="Verify your identity" onPress={() => setVerifyNow(true)} />}
        {user.locked ? (
          <GuardianStep />
        ) : (
          <>
            <Button title="Book a venue" onPress={() => router.push('/venues')} />
            <Button title="Find or create a match" onPress={() => router.push('/matches')} />
          </>
        )}
        <Wards />
        <TextButton title="My bookings" onPress={() => router.push('/bookings')} />
        <TextButton title="Chats" onPress={() => router.push('/chats')} />
        <TextButton title="Rankings" onPress={() => router.push('/leaderboards')} />
        <TextButton
          title={unread ? `Notifications (${unread})` : 'Notifications'}
          onPress={() => (setUnread(0), router.push('/notifications'))}
        />
        <TextButton title={isVendor ? 'Vendor: your venues' : 'List your venue'} onPress={() => router.push('/vendor')} />
        <TextButton title="Sign out" onPress={leave} busy={busy} />
      </View>
    );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>SportsLink</Text>
        {screen}
        {!!message && <Message>{message}</Message>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  title: { fontSize: 28, fontWeight: '600' },
});
