'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

/** Co-brand mark: same asset as the landing header (`/ethiotell.png` in /public), no filename fallbacks. */
export function EthioTellsMark({ className }: Props) {
  return (
    <Image
      src="/ethiotell.png"
      alt="Ethio telecom"
      width={200}
      height={60}
      className={cn(
        'h-9 w-auto max-w-[9.5rem] object-contain object-left sm:h-10 sm:max-w-[11rem] md:h-11 md:max-w-[12rem]',
        className,
      )}
    />
  );
}
