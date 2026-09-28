import { ActionForm, input, labelClass } from '@sportslink/ui';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentAdmin } from '@/lib/api';
import { login } from './actions';

export const metadata: Metadata = { title: 'Sign in · SportsLink Admin' };

export default async function LoginPage() {
  if (await currentAdmin()) redirect('/');
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">SportsLink Admin</h1>
      <div className="w-full max-w-sm">
        <ActionForm action={login} button="Sign in">
          <label className={labelClass}>
            Email
            <input name="email" type="email" autoComplete="username" required className={input} />
          </label>
          <label className={labelClass}>
            Password
            <input name="password" type="password" autoComplete="current-password" required className={input} />
          </label>
          <label className={labelClass}>
            Code from your authenticator app
            <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" required className={input} />
          </label>
        </ActionForm>
      </div>
    </main>
  );
}
