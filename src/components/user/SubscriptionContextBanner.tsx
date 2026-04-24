'use client';

import { UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SubscriptionBannerModel = {
  trainerId: number;
  trainer?: { name?: string; profilePicture?: string } | null;
  expiresAt: string;
};

type Props = {
  subscription: SubscriptionBannerModel;
  className?: string;
};

/**
 * Pastel informational strip (trainer context + expiry) — matches marketing-style info banners.
 */
export function SubscriptionContextBanner({ subscription, className }: Props) {
  const trainerName = subscription.trainer?.name || `Trainer #${subscription.trainerId}`;
  const expires = new Date(subscription.expiresAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  return (
    <div
      className={cn('user-app-info-banner max-w-4xl mx-auto mb-4', className)}
      role="status"
      aria-live="polite"
    >
      <div className="user-app-info-banner-icon" aria-hidden>
        <UserCheck className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="user-app-info-banner-title">Showing content from {trainerName}</p>
        <p className="user-app-info-banner-sub">Your active subscription expires on {expires}</p>
      </div>
    </div>
  );
}
