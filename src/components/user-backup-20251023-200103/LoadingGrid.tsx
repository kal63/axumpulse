import { Card, CardContent } from '@/components/ui/card'

interface LoadingGridProps {
    count?: number
    columns?: {
        mobile?: number
        tablet?: number
        desktop?: number
        wide?: number
    }
}

export function LoadingGrid({ 
    count = 8,
    columns = {
        mobile: 1,
        tablet: 2,
        desktop: 3,
        wide: 4
    }
}: LoadingGridProps) {
    const gridClasses = `grid gap-6 
        grid-cols-${columns.mobile} 
        sm:grid-cols-${columns.tablet} 
        lg:grid-cols-${columns.desktop} 
        xl:grid-cols-${columns.wide}`

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(count)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
                    <CardContent className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}


