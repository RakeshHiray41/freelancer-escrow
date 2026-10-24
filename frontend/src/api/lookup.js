import { useEffect, useState } from 'react'
import api from './axios'

// Small in-memory cache so the same user or milestone is fetched only once.
const cache = new Map()

function useLookup(kind, id, fetcher) {
  const key = `${kind}:${id}`
  const [val, setVal] = useState(cache.get(key)?.value ?? null)
  useEffect(() => {
    if (id == null) return
    let alive = true
    let entry = cache.get(key)
    if (!entry) {
      entry = { value: null, promise: fetcher(id).then((r) => r.data).catch(() => null) }
      entry.promise.then((v) => { entry.value = v })
      cache.set(key, entry)
    }
    entry.promise.then((v) => alive && setVal(v))
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return val
}

/** { id, name, role, photoUrl } of any user (needs login). */
export const useUser = (id) => useLookup('user', id, (i) => api.get(`/profile/${i}/public`))

/** Milestone with projectTitle, clientId, freelancerId (members and admin only). */
export const useMilestone = (id) => useLookup('milestone', id, (i) => api.get(`/milestones/${i}/details`))