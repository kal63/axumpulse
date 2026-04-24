'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MessageSquare, ArrowLeft, Plus, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function MedicalQuestionsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchQuestions()
    }
  }, [authLoading, user, router])

  async function fetchQuestions() {
    try {
      setLoading(true)
      const response = await apiClient.getMedicalQuestions({ page: 1, pageSize: 20 })
      if (response.success && response.data) {
        setQuestions(response.data.items || [])
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitQuestion() {
    if (!newQuestion.trim()) {
      toast.error('Please enter a question')
      return
    }

    try {
      setSubmitting(true)
      const response = await apiClient.submitQuestion({ text: newQuestion.trim() })
      if (response.success) {
        toast.success('Question submitted successfully')
        setNewQuestion('')
        setDialogOpen(false)
        fetchQuestions()
      } else {
        throw new Error(response.error?.message || 'Failed to submit question')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit question')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'answered':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Answered</Badge>
      case 'open':
        return <Badge className="bg-yellow-500 text-white"><Clock className="w-3 h-3 mr-1" />Open</Badge>
      case 'closed':
        return <Badge className="bg-gray-500 text-white">Closed</Badge>
      default:
        return null
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-dvh min-h-full user-app-page">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10" />
        
        <div className="relative px-4 md:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.push('/user/medical')}
                  variant="ghost"
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold user-app-ink">
                      Medical Q&A
                    </h1>
                    <p className="text-lg user-app-muted">
                      Ask questions to medical professionals
                    </p>
                  </div>
                </div>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Ask Question
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ask a Medical Question</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Enter your question..."
                      rows={6}
                    />
                    <Button
                      onClick={handleSubmitQuestion}
                      disabled={submitting || !newQuestion.trim()}
                      className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
                    >
                      {submitting ? 'Submitting...' : 'Submit Question'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question) => (
              <NeumorphicCard
                key={question.id}
                variant="raised"
                className="p-6 cursor-pointer"
                onClick={() => router.push(`/user/medical/questions/${question.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusBadge(question.status)}
                      <span className="text-sm user-app-muted">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="user-app-ink mb-3 line-clamp-2">
                      {question.text}
                    </p>
                    {question.answers?.length > 0 && (
                      <p className="text-sm user-app-muted">
                        {question.answers.length} answer(s)
                      </p>
                    )}
                  </div>
                </div>
              </NeumorphicCard>
            ))}
          </div>
        ) : (
          <NeumorphicCard variant="raised" className="p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold user-app-ink mb-2">
              No Questions Yet
            </h3>
            <p className="user-app-muted mb-4">
              Ask your first question to get started.
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ask Question
            </Button>
          </NeumorphicCard>
        )}
      </div>
    </div>
  )
}

