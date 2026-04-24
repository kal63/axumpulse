'use client';

import { NeumorphicCard } from './NeumorphicCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface TrainerApplicationBannerProps {
  status: 'none' | 'pending' | 'under_review' | 'approved' | 'rejected';
  onApplyClick: () => void;
  onStatusClick: () => void;
  className?: string;
}

export function TrainerApplicationBanner({ 
  status, 
  onApplyClick, 
  onStatusClick, 
  className 
}: TrainerApplicationBannerProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          title: 'Application Pending',
          description: 'Your trainer application is waiting to be reviewed',
          icon: Clock,
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          buttonText: 'View Status',
          buttonVariant: 'secondary' as const
        };
      case 'under_review':
        return {
          title: 'Under Review',
          description: 'Our team is reviewing your application',
          icon: AlertCircle,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          buttonText: 'View Status',
          buttonVariant: 'secondary' as const
        };
      case 'approved':
        return {
          title: 'Application Approved!',
          description: 'Congratulations! You are now a verified trainer',
          icon: CheckCircle,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          buttonText: 'View Status',
          buttonVariant: 'secondary' as const
        };
      case 'rejected':
        return {
          title: 'Application Needs Updates',
          description: 'Please review the feedback and resubmit',
          icon: XCircle,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          buttonText: 'View Feedback',
          buttonVariant: 'secondary' as const
        };
      default:
        return {
          title: 'Become a Trainer',
          description: 'Share your expertise and help others achieve their fitness goals',
          icon: Briefcase,
          color: 'text-[var(--ethio-lemon-dark)] dark:text-[var(--ethio-lemon)]',
          bgColor: 'bg-emerald-50/90 dark:bg-emerald-950/30',
          borderColor: 'border-emerald-200/90 dark:border-emerald-800/80',
          buttonText: 'Apply Now',
          buttonVariant: 'default' as const
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <NeumorphicCard 
      variant="raised" 
      size="md" 
      className={cn(
        'border-2 transition-all duration-200',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-center space-x-4">
        <div className={cn(
          'p-3 rounded-full',
          config.bgColor,
          config.borderColor,
          'border'
        )}>
          <Icon className={cn('w-6 h-6', config.color)} />
        </div>
        
        <div className="flex-1">
          <h3 className={cn('font-semibold text-lg', config.color)}>
            {config.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {config.description}
          </p>
        </div>

        <div className="flex flex-col space-y-2">
          {status === 'none' ? (
            <Button 
              onClick={onApplyClick}
              className="user-app-btn-primary border-0 shadow-lg"
            >
              {config.buttonText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={onStatusClick}
              variant="outline"
              className={cn(
                'border-2 transition-all duration-200',
                config.borderColor,
                config.color,
                'hover:bg-white/50 dark:hover:bg-gray-800/50'
              )}
            >
              {config.buttonText}
            </Button>
          )}
        </div>
      </div>
    </NeumorphicCard>
  );
}
