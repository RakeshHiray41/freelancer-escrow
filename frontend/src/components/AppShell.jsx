import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import {
  Briefcase, PlusCircle, Wallet, Bell, UserCircle, Scale, Users, BarChart3, LogOut, Menu, X, Search, Home,
} from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../auth/AuthContext'
import api from '../api/axios'
import { useUser } from '../api/lookup'
import { cx } from './ui'

const NAV = {
  CLIENT: [
    { to: '/app', label: 'Overview', icon: Home, end: true },
    { to: '/app/projects', label: 'My projects', icon: Briefcase },
    { to: '/app/projects/new', label: 'Post a project', icon: PlusCircle },
    { to: '/app/wallet', label: 'Wallet', icon: Wallet },
    { to: '/app/disputes', label: 'Disputes', icon: Scale },
  ],
  FREELANCER: [
    { to: '/app', label: 'Overview', icon: Home, end: true },
    { to: '/app/browse', label: 'Find work', icon: Search },
    { to: '/app/work', label: 'My work', icon: Briefcase },
    { to: '/app/wallet', label: 'Earnings', icon: Wallet },
    { to: '/app/disputes', label: 'Disputes', icon: Scale },
  ],
  ADMIN: [
    { to: '/app', label: 'Overview', icon: Home, end: true },
    { to: '/app/admin/disputes', label: 'Disputes', icon: Scale },
    { to: '/app/admin/users', label: 'Users', icon: Users },
    { to: '/app/admin/revenue', label: 'Revenue', icon: BarChart3 },
  ],
}

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const me = useUser(user.userId)

  useEffect(() => {
    if (user.role === 'ADMIN') return
    let stop = false
    const load = () =>
      api.get('/notifications/unread-count').then((r) => !stop && setUnread(r.data.unread)).catch(() => {})
    load()
    const t = setInterval(load, 30000)
    return () => { stop = true; clearInterval(t) }
  }, [user.role])

  const items = NAV[user.role] || []
  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5"><Logo to="/app" /></div>
      <nav aria-label="App" className="flex-1 space-y-1 px-3 py-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
            className={({ isActive }) => cx('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
              isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100')}>
            <Icon className="h-4 w-4" aria-hidden /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-3">
        <div className="mb-2 px-3 text-xs text-slate-500">
          <div className="truncate font-semibold text-slate-800">{me?.name || 'Loading...'}</div>
          <div>{user.role.toLowerCase()}</div>
        </div>
        <button onClick={async () => { await logout(); navigate('/') }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
          <LogOut className="h-4 w-4" aria-hidden /> Log out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-slate-200 bg-white lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">{sidebar}</aside>
        </div>
      )}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button className="rounded-md p-2 hover:bg-slate-100 lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-1">
            {user.role !== 'ADMIN' && (
              <Link to="/app/notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
                className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100">
                <Bell className="h-5 w-5" />
                {unread > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">{unread}</span>}
              </Link>
            )}
            <Link to="/app/profile" aria-label="Profile" className="rounded-full p-2 text-slate-600 hover:bg-slate-100"><UserCircle className="h-5 w-5" /></Link>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6"><Outlet /></main>
      </div>
    </div>
  )
}