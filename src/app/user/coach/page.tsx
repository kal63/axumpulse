'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient, type TraineeAiMessage } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, ArrowLeft, MessageCircle, Send } from 'lucide-react'
import Link from 'next/link'

export default function TraineeCoachPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [threadId, setThreadId] = useState<number | null>(null)
  const [messages, setMessages] = useState<TraineeAiMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login?redirect=/user/coach')
      return
    }
    if (user.isTrainer || user.isAdmin) {
      router.push('/user/dashboard')
      return
    }

    const init = async () => {
      setLoading(true)
      try {
        const list = await apiClient.getTraineeAiThreads()
        if (list.success && list.data?.items?.length) {
          const first = list.data.items[0]
          setThreadId(first.id)
          const msgs = await apiClient.getTraineeAiMessages(first.id)
          if (msgs.success && msgs.data?.messages) {
            setMessages(msgs.data.messages)
          }
        } else {
          const created = await apiClient.createTraineeAiThread({})
          if (created.success && created.data?.thread) {
            const t = created.data.thread
            setThreadId(t.id)
            setMessages([])
          }
        }
      } catch {
        /* handled by empty UI */
      } finally {
        setLoading(false)
      }
    }
    void init()
  }, [authLoading, user, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || !threadId || sending) return
    setSending(true)
    setInput('')
    try {
      const res = await apiClient.sendTraineeAiMessage(threadId, text)
      if (res.success) {
        const msgs = await apiClient.getTraineeAiMessages(threadId)
        if (msgs.success && msgs.data?.messages) {
          setMessages(msgs.data.messages)
        }
      }
    } finally {
      setSending(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--neumorphic-bg)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)] px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/user/dashboard">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--neumorphic-text)] flex items-center gap-2">
              <MessageCircle className="w-7 h-7 text-cyan-500" />
              AI coach
            </h1>
            <p className="text-sm text-[var(--neumorphic-muted)]">
              Fitness and habit support — not medical advice. Adjust data sharing in{' '}
              <Link href="/user/settings" className="text-cyan-500 underline">
                Settings
              </Link>
              .
            </p>
          </div>
        </div>

        <NeumorphicCard variant="raised" className="p-0 overflow-hidden flex flex-col min-h-[420px] max-h-[70vh]">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-[var(--neumorphic-muted)] text-center py-12 text-sm">
                Ask anything about workouts, consistency, or how to use the app.
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-[var(--neumorphic-surface)] text-[var(--neumorphic-text)] border border-[var(--neumorphic-border)]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 border-t border-[var(--neumorphic-border)] flex gap-2 bg-[var(--neumorphic-surface)]">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message your coach…"
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), void send())}
              disabled={sending || !threadId}
            />
            <Button onClick={() => void send()} disabled={sending || !threadId}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  )
}
