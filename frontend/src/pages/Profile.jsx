import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import api, { errorText } from '../api/axios'
import { Button, Card, Field, Input, PageHeader, Spinner, Textarea, useAsync, useToast } from '../components/ui'

export default function Profile() {
  const toast = useToast()
  const fileRef = useRef(null)
  const [f, setF] = useState(null)
  const [busy, setBusy] = useState(false)
  const [photo, setPhoto] = useState(null)
  const { data, loading } = useAsync(async () => {
    const d = (await api.get('/profile/me')).data
    setF({ bio: d.bio || '', skills: d.skills || '', hourlyRate: d.hourlyRate ?? '', country: d.country || '' })
    setPhoto(d.photoUrl)
    return d
  }, [])

  async function save(e) {
    e.preventDefault(); setBusy(true)
    try { await api.put('/profile/me', { ...f, hourlyRate: f.hourlyRate === '' ? null : Number(f.hourlyRate) }); toast('Profile saved.') }
    catch (x) { toast(errorText(x), 'error') } finally { setBusy(false) }
  }
  async function upload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) return toast('Only JPG or PNG allowed.', 'error')
    if (file.size > 2 * 1024 * 1024) return toast('Max size is 2 MB.', 'error')
    const form = new FormData(); form.append('file', file)
    try { const r = await api.post('/profile/photo', form); setPhoto(r.data.photoUrl); toast('Photo updated.') }
    catch (x) { toast(errorText(x), 'error') }
  }
  if (loading || !f) return <Spinner />
  return (
    <>
      <PageHeader title="Profile" text="This is what clients and freelancers see about you." />
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {photo ? <img src={photo} alt="Your profile" className="h-20 w-20 rounded-full object-cover" />
              : <div className="grid h-20 w-20 place-items-center rounded-full bg-brand-100 text-2xl font-extrabold text-brand-800">{data.name?.[0]?.toUpperCase()}</div>}
            <button onClick={() => fileRef.current.click()} aria-label="Change photo" className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50"><Camera className="h-4 w-4" /></button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="sr-only" onChange={upload} />
          </div>
          <div><p className="text-lg font-bold">{data.name}</p><p className="text-sm text-slate-500">{data.email} · {data.role.toLowerCase()}</p></div>
        </div>
        <form onSubmit={save} className="mt-6 space-y-4">
          <Field label="Bio" htmlFor="bio"><Textarea id="bio" maxLength={1000} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /></Field>
          <Field label="Skills" htmlFor="sk" hint="Comma separated. Used by the AI proposal writer."><Input id="sk" value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hourly rate (₹)" htmlFor="hr"><Input id="hr" type="number" min="0" value={f.hourlyRate} onChange={(e) => setF({ ...f, hourlyRate: e.target.value })} /></Field>
            <Field label="Country" htmlFor="co"><Input id="co" value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} /></Field>
          </div>
          <Button type="submit" loading={busy}>Save changes</Button>
        </form>
      </Card>
    </>
  )
}
