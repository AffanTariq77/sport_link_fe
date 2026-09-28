import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { API_URL } from './session';

// Placeholder styling until the SportsLink brand is chosen.

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

export function Message({ children }: { children?: ReactNode }) {
  return (
    <Text style={styles.message} accessibilityLiveRegion="polite">
      {children}
    </Text>
  );
}

export const styles = StyleSheet.create({
  form: { width: '100%', maxWidth: 360, gap: 12 },
  heading: { fontSize: 22, fontWeight: '600', textAlign: 'center' },
  body: { fontSize: 14, textAlign: 'center' },
  field: { gap: 4 },
  label: { fontSize: 14, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#999', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  message: { minHeight: 20, fontSize: 14 },
  button: { backgroundColor: '#171717', borderRadius: 6, paddingVertical: 12, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  link: { fontSize: 14, textDecorationLine: 'underline', paddingVertical: 8, textAlign: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#999', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipOn: { backgroundColor: '#171717', borderColor: '#171717' },
  chipText: { fontSize: 14 },
  chipTextOn: { color: '#fff' },
});
