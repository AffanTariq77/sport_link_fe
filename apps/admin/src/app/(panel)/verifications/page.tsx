import Link from 'next/link';
import { adminHeaders, api } from '@/lib/api';

export default async function Verifications(props: PageProps<'/verifications'>) {
  const { done } = await props.searchParams;
  const { data } = await api.GET('/admin/verifications', {
    params: { query: { status: 'pending' } },
    headers: await adminHeaders(),
  });
  return (
    <>
      <h1 className="text-2xl font-semibold">Identity checks</h1>
      {done && <p className="text-sm">Decision saved.</p>}
      {data?.length === 0 && <p>Nothing waiting.</p>}
      <ul className="flex flex-col gap-2">
        {data?.map((v) => (
          <li key={v.id}>
            <Link href={`/verifications/${v.id}`} className="block rounded-lg border p-3 text-sm hover:border-neutral-900">
              <span className="font-medium">{v.user.name ?? 'No name'}</span> · {v.docType === 'cnic' ? 'CNIC' : 'B-Form'}
              {v.user.isMinor && ' · minor'} · submitted {new Date(v.submittedAt).toLocaleString('en-GB', { timeZone: 'Asia/Karachi' })}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
