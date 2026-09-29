import type { Schemas } from '@sportslink/api-client';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { appLink } from '../push';
import { api, authHeaders } from '../session';
import { failed, Message, run } from '../ui';

type Item = Schemas['NotificationList']['items'][number];
const when = (d: string) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(d));

export default function Notifications() {
  const [list, setList] = useState<Item[] | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      run(setBusy, setMessage, async () => {
        const headers = await authHeaders();
        const { data, error } = await api.GET('/notifications', { headers });
        if (!data) return setMessage(error?.message ?? failed);
        setList(data.items);
        // Opening the list counts as reading it; unread ones stay highlighted until the next load.
        if (data.unread) await api.POST('/notifications/read', { headers, body: {} });
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
      keyExtractor={(n) => n.id}
      refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}
      ListHeaderComponent={
        <View>
          <Message>{message}</Message>
          {list?.length === 0 && <Text>Nothing yet. Booking, payment, match and chat updates will appear here.</Text>}
        </View>
      }
      renderItem={({ item: n }) => (
        <Pressable
          style={[styles.card, !n.readAt && styles.unread]}
          onPress={() => router.push(appLink(n.link))}
          accessibilityRole="button"
        >
          <View style={styles.row}>
            <Text style={styles.name}>{n.title}</Text>
            <Text style={styles.time}>{when(n.createdAt)}</Text>
          </View>
          <Text>{n.body}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10 },
  card: { gap: 4, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  unread: { borderColor: '#171717' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 15, fontWeight: '600', flexShrink: 1 },
  time: { fontSize: 12, color: '#666' },
});
