import { Skeleton } from '@/components/ui/skeleton'
import { NeumorphicCard } from '../NeumorphicCard'

export function ContentCardSkeleton() {
  return (
    <NeumorphicCard>
      <div className="space-y-3">
        {/* Thumbnail */}
        <Skeleton className="w-full h-40 rounded-xl" />
        
        {/* Title */}
        <Skeleton className="h-6 w-3/4" />
        
        {/* Trainer */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        {/* Meta info */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </NeumorphicCard>
  )
}

export function ContentGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ContentCardSkeleton key={i} />
      ))}
    </div>
  )
}

