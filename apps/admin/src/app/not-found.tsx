import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-start gap-3 p-6">
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="text-sm">This page does not exist, or you do not have access to it.</p>
      <Link href="/" className="text-sm underline">
        Go home
      </Link>
    </main>
  );
}
