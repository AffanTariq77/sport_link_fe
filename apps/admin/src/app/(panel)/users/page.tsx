import { ActionForm, input, labelClass } from '@sportslink/ui';
import { adminHeaders, api } from '@/lib/api';
import { changeUserPhone, moderateUser } from '../actions';

export default async function Users(props: PageProps<'/users'>) {
  const params = await props.searchParams;
  const q = typeof params.q === 'string' ? params.q : '';
  const { data } = q.length >= 2
    ? await api.GET('/admin/users', { params: { query: { q } }, headers: await adminHeaders() })
    : { data: undefined };
  return (
    <>
      <h1 className="text-2xl font-semibold">Users and bans</h1>
      <form className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Name or phone number" className={`${input} max-w-sm`} />
        <button className="rounded-md border px-4 text-sm">Search</button>
      </form>
      {params.done && <p className="text-sm">Saved.</p>}
      {data?.length === 0 && <p>No users found.</p>}
      {data?.map((u) => (
        <section key={u.id} className="flex flex-col gap-2 rounded-lg border p-4 text-sm">
          <p className="text-base font-semibold">{u.name ?? 'No name'}</p>
          <p>
            <span className="font-mono">{u.phone}</span> · {u.city ?? 'no city'} · {u.status}
            {u.isMinor && ' · minor'}
          </p>
          <details>
            <summary className="cursor-pointer">Moderate</summary>
            <div className="mt-3">
              <ActionForm action={moderateUser.bind(null, u.id, q)} button="Apply">
                <label className={labelClass}>
                  Action
                  <select name="action" className={input} defaultValue="warning">
                    <option value="warning">Warning</option>
                    <option value="suspension">Temporary suspension</option>
                    <option value="ban">Permanent ban</option>
                    <option value="reinstate">Reinstate</option>
                  </select>
                </label>
                <label className={labelClass}>
                  Days (suspension only)
                  <input name="days" type="number" min={1} max={365} className={input} />
                </label>
                <label className={labelClass}>
                  Reason
                  <input name="reason" required minLength={3} maxLength={500} className={input} />
                </label>
              </ActionForm>
              <details className="text-sm">
                <summary className="cursor-pointer underline">Change phone number (after a lost-number review)</summary>
                <ActionForm action={changeUserPhone.bind(null, u.id, q)} button="Change number" className="mt-2 flex flex-wrap items-center gap-2">
                  <input name="phone" type="tel" required placeholder="0300 1234567" aria-label="New number" className={input} />
                </ActionForm>
              </details>
            </div>
          </details>
        </section>
      ))}
    </>
  );
}
