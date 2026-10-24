import { useState } from 'react'
import { Scale, Sparkles } from 'lucide-react'
import api, { errorText, money } from '../api/axios'
import { useMilestone } from '../api/lookup'
import { UserName } from '../components/Names'
import { Badge, Button, Card, Empty, Field, Modal, PageHeader, Select, Spinner, StatusBadge, Textarea, useAsync, useToast } from '../components/ui'

/** Header shared by user and admin: milestone title, project, people involved. */
function DisputeInfo({ d, showPeople }) {
  const m = useMilestone(d.milestoneId)
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold">{m?.title || 'Milestone'}{m && <span className="font-normal text-slate-500"> · {money(m.amount)}</span>}</p>
          <p className="text-xs text-slate-500">{m?.projectTitle ? `Project: ${m.projectTitle} · ` : ''}Raised on {new Date(d.createdAt).toLocaleDateString()}</p>
        </div>
        {d.status && <StatusBadge status={d.status} />}
      </div>
      {showPeople && (
        <p className="mt-2 text-sm text-slate-600">
          Raised by <b><UserName id={d.raisedBy} /></b>
          {m && <> · Client: <b><UserName id={m.clientId} fallback="Client" /></b> · Freelancer: <b><UserName id={m.freelancerId} fallback="Freelancer" /></b></>}
        </p>
      )}
    </>
  )
}

export function MyDisputes() {
  const { data, loading } = useAsync(async () => (await api.get('/disputes/mine')).data, [])
  if (loading) return <Spinner />
  return (
    <>
      <PageHeader title="Disputes" text="Disputes you raised. Raise a new one from a submitted milestone." />
      {data.length === 0 ? <Empty icon={Scale} title="No disputes" text="Good news. Nothing needs an admin." /> : (
        <div className="space-y-3">
          {data.map((d) => (
            <Card key={d.id} className="p-5">
              <DisputeInfo d={d} />
              <p className="mt-2 text-sm text-slate-600">{d.reason}</p>
              {d.decision && (
                <p className="mt-3 text-sm"><Badge tone="brand">{d.decision}{d.freelancerPercent ? ` ${d.freelancerPercent}% to freelancer` : ''}</Badge>
                  {d.adminNote && <span className="ml-2 text-slate-600">{d.adminNote}</span>}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

export function AdminDisputes() {
  const toast = useToast()
  const { data, loading, reload } = useAsync(async () => (await api.get('/disputes')).data, [])
  const [sel, setSel] = useState(null)
  const selMilestone = useMilestone(sel?.milestoneId)
  const [r, setR] = useState({ decision: 'RELEASE', freelancerPercent: 50, adminNote: '' })
  const [busy, setBusy] = useState(false)
  const [summary, setSummary] = useState(null)
  const [aiBusy, setAiBusy] = useState(false)

  async function resolve(e) {
    e.preventDefault(); setBusy(true)
    try {
      await api.put(`/disputes/${sel.id}/resolve`, {
        decision: r.decision, adminNote: r.adminNote,
        freelancerPercent: r.decision === 'SPLIT' ? Number(r.freelancerPercent) : null,
      })
      toast('Dispute resolved.'); setSel(null); setSummary(null); reload()
    } catch (x) { toast(errorText(x), 'error') } finally { setBusy(false) }
  }

  // The milestone details are loaded automatically, so the admin does not retype anything.
  async function summarize() {
    const m = selMilestone
    if (!m) return toast('Milestone details could not be loaded.', 'error')
    setAiBusy(true); setSummary(null)
    try {
      const res = await api.post('/ai/dispute/summary', {
        milestoneTitle: m.title, amount: m.amount, acceptanceCriteria: m.acceptanceCriteria || 'Not specified',
        submissionNote: m.submissionNote, submissionLink: m.submissionLink, revisionNote: m.revisionNote, reason: sel.reason,
      })
      setSummary(typeof res.data === 'string' ? JSON.parse(res.data) : res.data)
    } catch (x) { toast(errorText(x), 'error') } finally { setAiBusy(false) }
  }
  function useSuggestion() {
    setR({ decision: summary.suggestion, freelancerPercent: summary.freelancerPercent || 50, adminNote: summary.reasoning || '' })
  }

  if (loading) return <Spinner />
  return (
    <>
      <PageHeader title="Open disputes" text="Review the evidence and decide. AI can summarize, but the decision is yours." />
      {data.length === 0 ? <Empty icon={Scale} title="No open disputes" /> : (
        <div className="space-y-3">
          {data.map((d) => (
            <Card key={d.id} className="p-5">
              <DisputeInfo d={{ ...d, status: null }} showPeople />
              <p className="mt-3 text-sm text-slate-600">{d.reason}</p>
              <div className="mt-3"><Button size="sm" onClick={() => { setSel(d); setSummary(null) }}>Review</Button></div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!sel} onClose={() => setSel(null)} title={selMilestone ? `Resolve: ${selMilestone.title}` : 'Resolve dispute'} wide>
        {sel && (
          <div className="space-y-4">
            {selMilestone && (
              <div className="space-y-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                <p><b>Project:</b> {selMilestone.projectTitle} · <b>Amount:</b> {money(selMilestone.amount)}</p>
                {selMilestone.acceptanceCriteria && <p><b>Acceptance criteria:</b> {selMilestone.acceptanceCriteria}</p>}
                {selMilestone.submissionNote && <p><b>Freelancer submitted:</b> {selMilestone.submissionNote}{selMilestone.submissionLink && <> · <a className="font-semibold text-brand-700 underline" href={selMilestone.submissionLink} target="_blank" rel="noreferrer noopener">open link</a></>}</p>}
                {selMilestone.revisionNote && <p><b>Client asked for:</b> {selMilestone.revisionNote}</p>}
                <p><b>Dispute reason:</b> {sel.reason}</p>
              </div>
            )}
            <Button type="button" variant="soft" icon={Sparkles} loading={aiBusy} onClick={summarize}>AI summary</Button>
            {summary && (
              <div className="space-y-3 rounded-lg border border-slate-200 p-4 text-sm">
                <p>{summary.summary}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><p className="font-semibold">Client points</p><ul className="mt-1 list-disc pl-5 text-slate-600">{(summary.clientPoints || []).map((p, i) => <li key={i}>{p}</li>)}</ul></div>
                  <div><p className="font-semibold">Freelancer points</p><ul className="mt-1 list-disc pl-5 text-slate-600">{(summary.freelancerPoints || []).map((p, i) => <li key={i}>{p}</li>)}</ul></div>
                </div>
                <p><Badge tone="brand">Suggestion: {summary.suggestion}{summary.freelancerPercent ? ` (${summary.freelancerPercent}%)` : ''}</Badge></p>
                <p className="text-slate-600">{summary.reasoning}</p>
                <Button type="button" variant="secondary" size="sm" onClick={useSuggestion}>Use as starting point</Button>
              </div>
            )}
            <form onSubmit={resolve} className="space-y-4 border-t border-slate-200 pt-4">
              <Field label="Decision" htmlFor="dec">
                <Select id="dec" value={r.decision} onChange={(e) => setR({ ...r, decision: e.target.value })}>
                  <option value="RELEASE">Release to freelancer</option>
                  <option value="REFUND">Refund to client</option>
                  <option value="SPLIT">Split</option>
                </Select>
              </Field>
              {r.decision === 'SPLIT' && (
                <Field label={`Freelancer share: ${r.freelancerPercent}%`} htmlFor="pct" hint={`Client gets the remaining ${100 - r.freelancerPercent}%`}>
                  <input id="pct" type="range" min="1" max="99" value={r.freelancerPercent} onChange={(e) => setR({ ...r, freelancerPercent: Number(e.target.value) })} className="w-full accent-brand-700" />
                </Field>
              )}
              <Field label="Note for both parties" htmlFor="an"><Textarea id="an" className="min-h-16" value={r.adminNote} onChange={(e) => setR({ ...r, adminNote: e.target.value })} /></Field>
              <Button type="submit" loading={busy} className="w-full">Confirm decision</Button>
            </form>
          </div>
        )}
      </Modal>
    </>
  )
}