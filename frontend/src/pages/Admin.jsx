import { Users as UsersIcon } from 'lucide-react'
import api, { errorText, money } from '../api/axios'
import { Badge, Button, Card, Empty, PageHeader, Spinner, useAsync, useToast } from '../components/ui'

export function AdminUsers() {
  const toast = useToast()
  const { data, loading, reload } = useAsync(async () => (await api.get('/admin/users')).data, [])
  async function toggle(u) {
    try { await api.put(`/admin/users/${u.id}/block`, null, { params: { blocked: !u.blocked } }); toast(u.blocked ? 'User unblocked.' : 'User blocked.'); reload() }
    catch (e) { toast(errorText(e), 'error') }
  }
  if (loading) return <Spinner />
  return (
    <>
      <PageHeader title="Users" text="Blocked users cannot log in or refresh tokens. An existing access token works until it expires." />
      {data.length === 0 ? <Empty icon={UsersIcon} title="No users" /> : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((u) => (
                <tr key={u.id}>
                  <td className="p-4"><p className="font-semibold">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></td>
                  <td className="p-4"><Badge>{u.role.toLowerCase()}</Badge></td>
                  <td className="p-4">{u.blocked ? <Badge tone="red">Blocked</Badge> : u.emailVerified ? <Badge tone="green">Active</Badge> : <Badge tone="amber">Unverified</Badge>}</td>
                  <td className="p-4 text-right">{u.role !== 'ADMIN' && <Button size="sm" variant={u.blocked ? 'secondary' : 'danger'} onClick={() => toggle(u)}>{u.blocked ? 'Unblock' : 'Block'}</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  )
}

export function AdminRevenue() {
  const { data, loading } = useAsync(async () => (await api.get('/admin/revenue')).data, [])
  if (loading) return <Spinner />
  return (
    <>
      <PageHeader title="Revenue" text="Platform fees collected on released payments." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5"><p className="text-sm font-semibold text-slate-500">Total fees earned</p><p className="mt-2 text-3xl font-extrabold tracking-tight">{money(data.totalFees)}</p></Card>
        <Card className="p-5"><p className="text-sm font-semibold text-slate-500">Platform wallet balance</p><p className="mt-2 text-3xl font-extrabold tracking-tight">{money(data.platformBalance)}</p></Card>
      </div>
    </>
  )
}
