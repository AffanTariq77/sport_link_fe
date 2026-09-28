import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

// Placeholder styling until the SportsLink brand is chosen.

export const failed = 'Something went wrong. Please try again.';

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
