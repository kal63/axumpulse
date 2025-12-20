'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, ArrowRight, Search } from 'lucide-react'

export default function ClientsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!authLoading && user) {
      fetchClients()
    }
  }, [authLoading, user, search])

  async function fetchClients() {
    try {
      setLoading(true)
      const params: any = { page: 1, pageSize: 50 }
      if (search.trim()) {
        params.q = search.trim()
      }
      const response = await apiClient.getMedicalClients(params)
      if (response.success && response.data) {
        setClients(response.data.items || [])
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-[var(--neumorphic-text)]">
                    Clients
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--neumorphic-muted)]" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search clients..."
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {clients.length > 0 ? (
          <div className="space-y-4">
            {clients.map((client) => (
              <NeumorphicCard
                key={client.id}
                variant="raised"
                className="p-6 cursor-pointer"
                onClick={() => router.push(`/medical/clients/${client.userId}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--neumorphic-text)] mb-2">
                      {client.user?.name || `User ${client.userId}`}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-[var(--neumorphic-muted)]">
                      {client.conditions?.length > 0 && (
                        <span>{client.conditions.length} conditions</span>
                      )}
                      {client.medications?.length > 0 && (
                        <span>{client.medications.length} medications</span>
                      )}
                    </div>
                  </div>
                  <Button variant="outline">
                    View <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </NeumorphicCard>
            ))}
          </div>
        ) : (
          <NeumorphicCard variant="raised" className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-[var(--neumorphic-text)] mb-2">
              No Clients Found
            </h3>
            <p className="text-[var(--neumorphic-muted)]">
              {search ? 'No clients match your search.' : 'No clients with medical profiles yet.'}
            </p>
          </NeumorphicCard>
        )}
      </div>
    </div>
  )
}

