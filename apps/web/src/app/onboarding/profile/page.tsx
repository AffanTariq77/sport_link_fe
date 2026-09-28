import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { ProfileForm } from './profile-form';

export const metadata: Metadata = { title: 'Your details · SportsLink' };

export default async function ProfilePage() {
  if (!(await currentUser())) redirect('/sign-in');
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Tell us about you</h1>
      <p className="max-w-sm text-center text-sm">Other players see your name and city. Your date of birth is private.</p>
      <ProfileForm />
    </main>
  );
}
