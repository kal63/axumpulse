'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, ArrowRight, Clock, CheckCircle } from 'lucide-react'

export default function MedicalQuestionsInboxPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])

  useEffect(() => {
    if (!authLoading && user) {
      fetchQuestions()
    }
  }, [authLoading, user])

  async function fetchQuestions() {
    try {
      setLoading(true)
      const response = await apiClient.getMedicalQuestionsInbox({ page: 1, pageSize: 50, status: 'open' })
      if (response.success && response.data) {
        setQuestions(response.data.items || [])
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neumorphic-bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-[var(--neumorphic-muted)]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                  Q&A Inbox
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question) => (
              <NeumorphicCard
                key={question.id}
                variant="raised"
                className="p-6 cursor-pointer"
                onClick={() => router.push(`/medical/questions/${question.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-yellow-500 text-white">
                        <Clock className="w-3 h-3 mr-1" />
                        Open
                      </Badge>
                      <span className="text-sm text-[var(--neumorphic-muted)]">
                        User ID: {question.userId}
                      </span>
                      <span className="text-sm text-[var(--neumorphic-muted)]">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[var(--neumorphic-text)] line-clamp-2">
                      {question.text}
                    </p>
                  </div>
                  <Button variant="outline">
                    Answer <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </NeumorphicCard>
            ))}
          </div>
        ) : (
          <NeumorphicCard variant="raised" className="p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-[var(--neumorphic-text)] mb-2">
              No Open Questions
            </h3>
            <p className="text-[var(--neumorphic-muted)]">
              All questions have been answered.
            </p>
          </NeumorphicCard>
        )}
      </div>
    </div>
  )
}

