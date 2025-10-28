import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { NeumorphicCard } from './NeumorphicCard'
import { cn } from '@/lib/utils'

interface PaginationControlsProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    maxVisiblePages?: number
}

export function PaginationControls({ 
    currentPage, 
    totalPages, 
    onPageChange,
    maxVisiblePages = 5 
}: PaginationControlsProps) {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
        const pages: number[] = []
        const halfVisible = Math.floor(maxVisiblePages / 2)
        
        let startPage = Math.max(1, currentPage - halfVisible)
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
        
        // Adjust start if we're near the end
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1)
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
        }
        
        return pages
    }

    const pages = getPageNumbers()

    return (
        <div className="flex justify-center items-center mt-8">
            <NeumorphicCard variant="raised" size="sm" className="p-2">
                <div className="flex items-center gap-1">
                    {/* Previous Button */}
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={cn(
                            'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200',
                            'hover:scale-105 active:scale-95',
                            currentPage === 1
                                ? 'text-[var(--neumorphic-muted)] cursor-not-allowed opacity-50'
                                : 'text-[var(--neumorphic-text)] hover:bg-[var(--neumorphic-hover)] hover:shadow-md'
                        )}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* First Page */}
                    {pages[0] > 1 && (
                        <>
                            <button
                                onClick={() => onPageChange(1)}
                                className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 text-[var(--neumorphic-text)] hover:bg-[var(--neumorphic-hover)] hover:shadow-md"
                            >
                                1
                            </button>
                            {pages[0] > 2 && (
                                <div className="flex items-center justify-center w-10 h-10">
                                    <MoreHorizontal className="w-4 h-4 text-[var(--neumorphic-muted)]" />
                                </div>
                            )}
                        </>
                    )}

                    {/* Page Numbers */}
                    {pages.map((pageNumber) => (
                        <button
                            key={pageNumber}
                            onClick={() => onPageChange(pageNumber)}
                            className={cn(
                                'flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95',
                                currentPage === pageNumber
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25'
                                    : 'text-[var(--neumorphic-text)] hover:bg-[var(--neumorphic-hover)] hover:shadow-md'
                            )}
                        >
                            {pageNumber}
                        </button>
                    ))}

                    {/* Last Page */}
                    {pages[pages.length - 1] < totalPages && (
                        <>
                            {pages[pages.length - 1] < totalPages - 1 && (
                                <div className="flex items-center justify-center w-10 h-10">
                                    <MoreHorizontal className="w-4 h-4 text-[var(--neumorphic-muted)]" />
                                </div>
                            )}
                            <button
                                onClick={() => onPageChange(totalPages)}
                                className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 text-[var(--neumorphic-text)] hover:bg-[var(--neumorphic-hover)] hover:shadow-md"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    {/* Next Button */}
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={cn(
                            'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200',
                            'hover:scale-105 active:scale-95',
                            currentPage === totalPages
                                ? 'text-[var(--neumorphic-muted)] cursor-not-allowed opacity-50'
                                : 'text-[var(--neumorphic-text)] hover:bg-[var(--neumorphic-hover)] hover:shadow-md'
                        )}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </NeumorphicCard>
        </div>
    )
}


