import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { API_URL } from './session';

// SportsLink theme: navy and orange. Orange fills carry navy text (white on orange fails contrast); orange text uses accentText.
export const colors = {
  navy: '#0b1b3f',
  navySoft: '#1c2f5e',
  accent: '#ff6b1a',
  accentText: '#c2410c',
  text: '#0b1b3f',
  muted: '#5b6478',
  line: '#e3e7ef',
  surface: '#f3f5f9',
  card: '#ffffff',
};

/** Navy headers over the grey page, shared by the stack and the tabs. */
export const header = {
  headerStyle: { backgroundColor: colors.navy },
  headerTintColor: '#fff',
  headerTitleStyle: { color: '#fff', fontWeight: '800' as const },
  headerShadowVisible: false,
};

/** White card on the grey page background; spread into a screen's StyleSheet. */
export const card = { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 14 } as const;

export const failed = 'Something went wrong. Please try again.';
export const offline = `Cannot reach SportsLink. Check your connection and that the API is running at ${API_URL}.`;

/** Runs an API task with a busy flag and a user-facing message on failure. */
export type Runner = (
  setBusy: (b: boolean) => void,
  setMessage: (m: string) => void,
  task: () => Promise<unknown>,
) => Promise<void>;

export const run: Runner = async (setBusy, setMessage, task) => {
  setBusy(true);
  setMessage('');
  try {
    await task();
  } catch (e) {
    // Network failures from fetch are TypeError (React Native) or FetchError (expo/fetch). Anything else is a bug.
    const network = e instanceof TypeError || (e instanceof Error && e.name === 'FetchError');
    if (!network) console.error(e);
    setMessage(network ? offline : failed);
  } finally {
    setBusy(false);
  }
};

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} accessibilityLabel={label} {...props} />
    </View>
  );
}

export function Button({ title, onPress, busy }: { title: string; onPress: () => void; busy?: boolean }) {
  return (
    <Pressable
      style={[styles.button, busy && styles.disabled]}
      disabled={busy}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

export function TextButton({ title, onPress, busy }: { title: string; onPress: () => void; busy?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={busy} accessibilityRole="button">
      <Text style={styles.link}>{title}</Text>
    </Pressable>
  );
}

/** Large tappable tile for the home screen menu. */
export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Tile({ title, onPress, badge, icon }: { title: string; onPress: () => void; badge?: number; icon?: IconName }) {
  return (
    <Pressable style={({ pressed }) => [styles.tile, pressed && styles.pressed]} onPress={onPress} accessibilityRole="button">
      {icon && (
        <View style={styles.tileIcon}>
          <Ionicons name={icon} size={20} color={colors.navy} />
        </View>
      )}
      <Text style={styles.tileText}>{title}</Text>
      {!!badge && <Text style={styles.badge}>{badge > 99 ? '99+' : badge}</Text>}
    </Pressable>
  );
}

export function Message({ children }: { children?: ReactNode }) {
  return (
    <Text style={styles.message} accessibilityLiveRegion="polite">
      {children}
    </Text>
  );
}

export const styles = StyleSheet.create({
  form: { width: '100%', maxWidth: 360, gap: 12 },
  heading: { fontSize: 24, fontWeight: '800', textAlign: 'center', color: colors.text },
  body: { fontSize: 14, textAlign: 'center', color: colors.text },
  field: { gap: 4 },
  label: { fontSize: 14, fontWeight: '700', color: colors.text },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, fontSize: 16, backgroundColor: colors.card, color: colors.text },
  message: { minHeight: 20, fontSize: 14, color: colors.text },
  button: { backgroundColor: colors.accent, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  buttonText: { color: colors.navy, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  link: { fontSize: 14, color: colors.accentText, fontWeight: '700', paddingVertical: 8, textAlign: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: colors.card },
  chipOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  tile: { ...card, flexBasis: '47%', flexGrow: 1, minHeight: 84, justifyContent: 'flex-end', padding: 14, gap: 8 },
  tileIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffe3d1', alignItems: 'center', justifyContent: 'center' },
  tileText: { fontSize: 15, fontWeight: '700', color: colors.text },
  pressed: { opacity: 0.7 },
  badge: { position: 'absolute', top: 10, right: 10, minWidth: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: colors.accent, color: colors.navy, fontSize: 12, fontWeight: '800', textAlign: 'center', overflow: 'hidden' },
  chipText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  chipTextOn: { color: '#fff' },
});
