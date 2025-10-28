import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
    icon?: LucideIcon
    title: string
    description?: string
    actionLabel?: string
    onAction?: () => void
}

export function EmptyState({ 
    icon: Icon, 
    title, 
    description, 
    actionLabel, 
    onAction 
}: EmptyStateProps) {
    return (
        <Card className="p-12 text-center">
            {Icon && (
                <div className="flex justify-center mb-4">
                    <Icon className="h-16 w-16 text-gray-400" />
                </div>
            )}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-text-dark mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {description}
                </p>
            )}
            {actionLabel && onAction && (
                <Button onClick={onAction} className="mt-4">
                    {actionLabel}
                </Button>
            )}
        </Card>
    )
}


