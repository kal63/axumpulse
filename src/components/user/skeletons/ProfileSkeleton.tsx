import { Skeleton } from '@/components/ui/skeleton'
import { NeumorphicCard } from '../NeumorphicCard'

export function ProfileHeaderSkeleton() {
  return (
    <NeumorphicCard>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-2xl" />
            {/* Level Badge */}
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
              <Skeleton className="w-20 h-8 rounded-full" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-3">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/70">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center p-3 rounded-lg bg-slate-100 dark:bg-slate-800/70">
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </NeumorphicCard>
  )
}





