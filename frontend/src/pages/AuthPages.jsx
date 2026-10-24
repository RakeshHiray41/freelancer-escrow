import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, MailCheck, XCircle } from 'lucide-react'
import Logo from '../components/Logo'
import { Button, Field, Input, Spinner } from '../components/ui'
import api, { errorText } from '../api/axios'
import { useAuth } from '../auth/AuthContext'

function AuthLayout({ title, text, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col px-4 py-8 sm:px-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          {text && <p className="mt-2 text-sm text-slate-600">{text}</p>}
          <div className="mt-8">{children}</div>
          {footer && <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>}
        </div>
      </div>
      <aside className="hidden bg-brand-900 p-12 text-brand-100 lg:flex lg:flex-col lg:justify-center">
        <p className="max-w-md text-2xl font-bold leading-snug text-white">“We stopped chasing invoices. Each milestone is funded before we write a line of code.”</p>
        <p className="mt-4 text-sm text-brand-200">Full-stack freelancer, Pune</p>
        <ul className="mt-12 space-y-3 text-sm">
          {['Money held in escrow per milestone', 'Release on approval or auto-release after 7 days', 'Admin-reviewed disputes with split payouts'].map((t) => (
            <li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-200" aria-hidden /> {t}</li>
          ))}
        </ul>
      </aside>
    </div>
  )
}

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [f, setF] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice] = useState(() => sessionStorage.getItem('authNotice'))

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('')
    sessionStorage.removeItem('authNotice')
    try { await login(f.email, f.password); navigate(location.state?.from?.pathname || '/app', { replace: true }) }
    catch (x) { setErr(errorText(x)) } finally { setBusy(false) }
  }
  return (
    <AuthLayout title="Welcome back" text="Log in to manage your projects and payments."
      footer={<>New here? <Link className="font-semibold text-brand-700 hover:underline" to="/register">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        {notice && <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{notice}</p>}
        <Field label="Email" htmlFor="email"><Input id="email" type="email" required autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Password" htmlFor="pw"><Input id="pw" type="password" required autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
        <div className="text-right text-sm"><Link className="font-semibold text-brand-700 hover:underline" to="/forgot-password">Forgot password?</Link></div>
        {err && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{err}</p>}
        <Button type="submit" size="lg" loading={busy} className="w-full">Log in</Button>
      </form>
    </AuthLayout>
  )
}

export function Register() {
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'CLIENT' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('')
    try { await api.post('/auth/register', f); setDone(true) }
    catch (x) { setErr(errorText(x)) } finally { setBusy(false) }
  }
  if (done) return (
    <AuthLayout title="Check your email">
      <div className="rounded-xl border border-slate-200 p-6 text-center">
        <MailCheck className="mx-auto h-10 w-10 text-brand-700" aria-hidden />
        <p className="mt-3 text-sm text-slate-600">We sent a verification link to <b>{f.email}</b>. Open it, then log in.</p>
        <Link to="/login"><Button className="mt-5 w-full">Go to log in</Button></Link>
      </div>
    </AuthLayout>
  )
  return (
    <AuthLayout title="Create your account" text="Free to join. Pay only when a milestone is paid out."
      footer={<>Already registered? <Link className="font-semibold text-brand-700 hover:underline" to="/login">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">I want to</legend>
          <div className="grid grid-cols-2 gap-2">
            {[['CLIENT', 'Hire talent'], ['FREELANCER', 'Find work']].map(([v, l]) => (
              <label key={v} className={`cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm font-semibold ${f.role === v ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-slate-300'}`}>
                <input type="radio" name="role" className="sr-only" checked={f.role === v} onChange={() => setF({ ...f, role: v })} /> {l}
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="Full name" htmlFor="name"><Input id="name" required autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Email" htmlFor="email"><Input id="email" type="email" required autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Password" htmlFor="pw" hint="At least 6 characters"><Input id="pw" type="password" required minLength={6} autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
        {err && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{err}</p>}
        <Button type="submit" size="lg" loading={busy} className="w-full">Create account</Button>
      </form>
    </AuthLayout>
  )
}

export function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [state, setState] = useState({ loading: true, error: null })
  const started = useRef(false)

  useEffect(() => {
    // React StrictMode runs effects twice in development. The token works only once,
    // so the request must be sent only once.
    if (started.current) return
    started.current = true
    if (!token) {
      setState({ loading: false, error: 'This verification link is incomplete. Open the link from your email again.' })
      return
    }
    api.get('/auth/verify', { params: { token } })
      .then(() => setState({ loading: false, error: null }))
      .catch((e) => setState({ loading: false, error: errorText(e) }))
  }, [token])

  return (
    <AuthLayout title="Email verification">
      {state.loading ? <Spinner label="Verifying" /> : state.error ? (
        <div className="text-center">
          <XCircle className="mx-auto h-10 w-10 text-rose-600" />
          <p className="mt-3 text-sm text-slate-600">{state.error}</p>
          <Link to="/login"><Button variant="secondary" className="mt-5 w-full">Go to log in</Button></Link>
        </div>
      ) : (
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
          <p className="mt-3 text-sm text-slate-600">Your email is verified. You can log in now.</p>
          <Link to="/login"><Button className="mt-5 w-full">Log in</Button></Link>
        </div>
      )}
    </AuthLayout>
  )
}

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('')
    try { const r = await api.post('/auth/forgot-password', { email }); setMsg(r.data.message) }
    catch (x) { setErr(errorText(x)) } finally { setBusy(false) }
  }
  return (
    <AuthLayout title="Reset your password" text="Enter your email. If it is registered, we send you a link to set a new password."
      footer={<Link className="font-semibold text-brand-700 hover:underline" to="/login">Back to log in</Link>}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" htmlFor="email"><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        {msg && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{msg}</p>}
        {err && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{err}</p>}
        <Button type="submit" size="lg" loading={busy} className="w-full">Send reset email</Button>
      </form>
    </AuthLayout>
  )
}

export function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const fromLink = Boolean(params.get('token'))
  const [f, setF] = useState({ token: params.get('token') || '', newPassword: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('')
    try { await api.post('/auth/reset-password', f); navigate('/login') }
    catch (x) { setErr(errorText(x)) } finally { setBusy(false) }
  }
  return (
    <AuthLayout title="Set a new password">
      <form onSubmit={submit} className="space-y-4">
        {!fromLink && (
          <Field label="Reset token" htmlFor="token" hint="Open the link from your email, or paste the token here"><Input id="token" required value={f.token} onChange={(e) => setF({ ...f, token: e.target.value })} /></Field>
        )}
        <Field label="New password" htmlFor="npw"><Input id="npw" type="password" required minLength={6} value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} /></Field>
        {err && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{err}</p>}
        <Button type="submit" size="lg" loading={busy} className="w-full">Change password</Button>
      </form>
    </AuthLayout>
  )
}