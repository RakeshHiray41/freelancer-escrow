import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, Scale, Search, Wallet, Users, BarChart3 } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import api, { money } from '../api/axios'
import { Card, PageHeader, useAsync, Button, Spinner } from '../components/ui'

function Stat({ label, value, sub, tone }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-extrabold tracking-tight ${tone || ''}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </Card>
  )
}

function ActionLink({ to, icon: Icon, title, text }) {
  return (
    <Link to={to} className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand-500">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" aria-hidden /></span>
      <span className="flex-1"><span className="block font-bold">{title}</span><span className="text-sm text-slate-600">{text}</span></span>
      <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user.role === 'ADMIN'
  const { data, loading } = useAsync(async () => {
    if (isAdmin) {
      const [rev, d] = await Promise.all([api.get('/admin/revenue'), api.get('/disputes')])
      return { rev: rev.data, open: d.data.length }
    }
    const w = await api.get('/wallet/balance')
    return { wallet: w.data }
  }, [isAdmin])

  return (
    <>
      <PageHeader title="Overview" text={`Signed in as ${user.email}`} />
      {loading ? <Spinner /> : isAdmin ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Platform fees earned" value={money(data?.rev?.totalFees)} />
          <Stat label="Platform balance" value={money(data?.rev?.platformBalance)} />
          <Stat label="Open disputes" value={data?.open ?? 0} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat label={user.role === 'CLIENT' ? 'Available to fund' : 'Available to withdraw'} value={money(data?.wallet?.available)} />
          <Stat label="Held in escrow" value={money(data?.wallet?.held)} tone="text-hold-600" sub="Locked until milestones are approved" />
        </div>
      )}
      <h2 className="mb-3 mt-10 text-sm font-bold uppercase tracking-wide text-slate-500">Shortcuts</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {user.role === 'CLIENT' && (<>
          <ActionLink to="/app/projects/new" icon={Briefcase} title="Post a project" text="Let AI draft the milestone plan." />
          <ActionLink to="/app/wallet" icon={Wallet} title="Add funds" text="Deposit before funding a milestone." />
        </>)}
        {user.role === 'FREELANCER' && (<>
          <ActionLink to="/app/browse" icon={Search} title="Find work" text="Browse open projects and place a bid." />
          <ActionLink to="/app/work" icon={Briefcase} title="My work" text="Start and submit milestones." />
        </>)}
        {isAdmin && (<>
          <ActionLink to="/app/admin/disputes" icon={Scale} title="Review disputes" text="Release, refund or split." />
          <ActionLink to="/app/admin/users" icon={Users} title="Manage users" text="Block or unblock accounts." />
          <ActionLink to="/app/admin/revenue" icon={BarChart3} title="Revenue" text="Fees collected by the platform." />
        </>)}
      </div>
    </>
  )
}
