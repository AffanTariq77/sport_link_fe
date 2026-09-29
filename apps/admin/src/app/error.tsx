'use client';

import Link from 'next/link';

// Shown when a page fails to load, for example if the API cannot be reached.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-start gap-3 p-6">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-sm">We could not load this page. Check your connection and try again.</p>
      <div className="flex gap-4 text-sm">
        <button onClick={reset} className="rounded-md border px-4 py-2 font-medium">
          Try again
        </button>
        <Link href="/" className="self-center underline">
          Go home
        </Link>
      </div>
    </main>
  );
}
