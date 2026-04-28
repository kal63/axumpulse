import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy · Compound 360',
  description:
    'How Compound 360 collects, uses, and protects your personal information across our fitness platform, AI coaching, and related services.',
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
