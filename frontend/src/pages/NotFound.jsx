import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Trash2 } from 'lucide-react'
import api, { errorText, money } from '../api/axios'
import { Button, Card, Field, Input, PageHeader, Textarea, useToast } from '../components/ui'

export default function NewProject() {
  const navigate = useNavigate()
  const toast = useToast()
  const [f, setF] = useState({ title: '', description: '', skills: '', budget: '' })
  const [plan, setPlan] = useState([])
  const [busy, setBusy] = useState(false)
  const [ai, setAi] = useState(false)

  async function generate() {
    if (!f.description.trim()) return toast('Write a description first.', 'error')
    setAi(true)
    try {
      const r = await api.post('/ai/milestones/generate', { description: f.description, budget: f.budget ? Number(f.budget) : null })
      const data = typeof r.data === 'string' ? JSON.parse(r.data) : r.data
      setPlan(data.milestones || [])
      toast('Plan ready. Review and edit it below.')
    } catch (e) { toast(errorText(e), 'error') } finally { setAi(false) }
  }

  const upd = (i, k, v) => setPlan(plan.map((m, x) => (x === i ? { ...m, [k]: v } : m)))

  async function submit(e) {
    e.preventDefault(); setBusy(true)
    try {
      const { data: p } = await api.post('/projects', { ...f, budget: Number(f.budget) })
      let failed = 0
      for (const m of plan) {
        const due = new Date(); due.setDate(due.getDate() + Number(m.days || 14))
        try {
          await api.post(`/projects/${p.id}/milestones`, {
            title: m.title, description: m.description, acceptanceCriteria: m.acceptanceCriteria,
            amount: Number(m.amount), dueDate: due.toISOString().slice(0, 10),
          })
        } catch (err) { failed += 1; toast(`Milestone "${m.title}" not saved: ${errorText(err)}`, 'error') }
      }
      if (failed) toast(`${failed} milestone(s) failed. Add them from the Milestones tab.`, 'error')
      toast('Project posted.')
      navigate(`/app/projects/${p.id}`)
    } catch (x) { toast(errorText(x), 'error') } finally { setBusy(false) }
  }

  return (
    <>
      <PageHeader title="Post a project" text="Describe the work. Milestones are optional now and can be added later." />
      <form onSubmit={submit} className="space-y-6">
        <Card className="space-y-4 p-6">
          <Field label="Title" htmlFor="t"><Input id="t" required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Food delivery mobile app" /></Field>
          <Field label="Description" htmlFor="d"><Textarea id="d" required value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="What should be built, for whom, and what does done look like?" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Skills" htmlFor="s" hint="Comma separated"><Input id="s" value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} placeholder="react, spring boot" /></Field>
            <Field label="Budget (₹)" htmlFor="b"><Input id="b" type="number" min="1" required value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })} /></Field>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">Milestone plan</h2>
              <p className="text-sm text-slate-600">AI suggests a plan. You stay in control and can edit everything.</p>
            </div>
            <Button type="button" variant="soft" icon={Sparkles} loading={ai} onClick={generate}>Generate with AI</Button>
          </div>
          {plan.length > 0 && (
            <div className="mt-5 space-y-4">
              {plan.map((m, i) => (
                <div key={i} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex gap-3">
                    <Input aria-label="Milestone title" value={m.title} onChange={(e) => upd(i, 'title', e.target.value)} />
                    <Input aria-label="Amount" type="number" className="w-32" value={m.amount} onChange={(e) => upd(i, 'amount', e.target.value)} />
                    <button type="button" aria-label="Remove milestone" onClick={() => setPlan(plan.filter((_, x) => x !== i))} className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <Textarea aria-label="Acceptance criteria" className="mt-3 min-h-16" value={m.acceptanceCriteria} onChange={(e) => upd(i, 'acceptanceCriteria', e.target.value)} />
                </div>
              ))}
              <p className="text-right text-sm font-semibold">Total: {money(plan.reduce((a, m) => a + Number(m.amount || 0), 0))}</p>
            </div>
          )}
        </Card>
        <div className="flex justify-end"><Button type="submit" size="lg" loading={busy}>Post project</Button></div>
      </form>
    </>
  )
}