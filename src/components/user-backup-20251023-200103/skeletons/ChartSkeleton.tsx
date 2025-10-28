import { Skeleton } from '@/components/ui/skeleton'
import { NeumorphicCard } from '../NeumorphicCard'

export function ChartSkeleton() {
  return (
    <NeumorphicCard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-12 h-8 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Chart Type Toggle */}
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-10 rounded-lg" />
          <Skeleton className="flex-1 h-10 rounded-lg" />
        </div>

        {/* Chart Area */}
        <Skeleton className="h-64 w-full rounded-lg" />

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-4 w-20 mx-auto mb-2" />
              <Skeleton className="h-8 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </NeumorphicCard>
  )
}

