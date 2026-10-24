import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Lock, Receipt, Wallet as WalletIcon } from 'lucide-react'
import api, { errorText, money } from '../api/axios'
import { useAuth } from '../auth/AuthContext'
import { MilestoneTitle } from '../components/Names'
import { Badge, Button, Card, Empty, Field, Input, Modal, PageHeader, Spinner, useAsync, useToast } from '../components/ui'

const TYPE = {
  DEPOSIT: ['Deposit', 'green', ArrowDownLeft], HOLD: ['Held in escrow', 'amber', Lock],
  RELEASE_OUT: ['Paid out', 'slate', ArrowUpRight], RELEASE_IN: ['Payment received', 'green', ArrowDownLeft],
  FEE: ['Platform fee', 'slate', Receipt], REFUND: ['Refund', 'blue', ArrowDownLeft],
}

export default function Wallet() {
  const { user } = useAuth()
  const toast = useToast()
  const { data, loading, reload } = useAsync(async () => {
    const [b, t] = await Promise.all([api.get('/wallet/balance'), api.get('/wallet/transactions')])
    return { b: b.data, t: t.data }
  }, [])
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)

  async function deposit(e) {
    e.preventDefault(); setBusy(true)
    try {
      // a new key per submit: the same request sent twice is credited once
      await api.post('/wallet/deposit', { amount: Number(amount) }, { headers: { 'Idempotency-Key': crypto.randomUUID() } })
      toast('Funds added.'); setOpen(false); setAmount(''); reload()
    } catch (x) { toast(errorText(x), 'error') } finally { setBusy(false) }
  }
  if (loading) return <Spinner />
  return (
    <>
      <PageHeader title={user.role === 'CLIENT' ? 'Wallet' : 'Earnings'} text="Every movement of money is recorded below."
        action={user.role === 'CLIENT' && <Button icon={WalletIcon} onClick={() => setOpen(true)}>Add funds</Button>} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5"><p className="text-sm font-semibold text-slate-500">Available</p><p className="mt-2 text-3xl font-extrabold tracking-tight">{money(data.b.available)}</p></Card>
        <Card className="border-amber-200 bg-hold-50 p-5"><p className="flex items-center gap-1.5 text-sm font-semibold text-hold-600"><Lock className="h-4 w-4" /> Held in escrow</p><p className="mt-2 text-3xl font-extrabold tracking-tight text-hold-600">{money(data.b.held)}</p></Card>
      </div>
      <h2 className="mb-3 mt-10 text-sm font-bold uppercase tracking-wide text-slate-500">Transactions</h2>
      {data.t.length === 0 ? <Empty icon={Receipt} title="No transactions yet" /> : (
        <Card className="divide-y divide-slate-100">
          {data.t.map((x) => {
            const [label, tone, Icon] = TYPE[x.type] || [x.type, 'slate', Receipt]
            return (
              <div key={x.id} className="flex items-center gap-4 p-4">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100"><Icon className="h-4 w-4 text-slate-600" aria-hidden /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{label}{x.milestoneId ? <span className="font-normal text-slate-500"> · <MilestoneTitle id={x.milestoneId} /></span> : null}</p>
                  <p className="text-xs text-slate-500">{new Date(x.createdAt).toLocaleString()}</p>
                </div>
                <Badge tone={tone}>{money(x.amount)}</Badge>
              </div>
            )
          })}
        </Card>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Add funds">
        <form onSubmit={deposit} className="space-y-4">
          <Field label="Amount (₹)" htmlFor="am" hint="Test top-up. A payment gateway can replace this later."><Input id="am" type="number" min="1" required value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
          <Button type="submit" loading={busy} className="w-full">Add funds</Button>
        </form>
      </Modal>
    </>
  )
}