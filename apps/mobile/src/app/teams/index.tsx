import type { Schemas } from '@sportslink/api-client';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { api, authHeaders } from '../../session';
import { roleName } from '../../teamText';
import { Button, failed, Field, Message, run, styles as ui, card } from '../../ui';

export default function Teams() {
  const [teams, setTeams] = useState<Schemas['MyTeam'][] | null>(null);
  const [sports, setSports] = useState<Schemas['Sport'][]>([]);
  const [sport, setSport] = useState<string>();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      run(setBusy, setMessage, async () => {
        const [{ data, error }, { data: s }] = await Promise.all([
          api.GET('/teams/mine', { headers: await authHeaders() }),
          api.GET('/sports'),
        ]);
        if (!data) return setMessage(error?.message ?? failed);
        setTeams(data);
        setSports(s ?? []);
        setSport((x) => x ?? s?.[0]?.slug);
      }),
    [],
  );
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  const create = () =>
    run(setBusy, setMessage, async () => {
      const { data, error } = await api.POST('/teams', {
        headers: await authHeaders(),
        body: { sport: sport!, name, city: city.trim() || undefined },
      });
      if (!data) return setMessage(error?.message ?? failed);
      setName('');
      router.push(`/teams/${data.id}`);
    });

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={teams ?? []}
      keyExtractor={(t) => t.id}
      refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}
      ListHeaderComponent={
        <View>
          <Message>{message}</Message>
          {teams?.length === 0 && <Text>You are not in a team yet. Create one below, or ask a captain to invite you.</Text>}
        </View>
      }
      renderItem={({ item: t }) => (
        <Pressable style={styles.card} onPress={() => router.push(`/teams/${t.id}`)} accessibilityRole="button">
          <View style={{ flex: 1 }}>
            <Text style={ui.label}>{t.name}</Text>
            <Text>
              {t.sport}
              {t.city ? ` · ${t.city}` : ''}
            </Text>
          </View>
          <Text>{t.status === 'invited' ? 'Invited' : roleName[t.role]}</Text>
        </Pressable>
      )}
      ListFooterComponent={
        <View style={styles.box}>
          <Text style={ui.label}>Create a team</Text>
          <View style={ui.row}>
            {sports.map((s) => (
              <Pressable key={s.slug} style={[ui.chip, sport === s.slug && ui.chipOn]} onPress={() => setSport(s.slug)} accessibilityRole="radio" accessibilityState={{ checked: sport === s.slug }}>
                <Text style={[ui.chipText, sport === s.slug && ui.chipTextOn]}>{s.name}</Text>
              </Pressable>
            ))}
          </View>
          <Field label="Team name" value={name} onChangeText={setName} maxLength={60} />
          <Field label="City (optional)" value={city} onChangeText={setCity} maxLength={80} />
          <Button title="Create team" onPress={create} busy={busy || !sport || name.trim().length < 2} />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 8, ...card, padding: 12 },
  box: { ...card, padding: 12, gap: 10, marginTop: 12 },
});
