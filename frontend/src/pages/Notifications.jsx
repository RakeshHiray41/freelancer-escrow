import { Bell, Check } from 'lucide-react'
import api, { errorText } from '../api/axios'
import { Button, Card, Empty, PageHeader, Spinner, useAsync, useToast, cx } from '../components/ui'

export default function Notifications() {
  const toast = useToast()
  const { data, loading, reload } = useAsync(async () => (await api.get('/notifications')).data, [])
  async function read(n) {
    try { await api.put(`/notifications/${n.id}/read`); reload() } catch (e) { toast(errorText(e), 'error') }
  }
  if (loading) return <Spinner />
  return (
    <>
      <PageHeader title="Notifications" text="Updates about bids, milestones, payments and disputes." />
      {data.length === 0 ? <Empty icon={Bell} title="You are all caught up" /> : (
        <Card className="divide-y divide-slate-100">
          {data.map((n) => (
            <div key={n.id} className={cx('flex items-start gap-3 p-4', !n.read && 'bg-brand-50/50')}>
              <span className={cx('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-slate-300' : 'bg-brand-600')} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm">{n.message}</p>
                <p className="mt-0.5 text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.read && <Button size="sm" variant="ghost" icon={Check} onClick={() => read(n)}>Mark read</Button>}
            </div>
          ))}
        </Card>
      )}
    </>
  )
}
