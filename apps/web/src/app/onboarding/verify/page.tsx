import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { VerifyForm } from './verify-form';

export const metadata: Metadata = { title: 'Verify your identity · SportsLink' };

export default async function VerifyPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');
  if (!user.name) redirect('/onboarding/profile');
  const { data: status } = await api.GET('/me/verification', { headers: await authHeaders() });
  if (status?.status === 'pending' || status?.status === 'approved') redirect('/');
  const docLabel = status?.docType === 'b_form' ? 'B-Form' : 'CNIC';

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Verify your identity</h1>
      <p className="max-w-sm text-center text-sm">
        Upload your {docLabel} so other players know you are real. It is encrypted, never shown to other players, and
        only our verification team can see it.
      </p>
      {status?.status === 'rejected' && (
        <p className="max-w-sm text-center text-sm font-medium">
          Your last upload was not accepted{status.rejectionReason ? `: ${status.rejectionReason}` : '.'} Please try
          again.
        </p>
      )}
      <VerifyForm docLabel={docLabel} />
    </main>
  );
}
