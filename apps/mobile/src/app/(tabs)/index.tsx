import type { Schemas } from '@sportslink/api-client';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useNavigation } from 'expo-router';
import { GuardianStep, Wards } from '../../screens/Family';
import { Profile } from '../../screens/Profile';
import { SignIn } from '../../screens/SignIn';
import { Verify } from '../../screens/Verify';
import { registerDevice } from '../../push';
import { api, authHeaders, currentUser, signOut } from '../../session';
import { card, colors, Message, offline, run, styles as ui, TextButton, Tile, type IconName } from '../../ui';

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
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

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
  const onboarded = !loading && !!user?.name && !needsId;

  // The tab bar only makes sense once the player can use the tabs.
  useEffect(() => {
    navigation.setOptions({ tabBarStyle: onboarded ? { backgroundColor: colors.navy, borderTopWidth: 0 } : { display: 'none' } });
  }, [navigation, onboarded]);

  let screen;
  if (loading) screen = <ActivityIndicator />;
  else if (!user) screen = <SignIn onSignedIn={signedIn} run={run} />;
  else if (!user.name) screen = <Profile onSaved={signedIn} run={run} />;
  else if (needsId && verification) screen = <Verify status={verification} onSubmitted={(v) => (setVerification(v), setVerifyNow(false))} run={run} />;
  else
    screen = (
      <View style={styles.dash}>
        {verification?.status === 'pending' && (
          <Text style={styles.note}>We are checking your ID and will let you know when it is done.</Text>
        )}
        {canSubmit && <TextButton title="Verify your identity" onPress={() => setVerifyNow(true)} />}
        {user.locked ? (
          <GuardianStep />
        ) : (
          <View style={styles.actions}>
            <Action icon="calendar" title="Book a court" text="Pick a venue, slot and pay the advance" onPress={() => router.push('/venues')} primary />
            <Action icon="football" title="Play a match" text="Join a game or host your own" onPress={() => router.push('/matches')} />
            <Action icon="locate" title="Find Players" text="Short of players? Ask people nearby" onPress={() => router.push('/find-players')} />
          </View>
        )}
        <Wards />
        <Text style={styles.section}>More</Text>
        <View style={ui.row}>
          <Tile icon="receipt" title="My bookings" onPress={() => router.push('/bookings')} />
          <Tile icon="people" title="Teams" onPress={() => router.push('/teams')} />
          <Tile icon="trophy" title="Tournaments" onPress={() => router.push('/tournaments')} />
          <Tile icon="podium" title="Rankings" onPress={() => router.push('/leaderboards')} />
          <Tile icon="business" title={isVendor ? 'Your venues' : 'List your venue'} onPress={() => router.push('/vendor')} />
          <Tile icon="person-circle" title="Your account" onPress={() => router.push('/account')} />
        </View>
        <TextButton title="Sign out" onPress={leave} busy={busy} />
      </View>
    );

  if (onboarded && user?.name)
    return (
      <ScrollView style={{ backgroundColor: colors.surface }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
          <View style={styles.heroTop}>
            <Text style={styles.brand}>
              SPORTS<Text style={{ color: colors.accent }}>LINK</Text>
            </Text>
            <Pressable
              onPress={() => (setUnread(0), router.push('/notifications'))}
              accessibilityRole="button"
              accessibilityLabel={`Notifications, ${unread} unread`}
              hitSlop={8}
            >
              <Ionicons name="notifications" size={24} color="#fff" />
              {unread > 0 && <Text style={styles.dot}>{unread > 99 ? '99+' : unread}</Text>}
            </Pressable>
          </View>
          <Text style={styles.hello}>Hi {user.name.split(' ')[0]},</Text>
          <Text style={styles.helloSub}>Ready to play today?</Text>
        </View>
        {screen}
        {!!message && <Message>{message}</Message>}
      </ScrollView>
    );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>
          SPORTS<Text style={{ color: colors.accent }}>LINK</Text>
        </Text>
        {screen}
        {!!message && <Message>{message}</Message>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Action({ icon, title, text, onPress, primary }: { icon: IconName; title: string; text: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable style={({ pressed }) => [styles.action, primary && styles.actionPrimary, pressed && ui.pressed]} onPress={onPress} accessibilityRole="button">
      <View style={[styles.actionIcon, primary && { backgroundColor: colors.navy }]}>
        <Ionicons name={icon} size={24} color={primary ? colors.accent : colors.navy} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionText}>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.navy} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  title: { fontSize: 32, fontWeight: '900', color: colors.navy, letterSpacing: 1 },
  hero: { backgroundColor: colors.navy, paddingHorizontal: 20, paddingBottom: 56, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  brand: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 1.5 },
  dot: { position: 'absolute', top: -6, right: -10, minWidth: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: colors.accent, color: colors.navy, fontSize: 11, fontWeight: '800', textAlign: 'center', overflow: 'hidden' },
  hello: { color: '#fff', fontSize: 28, fontWeight: '800' },
  helloSub: { color: '#aab4cc', fontSize: 16, marginTop: 4 },
  dash: { paddingHorizontal: 16, marginTop: -36, gap: 12 },
  note: { ...card, padding: 12, color: colors.text },
  actions: { gap: 10 },
  action: { ...card, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  actionPrimary: { backgroundColor: colors.accent, borderColor: colors.accent },
  actionIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ffe3d1', alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontSize: 17, fontWeight: '800', color: colors.navy },
  actionText: { fontSize: 13, color: colors.navySoft, marginTop: 2 },
  section: { fontSize: 13, fontWeight: '800', color: colors.muted, letterSpacing: 1, textTransform: 'uppercase', marginTop: 8 },
});
