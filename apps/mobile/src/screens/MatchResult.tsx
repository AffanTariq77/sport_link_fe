import { formatDay, formatTime, type Schemas } from '@sportslink/api-client';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { api, authHeaders } from '../session';
import { Button, failed, Field, Message, run, styles as ui, TextButton } from '../ui';

export const tagName = (t: string) => t.charAt(0).toUpperCase() + t.slice(1).replaceAll('_', ' ');
type Outcome = 'a' | 'b' | 'draw';
const outcomeText: Record<Outcome, string> = { a: 'Side A won', b: 'Side B won', draw: 'Draw' };

function Chip({ on, label, onPress }: { on: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable style={[ui.chip, on && ui.chipOn]} onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
      <Text style={[ui.chipText, on && ui.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

/** Result, confirmation and behaviour reviews once the match has been played (spec 11). */
export function MatchResult({ id, tz, me }: { id: string; tz: string; me: string }) {
  const [state, setState] = useState<Schemas['MatchResultState'] | null>(null);
  const [sides, setSides] = useState<Record<string, 'a' | 'b'>>({});
  const [outcome, setOutcome] = useState<Outcome>('a');
  const [score, setScore] = useState('');
  const [note, setNote] = useState('');
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [stars, setStars] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const path = { params: { path: { id } } };

  const load = useCallback(
    () =>
      run(setBusy, setMessage, async () => {
        const { data } = await api.GET('/matches/{id}/result', { ...path, headers: await authHeaders() });
        if (!data) return;
        setState(data);
        setSides((s) => (Object.keys(s).length ? s : Object.fromEntries(data.participants.map((p, i) => [p.id, i % 2 ? 'b' : 'a']))));
      }),
    [id],
  );
  useEffect(() => {
    void load();
  }, [load]);

  const act = (task: () => Promise<{ error?: { message?: string } }>, done: string) =>
    run(setBusy, setMessage, async () => {
      const { error } = await task();
      if (error) return setMessage(error.message ?? failed);
      setMessage(done);
      setReviewing(null);
      await load();
    });

  if (!state?.finished) return null;
  const name = (uid: string) => state.participants.find((p) => p.id === uid)?.name ?? 'Player';
  const r = state.result;
  return (
    <View style={styles.box}>
      <Text style={ui.label}>Result</Text>
      <Message>{message}</Message>
      {state.canSubmit && (
        <>
          <Text>Put each player on a side. The other side confirms it; ratings change once it is confirmed.</Text>
          {state.participants.map((p) => (
            <View key={p.id} style={styles.line}>
              <Text style={{ flex: 1 }}>{p.id === me ? `${p.name} (you)` : p.name}</Text>
              {(['a', 'b'] as const).map((s) => (
                <Chip key={s} on={sides[p.id] === s} label={`Side ${s.toUpperCase()}`} onPress={() => setSides({ ...sides, [p.id]: s })} />
              ))}
            </View>
          ))}
          <View style={ui.row}>
            {(Object.keys(outcomeText) as Outcome[]).map((o) => (
              <Chip key={o} on={outcome === o} label={outcomeText[o]} onPress={() => setOutcome(o)} />
            ))}
          </View>
          <Field label="Score (optional)" value={score} onChangeText={setScore} placeholder="6-4 6-3" />
          <Button
            title="Submit result"
            busy={busy}
            onPress={() =>
              act(async () => {
                const ids = state.participants.map((p) => p.id);
                return api.POST('/matches/{id}/result', {
                  ...path,
                  headers: await authHeaders(),
                  body: {
                    sideA: ids.filter((x) => sides[x] === 'a'),
                    sideB: ids.filter((x) => sides[x] === 'b'),
                    outcome,
                    score: score.trim() || undefined,
                  },
                });
              }, 'Result sent. The other side will be asked to confirm it.')
            }
          />
        </>
      )}
      {r && (
        <>
          <Text>Side A: {r.sideA.map(name).join(', ')}</Text>
          <Text>Side B: {r.sideB.map(name).join(', ')}</Text>
          <Text style={ui.label}>
            {outcomeText[r.outcome]}
            {r.score ? ` · ${r.score}` : ''}
          </Text>
          <Text>
            {r.status === 'pending' && `Waiting for the other side to confirm by ${formatDay(r.confirmBy, tz)}, ${formatTime(r.confirmBy, tz)}.`}
            {r.status === 'confirmed' && 'Confirmed. Ratings are updated.'}
            {r.status === 'disputed' && 'Disputed. SportsLink will review it and decide.'}
          </Text>
        </>
      )}
      {state.canRespond && (
        <>
          <Button
            title="This is right"
            busy={busy}
            onPress={() =>
              act(async () => api.POST('/matches/{id}/result/respond', { ...path, headers: await authHeaders(), body: { agree: true } }), 'Result confirmed.')
            }
          />
          <Field label="If it is wrong, what happened?" value={note} onChangeText={setNote} multiline />
          <TextButton
            title="Dispute this result"
            busy={busy}
            onPress={() =>
              act(
                async () => api.POST('/matches/{id}/result/respond', { ...path, headers: await authHeaders(), body: { agree: false, note } }),
                'Dispute sent. SportsLink will review it.',
              )
            }
          />
        </>
      )}
      {state.reviewable.length > 0 && (
        <>
          <Text style={ui.label}>Review the players</Text>
          <Text>Only about behaviour. Reviews never change skill ratings.</Text>
          {state.reviewable.map((p) => (
            <View key={p.id} style={styles.review}>
              <View style={styles.line}>
                <TextButton title={p.name} onPress={() => router.push(`/players/${p.id}`)} />
                {p.reviewed ? (
                  <Text>reviewed</Text>
                ) : (
                  reviewing !== p.id && <TextButton title="Review" onPress={() => (setReviewing(p.id), setStars(5), setTags([]))} />
                )}
              </View>
              {reviewing === p.id && (
                <>
                  <View style={ui.row}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Chip key={n} on={stars === n} label={`${n}★`} onPress={() => setStars(n)} />
                    ))}
                  </View>
                  <View style={ui.row}>
                    {state.reviewTags.map((t) => (
                      <Chip
                        key={t}
                        on={tags.includes(t)}
                        label={tagName(t)}
                        onPress={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}
                      />
                    ))}
                  </View>
                  <Button
                    title="Send review"
                    busy={busy}
                    onPress={() =>
                      act(
                        async () =>
                          api.POST('/matches/{id}/reviews', { ...path, headers: await authHeaders(), body: { toUserId: p.id, stars, tags } }),
                        'Review sent. Thank you.',
                      )
                    }
                  />
                </>
              )}
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, gap: 8 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  review: { borderTopWidth: 1, borderColor: '#eee', paddingTop: 6, gap: 6 },
});
