/**
 * Custom hook for managing paginated data fetching
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { PaginationParams, PaginationMeta } from '@/lib/pagination'
import { usePagination, UsePaginationOptions } from './usePagination'

export interface PaginatedDataOptions<T> extends UsePaginationOptions {
  fetchFunction: (params: PaginationParams) => Promise<{
    items: T[]
    pagination: PaginationMeta
  }>
  dependencies?: unknown[]
  enabled?: boolean
  onError?: (error: Error) => void
  onSuccess?: (data: T[]) => void
}

export interface PaginatedDataReturn<T> {
  // Data
  data: T[]
  pagination: ReturnType<typeof usePagination>
  
  // Loading states
  loading: boolean
  error: string | null
  
  // Actions
  refetch: () => Promise<void>
  refresh: () => Promise<void>
  
  // Computed
  hasData: boolean
  isEmpty: boolean
}

export function usePaginatedData<T>({
  fetchFunction,
  dependencies = [],
  enabled = true,
  onError,
  onSuccess,
  ...paginationOptions
}: PaginatedDataOptions<T>): PaginatedDataReturn<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const pagination = usePagination(paginationOptions)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)
  const paginationRef = useRef(pagination)
  const isFetchingRef = useRef(false)
  
  // Keep pagination ref up to date
  paginationRef.current = pagination

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Reset state when component mounts (for navigation)
  useEffect(() => {
    // Reset loading state on mount to ensure clean state
    setLoading(false)
    setError(null)
    isMountedRef.current = true
    isFetchingRef.current = false
  }, [])


  // Refetch with current parameters
  const refetch = useCallback(async () => {
    const currentParams = paginationRef.current.params
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    try {
      setLoading(true)
      setError(null)

      const result = await fetchFunction(currentParams)
      
      // Check if component is still mounted and request wasn't aborted
      if (!isMountedRef.current || abortControllerRef.current?.signal.aborted) {
        return
      }

      setData(result.items)
      paginationRef.current.setTotalItems(result.pagination.totalItems)
      paginationRef.current.setError(null)
      
      onSuccess?.(result.items)
    } catch (err) {
      // Check if component is still mounted and request wasn't aborted
      if (!isMountedRef.current || abortControllerRef.current?.signal.aborted) {
        return
      }

      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error.message)
      paginationRef.current.setError(error.message)
      onError?.(error)
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
        paginationRef.current.setLoading(false)
      }
    }
  }, [fetchFunction, onError, onSuccess])

  // Refresh (go to first page and refetch)
  const refresh = useCallback(async () => {
    paginationRef.current.setPage(1)
    // The useEffect will handle the refetch when the page changes
  }, [])

  // Fetch data when parameters change
  useEffect(() => {
    if (!enabled) return

    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    const currentParams = pagination.params

    const performFetch = async () => {
      try {
        isFetchingRef.current = true
        setLoading(true)
        setError(null)

        const result = await fetchFunction(currentParams)
        
        // Check if component is still mounted and request wasn't aborted
        if (!isMountedRef.current || abortControllerRef.current?.signal.aborted) {
          return
        }

        setData(result.items)
        paginationRef.current.setTotalItems(result.pagination.totalItems)
        paginationRef.current.setError(null)
        
        onSuccess?.(result.items)
      } catch (err) {
        // Check if component is still mounted and request wasn't aborted
        if (!isMountedRef.current || abortControllerRef.current?.signal.aborted) {
          return
        }

        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error.message)
        paginationRef.current.setError(error.message)
        onError?.(error)
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
          paginationRef.current.setLoading(false)
        }
        isFetchingRef.current = false
      }
    }

    performFetch()
  }, [pagination.params.page, pagination.params.pageSize, enabled, fetchFunction, onError, onSuccess, ...dependencies])

  // Computed values
  const hasData = data.length > 0
  const isEmpty = !loading && data.length === 0

  return {
    // Data
    data,
    pagination,
    
    // Loading states
    loading,
    error,
    
    // Actions
    refetch,
    refresh,
    
    // Computed
    hasData,
    isEmpty
  }
}
