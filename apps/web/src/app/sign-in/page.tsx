import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { SignInForm } from './sign-in-form';

export const metadata: Metadata = { title: 'Sign in · SportsLink' };

export default async function SignInPage() {
  if (await currentUser()) redirect('/');
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Sign in or create an account</h1>
      <SignInForm />
    </main>
  );
}
