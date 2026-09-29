import { formatDay, formatMoney, formatTime } from "@sportslink/api-client";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { authHeaders, currentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Matches · SportsLink" };

const chip = "rounded-full border px-3 py-1 text-sm";
const on =
  "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900";
type Match = NonNullable<Awaited<ReturnType<typeof load>>["open"]>[number];

async function load(sport?: string) {
  const headers = await authHeaders();
  const [open, mine, sports] = await Promise.all([
    api.GET("/matches", { params: { query: { sport } }, headers }),
    api.GET("/matches/mine", { headers }),
    api.GET("/sports"),
  ]);
  return { open: open.data, mine: mine.data, sports: sports.data };
}

function MatchCard({ m }: { m: Match }) {
  return (
    <Link
      href={`/matches/${m.id}`}
      className="block rounded-lg border p-4 text-sm hover:border-neutral-900"
    >
      <p className="text-base font-semibold">
        {m.sport} · {formatDay(m.startAt, m.timezone)},{" "}
        {formatTime(m.startAt, m.timezone)}
      </p>
      <p>
        {m.venue.name}, {m.venue.detail}
        {!m.listed && " · unlisted venue"}
      </p>
      <p>
        {m.slotsFilled} of {m.slotsTotal} players · host{" "}
        {m.host.name ?? "Player"}
        {m.pricePerPlayer !== null &&
          m.currency &&
          ` · ${formatMoney(m.pricePerPlayer, m.currency)} each`}
        {m.filters.gender === "female" && " · women only"}
        {m.filters.verifiedOnly && " · verified players"}
      </p>
    </Link>
  );
}

export default async function MatchesPage(props: PageProps<"/matches">) {
  if (!(await currentUser())) redirect("/sign-in");
  const { sport } = await props.searchParams;
  const selected = typeof sport === "string" ? sport : undefined;
  const { open, mine, sports } = await load(selected);
  const upcomingMine = mine?.filter((m) => m.status !== "cancelled") ?? [];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Matches</h1>
        <Link
          href="/matches/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
        >
          Create a match
        </Link>
      </div>
      {upcomingMine.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Your matches</h2>
          {upcomingMine.map((m) => (
            <MatchCard key={m.id} m={m} />
          ))}
        </section>
      )}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Open matches</h2>
        <nav aria-label="Sport" className="flex flex-wrap gap-2">
          <Link href="/matches" className={`${chip} ${!selected ? on : ""}`}>
            All sports
          </Link>
          {sports?.map((s) => (
            <Link
              key={s.slug}
              href={`/matches?sport=${s.slug}`}
              className={`${chip} ${selected === s.slug ? on : ""}`}
            >
              {s.name}
            </Link>
          ))}
        </nav>
        {open?.length === 0 && (
          <p>No open matches right now. Create one and invite players.</p>
        )}
        {open?.map((m) => (
          <MatchCard key={m.id} m={m} />
        ))}
      </section>
    </main>
  );
}
