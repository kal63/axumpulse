/**
 * Frontend Pagination Utilities
 * Provides consistent pagination handling across the application
 */

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationMeta
}

export interface PaginationState {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  loading: boolean
  error: string | null
}

/**
 * Default pagination configuration
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 20,
  maxPageSize: 100
} as const

/**
 * Create URL search parameters for pagination
 */
export function createPaginationParams(params: PaginationParams): URLSearchParams {
  const searchParams = new URLSearchParams()
  
  if (params.page && params.page > 0) {
    searchParams.set('page', params.page.toString())
  }
  
  if (params.pageSize && params.pageSize > 0) {
    searchParams.set('pageSize', Math.min(params.pageSize, DEFAULT_PAGINATION.maxPageSize).toString())
  }
  
  return searchParams
}

/**
 * Parse pagination parameters from URL search params
 */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = searchParams.get('page')
  const pageSize = searchParams.get('pageSize')
  
  return {
    page: page ? Math.max(1, parseInt(page, 10)) : undefined,
    pageSize: pageSize ? Math.min(DEFAULT_PAGINATION.maxPageSize, Math.max(1, parseInt(pageSize, 10))) : undefined
  }
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(
  page: number,
  pageSize: number,
  totalItems: number
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / pageSize)
  
  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
}

/**
 * Generate page numbers for pagination UI
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): (number | 'ellipsis')[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  
  const pages: (number | 'ellipsis')[] = []
  const halfVisible = Math.floor(maxVisible / 2)
  
  // Always show first page
  pages.push(1)
  
  if (currentPage > halfVisible + 2) {
    pages.push('ellipsis')
  }
  
  // Calculate start and end of visible range
  const start = Math.max(2, currentPage - halfVisible)
  const end = Math.min(totalPages - 1, currentPage + halfVisible)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  if (currentPage < totalPages - halfVisible - 1) {
    pages.push('ellipsis')
  }
  
  // Always show last page (if more than 1 page)
  if (totalPages > 1) {
    pages.push(totalPages)
  }
  
  return pages
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(params: PaginationParams): PaginationParams {
  return {
    page: params.page ? Math.max(1, params.page) : DEFAULT_PAGINATION.page,
    pageSize: params.pageSize 
      ? Math.min(DEFAULT_PAGINATION.maxPageSize, Math.max(1, params.pageSize))
      : DEFAULT_PAGINATION.pageSize
  }
}

/**
 * Create pagination state from API response
 */
export function createPaginationState(
  pagination: PaginationMeta,
  loading: boolean = false,
  error: string | null = null
): PaginationState {
  return {
    ...pagination,
    loading,
    error
  }
}

/**
 * Get pagination display text
 */
export function getPaginationDisplayText(pagination: PaginationMeta): string {
  const { page, pageSize, totalItems } = pagination
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)
  
  if (totalItems === 0) {
    return 'No items'
  }
  
  return `Showing ${start}-${end} of ${totalItems} items`
}

/**
 * Common page sizes for pagination controls
 */
export const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10 per page' },
  { value: 20, label: '20 per page' },
  { value: 50, label: '50 per page' },
  { value: 100, label: '100 per page' }
] as const
