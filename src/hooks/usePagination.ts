/**
 * Custom hook for managing pagination state and logic
 */

import { useState, useCallback, useMemo } from 'react'
import { 
  PaginationParams, 
  PaginationState, 
  PaginationMeta,
  DEFAULT_PAGINATION,
  validatePaginationParams,
  createPaginationState,
  generatePageNumbers,
  getPaginationDisplayText
} from '@/lib/pagination'

export interface UsePaginationOptions {
  initialPage?: number
  initialPageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export interface UsePaginationReturn {
  // State
  pagination: PaginationState
  pageNumbers: (number | 'ellipsis')[]
  displayText: string
  
  // Actions
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  setTotalItems: (totalItems: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
  
  // Computed values
  params: PaginationParams
  isFirstPage: boolean
  isLastPage: boolean
  hasItems: boolean
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    initialPage = DEFAULT_PAGINATION.page,
    initialPageSize = DEFAULT_PAGINATION.pageSize,
    onPageChange,
    onPageSizeChange
  } = options

  // Validate initial parameters
  const validatedParams = validatePaginationParams({
    page: initialPage,
    pageSize: initialPageSize
  })

  // State
  const [page, setPageState] = useState(validatedParams.page!)
  const [pageSize, setPageSizeState] = useState(validatedParams.pageSize!)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Computed pagination metadata
  const paginationMeta: PaginationMeta = useMemo(() => ({
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
    hasNext: page < Math.ceil(totalItems / pageSize),
    hasPrev: page > 1
  }), [page, pageSize, totalItems])

  // Pagination state
  const pagination: PaginationState = useMemo(() => 
    createPaginationState(paginationMeta, loading, error),
    [paginationMeta, loading, error]
  )

  // Page numbers for UI
  const pageNumbers = useMemo(() => 
    generatePageNumbers(page, paginationMeta.totalPages),
    [page, paginationMeta.totalPages]
  )

  // Display text
  const displayText = useMemo(() => 
    getPaginationDisplayText(paginationMeta),
    [paginationMeta]
  )

  // Actions
  const setPage = useCallback((newPage: number) => {
    const validatedPage = Math.max(1, newPage)
    if (validatedPage !== page) {
      setPageState(validatedPage)
      onPageChange?.(validatedPage)
    }
  }, [page, onPageChange])

  const setPageSize = useCallback((newPageSize: number) => {
    const validatedPageSize = Math.min(
      DEFAULT_PAGINATION.maxPageSize, 
      Math.max(1, newPageSize)
    )
    if (validatedPageSize !== pageSize) {
      setPageSizeState(validatedPageSize)
      // Reset to first page when page size changes
      setPageState(1)
      onPageSizeChange?.(validatedPageSize)
    }
  }, [pageSize, onPageSizeChange])

  const updateTotalItems = useCallback((newTotalItems: number) => {
    setTotalItems(Math.max(0, newTotalItems))
  }, [])

  const updateLoading = useCallback((newLoading: boolean) => {
    setLoading(newLoading)
  }, [])

  const updateError = useCallback((newError: string | null) => {
    setError(newError)
  }, [])

  const reset = useCallback(() => {
    setPageState(validatedParams.page!)
    setPageSizeState(validatedParams.pageSize!)
    setTotalItems(0)
    setLoading(false)
    setError(null)
  }, [validatedParams])

  // Computed values
  const params: PaginationParams = useMemo(() => ({
    page,
    pageSize
  }), [page, pageSize])

  const isFirstPage = page === 1
  const isLastPage = page >= paginationMeta.totalPages
  const hasItems = totalItems > 0

  return {
    // State
    pagination,
    pageNumbers,
    displayText,
    
    // Actions
    setPage,
    setPageSize,
    setTotalItems: updateTotalItems,
    setLoading: updateLoading,
    setError: updateError,
    reset,
    
    // Computed values
    params,
    isFirstPage,
    isLastPage,
    hasItems
  }
}
