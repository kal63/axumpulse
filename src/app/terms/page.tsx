import Link from 'next/link'
import { LegalDocShell } from '@/components/legal/LegalDocShell'

export default function TermsOfServicePage() {
  return (
    <LegalDocShell
      title="Terms of Service"
      subtitle="Please read these terms carefully before using Compound 360. Last updated: April 28, 2026."
    >
      <h2>1. Agreement</h2>
      <p>
        By creating an account, accessing our website or apps, subscribing via SMS or in-app flows, or otherwise using
        Compound 360 (the &quot;Service&quot;), you agree to these Terms of Service and our{' '}
        <Link href="/privacy" className="font-semibold text-[hsl(210,95%,28%)] underline underline-offset-2">
          Privacy Policy
        </Link>
        . If you do not agree, do not use the Service. We may update these terms; continued use after notice constitutes
        acceptance of the changes where permitted by law.
      </p>

      <h2>2. Description of the Service</h2>
      <p>
        Compound 360 provides digital fitness and wellness experiences, including AI-assisted coaching, workout and
        challenge content, progress tracking, gamification, multi-language support (including Amharic, Oromifa,
        Tigrigna, and English), optional trainer marketplace features, and optional medical-adjacent modules where
        available. Features may vary by region, carrier, subscription tier, and product roadmap.
      </p>

      <h2>3. Eligibility and accounts</h2>
      <p>
        You must provide accurate registration information and keep your credentials confidential. You are responsible
        for activity under your account. Notify us immediately of unauthorized use. We may suspend or terminate accounts
        that violate these terms or pose risk to the platform or other users.
      </p>

      <h2>4. Subscriptions, fees, and billing</h2>
      <p>
        Paid plans (for example daily or recurring subscriptions in ETB) are billed according to the offer shown at
        purchase and any carrier or payment partner rules. Prices and taxes may change with reasonable notice where
        required. Unless stated otherwise, subscriptions renew until you cancel through the channel you used to
        subscribe. Refunds follow the policy displayed at checkout and applicable consumer law.
      </p>

      <h2>5. Not medical advice</h2>
      <p>
        The Service is for general fitness and wellness education. It is not a substitute for professional medical
        advice, diagnosis, or treatment. Consult a qualified clinician before starting a new program if you have a
        medical condition, injury, or pregnancy. Use of optional medical or telehealth features is subject to additional
        terms and disclosures presented in those flows.
      </p>

      <h2>6. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Violate laws or third-party rights.</li>
        <li>Harass, abuse, or impersonate others; upload malware; or probe or break security.</li>
        <li>Scrape, data-mine, or reverse engineer the Service except as allowed by mandatory law.</li>
        <li>Circumvent access controls, share accounts in ways that breach subscription limits, or resell access.</li>
        <li>Use AI outputs to generate harmful, discriminatory, or illegal content.</li>
      </ul>

      <h2>7. Content and intellectual property</h2>
      <p>
        We and our licensors own the Service, branding, software, and curated content. Subject to your subscription and
        these terms, we grant you a personal, non-exclusive, non-transferable license to use the Service for its intended
        purpose. You retain rights in content you upload; you grant us a license to host, process, display, and improve
        the Service using that content (including training or tuning product features where permitted by law and our
        Privacy Policy).
      </p>

      <h2>8. Trainers, trainees, and third parties</h2>
      <p>
        If you are a trainer or professional user, additional obligations (verification, content standards, payouts) may
        apply in separate agreements or in-product policies. Interactions between trainees and trainers are subject to
        community guidelines and moderation. We are not a party to every user-to-user dispute but may intervene to
        protect platform integrity.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, to the
        fullest extent permitted by law. We do not guarantee uninterrupted or error-free operation, or specific fitness
        outcomes.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by applicable law, Compound 360 and its affiliates, partners, and suppliers
        will not be liable for indirect, incidental, special, consequential, or punitive damages, or loss of profits,
        data, or goodwill, arising from your use of the Service. Our aggregate liability for claims relating to the
        Service is limited to the greater of (a) the amount you paid us for the Service in the three months before the
        claim or (b) a nominal statutory minimum where caps are not enforceable.
      </p>

      <h2>11. Indemnity</h2>
      <p>
        You will defend and indemnify us against claims arising from your misuse of the Service, your content, or your
        violation of these terms, except to the extent caused by our willful misconduct.
      </p>

      <h2>12. Termination</h2>
      <p>
        You may stop using the Service at any time. We may suspend or terminate access for breach, risk, legal
        requirements, or discontinuation of features. Provisions that by nature should survive (for example liability
        limits, governing law) will survive termination.
      </p>

      <h2>13. Governing law and disputes</h2>
      <p>
        These terms are governed by the laws of the Federal Democratic Republic of Ethiopia, without regard to
        conflict-of-law rules. Courts in Addis Ababa shall have non-exclusive jurisdiction unless mandatory consumer
        protections in your country require otherwise.
      </p>

      <h2>14. Contact</h2>
      <p>
        <strong>support@compound-360.com</strong>
        <br />
        Bole, Addis Ababa, Ethiopia · +251 911 234 567
      </p>
    </LegalDocShell>
  )
}
