import { ContentCard } from './ContentCard'
import type { ContentItem } from '@/lib/api-client'

interface ContentGridProps {
    items: ContentItem[]
    onItemClick: (item: ContentItem) => void
    showXP?: boolean
    xpAmount?: number
}

export function ContentGrid({ 
    items, 
    onItemClick, 
    showXP = true, 
    xpAmount = 50 
}: ContentGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
                <ContentCard
                    key={item.id}
                    content={item}
                    onClick={() => onItemClick(item)}
                    showXP={showXP}
                    xpAmount={xpAmount}
                />
            ))}
        </div>
    )
}






