import { Star } from 'lucide-react'

interface FeaturedBadgeProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function FeaturedBadge({ className = '', size = 'md' }: FeaturedBadgeProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold ${className}`}>
      <Star className={sizeClasses[size]} fill="currentColor" />
      <span>Featured</span>
    </div>
  )
}

