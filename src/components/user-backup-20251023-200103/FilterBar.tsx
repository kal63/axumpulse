import { Button } from '@/components/ui/button'

interface FilterOption {
    value: string
    label: string
}

interface FilterBarProps {
    label?: string
    options: FilterOption[]
    selectedValue: string
    onValueChange: (value: string) => void
    variant?: 'default' | 'outline'
}

export function FilterBar({ 
    label, 
    options, 
    selectedValue, 
    onValueChange,
    variant = 'outline' 
}: FilterBarProps) {
    return (
        <div className="space-y-2">
            {label && (
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <Button
                        key={option.value}
                        variant={selectedValue === option.value ? 'default' : variant}
                        size="sm"
                        onClick={() => onValueChange(option.value)}
                        className={selectedValue === option.value ? 'bg-black text-white hover:bg-gray-800' : ''}
                    >
                        {option.label}
                    </Button>
                ))}
            </div>
        </div>
    )
}


