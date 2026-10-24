import { Check } from 'lucide-react'
import { cx } from './ui'

const FLOW = ['CREATED', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'RELEASED']
const LABEL = { CREATED: 'Created', FUNDED: 'Funded', IN_PROGRESS: 'In progress', SUBMITTED: 'Submitted', RELEASED: 'Paid' }

/** Visual progress of a milestone through the escrow state machine. */
export default function MilestoneStepper({ status }) {
  const map = { REVISION_REQUESTED: 'IN_PROGRESS', APPROVED: 'RELEASED', DISPUTED: 'SUBMITTED', REFUNDED: 'SUBMITTED' }
  const idx = FLOW.indexOf(map[status] || status)
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Milestone progress">
      {FLOW.map((s, i) => (
        <li key={s} className="text-center">
          <div className={cx('h-1.5 rounded-full', i <= idx ? 'bg-brand-600' : 'bg-slate-200')} />
          <span className={cx('mt-1.5 flex items-center justify-center gap-0.5 text-[11px] font-semibold', i <= idx ? 'text-brand-800' : 'text-slate-400')}>
            {i < idx && <Check className="h-3 w-3" aria-hidden />}{LABEL[s]}
          </span>
        </li>
      ))}
    </ol>
  )
}
