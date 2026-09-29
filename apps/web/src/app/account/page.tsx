import { ActionForm, input, labelClass } from '@sportslink/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { confirmPhoneChange, deleteAccount, requestPhoneReview, startPhoneChange } from './actions';

export const metadata: Metadata = { title: 'Your account · SportsLink' };
const doneText: Record<string, string> = {
  phone: 'Your number is changed. Use it to sign in from now on.',
  review: 'Thanks. Our team will check your request and contact you on the new number.',
};

export default async function AccountPage(props: PageProps<'/account'>) {
  const user = await currentUser();
  if (!user) redirect('/sign-in');
  const q = await props.searchParams;
  const pending = typeof q.phone === 'string' ? q.phone : null;
  const card = 'flex flex-col gap-3 rounded-lg border p-4';
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 p-6">
      <Link href="/" className="text-sm underline">
        Home
      </Link>
      <h1 className="text-2xl font-semibold">Your account</h1>
      {typeof q.done === 'string' && doneText[q.done] && <p className="rounded-md border p-3 text-sm">{doneText[q.done]}</p>}
      <p className="text-sm">
        <Link href={`/players/${user.id}`} className="underline">
          See your public profile
        </Link>{' '}
        · <Link href="/onboarding/profile" className="underline">Edit your details</Link>
      </p>

      <section className={card}>
        <h2 className="font-semibold">Change your phone number</h2>
        {pending ? (
          <ActionForm action={confirmPhoneChange.bind(null, pending)} button="Change number">
            <p className="text-sm">We sent a code to your current number and to {pending}.</p>
            <label className={labelClass}>
              Code sent to your current number
              <input name="oldCode" required inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="one-time-code" className={input} />
            </label>
            <label className={labelClass}>
              Code sent to {pending}
              <input name="newCode" required inputMode="numeric" pattern="\d{6}" maxLength={6} className={input} />
            </label>
          </ActionForm>
        ) : (
          <ActionForm action={startPhoneChange} button="Send codes">
            <label className={labelClass}>
              New number
              <input name="phone" type="tel" required inputMode="tel" placeholder="0300 1234567" className={input} />
            </label>
          </ActionForm>
        )}
        <details className="text-sm">
          <summary className="cursor-pointer underline">I no longer have my old number</summary>
          <ActionForm action={requestPhoneReview} button="Ask for a review" className="mt-2 flex flex-col gap-2">
            <label className={labelClass}>
              New number
              <input name="phone" type="tel" required placeholder="0300 1234567" className={input} />
            </label>
            <label className={labelClass}>
              What happened to the old number?
              <textarea name="reason" required minLength={10} maxLength={500} rows={3} className={input} />
            </label>
          </ActionForm>
        </details>
      </section>

      <section className={card}>
        <h2 className="font-semibold">Delete your account</h2>
        <p className="text-sm">
          Your name, number, date of birth and ID documents are removed. Past bookings, invoices and results are kept without your details, as the law and
          the venues need. Cancel upcoming bookings and hand over any team you captain first.
        </p>
        <ActionForm action={deleteAccount} button="Delete my account">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="sure" /> I understand this cannot be undone
          </label>
        </ActionForm>
      </section>
    </main>
  );
}
