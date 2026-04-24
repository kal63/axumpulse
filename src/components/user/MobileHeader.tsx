'use client';

import { NeumorphicCard } from './NeumorphicCard';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

export function MobileHeader({ title, subtitle, className }: MobileHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      <NeumorphicCard variant="flat" size="sm" className="p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold user-app-ink font-orbitron">
            {title}
          </h1>
          <p className="user-app-muted mt-1 text-sm">
            {subtitle}
          </p>
        </div>
      </NeumorphicCard>
    </div>
  );
}
