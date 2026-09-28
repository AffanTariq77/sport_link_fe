import type { Schemas } from '@sportslink/api-client';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { api, authHeaders } from '../session';
import { Button, failed, Field, Message, styles } from '../ui';
import type { Runner } from './SignIn';

type Gender = Schemas['ProfileUpdate']['gender'];
const genders: [Gender, string][] = [
  ['female', 'Female'],
  ['male', 'Male'],
  ['other', 'Other'],
  ['prefer_not_to_say', 'Prefer not to say'],
];

/** DD/MM/YYYY as typed in Pakistan, to the API's YYYY-MM-DD. */
const toIsoDate = (typed: string) => {
  const m = /^(\d{1,2})\s*[/.-]\s*(\d{1,2})\s*[/.-]\s*(\d{4})$/.exec(typed.trim());
  return m ? `${m[3]}-${m[2]!.padStart(2, '0')}-${m[1]!.padStart(2, '0')}` : '';
};

export function Profile({ onSaved, run }: { onSaved: (u: Schemas['User']) => void; run: Runner }) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const save = () =>
    run(setBusy, setMessage, async () => {
      const isoDob = toIsoDate(dob);
      if (!isoDob) return setMessage('Enter your date of birth as DD/MM/YYYY.');
      if (!gender) return setMessage('Choose a gender option.');
      const { data, error } = await api.PATCH('/me/profile', {
        headers: await authHeaders(),
        body: { name, dob: isoDob, gender, city },
      });
      if (!data) return setMessage(error?.message ?? failed);
      onSaved(data);
    });

  return (
    <View style={styles.form}>
      <Text style={styles.heading}>Tell us about you</Text>
      <Text style={styles.body}>Other players see your name and city. Your date of birth is private.</Text>
      <Field label="Full name, as on your ID" value={name} onChangeText={setName} autoComplete="name" maxLength={80} />
      <Field
        label="Date of birth"
        value={dob}
        onChangeText={setDob}
        placeholder="DD/MM/YYYY"
        keyboardType="numbers-and-punctuation"
        maxLength={10}
      />
      <Text style={styles.label}>Gender</Text>
      <View style={styles.row} accessibilityRole="radiogroup">
        {genders.map(([value, label]) => (
          <Pressable
            key={value}
            onPress={() => setGender(value)}
            style={[styles.chip, gender === value && styles.chipOn]}
            accessibilityRole="radio"
            accessibilityState={{ checked: gender === value }}
          >
            <Text style={[styles.chipText, gender === value && styles.chipTextOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <Field label="City" value={city} onChangeText={setCity} autoComplete="postal-address-locality" maxLength={80} />
      <Message>{message}</Message>
      <Button title="Continue" onPress={save} busy={busy} />
    </View>
  );
}
