/**
 * Paginated Table Component
 * Combines table display with pagination controls
 */

import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PaginatedTableColumn<T> {
  key: keyof T | string
  header: string
  render?: (item: T, index: number) => React.ReactNode
  className?: string
  sortable?: boolean
}

export interface PaginatedTableProps<T> {
  data: T[]
  columns: PaginatedTableColumn<T>[]
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  
  // Pagination props
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  
  // Optional props
  className?: string
  tableClassName?: string
  showPagination?: boolean
  showPageSizeSelector?: boolean
  showInfo?: boolean
  onRowClick?: (item: T, index: number) => void
  rowClassName?: (item: T, index: number) => string
}

export function PaginatedTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  emptyMessage = 'No data available',
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  className,
  tableClassName,
  showPagination = true,
  showPageSizeSelector = true,
  showInfo = true,
  onRowClick,
  rowClassName
}: PaginatedTableProps<T>) {
  const renderCellContent = (item: T, column: PaginatedTableColumn<T>, index: number) => {
    if (column.render) {
      return column.render(item, index)
    }
    
    const keyStr = String(column.key)
    const value = keyStr.includes('.') 
      ? keyStr.split('.').reduce((obj: any, key: string) => obj?.[key], item)
      : item[column.key as keyof T]
    
    return value?.toString() || '-'
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        {/* Table */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            </div>
          )}
          
          <Table className={tableClassName}>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index} className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {emptyMessage}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow
                    key={index}
                    className={cn(
                      onRowClick && 'cursor-pointer hover:bg-muted/50',
                      rowClassName?.(item, index)
                    )}
                    onClick={() => onRowClick?.(item, index)}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex} className={column.className}>
                        {renderCellContent(item, column, index)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {showPagination && data.length > 0 && (
          <div className="border-t p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              loading={loading}
              showPageSizeSelector={showPageSizeSelector}
              showInfo={showInfo}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
