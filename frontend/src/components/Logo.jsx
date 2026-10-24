import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export default function Logo({ to = '/', light }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 font-extrabold tracking-tight">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-700 text-white"><ShieldCheck className="h-5 w-5" aria-hidden /></span>
      <span className={light ? 'text-white' : 'text-slate-900'}>EscrowHub</span>
    </Link>
  )
}
