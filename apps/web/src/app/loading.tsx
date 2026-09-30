export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 p-6" aria-busy="true">
      <p role="status" className="text-sm">
        Loading…
      </p>
      <div className="h-6 w-2/3 animate-pulse rounded bg-surface" />
      <div className="h-24 w-full animate-pulse rounded bg-surface" />
      <div className="h-24 w-full animate-pulse rounded bg-surface" />
    </main>
  );
}
