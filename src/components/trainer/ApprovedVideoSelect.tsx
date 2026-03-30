'use client'

import { useEffect, useState } from 'react'
import { apiClient, type ContentItem } from '@/lib/api-client'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const NONE = '__none__'

function mediaBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL || ''
  return base.replace(/\/api\/v1\/?$/, '')
}

export interface ApprovedVideoSelectProps {
  label: string
  description?: string
  value: number | null | undefined
  onChange: (contentId: number | null) => void
  disabled?: boolean
}

export function ApprovedVideoSelect({
  label,
  description,
  value,
  onChange,
  disabled,
}: ApprovedVideoSelectProps) {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await apiClient.getTrainerContent({
          type: 'video',
          status: 'approved',
          pageSize: 100,
        })
        if (cancelled) return
        if (res.success && res.data?.items) {
          setItems(res.data.items)
        } else {
          setError(res.error?.message || 'Failed to load videos')
        }
      } catch {
        if (!cancelled) setError('Failed to load videos')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const selectValue = value != null && value > 0 ? String(value) : NONE
  const base = mediaBaseUrl()

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <Select
        disabled={disabled || loading}
        value={selectValue}
        onValueChange={(v) => {
          onChange(v === NONE ? null : parseInt(v, 10))
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={loading ? 'Loading videos…' : 'No video selected'}
          />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          <SelectItem value={NONE}>No video</SelectItem>
          {items.map((item) => (
            <SelectItem key={item.id} value={String(item.id)}>
              <span className="flex items-center gap-2">
                {item.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${base}${item.thumbnailUrl}`}
                    alt=""
                    className="h-8 w-12 rounded object-cover shrink-0"
                  />
                ) : (
                  <span className="h-8 w-12 rounded bg-muted shrink-0" />
                )}
                <span className="truncate">{item.title}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
