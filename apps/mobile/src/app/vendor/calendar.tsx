import { bookingStatusText, formatDay, formatMoney, formatTime, nextDates, type Schemas } from '@sportslink/api-client';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, authHeaders } from '../../session';
import { Button, failed, Field, Message, run, styles as ui, TextButton, card, colors } from '../../ui';

type Branch = Schemas['VendorAccess']['vendors'][number]['branches'][number];
type Slot = { courtId: string; startAt: string; endAt: string };
const sourceText: Record<string, string> = { app: 'App booking', manual: 'Walk-in', block: 'Blocked' };

export default function VendorCalendar() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [day, setDay] = useState<Schemas['CalendarDay'] | null>(null);
  const [picked, setPicked] = useState<Slot | null>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    (b: Branch | null = branch, d: string | null = date) =>
      run(setBusy, setMessage, async () => {
        const headers = await authHeaders();
        let current = b;
        if (!current) {
          const { data } = await api.GET('/vendor/access', { headers });
          const all = data?.vendors.flatMap((v) => v.branches) ?? [];
          setBranches(all);
          current = all[0] ?? null;
          setBranch(current);
        }
        if (!current) return setMessage('You do not have access to a venue calendar.');
        const when = d ?? nextDates(current.timezone, 1)[0]!;
        setDate(when);
        const { data, error } = await api.GET('/vendor/calendar', {
          params: { query: { branchId: current.id, date: when } },
          headers,
        });
        if (!data) return setMessage(error?.message ?? failed);
        setDay(data);
      }),
    [branch, date],
  );
  useFocusEffect(
    useCallback(() => {
      void load();
      // Reload the current branch and day whenever the screen comes back into view.
    }, []),

  );

  const add = (kind: 'walk-in' | 'block') =>
    run(setBusy, setMessage, async () => {
      if (!picked) return;
      const headers = await authHeaders();
      const { error } =
        kind === 'walk-in'
          ? await api.POST('/vendor/bookings/manual', { headers, body: { ...picked, customerName: name } })
          : await api.POST('/vendor/blocks', { headers, body: { ...picked, reason: name || 'Blocked by the venue' } });
      if (error) return setMessage(error.message);
      setPicked(null);
      setName('');
      await load();
    });

  const chip = (key: string, label: string, selected: boolean, onPress: () => void) => (
    <Pressable key={key} onPress={onPress} style={[ui.chip, selected && ui.chipOn]} accessibilityRole="button">
      <Text style={[ui.chipText, selected && ui.chipTextOn]}>{label}</Text>
    </Pressable>
  );
  const tz = branch?.timezone ?? 'Asia/Karachi';

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      refreshControl={<RefreshControl refreshing={busy} onRefresh={() => load()} />}
      keyboardShouldPersistTaps="handled"
    >
      {branches.length > 1 && (
        <View style={ui.row}>{branches.map((b) => chip(b.id, b.name, b.id === branch?.id, () => (setBranch(b), load(b, date))))}</View>
      )}
      {branch && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ui.row}>
          {nextDates(tz, 7).map((d) => chip(d, formatDay(`${d}T12:00:00Z`, 'UTC'), d === date, () => load(branch, d)))}
        </ScrollView>
      )}
      <Message>{message}</Message>
      {day?.courts.map((court) => (
        <View key={court.id} style={{ gap: 6 }}>
          <Text style={styles.court}>{court.name}</Text>
          {court.slots.length === 0 && <Text>Closed on this day.</Text>}
          {court.slots.map((s) => {
            const b = court.bookings.find((x) => x.startAt < s.endAt && x.endAt > s.startAt);
            const time = `${formatTime(s.startAt, tz)} to ${formatTime(s.endAt, tz)}`;
            const isPicked = picked?.startAt === s.startAt && picked.courtId === court.id;
            return (
              <View key={s.startAt} style={[styles.slot, b && styles.taken]}>
                {b ? (
                  <>
                    <Text style={ui.label}>
                      {time} · {sourceText[b.source]} · {b.name ?? 'Player'}
                    </Text>
                    <Text>
                      {b.source === 'block' ? 'Not bookable' : `${bookingStatusText[b.status] ?? b.status} · ${formatMoney(b.total, b.currency)}`}
                      {b.customerPhone ? ` · ${b.customerPhone}` : ''}
                    </Text>
                  </>
                ) : isPicked ? (
                  <View style={{ gap: 8 }}>
                    <Text style={ui.label}>{time}</Text>
                    <Field label="Customer name, or reason for a block" value={name} onChangeText={setName} maxLength={80} />
                    <Button title="Book walk-in" onPress={() => add('walk-in')} busy={busy || !name.trim()} />
                    <TextButton title="Block this slot" onPress={() => add('block')} busy={busy} />
                    <TextButton title="Cancel" onPress={() => setPicked(null)} />
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setPicked({ courtId: court.id, startAt: s.startAt, endAt: s.endAt })}
                    accessibilityRole="button"
                  >
                    <Text>{time} · free (tap to add a walk-in or block)</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 12 },
  court: { fontSize: 18, fontWeight: '600', marginTop: 8 },
  slot: { ...card, padding: 10 },
  taken: { borderColor: colors.navy },
});
