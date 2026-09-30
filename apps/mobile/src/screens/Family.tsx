import { bookingStatusText, formatDay, formatTime, type Schemas } from '@sportslink/api-client';
import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { api, authHeaders } from '../session';
import { Button, failed, Field, Message, run, styles, TextButton, card } from '../ui';

/** A locked minor names their parent or guardian (spec 5). */
export function GuardianStep() {
  const [status, setStatus] = useState<Schemas['MyGuardian'] | null>(null);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setStatus((await api.GET('/me/guardian', { headers: await authHeaders() })).data ?? null);
  }, []);
  useEffect(() => void load(), [load]);

  const send = () =>
    run(setBusy, setMessage, async () => {
      const { error } = await api.POST('/me/guardian', { headers: await authHeaders(), body: { phone } });
      if (error) return setMessage(error.message);
      setPhone('');
      await load();
    });

  return (
    <View style={[styles.form, { ...card, padding: 12 }]}>
      <Text style={styles.label}>Ask a parent or guardian</Text>
      <Text>
        {status?.status === 'pending'
          ? `We have asked ${status.guardianName ?? 'your parent or guardian'} to approve your account. Once they accept in their own SportsLink account, you can book and join matches.`
          : 'Players under 18 need a parent or guardian to approve their account. They need their own SportsLink account first.'}
      </Text>
      <Field label="Their mobile number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="0300 1234567" />
      <Message>{message}</Message>
      <Button title={status?.status === 'pending' ? 'Ask someone else' : 'Send request'} onPress={send} busy={busy || !phone.trim()} />
    </View>
  );
}

/** Children who asked this user to approve them, and what approved children are doing. */
export function Wards() {
  const [wards, setWards] = useState<Schemas['Ward'][]>([]);
  const [consent, setConsent] = useState<Schemas['ConsentText'] | null>(null);
  const [activity, setActivity] = useState<Record<string, Schemas['WardActivity']>>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const headers = await authHeaders();
    const [w, c] = await Promise.all([api.GET('/me/wards', { headers }), api.GET('/me/guardian/consent-text', { headers })]);
    setWards(w.data ?? []);
    setConsent(c.data ?? null);
  }, []);
  useEffect(() => void load(), [load]);
  if (!wards.length || !consent) return null;

  const decide = (id: string, accept: boolean) =>
    run(setBusy, setMessage, async () => {
      const { error } = await api.POST('/me/wards/{id}/consent', {
        params: { path: { id } },
        headers: await authHeaders(),
        body: { accept, version: consent.version },
      });
      if (error) return setMessage(error.message ?? failed);
      await load();
    });
  const show = (id: string) =>
    run(setBusy, setMessage, async () => {
      const { data, error } = await api.GET('/me/wards/{id}/activity', { params: { path: { id } }, headers: await authHeaders() });
      if (!data) return setMessage(error?.message ?? failed);
      setActivity({ ...activity, [id]: data });
    });

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Your children</Text>
      <Message>{message}</Message>
      {wards.map((w) => (
        <View key={w.id} style={{ ...card, padding: 12, gap: 6 }}>
          {w.consentAt ? (
            <>
              <Text style={styles.label}>{w.name ?? 'Your child'}</Text>
              {activity[w.id] ? (
                <>
                  {activity[w.id]!.bookings.map((b) => (
                    <Text key={b.id}>
                      {b.venue} · {formatDay(b.startAt, b.timezone)} {formatTime(b.startAt, b.timezone)} · {bookingStatusText[b.status] ?? b.status}
                    </Text>
                  ))}
                  {activity[w.id]!.matches.map((m) => (
                    <Text key={m.id}>
                      {m.sport} match · {formatDay(m.startAt, 'Asia/Karachi')} {formatTime(m.startAt, 'Asia/Karachi')}
                    </Text>
                  ))}
                  {!activity[w.id]!.bookings.length && !activity[w.id]!.matches.length && <Text>Nothing coming up.</Text>}
                </>
              ) : (
                <TextButton title="See bookings and matches" onPress={() => show(w.id)} busy={busy} />
              )}
            </>
          ) : (
            <>
              <Text style={styles.label}>{w.name ?? 'A player'} has asked you to approve their account.</Text>
              <Text style={{ fontSize: 12 }}>{consent.text}</Text>
              <Button title="I agree" onPress={() => decide(w.id, true)} busy={busy} />
              <TextButton title="This is not my child" onPress={() => decide(w.id, false)} busy={busy} />
            </>
          )}
        </View>
      ))}
    </View>
  );
}
