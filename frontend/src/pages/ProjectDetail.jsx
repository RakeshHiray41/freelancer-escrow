import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Sparkles, Star, Link as LinkIcon, Scale } from 'lucide-react'
import api, { errorText, money } from '../api/axios'
import { useAuth } from '../auth/AuthContext'
import Chat from '../components/Chat'
import { UserName } from '../components/Names'
import MilestoneStepper from '../components/MilestoneStepper'
import { Badge, Button, Card, Field, Input, Modal, PageHeader, Spinner, StatusBadge, Textarea, useAsync, useToast } from '../components/ui'

function Tabs({ tabs, value, onChange }) {
  return (
    <div role="tablist" className="mb-5 flex gap-1 border-b border-slate-200">
      {tabs.map(([k, l]) => (
        <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k)}
          className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold ${value === k ? 'border-brand-700 text-brand-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{l}</button>
      ))}
    </div>
  )
}

/* ---------- Milestones ---------- */
function MilestoneCard({ m, role, onChange }) {
  const toast = useToast()
  const [busy, setBusy] = useState('')
  const [modal, setModal] = useState(null) // 'submit' | 'revision' | 'dispute' | 'check'
  const [form, setForm] = useState({ note: '', link: '' })
  const [check, setCheck] = useState(null)

  async function act(key, fn, ok) {
    setBusy(key)
    try { await fn(); toast(ok); setModal(null); setForm({ note: '', link: '' }); onChange() }
    catch (e) { toast(errorText(e), 'error') } finally { setBusy('') }
  }
  const post = (path, body) => api.post(path, body)
  const client = role === 'CLIENT'
  const s = m.status

  async function runCheck() {
    setBusy('check'); setModal('check')
    try {
      const r = await api.post('/ai/deliverable/check', { acceptanceCriteria: m.acceptanceCriteria || 'Not specified', submissionNote: m.submissionNote || '', submissionLink: m.submissionLink || '' })
      setCheck(typeof r.data === 'string' ? JSON.parse(r.data) : r.data)
    } catch (e) { toast(errorText(e), 'error'); setModal(null) } finally { setBusy('') }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">{m.title}</h3>
          {m.dueDate && <p className="text-xs text-slate-500">Due {m.dueDate}</p>}
        </div>
        <div className="text-right">
          <p className="font-extrabold">{money(m.amount)}</p>
          <StatusBadge status={s} />
        </div>
      </div>
      {m.description && <p className="mt-3 text-sm text-slate-600">{m.description}</p>}
      {m.acceptanceCriteria && (
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm"><span className="font-semibold">Acceptance criteria: </span>{m.acceptanceCriteria}</div>
      )}
      <div className="mt-4"><MilestoneStepper status={s} /></div>
      {m.submissionNote && (
        <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm">
          <p className="font-semibold text-sky-900">Submission</p>
          <p className="text-sky-900/90">{m.submissionNote}</p>
          {m.submissionLink && <a className="mt-1 inline-flex items-center gap-1 font-semibold text-sky-800 underline" href={m.submissionLink} target="_blank" rel="noreferrer noopener"><LinkIcon className="h-3.5 w-3.5" /> Open deliverable</a>}
        </div>
      )}
      {m.revisionNote && s === 'REVISION_REQUESTED' && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-hold-50 p-3 text-sm text-hold-600"><b>Revision requested:</b> {m.revisionNote}</div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {client && s === 'CREATED' && <Button loading={busy === 'fund'} onClick={() => act('fund', () => post(`/milestones/${m.id}/fund`), 'Milestone funded. Money is held in escrow.')}>Fund milestone</Button>}
        {!client && s === 'FUNDED' && <Button loading={busy === 'start'} onClick={() => act('start', () => post(`/milestones/${m.id}/start`), 'Milestone started.')}>Start work</Button>}
        {!client && (s === 'IN_PROGRESS' || s === 'REVISION_REQUESTED') && <Button onClick={() => setModal('submit')}>Submit work</Button>}
        {client && s === 'SUBMITTED' && (<>
          <Button loading={busy === 'approve'} onClick={() => act('approve', () => post(`/milestones/${m.id}/approve`), 'Approved. Payment released.')}>Approve and pay</Button>
          <Button variant="secondary" onClick={() => setModal('revision')}>Request revision</Button>
          <Button variant="soft" icon={Sparkles} onClick={runCheck}>AI check</Button>
        </>)}
        {(s === 'SUBMITTED' || s === 'REVISION_REQUESTED') && <Button variant="ghost" icon={Scale} onClick={() => setModal('dispute')}>Raise dispute</Button>}
      </div>

      <Modal open={modal === 'submit'} onClose={() => setModal(null)} title="Submit work">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); act('submit', () => post(`/milestones/${m.id}/submit`, form), 'Work submitted.') }}>
          <Field label="What did you deliver?" htmlFor="n"><Textarea id="n" required value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field>
          <Field label="Link to deliverable" htmlFor="l" hint="Figma, GitHub, Drive, etc."><Input id="l" type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://" /></Field>
          <Button type="submit" loading={busy === 'submit'} className="w-full">Submit for review</Button>
        </form>
      </Modal>
      <Modal open={modal === 'revision'} onClose={() => setModal(null)} title="Request a revision">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); act('rev', () => post(`/milestones/${m.id}/request-revision`, { note: form.note }), 'Revision requested.') }}>
          <Field label="What should change?" htmlFor="rn"><Textarea id="rn" required value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field>
          <Button type="submit" loading={busy === 'rev'} className="w-full">Send request</Button>
        </form>
      </Modal>
      <Modal open={modal === 'dispute'} onClose={() => setModal(null)} title="Raise a dispute">
        <p className="mb-3 text-sm text-slate-600">An admin will review and decide to release, refund or split the money. Use this when you cannot agree.</p>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); act('disp', () => api.post('/disputes', { milestoneId: m.id, reason: form.note }), 'Dispute raised. An admin will review it.') }}>
          <Field label="Reason" htmlFor="dr"><Textarea id="dr" required value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field>
          <Button type="submit" variant="danger" loading={busy === 'disp'} className="w-full">Raise dispute</Button>
        </form>
      </Modal>
      <Modal open={modal === 'check'} onClose={() => { setModal(null); setCheck(null) }} title="AI deliverable check" wide>
        {!check ? <Spinner label="Checking against criteria" /> : (
          <div className="space-y-3 text-sm">
            <p className="font-semibold">{check.metCount} of {check.totalCount} criteria met</p>
            {(check.criteria || []).map((c, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2"><span className="font-semibold">{c.criterion}</span>
                  <Badge tone={c.status === 'MET' ? 'green' : c.status === 'NOT_MET' ? 'red' : 'amber'}>{c.status.replace('_', ' ')}</Badge></div>
                <p className="mt-1 text-slate-600">{c.comment}</p>
              </div>
            ))}
            <p className="text-slate-700">{check.overall}</p>
            <p className="text-xs text-slate-500">AI judges from the text only. You make the final call.</p>
          </div>
        )}
      </Modal>
    </Card>
  )
}

function Milestones({ project, role }) {
  const { data, loading, error, reload } = useAsync(async () => (await api.get(`/projects/${project.id}/milestones`)).data, [project.id])
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ title: '', description: '', acceptanceCriteria: '', amount: '', dueDate: '' })
  const [busy, setBusy] = useState(false)

  async function add(e) {
    e.preventDefault(); setBusy(true)
    try { await api.post(`/projects/${project.id}/milestones`, { ...f, amount: Number(f.amount), dueDate: f.dueDate || null }); setOpen(false); setF({ title: '', description: '', acceptanceCriteria: '', amount: '', dueDate: '' }); reload() }
    catch (x) { toast(errorText(x), 'error') } finally { setBusy(false) }
  }
  if (loading) return <Spinner />
  if (error) return <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">{errorText(error)}</p>
  return (
    <div className="space-y-4">
      {role === 'CLIENT' && <div className="flex justify-end"><Button variant="secondary" onClick={() => setOpen(true)}>Add milestone</Button></div>}
      {data.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No milestones yet.</p>}
      {data.map((m) => <MilestoneCard key={m.id} m={m} role={role} onChange={reload} />)}
      <Modal open={open} onClose={() => setOpen(false)} title="Add milestone">
        <form className="space-y-4" onSubmit={add}>
          <Field label="Title" htmlFor="mt"><Input id="mt" required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Description" htmlFor="md"><Textarea id="md" className="min-h-16" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <Field label="Acceptance criteria" htmlFor="mc"><Textarea id="mc" className="min-h-16" value={f.acceptanceCriteria} onChange={(e) => setF({ ...f, acceptanceCriteria: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (₹)" htmlFor="ma"><Input id="ma" type="number" min="1" required value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
            <Field label="Due date" htmlFor="mdd"><Input id="mdd" type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} /></Field>
          </div>
          <Button type="submit" loading={busy} className="w-full">Add milestone</Button>
        </form>
      </Modal>
    </div>
  )
}

/* ---------- Bids ---------- */
function ClientBids({ project, onHired }) {
  const toast = useToast()
  const { data, loading, reload } = useAsync(async () => (await api.get(`/projects/${project.id}/bids`)).data, [project.id])
  const [busy, setBusy] = useState(null)
  async function hire(b) {
    setBusy(b.id)
    try { await api.post(`/projects/${project.id}/hire/${b.id}`); toast('Freelancer hired.'); onHired() }
    catch (e) { toast(errorText(e), 'error') } finally { setBusy(null) }
  }
  if (loading) return <Spinner />
  if (!data.length) return <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No bids yet. Freelancers will appear here.</p>
  return (
    <div className="space-y-3">
      {data.map((b) => (
        <Card key={b.id} className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="font-bold"><UserName id={b.freelancerId} fallback="Freelancer" /></p><p className="text-sm font-semibold text-brand-800">{money(b.amount)}</p></div>
            <div className="flex items-center gap-2">
              <StatusBadge status={b.status} />
              {project.status === 'OPEN' && <Button size="sm" loading={busy === b.id} onClick={() => hire(b)}>Hire</Button>}
            </div>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{b.proposal}</p>
        </Card>
      ))}
    </div>
  )
}

function BidForm({ project }) {
  const toast = useToast()
  const [f, setF] = useState({ amount: '', proposal: '' })
  const [busy, setBusy] = useState(false)
  const [ai, setAi] = useState(false)
  const [done, setDone] = useState(false)

  async function draft() {
    setAi(true)
    try {
      const prof = await api.get('/profile/me').then((r) => r.data).catch(() => ({}))
      const r = await api.post('/ai/proposal', {
        projectTitle: project.title, projectDescription: project.description,
        freelancerSkills: prof.skills || '', bidAmount: f.amount ? Number(f.amount) : null,
      })
      setF((x) => ({ ...x, proposal: r.data }))
    } catch (e) { toast(errorText(e), 'error') } finally { setAi(false) }
  }
  async function submit(e) {
    e.preventDefault(); setBusy(true)
    try { await api.post(`/projects/${project.id}/bids`, { amount: Number(f.amount), proposal: f.proposal }); setDone(true); toast('Bid placed.') }
    catch (x) { toast(errorText(x), 'error') } finally { setBusy(false) }
  }
  if (done) return <Card className="p-6 text-center text-sm text-slate-600">Your bid was sent. You will be notified if the client hires you.</Card>
  return (
    <Card className="p-6">
      <h2 className="font-bold">Place a bid</h2>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <Field label="Your price (₹)" htmlFor="ba"><Input id="ba" type="number" min="1" required value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
        <Field label="Proposal" htmlFor="bp">
          <Textarea id="bp" required className="min-h-40" value={f.proposal} onChange={(e) => setF({ ...f, proposal: e.target.value })} />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="soft" icon={Sparkles} loading={ai} onClick={draft}>Draft with AI</Button>
          <Button type="submit" loading={busy}>Send bid</Button>
        </div>
      </form>
    </Card>
  )
}

function ReviewForm({ project }) {
  const toast = useToast()
  const [f, setF] = useState({ rating: 5, comment: '' })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  async function submit(e) {
    e.preventDefault(); setBusy(true)
    try { await api.post(`/projects/${project.id}/review`, f); setDone(true); toast('Review submitted.') }
    catch (x) { toast(errorText(x), 'error') } finally { setBusy(false) }
  }
  if (done) return <Card className="p-6 text-center text-sm text-slate-600">Thanks for your review.</Card>
  return (
    <Card className="p-6">
      <h2 className="font-bold">Review the freelancer</h2>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <div role="radiogroup" aria-label="Rating" className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} role="radio" aria-checked={f.rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setF({ ...f, rating: n })}>
              <Star className={`h-7 w-7 ${n <= f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
            </button>
          ))}
        </div>
        <Textarea aria-label="Comment" className="min-h-20" placeholder="How was the work and communication?" value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} />
        <Button type="submit" loading={busy}>Submit review</Button>
      </form>
      <p className="mt-2 text-xs text-slate-500">Available after at least one milestone is paid.</p>
    </Card>
  )
}

/* ---------- Page ---------- */
export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data: project, loading, error, reload } = useAsync(async () => (await api.get(`/projects/${id}`)).data, [id])
  const [tab, setTab] = useState(null)

  if (loading) return <Spinner />
  if (error) return <p className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{errorText(error)}</p>

  const isClient = user.role === 'CLIENT' && project.clientId === user.userId
  const isFreelancer = user.role === 'FREELANCER' && project.freelancerId === user.userId
  const member = isClient || isFreelancer
  const tabs = [['overview', 'Overview']]
  if (isClient) tabs.push(['bids', 'Bids'])
  if (member) tabs.push(['milestones', 'Milestones'], ['chat', 'Chat'])
  // Client and hired freelancer land on Milestones; everyone else on the overview.
  const active = tab || (member ? 'milestones' : 'overview')

  return (
    <>
      <PageHeader title={project.title} text={`Budget ${money(project.budget)}`} action={<StatusBadge status={project.status} />} />
      <Tabs tabs={tabs} value={active} onChange={setTab} />
      {active === 'overview' && (
        <div className="space-y-5">
          <Card className="p-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{project.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">{(project.skills || '').split(',').filter(Boolean).map((s) => <Badge key={s}>{s.trim()}</Badge>)}</div>
          </Card>
          {user.role === 'FREELANCER' && project.status === 'OPEN' && <BidForm project={project} />}
          {isClient && project.freelancerId && <ReviewForm project={project} />}
        </div>
      )}
      {active === 'bids' && isClient && <ClientBids project={project} onHired={() => { reload(); setTab('milestones') }} />}
      {active === 'milestones' && member && <Milestones project={project} role={user.role} />}
      {active === 'chat' && member && <Card className="p-4"><Chat projectId={project.id} /></Card>}
    </>
  )
}