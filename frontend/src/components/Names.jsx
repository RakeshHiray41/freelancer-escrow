import { useMilestone, useUser } from '../api/lookup'

/** Name of a user (never the numeric id). Admins also get the email, shown in brackets. */
export function UserName({ id, fallback = 'User' }) {
  const u = useUser(id)
  return (
    <span>
      {u?.name || fallback}
      {u?.email && <span className="font-normal text-slate-500"> ({u.email})</span>}
    </span>
  )
}

export function MilestoneTitle({ id }) {
  const m = useMilestone(id)
  return <span>{m?.title || 'Milestone'}</span>
}