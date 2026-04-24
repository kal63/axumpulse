'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MessageSquare, User } from 'lucide-react'

export default function QuestionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const questionId = parseInt(params.id as string)
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && questionId) {
      fetchQuestion()
    }
  }, [authLoading, user, router, questionId])

  async function fetchQuestion() {
    try {
      setLoading(true)
      const response = await apiClient.getQuestion(questionId)
      if (response.success && response.data) {
        setQuestion(response.data)
      }
    } catch (error) {
      console.error('Error fetching question:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-dvh min-h-screen items-center justify-center user-app-page">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 user-app-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !question) {
    return null
  }

  return (
    <div className="min-h-dvh min-h-full user-app-page">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => router.push('/user/medical/questions')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold user-app-ink">
                  Question Details
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Question */}
        <NeumorphicCard variant="raised" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className={question.status === 'answered' ? 'bg-green-500' : 'bg-yellow-500'}>
              {question.status}
            </Badge>
            <span className="text-sm user-app-muted">
              {new Date(question.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-lg user-app-ink whitespace-pre-wrap">
            {question.text}
          </p>
        </NeumorphicCard>

        {/* Answers */}
        {question.answers && question.answers.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold user-app-ink">
              Answers ({question.answers.length})
            </h2>
            {question.answers.map((answer: any) => (
              <NeumorphicCard key={answer.id} variant="raised" className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-5 h-5 user-app-muted" />
                  <span className="font-semibold user-app-ink">
                    Medical Professional
                  </span>
                  <span className="text-sm user-app-muted">
                    {new Date(answer.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="user-app-ink whitespace-pre-wrap">
                  {answer.text}
                </p>
              </NeumorphicCard>
            ))}
          </div>
        ) : (
          <NeumorphicCard variant="raised" className="p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="user-app-muted">
              No answers yet. A medical professional will respond soon.
            </p>
          </NeumorphicCard>
        )}
      </div>
    </div>
  )
}

