import { cn } from '@/lib/utils'
import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'

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
    const [isOpen, setIsOpen] = useState(false)
    
    const selectedOption = options.find(option => option.value === selectedValue)
    
    return (
        <div className="space-y-3">
            {label && (
                <label className="text-sm font-semibold user-app-ink tracking-wide">
                    {label}
                </label>
            )}
            
            {/* Desktop: Horizontal pills */}
            <div className="hidden md:flex flex-wrap gap-2">
                {options.map((option) => {
                    const isSelected = selectedValue === option.value
                    return (
                        <button
                            key={option.value}
                            onClick={() => onValueChange(option.value)}
                            className={cn(
                                'relative flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105',
                                'border border-gray-200/50 dark:border-gray-700/50',
                                isSelected
                                    ? 'bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white shadow-lg border-transparent dark:from-[var(--ethio-lemon-dark)] dark:to-[var(--ethio-deep-blue)] dark:shadow-[0_0_20px_rgba(142,198,63,0.2)]'
                                    : 'user-app-paper user-app-hover user-app-ink hover:shadow-md'
                            )}
                        >
                            {isSelected && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                                    <Check className="w-3 h-3 text-[var(--ethio-deep-blue)] dark:text-[var(--ethio-lemon-dark)]" />
                                </div>
                            )}
                            <span>{option.label}</span>
                        </button>
                    )
                })}
            </div>
            
            {/* Mobile: Dropdown */}
            <div className="md:hidden relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 user-app-paper border border-gray-200/50 dark:border-gray-700/50 rounded-xl user-app-ink font-medium user-app-hover transition-all duration-200"
                >
                    <span>{selectedOption?.label || 'Select option'}</span>
                    <ChevronDown className={cn(
                        'w-5 h-5 transition-transform duration-200',
                        isOpen && 'rotate-180'
                    )} />
                </button>
                
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 user-app-paper border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg z-50">
                        {options.map((option) => {
                            const isSelected = selectedValue === option.value
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onValueChange(option.value)
                                        setIsOpen(false)
                                    }}
                                    className={cn(
                                        'w-full flex items-center justify-between px-4 py-3 text-left user-app-ink font-medium user-app-hover transition-all duration-200',
                                        isSelected && 'bg-gradient-to-r from-[var(--ethio-lemon)]/12 to-[var(--ethio-deep-blue)]/10 dark:from-[var(--ethio-lemon)]/10 dark:to-[var(--ethio-deep-blue)]/10'
                                    )}
                                >
                                    <span>{option.label}</span>
                                    {isSelected && (
                                        <Check className="w-5 h-5 text-[var(--ethio-deep-blue)] dark:text-[var(--ethio-lemon-dark)]" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}


