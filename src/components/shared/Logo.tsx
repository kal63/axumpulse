'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface LogoProps {
    withText?: boolean;
    size?: 'sm' | 'md';
}

export function Logo({ withText = true, size = 'md' }: LogoProps) {
    const height = size === 'sm' ? 24 : 32;
    const width = size === 'sm' ? 90 : 120;

    return (
        <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-90 transition-all duration-300 cursor-pointer group"
        >
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative inline-flex items-center justify-center transition-all duration-300"
            >
                <Image
                    src="/logo.png"
                    alt="Compound 360 logo"
                    width={width}
                    height={height}
                    className="w-auto bg-white rounded-[7px]"
                    priority
                />
            </motion.div>
            {withText && (
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:via-blue-300 group-hover:to-cyan-300 transition-all duration-300">
                    Compound 360
                </span>
            )}
        </Link>
    );
}


