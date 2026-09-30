import { formatDay, formatTime, type Schemas } from '@sportslink/api-client';
import * as Location from 'expo-location';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { statusText } from '../../findText';
import { api, authHeaders } from '../../session';
import { Button, failed, Field, Message, run, styles as ui, TextButton, card } from '../../ui';

const tz = 'Asia/Karachi';
type AlertMode = 'always' | 'available' | 'off';

function Chips<T extends string>({ value, options, onChange }: { value: T | undefined; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <View style={ui.row}>
      {options.map(([v, label]) => (
        <Pressable key={v} style={[ui.chip, value === v && ui.chipOn]} onPress={() => onChange(v)} accessibilityRole="radio" accessibilityState={{ checked: value === v }}>
          <Text style={[ui.chipText, value === v && ui.chipTextOn]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function FindPlayers() {
  const [me, setMe] = useState<Schemas['Availability'] | null>(null);
  const [mine, setMine] = useState<Schemas['MyFindRequests'] | null>(null);
  const [sports, setSports] = useState<Schemas['Sport'][]>([]);
  const [sport, setSport] = useState<string>();
  const [needed, setNeeded] = useState('2');
  const [radius, setRadius] = useState('5');
  const [window, setWindow] = useState<'now' | 'today'>('now');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () =>
      run(setBusy, setMessage, async () => {
        const headers = await authHeaders();
        const [a, m, s] = await Promise.all([api.GET('/me/availability', { headers }), api.GET('/find-players', { headers }), api.GET('/sports')]);
        if (!a.data || !m.data) return setMessage(a.error?.message ?? failed);
        setMe(a.data);
        setMine(m.data);
        setSports(s.data ?? []);
        setSport((x) => x ?? s.data?.[0]?.slug);
      }),
    [],
  );
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const share = () =>
    run(setBusy, setMessage, async () => {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) return setMessage('Location permission was not given.');
      const p = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { error } = await api.PUT('/me/location', {
        headers: await authHeaders(),
        body: { latitude: p.coords.latitude, longitude: p.coords.longitude },
      });
      if (error) return setMessage(error.message ?? failed);
      setMessage('Location shared. Only a rounded area is kept, and others see distance bands only.');
      await load();
    });
  const save = (body: { alertMode?: AlertMode; available?: boolean; quietHoursOk?: boolean }) =>
    run(setBusy, setMessage, async () => {
      const { data, error } = await api.PUT('/me/availability', { headers: await authHeaders(), body });
      if (!data) return setMessage(error?.message ?? failed);
      setMe(data);
    });
  const send = () =>
    run(setBusy, setMessage, async () => {
      const { data, error } = await api.POST('/find-players', {
        headers: await authHeaders(),
        body: { sport: sport!, playersNeeded: Number(needed), radiusKm: Number(radius), window, filters: {} },
      });
      if (!data) return setMessage(error?.message ?? failed);
      router.push(`/find-players/${data.id}?sent=${data.notified}`);
    });

  return (
    <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />} keyboardShouldPersistTaps="handled">
      <Text>Short of players? Ask players nearby. They accept, you pick who joins, then agree the details in chat.</Text>
      <Message>{message}</Message>
      {me && (
        <View style={styles.box}>
          <View style={styles.line}>
            <Text style={[ui.label, { flex: 1 }]}>Available to play now</Text>
            <Switch value={me.available} onValueChange={(available) => save({ available })} accessibilityLabel="Available to play now" />
          </View>
          <Text>Alert me</Text>
          <Chips<AlertMode>
            value={me.alertMode}
            options={[
              ['available', 'When available'],
              ['always', 'Always'],
              ['off', 'Never'],
            ]}
            onChange={(alertMode) => save({ alertMode })}
          />
          <View style={styles.line}>
            <Text style={{ flex: 1 }}>Alerts at night are fine</Text>
            <Switch value={me.quietHoursOk} onValueChange={(quietHoursOk) => save({ quietHoursOk })} accessibilityLabel="Alerts at night are fine" />
          </View>
          <TextButton title={me.hasLocation ? 'Update my location' : 'Share my location'} onPress={share} busy={busy} />
        </View>
      )}

      {mine && mine.incoming.length > 0 && (
        <>
          <Text style={ui.label}>Players needed near you</Text>
          {mine.incoming.map((r) => (
            <Pressable key={r.id} style={styles.box} onPress={() => router.push(`/find-players/${r.id}`)} accessibilityRole="button">
              <Text style={ui.label}>
                {r.sport} · {r.distance} away
              </Text>
              <Text>
                {r.requester} · until {formatDay(r.windowEnd, tz)}, {formatTime(r.windowEnd, tz)} · {statusText[r.myStatus] ?? r.myStatus}
              </Text>
            </Pressable>
          ))}
        </>
      )}

      <View style={styles.box}>
        <Text style={ui.label}>Ask for players</Text>
        {!me?.hasLocation && <Text>Share your location first so we can find players near you.</Text>}
        <Chips value={sport} options={sports.map((s) => [s.slug, s.name])} onChange={setSport} />
        <Field label="Players needed" value={needed} onChangeText={setNeeded} keyboardType="number-pad" />
        <Field label="Within (km)" value={radius} onChangeText={setRadius} keyboardType="number-pad" />
        <Chips
          value={window}
          options={[
            ['now', 'Now'],
            ['today', 'Today'],
          ]}
          onChange={setWindow}
        />
        <Button title="Send request" onPress={send} busy={busy || !sport || !me?.hasLocation} />
      </View>

      {mine && mine.sent.length > 0 && (
        <>
          <Text style={ui.label}>Your requests</Text>
          {mine.sent.map((r) => (
            <TextButton key={r.id} title={`${r.sport} · ${r.status}`} onPress={() => router.push(`/find-players/${r.id}`)} />
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 12 },
  box: { ...card, padding: 12, gap: 8 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
