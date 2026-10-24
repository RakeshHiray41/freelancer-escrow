import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import AppShell from './components/AppShell'
import Landing from './pages/Landing'
import { Login, Register, VerifyEmail, ForgotPassword, ResetPassword } from './pages/AuthPages'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import NewProject from './pages/NewProject'
import ProjectDetail from './pages/ProjectDetail'
import Wallet from './pages/Wallet'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import { MyDisputes, AdminDisputes } from './pages/Disputes'
import { AdminUsers, AdminRevenue } from './pages/Admin'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="projects/:id" element={<ProjectDetail />} />

          <Route element={<ProtectedRoute roles={['CLIENT', 'FREELANCER']} />}>
            <Route path="wallet" element={<Wallet />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="disputes" element={<MyDisputes />} />
          </Route>
          <Route element={<ProtectedRoute roles={['CLIENT']} />}>
            <Route path="projects" element={<Projects mode="mine" />} />
            <Route path="projects/new" element={<NewProject />} />
          </Route>
          <Route element={<ProtectedRoute roles={['FREELANCER']} />}>
            <Route path="browse" element={<Projects mode="browse" />} />
            <Route path="work" element={<Projects mode="work" />} />
          </Route>
          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="admin/disputes" element={<AdminDisputes />} />
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/revenue" element={<AdminRevenue />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
