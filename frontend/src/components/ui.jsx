import { useEffect, useRef, useState, createContext, useContext, useCallback } from 'react'
import { Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react'

const cx = (...c) => c.filter(Boolean).join(' ')

const VARIANTS = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 shadow-sm',
  secondary: 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50',
  ghost: 'text-slate-700 hover:bg-slate-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  soft: 'bg-brand-50 text-brand-800 hover:bg-brand-100',
}
const SIZES = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' }

export function Button({ variant = 'primary', size = 'md', loading, icon: Icon, children, className, ...p }) {
  return (
    <button
      {...p}
      disabled={p.disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px',
        VARIANTS[variant], SIZES[size], className
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : Icon && <Icon className="h-4 w-4" aria-hidden />}
      {children}
    </button>
  )
}

export function Card({ className, children, ...p }) {
  return <div {...p} className={cx('rounded-xl border border-slate-200 bg-white', className)}>{children}</div>
}

export function Field({ label, hint, error, children, htmlFor }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-slate-800">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20'

export const Input = ({ className, ...p }) => <input {...p} className={cx(inputCls, 'h-10', className)} />
export const Textarea = ({ className, ...p }) => <textarea {...p} className={cx(inputCls, 'min-h-24', className)} />
export const Select = ({ className, children, ...p }) => <select {...p} className={cx(inputCls, 'h-10', className)}>{children}</select>

const TONES = {
  slate: 'bg-slate-100 text-slate-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-hold-100 text-hold-600',
  red: 'bg-rose-50 text-rose-700',
  blue: 'bg-sky-50 text-sky-700',
  brand: 'bg-brand-50 text-brand-800',
}
export const Badge = ({ tone = 'slate', children }) => (
  <span className={cx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', TONES[tone])}>{children}</span>
)

const STATUS_TONE = {
  OPEN: 'green', IN_PROGRESS: 'blue', COMPLETED: 'brand', CLOSED: 'slate',
  CREATED: 'slate', FUNDED: 'amber', SUBMITTED: 'blue', REVISION_REQUESTED: 'amber',
  APPROVED: 'green', RELEASED: 'green', DISPUTED: 'red', REFUNDED: 'slate',
  PENDING: 'slate', ACCEPTED: 'green', REJECTED: 'red', RESOLVED: 'green',
}
export const StatusBadge = ({ status }) => (
  <Badge tone={STATUS_TONE[status] || 'slate'}>{String(status || '').replaceAll('_', ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase())}</Badge>
)

export function Spinner({ label = 'Loading' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> {label}
    </div>
  )
}

export function Empty({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      {Icon && <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-slate-100"><Icon className="h-5 w-5 text-slate-500" aria-hidden /></span>}
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function PageHeader({ title, text, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        {text && <p className="mt-1 text-sm text-slate-600">{text}</p>}
      </div>
      {action}
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    ref.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-900/50 p-4" onMouseDown={onClose}>
      <div
        ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className={cx('w-full rounded-2xl bg-white p-6 shadow-xl', wide ? 'max-w-2xl' : 'max-w-md')}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ---------- Toasts ---------- */
const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const push = useCallback((message, tone = 'success') => {
    const id = crypto.randomUUID()
    setItems((i) => [...i, { id, message, tone }])
    setTimeout(() => setItems((i) => i.filter((t) => t.id !== id)), 4500)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {items.map((t) => (
          <div key={t.id} className={cx('flex items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg',
            t.tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-white text-slate-800')}>
            {t.tone === 'error'
              ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

/** Small data-loading hook. */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try { setState({ data: await fn(), loading: false, error: null }) }
    catch (e) { setState({ data: null, loading: false, error: e }) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  useEffect(() => { run() }, [run])
  return { ...state, reload: run }
}

export { cx }
