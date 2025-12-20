'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, MessageSquare, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function AnswerQuestionPage() {
  const router = useRouter()
  const params = useParams()
  const questionId = parseInt(params.id as string)
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState<any>(null)
  const [answer, setAnswer] = useState('')
  const [visibility, setVisibility] = useState<'user' | 'user_trainer' | 'internal'>('user')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && user && questionId) {
      fetchQuestion()
    }
  }, [authLoading, user, questionId])

  async function fetchQuestion() {
    try {
      setLoading(true)
      const response = await apiClient.getMedicalQuestion(questionId)
      if (response.success && response.data) {
        setQuestion(response.data)
      }
    } catch (error) {
      console.error('Error fetching question:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!answer.trim()) {
      toast.error('Please enter an answer')
      return
    }

    try {
      setSubmitting(true)
      const response = await apiClient.answerQuestion(questionId, {
        text: answer.trim(),
        visibility
      })
      if (response.success) {
        toast.success('Answer submitted successfully')
        router.push('/medical/questions')
      } else {
        throw new Error(response.error?.message || 'Failed to submit answer')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit answer')
    } finally {
      setSubmitting(false)
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

  if (!user || !question) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--neumorphic-bg)]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => router.push('/medical/questions')}
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
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                  Answer Question
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <NeumorphicCard variant="raised" className="p-6">
          <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-4">Question</h2>
          <p className="text-[var(--neumorphic-text)] whitespace-pre-wrap">
            {question.text}
          </p>
          {question.triageRun && (
            <div className="mt-4 p-3 rounded-lg bg-[var(--neumorphic-surface)]">
              <p className="text-sm font-semibold text-[var(--neumorphic-muted)] mb-1">Related Triage Run:</p>
              <p className="text-sm text-[var(--neumorphic-text)]">
                Risk Level: {question.triageRun.riskLevel} | Disposition: {question.triageRun.disposition}
              </p>
            </div>
          )}
        </NeumorphicCard>

        <NeumorphicCard variant="raised" className="p-6">
          <div className="space-y-4">
            <div>
              <Label>Your Answer</Label>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer..."
                rows={8}
              />
            </div>
            <div>
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={(v: any) => setVisibility(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User Only</SelectItem>
                  <SelectItem value="user_trainer">User & Trainer</SelectItem>
                  <SelectItem value="internal">Internal Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !answer.trim()}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Answer'}
            </Button>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  )
}

