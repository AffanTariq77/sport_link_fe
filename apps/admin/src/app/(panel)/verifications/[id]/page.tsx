import { ActionForm, input, labelClass } from '@sportslink/ui';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminHeaders, api } from '@/lib/api';
import { decideVerification } from '../../actions';

export default async function VerificationPage(props: PageProps<'/verifications/[id]'>) {
  const { id } = await props.params;
  // Opening this page decrypts the number and is recorded in the audit log.
  const { data: v } = await api.GET('/admin/verifications/{id}', { params: { path: { id } }, headers: await adminHeaders() });
  if (!v) notFound();
  return (
    <>
      <Link href="/verifications" className="text-sm underline">
        Identity checks
      </Link>
      <h1 className="text-2xl font-semibold">{v.user.name ?? 'No name'}</h1>
      <p className="text-sm">
        {v.docType === 'cnic' ? 'CNIC' : 'B-Form'} <span className="font-mono">{v.docNumber}</span> · date of birth {v.user.dob}
        {v.user.isMinor && ' · minor'}
      </p>
      <p className="text-xs">Every view of this document is recorded in the audit log.</p>
      <div className="grid gap-3 md:grid-cols-2">
        {(['front', 'back'] as const).map((side) => (
          <figure key={side} className="flex flex-col gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- private, streamed per view, never cached or optimised */}
            <img src={`/documents/${v.id}/${side}`} alt={`${side} of the document`} className="w-full rounded border" />
            <figcaption className="text-xs capitalize">{side}</figcaption>
          </figure>
        ))}
      </div>
      {v.status === 'pending' ? (
        <ActionForm action={decideVerification.bind(null, v.id)} button="Save decision">
          <fieldset className="flex gap-4 text-sm">
            <label className="flex items-center gap-1">
              <input type="radio" name="decision" value="approve" required /> Approve: name and date of birth match
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="decision" value="reject" /> Reject
            </label>
          </fieldset>
          <label className={labelClass}>
            Reason, shown to the player if rejected
            <input name="reason" maxLength={500} placeholder="The photo is blurry" className={input} />
          </label>
        </ActionForm>
      ) : (
        <p className="text-sm">Decided: {v.status}.</p>
      )}
    </>
  );
}
