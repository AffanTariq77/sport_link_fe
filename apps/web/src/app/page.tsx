import { Building2, CalendarDays, ChevronRight, Crown, LocateFixed, Medal, Receipt, Users, Volleyball, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { GuardianStep, WardsSection } from '@/components/family';
import { authHeaders, currentUser, onboardingStep } from '@/lib/session';
import { signOut } from './actions';

function Action({ href, icon: Icon, title, text, primary }: { href: string; icon: LucideIcon; title: string; text: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        primary ? 'border-accent bg-accent text-on-accent hover:text-on-accent' : 'bg-card'
      }`}
    >
      <span className={`grid size-12 shrink-0 place-items-center rounded-full ${primary ? 'bg-navy text-accent' : 'bg-accent/15 text-navy dark:text-accent'}`}>
        <Icon size={24} aria-hidden />
      </span>
      <span className="flex-1">
        <span className="block text-lg font-extrabold">{title}</span>
        <span className="block text-sm opacity-80">{text}</span>
      </span>
      <ChevronRight size={20} aria-hidden />
    </Link>
  );
}

function Tile({ href, icon: Icon, title }: { href: string; icon: LucideIcon; title: string }) {
  return (
    <Link href={href} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 font-bold transition hover:border-accent">
      <span className="grid size-9 place-items-center rounded-full bg-accent/15 text-navy dark:text-accent">
        <Icon size={18} aria-hidden />
      </span>
      {title}
    </Link>
  );
}

export default async function Home() {
  const user = await currentUser();
  const step = user && (await onboardingStep(user));
  if (step) redirect(step);
  const verification = user && (await api.GET('/me/verification', { headers: await authHeaders() })).data;
  const vendor = user && (await api.GET('/vendor/access', { headers: await authHeaders() })).data?.vendors.length;

  if (!user)
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-navy p-8 text-center text-white">
        <p className="text-4xl font-black tracking-widest sm:text-5xl">
          SPORTS<span className="text-accent">LINK</span>
        </p>
        <p className="max-w-md text-lg text-white/80">Book a venue, fill your match, find players nearby.</p>
        <Link href="/sign-in" className="rounded-full bg-accent px-8 py-3 text-lg font-extrabold text-on-accent hover:opacity-90">
          Sign in
        </Link>
      </main>
    );

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-navy pb-16 pt-8 text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-3xl sm:text-4xl">Hi {user.name?.split(' ')[0]},</h1>
          <p className="mt-1 text-lg text-white/70">Ready to play today?</p>
        </div>
      </section>
      <div className="mx-auto -mt-10 flex w-full max-w-3xl flex-col gap-4 px-4 pb-8">
        {verification?.status === 'pending' && (
          <p className="rounded-2xl border bg-card p-4 text-sm">We are checking your ID and will let you know when it is done.</p>
        )}
        {verification?.status === 'none' && (
          <Link href="/onboarding/verify" className="rounded-2xl border bg-card p-4 text-sm font-semibold text-accent-text">
            Verify your identity
          </Link>
        )}
        {user.locked ? (
          <GuardianStep />
        ) : (
          <div className="grid gap-3">
            <Action href="/venues" icon={CalendarDays} title="Book a court" text="Pick a venue, slot and pay the advance" primary />
            <Action href="/matches" icon={Volleyball} title="Play a match" text="Join a game or host your own" />
            <Action href="/find-players" icon={LocateFixed} title="Find Players" text="Short of players? Ask people nearby" />
          </div>
        )}
        <WardsSection />
        {!user.locked && (
          <>
            <h2 className="mt-2 text-xs font-extrabold uppercase tracking-widest text-muted">More</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Tile href="/bookings" icon={Receipt} title="My bookings" />
              <Tile href="/teams" icon={Users} title="Teams" />
              <Tile href="/tournaments" icon={Medal} title="Tournaments" />
              <Tile href="/leaderboards" icon={Crown} title="Rankings" />
              <Tile href="/vendor" icon={Building2} title={vendor ? 'Your venues' : 'List your venue'} />
            </div>
          </>
        )}
        <form action={signOut} className="self-center">
          <button className="text-sm font-semibold text-muted underline">Sign out</button>
        </form>
      </div>
    </main>
  );
}
