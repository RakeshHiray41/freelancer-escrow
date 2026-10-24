import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'
import { Button } from './ui'
import { useAuth } from '../auth/AuthContext'

const links = [
  { href: '/#how', label: 'How it works' },
  { href: '/#features', label: 'Features' },
  { href: '/#faq', label: 'Questions' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-semibold text-slate-600 hover:text-slate-900">{l.label}</a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Link to="/app"><Button size="md">Open dashboard</Button></Link>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost">Log in</Button></Link>
              <Link to="/register"><Button>Create account</Button></Link>
            </>
          )}
        </div>
        <button className="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden" aria-label="Toggle menu"
          aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col py-2">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-2.5 text-sm font-semibold text-slate-700">{l.label}</a>
            ))}
          </nav>
          <div className="flex gap-2">
            {user ? <Link className="flex-1" to="/app"><Button className="w-full">Open dashboard</Button></Link> : (
              <>
                <Link className="flex-1" to="/login"><Button variant="secondary" className="w-full">Log in</Button></Link>
                <Link className="flex-1" to="/register"><Button className="w-full">Sign up</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
