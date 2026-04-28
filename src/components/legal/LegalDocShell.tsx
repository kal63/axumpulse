'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Header from '@/components/shared/header'
import { UnifiedBackground } from '@/components/landing/ui/UnifiedBackground'

type LegalDocShellProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function LegalDocShell({ title, subtitle, children }: LegalDocShellProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="landing-ethio min-h-screen relative overflow-hidden">
      <UnifiedBackground variant="ethio" />
      <Header scrolled={scrolled} showLogin variant="ethio" />

      <main className="relative z-20 mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(210,95%,28%)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>

        <header className="mb-10 border-b border-slate-200/90 pb-8">
          <h1 className="font-landing-display text-3xl uppercase tracking-tight text-[hsl(222,47%,8%)] sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 text-base text-[hsl(222,20%,40%)]">{subtitle}</p>
          ) : null}
        </header>

        <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-lg backdrop-blur-sm sm:p-10">
          <div className="legal-prose text-[hsl(222,20%,38%)] [&_h2]:mt-10 [&_h2]:scroll-mt-28 [&_h2]:font-landing-display [&_h2]:text-xl [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-[hsl(222,47%,8%)] [&_h2]:first:mt-0 [&_p]:mt-3 [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_strong]:text-[hsl(222,47%,8%)]">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
