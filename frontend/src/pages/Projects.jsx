import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Search } from 'lucide-react'
import api, { errorText, money } from '../api/axios'
import { UserName } from '../components/Names'
import { Button, Card, Empty, Input, PageHeader, Spinner, StatusBadge, useAsync, Badge } from '../components/ui'

/** One line only, however many milestones there are: "2 of 30 paid" with a thin bar. */
function MilestoneProgress({ projectId }) {
  const { data } = useAsync(async () => (await api.get(`/projects/${projectId}/milestones`)).data, [projectId])
  if (!data || data.length === 0) return null
  const paid = data.filter((m) => m.status === 'RELEASED').length
  return (
    <div className="mt-4 border-t border-slate-100 pt-3">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>{paid} of {data.length} milestones paid</span>
        <span>Open to see milestones</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-600" style={{ width: `${(paid / data.length) * 100}%` }} />
      </div>
    </div>
  )
}

function ProjectCard({ p, work }) {
  return (
    <Link to={`/app/projects/${p.id}`} className="block">
      <Card className="p-5 transition-colors hover:border-brand-500">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-slate-900">{p.title}</h3>
          <StatusBadge status={p.status} />
        </div>
        {work && <p className="mt-1 text-xs text-slate-500">Client: <b className="text-slate-700"><UserName id={p.clientId} fallback="Client" /></b></p>}
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{p.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(p.skills || '').split(',').filter(Boolean).map((s) => <Badge key={s} tone="slate">{s.trim()}</Badge>)}
          <span className="ml-auto text-sm font-bold">{money(p.budget)}</span>
        </div>
        {work && <MilestoneProgress projectId={p.id} />}
      </Card>
    </Link>
  )
}

/** mode: 'browse' (open projects with filters) | 'mine' (client) | 'work' (freelancer) */
export default function Projects({ mode }) {
  const [filters, setFilters] = useState({ skill: '', minBudget: '', maxBudget: '' })
  const [applied, setApplied] = useState(filters)

  const { data, loading, error } = useAsync(async () => {
    if (mode === 'mine') return (await api.get('/projects/mine')).data
    if (mode === 'work') return (await api.get('/projects/assigned')).data
    const params = Object.fromEntries(Object.entries(applied).filter(([, v]) => v !== ''))
    return (await api.get('/projects', { params })).data
  }, [mode, applied])

  const titles = {
    browse: ['Find work', 'Open projects you can bid on.'],
    mine: ['My projects', 'Everything you have posted.'],
    work: ['My work', 'Projects you were hired for.'],
  }
  const [title, text] = titles[mode]

  return (
    <>
      <PageHeader title={title} text={text}
        action={mode === 'mine' && <Link to="/app/projects/new"><Button>Post a project</Button></Link>} />
      {mode === 'browse' && (
        <form onSubmit={(e) => { e.preventDefault(); setApplied(filters) }} className="mb-6 grid gap-3 sm:grid-cols-[1fr_140px_140px_auto]">
          <Input aria-label="Skill" placeholder="Skill, e.g. react" value={filters.skill} onChange={(e) => setFilters({ ...filters, skill: e.target.value })} />
          <Input aria-label="Minimum budget" type="number" min="0" placeholder="Min ₹" value={filters.minBudget} onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })} />
          <Input aria-label="Maximum budget" type="number" min="0" placeholder="Max ₹" value={filters.maxBudget} onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })} />
          <Button type="submit" variant="secondary" icon={Search}>Filter</Button>
        </form>
      )}
      {loading ? <Spinner /> : error ? (
        <Empty icon={Briefcase} title="Could not load projects"
          text={mode === 'work' ? 'Add the /projects/assigned endpoint to project-service, then restart it.' : errorText(error)} />
      ) : data.length === 0 ? (
        <Empty icon={Briefcase} title="Nothing here yet"
          text={mode === 'mine' ? 'Post your first project to start receiving bids.' : mode === 'work' ? 'Projects appear here after a client hires you.' : 'No open projects match your filters.'} />
      ) : (
        <div className={mode === 'work' ? 'grid gap-4' : 'grid gap-4 md:grid-cols-2'}>{data.map((p) => <ProjectCard key={p.id} p={p} work={mode === 'work'} />)}</div>
      )}
    </>
  )
}