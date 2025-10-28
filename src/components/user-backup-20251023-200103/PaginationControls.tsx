import { Button } from '@/components/ui/button'

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
        <div className="flex justify-center items-center gap-2 mt-8">
            <Button
                variant="outline"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
            >
                Previous
            </Button>
            
            {pages[0] > 1 && (
                <>
                    <Button
                        variant="outline"
                        onClick={() => onPageChange(1)}
                    >
                        1
                    </Button>
                    {pages[0] > 2 && <span className="text-gray-500">...</span>}
                </>
            )}
            
            <div className="flex gap-2">
                {pages.map((pageNumber) => (
                    <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? 'default' : 'outline'}
                        onClick={() => onPageChange(pageNumber)}
                        className={currentPage === pageNumber ? 'bg-black text-white hover:bg-gray-800' : ''}
                    >
                        {pageNumber}
                    </Button>
                ))}
            </div>
            
            {pages[pages.length - 1] < totalPages && (
                <>
                    {pages[pages.length - 1] < totalPages - 1 && <span className="text-gray-500">...</span>}
                    <Button
                        variant="outline"
                        onClick={() => onPageChange(totalPages)}
                    >
                        {totalPages}
                    </Button>
                </>
            )}
            
            <Button
                variant="outline"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
            >
                Next
            </Button>
        </div>
    )
}


