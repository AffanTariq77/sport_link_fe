import type { Schemas } from '@sportslink/api-client';
import { useState } from 'react';
import { View } from 'react-native';
import { api, saveTokens } from '../session';
import { Button, failed, Field, Message, styles, TextButton } from '../ui';

export function SignIn({ onSignedIn, run }: { onSignedIn: (u: Schemas['User']) => void; run: Runner }) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const sendCode = () =>
    run(setBusy, setMessage, async () => {
      const { error } = await api.POST('/auth/otp/request', { body: { phone } });
      if (error) return setMessage(error.message ?? failed);
      setCode('');
      setMessage(`We sent a 6-digit code to ${phone}.`);
      setStep('code');
    });

  const verify = () =>
    run(setBusy, setMessage, async () => {
      const { data, error } = await api.POST('/auth/otp/verify', { body: { phone, code } });
      if (!data) return setMessage(error?.message ?? failed);
      await saveTokens(data);
      onSignedIn(data.user);
    });

  return (
    <View style={styles.form}>
      <Field
        label="Mobile number"
        value={phone}
        onChangeText={setPhone}
        placeholder="0300 1234567"
        keyboardType="phone-pad"
        autoComplete="tel"
        editable={step === 'phone' && !busy}
      />
      {step === 'code' && (
        <Field
          label="Code"
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          keyboardType="number-pad"
          autoComplete="sms-otp"
          textContentType="oneTimeCode"
          maxLength={6}
          autoFocus
        />
      )}
      <Message>{message}</Message>
      <Button title={step === 'phone' ? 'Send code' : 'Sign in'} onPress={step === 'phone' ? sendCode : verify} busy={busy} />
      {step === 'code' && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TextButton title="Send a new code" onPress={sendCode} busy={busy} />
          <TextButton title="Change number" onPress={() => setStep('phone')} busy={busy} />
        </View>
      )}
    </View>
  );
}

/** Runs an API task with a busy flag, showing a network error message if the API cannot be reached. */
export type Runner = (
  setBusy: (b: boolean) => void,
  setMessage: (m: string) => void,
  task: () => Promise<unknown>,
) => Promise<void>;
