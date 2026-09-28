import { adminHeaders, api } from '@/lib/api';

export default async function Audit() {
  const { data } = await api.GET('/admin/audit', { headers: await adminHeaders() });
  return (
    <>
      <h1 className="text-2xl font-semibold">Audit log</h1>
      <p className="text-sm">Every admin action, newest first. Entries cannot be changed or deleted.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b">
              <th className="p-2">When</th>
              <th className="p-2">Action</th>
              <th className="p-2">Target</th>
              <th className="p-2">By</th>
              <th className="p-2">IP</th>
              <th className="p-2">Change</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((e) => (
              <tr key={e.id} className="border-b align-top">
                <td className="p-2 whitespace-nowrap">{new Date(e.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Karachi' })}</td>
                <td className="p-2 font-mono">{e.action}</td>
                <td className="p-2">
                  {e.targetType} {e.targetId?.slice(0, 8)}
                </td>
                <td className="p-2">{e.actorId?.slice(0, 8)}</td>
                <td className="p-2">{e.ip}</td>
                <td className="p-2 font-mono break-all">
                  {e.before ? JSON.stringify(e.before) : ''} {e.after ? `→ ${JSON.stringify(e.after)}` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
