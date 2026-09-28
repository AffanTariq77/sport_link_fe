import type { Schemas } from '@sportslink/api-client';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { api, authHeaders } from '../../session';
import { failed, Message, run } from '../../ui';

export default function Chats() {
  const [list, setList] = useState<Schemas['ConversationSummary'][] | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      run(setBusy, setMessage, async () => {
        const { data, error } = await api.GET('/conversations', { headers: await authHeaders() });
        if (!data) return setMessage(error?.message ?? failed);
        setList(data);
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
      keyExtractor={(c) => c.id}
      refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}
      ListHeaderComponent={
        <View>
          <Message>{message}</Message>
          {list?.length === 0 && <Text>No chats yet. Match chats open once you are in a match.</Text>}
        </View>
      }
      renderItem={({ item: c }) => (
        <Pressable style={styles.card} onPress={() => router.push(`/chats/${c.id}`)} accessibilityRole="button">
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{c.title}</Text>
            <Text numberOfLines={1}>{c.lastMessage ?? 'No messages yet'}</Text>
          </View>
          {c.unread > 0 && <Text style={styles.badge}>{c.unread}</Text>}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  name: { fontSize: 15, fontWeight: '600' },
  badge: { backgroundColor: '#171717', color: '#fff', borderRadius: 10, paddingHorizontal: 8, overflow: 'hidden' },
});
