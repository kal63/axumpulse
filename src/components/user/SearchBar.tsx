import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function SearchBar({ 
    value, 
    onChange, 
    placeholder = 'Search...', 
    className = '' 
}: SearchBarProps) {
    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-10 bg-white dark:bg-charcoal border-gray-200 dark:border-gray-700"
            />
        </div>
    )
}






