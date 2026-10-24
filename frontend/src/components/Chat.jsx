import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import { Send, ShieldAlert } from 'lucide-react'
import api, { errorText, WS_URL } from '../api/axios'
import { useAuth } from '../auth/AuthContext'
import { Button, Spinner, cx } from './ui'

/** Project chat: history over REST, live messages over STOMP WebSocket. */
export default function Chat({ projectId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef(null)

  const add = (m) => setMessages((list) => (list.some((x) => x.id === m.id) ? list : [...list, m]))

  useEffect(() => {
    let client
    api.get(`/chat/projects/${projectId}/messages`)
      .then((r) => setMessages(r.data))
      .catch((e) => setError(errorText(e)))
      .finally(() => setLoading(false))

    if (WS_URL) {
      client = new Client({
        brokerURL: WS_URL,
        connectHeaders: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        reconnectDelay: 5000,
        onConnect: () => client.subscribe(`/topic/projects/${projectId}`, (f) => add(JSON.parse(f.body))),
      })
      client.activate()
    }
    return () => client?.deactivate()
  }, [projectId])

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [messages])

  async function send(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      const r = await api.post(`/chat/projects/${projectId}/messages`, { content: text })
      add(r.data)
      setText('')
    } catch (err) { setError(errorText(err)) }
    finally { setSending(false) }
  }

  if (loading) return <Spinner label="Loading messages" />
  if (error && messages.length === 0) return <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">{error}</p>

  return (
    <div className="flex h-[26rem] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto rounded-lg bg-slate-50 p-4" aria-live="polite">
        {messages.length === 0 && <p className="py-10 text-center text-sm text-slate-500">No messages yet. Say hello to start the conversation.</p>}
        {messages.map((m) => {
          const mine = m.senderId === user.userId
          return (
            <div key={m.id} className={cx('flex', mine ? 'justify-end' : 'justify-start')}>
              <div className={cx('max-w-[80%] rounded-2xl px-3.5 py-2 text-sm', mine ? 'bg-brand-700 text-white' : 'border border-slate-200 bg-white text-slate-800')}>
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                {m.flagged && (
                  <p className={cx('mt-1.5 flex items-start gap-1 text-xs', mine ? 'text-amber-200' : 'text-hold-600')}>
                    <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {m.warning}
                  </p>
                )}
                <p className={cx('mt-1 text-[11px]', mine ? 'text-brand-100' : 'text-slate-400')}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-rose-600">{error}</p>}
      <form onSubmit={send} className="mt-3 flex gap-2">
        <label htmlFor="chat-input" className="sr-only">Message</label>
        <input id="chat-input" value={text} onChange={(e) => setText(e.target.value)} maxLength={2000}
          placeholder="Write a message"
          className="h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20" />
        <Button type="submit" loading={sending} icon={Send}>Send</Button>
      </form>
      <p className="mt-2 text-xs text-slate-500">Keep payments and contact details on the platform. Escrow protects only payments made here.</p>
    </div>
  )
}
