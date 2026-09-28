import { formatMoney, fromMinor } from '@sportslink/api-client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ActionForm, input, labelClass } from '@sportslink/ui';
import { BranchFields } from '@/components/branch-fields';
import { api } from '@/lib/api';
import { authHeaders, currentUser } from '@/lib/session';
import { createCourt, setHours, setPolicy, setPrices, submitBranch, updateBranch, updateCourt } from '../../setup-actions';

export const metadata: Metadata = { title: 'Set up your venue · SportsLink' };

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_TYPES = [
  ['weekday', 'Weekdays'],
  ['weekend', 'Weekends'],
  ['holiday', 'Public holidays'],
  ['all', 'Every day'],
] as const;
const PRICE_ROWS = 6;
const card = 'flex flex-col gap-3 rounded-lg border p-4';
const saved: Record<string, string> = {
  details: 'Venue details saved.',
  policy: 'Policy saved. It applies to new bookings.',
  court: 'Court saved.',
  hours: 'Opening hours saved.',
  prices: 'Prices saved. They apply to new bookings.',
  submitted: 'Sent for review. We will contact you to arrange the site visit.',
};

export default async function BranchPage(props: PageProps<'/vendor/branches/[id]'>) {
  if (!(await currentUser())) redirect('/sign-in');
  const { id } = await props.params;
  const { saved: savedKey } = await props.searchParams;
  const headers = await authHeaders();
  const [{ data: setup }, { data: sports }] = await Promise.all([
    api.GET('/vendor/setup', { headers }),
    api.GET('/sports'),
  ]);
  const branch = setup?.branches.find((b) => b.id === id);
  if (!setup?.vendor || !branch) notFound();
  const currency = setup.vendor.currency;
  const p = branch.policy;
  const todo = branch.checklist.filter((c) => !c.done);

  const courtFields = (court?: (typeof branch.courts)[number]) => (
    <>
      <label className={labelClass}>
        Name
        <input name="name" required maxLength={60} defaultValue={court?.name} className={input} />
      </label>
      <label className={labelClass}>
        Surface (optional)
        <input name="surface" maxLength={60} defaultValue={court?.surface ?? ''} className={input} />
      </label>
      <label className={labelClass}>
        Slot length in minutes
        <input
          name="slotMinutes"
          type="number"
          min={15}
          max={240}
          step={15}
          required
          defaultValue={court?.slotMinutes ?? 60}
          className={input}
        />
      </label>
      <fieldset className="flex flex-col gap-1 text-sm">
        <legend className="font-medium">Sports</legend>
        <div className="flex flex-wrap gap-3">
          {sports?.map((s) => (
            <label key={s.slug} className="flex items-center gap-1">
              <input type="checkbox" name="sports" value={s.slug} defaultChecked={court?.sports.includes(s.slug)} />
              {s.name}
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <Link href="/vendor" className="text-sm underline">
        {setup.vendor.businessName}
      </Link>
      <h1 className="text-2xl font-semibold">{branch.name}</h1>
      {typeof savedKey === 'string' && saved[savedKey] && (
        <p className="rounded-md border p-3 text-sm">{saved[savedKey]}</p>
      )}

      {branch.status === 'draft' && (
        <section className={card}>
          <h2 className="font-semibold">Before we review your venue</h2>
          <ul className="text-sm">
            {branch.checklist.map((c) => (
              <li key={c.key}>
                {c.done ? '✓' : '○'} {c.label}
              </li>
            ))}
          </ul>
          {todo.length === 0 && (
            <ActionForm action={submitBranch.bind(null, branch.id)} button="Send for review and request a site visit" />
          )}
        </section>
      )}

      <details className={card}>
        <summary className="cursor-pointer font-semibold">Venue details</summary>
        <BranchFields action={updateBranch.bind(null, branch.id)} button="Save details" branch={branch} />
      </details>

      <details className={card}>
        <summary className="cursor-pointer font-semibold">Advance and refunds</summary>
        <ActionForm action={setPolicy.bind(null, branch.id, currency)} button="Save policy">
          <label className={labelClass}>
            Advance to confirm a booking
            <select name="advanceType" defaultValue={p.advanceType} className={input}>
              <option value="percentage">Percentage of the price</option>
              <option value="fixed">Fixed amount</option>
              <option value="none">No advance</option>
            </select>
          </label>
          <label className={labelClass}>
            Advance (percent, or rupees for a fixed amount)
            <input
              name="advanceValue"
              inputMode="decimal"
              defaultValue={p.advanceType === 'percentage' ? p.advanceValue / 100 : fromMinor(p.advanceValue, currency)}
              className={input}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="cancelRefund" defaultChecked={p.cancelRefund} /> Refund cancellations made in time
          </label>
          <label className={labelClass}>
            Hours before the slot a player can cancel for a refund
            <input
              name="cancelWindowHours"
              type="number"
              min={0}
              max={336}
              defaultValue={p.cancelWindowHours}
              className={input}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="noShowRefund" defaultChecked={p.noShowRefund} /> Refund no-shows
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="recurringAllowed" defaultChecked={p.recurringAllowed} /> Allow weekly recurring
            bookings
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="allowUnpaidCash" defaultChecked={p.allowUnpaidCash} /> Players may book without an
            advance and pay at the venue
          </label>
        </ActionForm>
      </details>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Courts</h2>
        {branch.courts.map((court) => (
          <details key={court.id} className={card}>
            <summary className="cursor-pointer font-semibold">
              {court.name}
              {!court.active && ' (switched off)'}
            </summary>
            <ActionForm action={updateCourt.bind(null, branch.id, court.id)} button="Save court">
              {courtFields(court)}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="active" defaultChecked={court.active} /> Open for bookings
              </label>
            </ActionForm>

            <h3 className="mt-2 font-medium">Opening hours</h3>
            <ActionForm action={setHours.bind(null, branch.id, court.id)} button="Save hours">
              <p className="text-xs">Leave a day empty if closed. A closing time earlier than opening means after midnight.</p>
              {WEEKDAYS.map((day, weekday) => {
                const h = court.hours.find((x) => x.weekday === weekday);
                return (
                  <div key={day} className="grid grid-cols-3 items-center gap-2 text-sm">
                    <span>{day}</span>
                    <input type="time" name={`opens${weekday}`} defaultValue={h?.opensAt} aria-label={`${day} opens`} className={input} />
                    <input type="time" name={`closes${weekday}`} defaultValue={h?.closesAt} aria-label={`${day} closes`} className={input} />
                  </div>
                );
              })}
            </ActionForm>

            <h3 className="mt-2 font-medium">Prices per hour</h3>
            <ActionForm action={setPrices.bind(null, branch.id, court.id, currency)} button="Save prices">
              <p className="text-xs">
                Set a price for every hour you are open. A holiday price overrides weekday and weekend prices; &quot;every
                day&quot; fills any gaps. End 00:00 means midnight.
              </p>
              {[...Array(Math.max(PRICE_ROWS, court.prices.length + 1)).keys()].map((i) => {
                const r = court.prices[i];
                return (
                  <div key={i} className="grid grid-cols-4 gap-2 text-sm">
                    <select name={`dayType${i}`} defaultValue={r?.dayType ?? 'weekday'} aria-label="Days" className={input}>
                      {DAY_TYPES.map(([value, text]) => (
                        <option key={value} value={value}>
                          {text}
                        </option>
                      ))}
                    </select>
                    <input type="time" name={`start${i}`} defaultValue={r?.startTime} aria-label="From" className={input} />
                    <input type="time" name={`end${i}`} defaultValue={r?.endTime} aria-label="To" className={input} />
                    <input
                      name={`price${i}`}
                      inputMode="decimal"
                      placeholder="Rs"
                      defaultValue={r ? fromMinor(r.pricePerHour, currency) : ''}
                      aria-label="Price per hour in rupees"
                      className={input}
                    />
                  </div>
                );
              })}
              {court.prices.length > 0 && (
                <p className="text-xs">
                  Now: {court.prices.map((r) => `${r.dayType} ${r.startTime} to ${r.endTime} ${formatMoney(r.pricePerHour, currency)}`).join(' · ')}
                </p>
              )}
            </ActionForm>
          </details>
        ))}
        <details className={card}>
          <summary className="cursor-pointer font-medium">Add a court</summary>
          <ActionForm action={createCourt.bind(null, branch.id)} button="Add court">
            {courtFields()}
          </ActionForm>
        </details>
      </section>
    </main>
  );
}
