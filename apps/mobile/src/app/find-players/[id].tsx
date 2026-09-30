import { formatDay, formatTime, type Schemas } from '@sportslink/api-client';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { statusText } from '../../findText';
import { api, authHeaders } from '../../session';
import { Button, failed, Message, run, styles as ui, TextButton, card, colors } from '../../ui';

const tz = 'Asia/Karachi';
const POLL_MS = 5000; // ponytail: polling until realtime (Socket.IO) lands

export default function FindRequest() {
  const { id, sent } = useLocalSearchParams<{ id: string; sent?: string }>();
  const [r, setRequest] = useState<Schemas['FindRequest'] | null>(null);
  const [pick, setPick] = useState<string[]>([]);
  const [message, setMessage] = useState(
    sent === undefined ? '' : sent === '0' ? 'Nobody who matches is nearby right now. Try a wider radius, or join an open match.' : `Sent to ${sent} nearby.`,
  );
  const [busy, setBusy] = useState(false);
  const path = { params: { path: { id } } };

  const load = useCallback(async () => {
    const { data, error } = await api.GET('/find-players/{id}', { ...path, headers: await authHeaders() });
    if (!data) return setMessage(error?.message ?? failed);
    setRequest(data);
  }, [id]);
  useFocusEffect(
    useCallback(() => {
      void load();
      const t = setInterval(() => void load(), POLL_MS);
      return () => clearInterval(t);
    }, [load]),
  );
  const act = (task: () => Promise<{ error?: { message?: string } }>) =>
    run(setBusy, setMessage, async () => {
      const { error } = await task();
      if (error) return setMessage(error.message ?? failed);
      setPick([]);
      await load();
    });
  const openChat = () =>
    run(setBusy, setMessage, async () => {
      const { data, error } = await api.POST('/conversations/find/{requestId}', { params: { path: { requestId: id } }, headers: await authHeaders() });
      if (!data) return setMessage(error?.message ?? failed);
      router.push(`/chats/${data.id}`);
    });

  if (!r) return <View style={styles.page}>{busy ? <Text>Loading…</Text> : <Message>{message}</Message>}</View>;
  const live = r.status === 'open' || r.status === 'matched';
  const accepted = r.players.filter((p) => p.status === 'accepted');
  const picked = r.players.filter((p) => p.status === 'selected');
  return (
    <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={busy} onRefresh={() => void load()} />}>
      <Text style={ui.heading}>
        {r.sport}: {r.playersNeeded} {r.playersNeeded === 1 ? 'player' : 'players'} needed
      </Text>
      <Text>
        {r.mine ? `Within ${r.radiusKm} km` : `${r.requester.name} · ${r.distance} away`} · {formatDay(r.windowStart, tz)}, {formatTime(r.windowStart, tz)} to{' '}
        {formatTime(r.windowEnd, tz)} · {r.status}
      </Text>
      <Message>{message}</Message>

      {!r.mine && (
        <View style={styles.box}>
          <Text style={ui.label}>
            {r.myStatus === 'notified' && r.status !== 'open' ? 'This game has its players now. Thanks for looking.' : (statusText[r.myStatus ?? ''] ?? '')}
          </Text>
          {r.myStatus === 'notified' && r.status === 'open' && (
            <>
              <Button title="I can play" busy={busy} onPress={() => act(async () => api.POST('/find-players/{id}/respond', { ...path, headers: await authHeaders(), body: { accept: true } }))} />
              <TextButton title="Not this time" onPress={() => act(async () => api.POST('/find-players/{id}/respond', { ...path, headers: await authHeaders(), body: { accept: false } }))} />
            </>
          )}
          {r.myStatus === 'selected' && <Button title="Open the group chat" onPress={openChat} busy={busy} />}
          {r.matchId && <TextButton title="See the match" onPress={() => router.push(`/matches/${r.matchId}`)} />}
        </View>
      )}

      {r.mine && (
        <>
          <Text style={ui.label}>Players who said yes</Text>
          {accepted.length === 0 && <Text>No one yet. This screen updates by itself.</Text>}
          {accepted.map((p) => (
            <Pressable
              key={p.id}
              style={[styles.box, pick.includes(p.id) && styles.on]}
              onPress={() => setPick(pick.includes(p.id) ? pick.filter((x) => x !== p.id) : [...pick, p.id])}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: pick.includes(p.id) }}
            >
              <Text style={ui.label}>{p.name}</Text>
              <Text>
                {p.distance} · rating {p.rating ?? 'new'}
                {p.provisional && p.rating ? ' (provisional)' : ''}
                {p.behaviour !== null ? ` · ${p.behaviour}★` : ''}
              </Text>
            </Pressable>
          ))}
          {live && accepted.length > 0 && (
            <Button
              title="Pick these players"
              busy={busy || !pick.length}
              onPress={() => act(async () => api.POST('/find-players/{id}/select', { ...path, headers: await authHeaders(), body: { userIds: pick } }))}
            />
          )}
          {picked.length > 0 && (
            <>
              <Text style={ui.label}>Picked</Text>
              {picked.map((p) => (
                <View key={p.id} style={styles.line}>
                  <Text style={{ flex: 1 }}>
                    {p.name} · {p.distance}
                  </Text>
                  {live && (
                    <TextButton
                      title="Remove"
                      onPress={() => act(async () => api.POST('/find-players/{id}/players/{userId}/remove', { params: { path: { id, userId: p.id } }, headers: await authHeaders() }))}
                    />
                  )}
                </View>
              ))}
              <Button title="Open the group chat" onPress={openChat} busy={busy} />
              {!r.matchId && <Text>Agree the venue and time in the chat, then create the match on the web or in Matches.</Text>}
            </>
          )}
          {r.matchId && <TextButton title="See the match" onPress={() => router.push(`/matches/${r.matchId}`)} />}
          {live && <TextButton title="Close this request" onPress={() => act(async () => api.POST('/find-players/{id}/close', { ...path, headers: await authHeaders() }))} />}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 10 },
  box: { ...card, padding: 12, gap: 6 },
  on: { borderColor: colors.navy, borderWidth: 2 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
