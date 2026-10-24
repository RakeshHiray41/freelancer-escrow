import { Link } from 'react-router-dom'
import { ArrowRight, Check, Sparkles, Scale, Wallet, MessageSquareWarning, Lock, FileCheck2, BadgeCheck } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Button, Badge } from '../components/ui'

const STEPS = [
  { t: 'Post and agree', d: 'The client posts a project and picks a freelancer from the bids. Work is split into milestones with clear acceptance criteria.' },
  { t: 'Fund the milestone', d: 'The client moves money into escrow. The freelancer sees it is funded before starting.' },
  { t: 'Deliver and review', d: 'The freelancer submits work. The client approves it or asks for a revision.' },
  { t: 'Get paid', d: 'On approval the money is released to the freelancer. If nobody responds, it is auto-approved after 7 days.' },
]

const FEATURES = [
  { i: Sparkles, t: 'AI milestone planner', d: 'Describe the project and get a milestone plan with amounts and acceptance criteria you can edit before saving.' },
  { i: Scale, t: 'Fair dispute resolution', d: 'An admin reviews the evidence and decides: release, refund, or split the amount by percentage. AI prepares a summary, a human decides.' },
  { i: Wallet, t: 'Wallet with a full ledger', d: 'Every deposit, hold, release and fee is an immutable ledger entry, so balances can always be explained.' },
  { i: MessageSquareWarning, t: 'Safer chat', d: 'Project chat flags phone numbers, emails and off-platform payment requests, so escrow protection is not bypassed.' },
]

const FAQ = [
  ['When does the freelancer get paid?', 'When the client approves a submitted milestone, or automatically 7 days after submission if the client does not respond.'],
  ['What does the platform charge?', 'A 5% fee on released payments. Nothing is charged for posting projects or placing bids.'],
  ['What if we disagree on the work?', 'Either side can raise a dispute on a submitted milestone. An admin decides to release, refund or split the money.'],
  ['Can AI move my money?', 'No. AI only suggests plans, drafts and summaries. Money moves only through escrow actions taken by people.'],
]

function LedgerCard() {
  const steps = ['Created', 'Funded', 'Submitted', 'Released']
  return (
    <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-20px_rgba(11,63,59,.35)]" aria-hidden>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Milestone 2 of 4</p>
          <p className="mt-1 text-lg font-bold">Backend API and auth</p>
        </div>
        <Badge tone="amber">Held in escrow</Badge>
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight">₹25,000</p>
      <p className="text-sm text-slate-500">Releases to the freelancer on approval</p>
      <div className="mt-6">
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="progress-fill h-full w-2/3 rounded-full bg-brand-600" />
        </div>
        <ol className="mt-3 grid grid-cols-4 text-xs font-semibold">
          {steps.map((s, i) => (
            <li key={s} className={i <= 2 ? 'text-brand-800' : 'text-slate-400'}>
              <span className="flex items-center gap-1">{i <= 1 && <Check className="h-3.5 w-3.5" />} {s}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-5 rounded-lg bg-slate-50 p-3 text-sm">
        <p className="font-semibold text-slate-800">Acceptance criteria</p>
        <ul className="mt-1.5 space-y-1 text-slate-600">
          <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Login and refresh tokens working</li>
          <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Postman collection included</li>
        </ul>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="bg-white">
      <Navbar />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <Badge tone="brand">Escrow for freelance work</Badge>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
              Pay for approved work, not for promises.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              EscrowHub holds the client's money per milestone and releases it only when the work is approved. Freelancers start with confidence. Clients pay with confidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register"><Button size="lg" icon={ArrowRight}>Start free</Button></Link>
              <a href="#how"><Button size="lg" variant="secondary">See how it works</Button></a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-600">
              <li className="flex items-center gap-2"><Lock className="h-4 w-4 text-brand-700" /> Funds held per milestone</li>
              <li className="flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-brand-700" /> Clear acceptance criteria</li>
              <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-brand-700" /> 5% fee on payouts only</li>
            </ul>
          </div>
          <div className="flex justify-center lg:justify-end"><LedgerCard /></div>
        </section>

        <section id="how" className="scroll-mt-20 border-y border-slate-200 bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-extrabold tracking-tight">How escrow works</h2>
            <p className="mt-3 max-w-2xl text-slate-600">Four steps, the same for every milestone.</p>
            <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.t} className="bg-white p-6">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-700 text-sm font-bold text-white">{i + 1}</span>
                  <h3 className="mt-4 font-bold">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="features" className="scroll-mt-20 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-extrabold tracking-tight">Built for trust on both sides</h2>
            <div className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
              {FEATURES.map(({ i: Icon, t, d }) => (
                <div key={t} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" aria-hidden /></span>
                  <div>
                    <h3 className="font-bold">{t}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 border-t border-slate-200 bg-slate-50 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-3xl font-extrabold tracking-tight">Questions</h2>
            <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                    {q}<span className="ml-4 text-slate-400 transition-transform group-open:rotate-45" aria-hidden>+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-900 py-16 text-center">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Start your first milestone today</h2>
            <p className="mt-3 text-brand-200">Create a free account as a client or a freelancer.</p>
            <Link to="/register" className="mt-6 inline-block"><Button size="lg" variant="secondary">Create account</Button></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
