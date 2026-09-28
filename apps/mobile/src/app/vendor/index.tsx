import { paymentMethodName, type Schemas } from '@sportslink/api-client';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, authHeaders } from '../../session';
import { Button, failed, Field, Message, run, styles as ui, TextButton } from '../../ui';

const branchStatusText: Record<string, string> = {
  draft: 'Draft: not visible to players',
  pending_visit: 'Sent for review: waiting for the site visit',
  live: 'Live',
  hidden: 'Hidden from search',
  suspended: 'Suspended',
  banned: 'Banned',
};
const accountStatusText: Record<string, string> = { pending: 'Waiting for approval', approved: 'Approved', rejected: 'Rejected' };

// Vendor mode on mobile: apply and track setup. Courts, hours and prices are edited on the website for now
// (spec 13: the vendor calendar and tools are easier there).
export default function Vendor() {
  const [setup, setSetup] = useState<Schemas['VendorSetup'] | null>(null);
  const [verification, setVerification] = useState<Schemas['VerificationStatus'] | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () =>
      run(setBusy, setMessage, async () => {
        const headers = await authHeaders();
        const [s, v] = await Promise.all([api.GET('/vendor/setup', { headers }), api.GET('/me/verification', { headers })]);
        if (!s.data) return setMessage(s.error?.message ?? failed);
        setSetup(s.data);
        setVerification(v.data ?? null);
      }),
    [],
  );
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const apply = () =>
    run(setBusy, setMessage, async () => {
      const { error } = await api.POST('/vendor/apply', { headers: await authHeaders(), body: { businessName } });
      if (error) return setMessage(error.message);
      await load();
    });

  if (!setup) return <View style={styles.page}>{busy ? <Text>Loading…</Text> : <Message>{message}</Message>}</View>;
  const needsId = verification?.status === 'none' || verification?.status === 'rejected';

  return (
    <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}>
      {!setup.vendor ? (
        <View style={{ gap: 12 }}>
          <Text style={ui.heading}>List your venue on SportsLink</Text>
          <Text>
            Players book and pay you directly. Every venue is reviewed and visited by our team before it goes live.
          </Text>
          {needsId ? (
            <>
              <Text>First, verify your identity. Payment accounts must be in the same name as your CNIC.</Text>
              <Button title="Verify your identity" onPress={() => router.replace('/')} />
            </>
          ) : (
            <>
              <Field label="Business name" value={businessName} onChangeText={setBusinessName} maxLength={120} />
              <Message>{message}</Message>
              <Button title="Apply" onPress={apply} busy={busy} />
            </>
          )}
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          <Text style={ui.heading}>{setup.vendor.businessName}</Text>
          <Message>{message}</Message>
          <TextButton title="Calendar" onPress={() => router.push('/vendor/calendar')} />
          <TextButton title="Payments to check" onPress={() => router.push('/vendor/payments')} />
          <TextButton title="Messages from players" onPress={() => router.push('/chats')} />
          <Text style={ui.label}>Venues</Text>
          {setup.branches.length === 0 && <Text>No venues yet.</Text>}
          {setup.branches.map((b) => (
            <View key={b.id} style={styles.card}>
              <Text style={styles.name}>{b.name}</Text>
              <Text>{branchStatusText[b.status] ?? b.status}</Text>
              {b.status === 'draft' &&
                b.checklist.map((c) => (
                  <Text key={c.key}>
                    {c.done ? '✓' : '○'} {c.label}
                  </Text>
                ))}
            </View>
          ))}
          <Text style={ui.label}>Where players pay you</Text>
          {setup.paymentAccounts.map((a) => (
            <Text key={a.id}>
              {paymentMethodName[a.method] ?? a.method}
              {a.accountNumberEnding ? ` ending ${a.accountNumberEnding}` : ''}: {accountStatusText[a.status] ?? a.status}
            </Text>
          ))}
          <Text style={styles.note}>
            Add venues, courts, opening hours, prices, payment accounts and staff on the SportsLink website, signed in with
            this number. For now, these are edited on the website.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 12 },
  card: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, gap: 2 },
  name: { fontSize: 16, fontWeight: '600' },
  note: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10 },
});
