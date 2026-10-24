import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

// Idle timeout in minutes, from .env (VITE_IDLE_TIMEOUT_MIN). Default 15.
const IDLE_MS = Number(import.meta.env.VITE_IDLE_TIMEOUT_MIN || 15) * 60 * 1000
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']

const touch = () => localStorage.setItem('lastActivity', String(Date.now()))
const idleExpired = () => {
  const t = Number(localStorage.getItem('lastActivity') || 0)
  return t > 0 && Date.now() - t > IDLE_MS
}

function decode(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

function loadUser() {
  const token = localStorage.getItem('accessToken')
  const role = localStorage.getItem('role')
  if (!token || !role || !localStorage.getItem('refreshToken')) return null
  const p = decode(token)
  return p ? { userId: p.userId, email: p.sub, role } : null
}

function initialUser() {
  // Browser was closed and reopened after the idle time: the session is over.
  if (localStorage.getItem('accessToken') && idleExpired()) {
    localStorage.clear()
    sessionStorage.setItem('authNotice', 'You were logged out after being inactive. Please log in again.')
    return null
  }
  return loadUser()
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(initialUser)

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('accessToken', res.data.accessToken)
    localStorage.setItem('refreshToken', res.data.refreshToken)
    localStorage.setItem('role', res.data.role)
    touch()
    setUser(loadUser())
  }

  async function logout() {
    const refreshToken = localStorage.getItem('refreshToken')
    try {
      if (refreshToken) await api.post('/auth/logout', { refreshToken })
    } catch {
      /* local data is cleared anyway */
    }
    localStorage.clear()
    setUser(null)
  }

  // While logged in: record activity, log out when idle, and log out in all tabs together.
  useEffect(() => {
    if (!user) return undefined
    touch()
    let last = Date.now()
    const onActivity = () => {
      const now = Date.now()
      if (now - last > 5000) { last = now; touch() }
    }
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))

    const timer = setInterval(async () => {
      if (!idleExpired()) return
      sessionStorage.setItem('authNotice', 'You were logged out after being inactive. Please log in again.')
      await logout()
    }, 15000)

    const onStorage = (e) => {
      if (e.key === null || (e.key === 'accessToken' && !e.newValue)) setUser(null)
    }
    window.addEventListener('storage', onStorage)

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity))
      clearInterval(timer)
      window.removeEventListener('storage', onStorage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)