import type { Schemas } from '@sportslink/api-client';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { api, authHeaders } from '../../session';
import { failed, Message, run, TextButton } from '../../ui';

type Msg = Schemas['ChatThread']['messages'][number];
const POLL_MS = 4000; // ponytail: polling until realtime (Socket.IO, spec 2) is added
const time = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso));

export default function ChatThread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [list, setList] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const last = useRef<string | undefined>(undefined);
  const listRef = useRef<FlatList<Msg>>(null);

  const poll = useCallback(async () => {
    const { data } = await api.GET('/conversations/{id}/messages', {
      params: { path: { id }, query: { after: last.current } },
      headers: await authHeaders(),
    });
    if (data?.messages.length) {
      last.current = data.messages.at(-1)!.createdAt;
      setList((prev) => [...prev, ...data.messages.filter((m) => !prev.some((p) => p.id === m.id))]);
    }
  }, [id]);

  useEffect(() => {
    void poll().catch(() => setMessage('Cannot reach SportsLink right now.'));
    const timer = setInterval(() => void poll().catch(() => undefined), POLL_MS);
    return () => clearInterval(timer);
  }, [poll]);

  const send = (confirmPhone = false) =>
    run(setBusy, setMessage, async () => {
      const { data, error, response } = await api.POST('/conversations/{id}/messages', {
        params: { path: { id } },
        headers: await authHeaders(),
        body: { body: text, confirmPhone },
      });
      if (response.status === 409) {
        // Phone number: warn before it is shared (Foundation 4.6).
        return Alert.alert('Share a phone number?', error?.message ?? '', [
          { text: 'Edit message', style: 'cancel' },
          { text: 'Send anyway', onPress: () => void send(true) },
        ]);
      }
      if (!data) return setMessage(error?.message ?? failed);
      setText('');
      await poll();
    });

  const report = () =>
    Alert.alert('Report this chat', 'Our safety team will see the recent messages.', [
      { text: 'Cancel', style: 'cancel' },
      ...(['Abuse or harassment', 'Scam or fake payment', 'Safety concern'] as const).map((reason) => ({
        text: reason,
        onPress: () =>
          run(setBusy, setMessage, async () => {
            const { error } = await api.POST('/conversations/{id}/report', {
              params: { path: { id } },
              headers: await authHeaders(),
              body: { reason },
            });
            setMessage(error ? error.message : 'Thank you. Our safety team will review this chat.');
          }),
      })),
    ]);

  const block = (m: Msg) =>
    Alert.alert(`Block ${m.senderName ?? 'this player'}?`, 'You will not see their messages.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: () =>
          run(setBusy, setMessage, async () => {
            await api.POST('/users/{id}/block', { params: { path: { id: m.senderId! } }, headers: await authHeaders() });
            setList((prev) => prev.filter((x) => x.senderId !== m.senderId));
          }),
      },
    ]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        ref={listRef}
        contentContainerStyle={styles.list}
        data={list}
        keyExtractor={(m) => m.id}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListHeaderComponent={
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 12 }}>Keep chatting here: SportsLink never shows your phone number to other players.</Text>
            <TextButton title="Report this chat" onPress={report} />
          </View>
        }
        ListEmptyComponent={<Text>No messages yet. Say hello.</Text>}
        renderItem={({ item: m }) => (
          <Pressable onLongPress={() => !m.mine && m.senderId && block(m)} style={[styles.bubble, m.mine ? styles.mine : styles.theirs]}>
            {!m.mine && <Text style={styles.sender}>{m.senderName ?? 'SportsLink'}</Text>}
            <Text style={m.mine ? styles.mineText : undefined}>{m.body}</Text>
            <Text style={[styles.time, m.mine && styles.mineText]}>{time(m.createdAt)}</Text>
          </Pressable>
        )}
      />
      <Message>{message}</Message>
      <View style={styles.composer}>
        <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Message" multiline maxLength={2000} />
        <TextButton title="Send" onPress={() => send()} busy={busy || !text.trim()} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 8 },
  bubble: { maxWidth: '80%', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#171717' },
  theirs: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#ccc' },
  mineText: { color: '#fff' },
  sender: { fontSize: 12, fontWeight: '600' },
  time: { fontSize: 10, alignSelf: 'flex-end', opacity: 0.7 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1, borderWidth: 1, borderColor: '#999', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, maxHeight: 120 },
});
