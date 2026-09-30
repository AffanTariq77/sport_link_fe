import { formatDay, formatMoney, type Schemas } from '@sportslink/api-client';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { api, authHeaders } from '../../session';
import { formatName } from '../../tournamentText';
import { failed, Message, run, styles as ui, card } from '../../ui';

const tz = 'Asia/Karachi';

export default function Tournaments() {
  const [list, setList] = useState<Schemas['TournamentSummary'][] | null>(null);
  const [soon, setSoon] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      run(setBusy, setMessage, async () => {
        const headers = await authHeaders();
        const [{ data, error }, { data: p }] = await Promise.all([api.GET('/tournaments', { headers }), api.GET('/programmes', { headers })]);
        if (!data) return setMessage(error?.message ?? failed);
        setList(data);
        setSoon((p ?? []).filter((x) => x.status === 'coming_soon').map((x) => x.name));
      }),
    [],
  );
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={list ?? []}
      keyExtractor={(t) => t.id}
      refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}
      ListHeaderComponent={
        <View>
          <Message>{message}</Message>
          {list?.length === 0 && <Text>No tournaments yet. SportsLink announces them here.</Text>}
        </View>
      }
      renderItem={({ item: t }) => (
        <Pressable style={styles.card} onPress={() => router.push(`/tournaments/${t.id}`)} accessibilityRole="button">
          <Text style={ui.label}>{t.name}</Text>
          <Text>
            {t.sport} · {formatName[t.format]} · {t.entryFee ? formatMoney(t.entryFee, t.currency) : 'free'}
          </Text>
          <Text>
            {t.venue} · starts {formatDay(t.startsAt, tz)} · {t.status.replace('_', ' ')}
          </Text>
        </Pressable>
      )}
      ListFooterComponent={
        <View style={{ gap: 8, marginTop: 12 }}>
          {soon.map((n) => (
            <View key={n} style={[styles.card, { borderStyle: 'dashed' }]}>
              <Text style={ui.label}>{n}</Text>
              <Text>Coming soon.</Text>
            </View>
          ))}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10 },
  card: { ...card, padding: 12, gap: 4 },
});
