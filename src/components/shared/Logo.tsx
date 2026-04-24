'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
    withText?: boolean;
    size?: 'sm' | 'md';
    /** Override mark (e.g. EthioTells) — default Compound 360 asset */
    imageSrc?: string;
    imageAlt?: string;
    /** When false, render the mark only (no link) — e.g. in-app chrome */
    withLink?: boolean;
    /** Where the default linked logo goes; traineed app can use `/user/dashboard` */
    href?: string;
}

export function Logo({
    withText = true,
    size = 'md',
    imageSrc = '/logo.png',
    imageAlt = 'Compound 360 logo',
    withLink = true,
    href = '/',
}: LogoProps) {
    const isDefaultMark = imageSrc === '/logo.png';
    const height = !isDefaultMark
        ? size === 'sm'
            ? 40
            : 48
        : size === 'sm'
          ? 24
          : 32;
    const width = !isDefaultMark
        ? size === 'sm'
            ? 180
            : 220
        : size === 'sm'
          ? 90
          : 120;

    const mark = (
        <motion.div
            whileHover={{ scale: withLink ? 1.05 : 1 }}
            whileTap={withLink ? { scale: 0.95 } : undefined}
            className="relative inline-flex items-center justify-center transition-all duration-300"
        >
            <Image
                src={imageSrc}
                alt={imageAlt}
                width={width}
                height={height}
                className={cn(
                    'w-auto',
                    isDefaultMark
                        ? 'bg-white rounded-[7px]'
                        : size === 'sm'
                          ? 'h-10 w-auto max-w-[min(100%,15rem)] object-contain object-left sm:h-11'
                          : 'h-12 w-auto max-w-[min(100%,18rem)] object-contain object-left sm:h-14',
                )}
                priority
            />
        </motion.div>
    );

    if (!withLink) {
        return (
            <div className="flex w-full min-w-0 items-center space-x-3">
                {mark}
                {withText && (
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Compound 360
                    </span>
                )}
            </div>
        );
    }

    return (
        <Link
            href={href}
            className="group flex cursor-pointer items-center space-x-3 transition-all duration-300 hover:opacity-90"
        >
            {mark}
            {withText && (
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:via-blue-300 group-hover:to-cyan-300 transition-all duration-300">
                    Compound 360
                </span>
            )}
        </Link>
    );
}


