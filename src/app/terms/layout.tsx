import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service · Compound 360',
  description:
    'Terms governing your use of Compound 360—AI fitness coaching, subscriptions, trainer features, and related services.',
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
