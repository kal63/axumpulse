import Link from 'next/link'
import { LegalDocShell } from '@/components/legal/LegalDocShell'

export default function PrivacyPolicyPage() {
  return (
    <LegalDocShell
      title="Privacy Policy"
      subtitle="Effective for users of Compound 360 and related AxumPulse services. Last updated: April 28, 2026."
    >
      <h2>1. Who we are</h2>
      <p>
        Compound 360 is Ethiopia&apos;s AI-powered fitness and wellness platform operated with partners including BitApps
        Tech. We provide coaching, workouts, challenges, trainer tools, and optional medical-adjacent features where
        available. This policy explains how we handle information when you use our website, mobile apps, SMS onboarding,
        and paid subscriptions (including carrier billing where supported).
      </p>

      <h2>2. Information we collect</h2>
      <p>Depending on how you use the service, we may collect:</p>
      <ul>
        <li>
          <strong>Account and profile data:</strong> name, phone number, email (if provided), password (stored securely
          hashed), language preferences, date of birth, gender, profile photo, and fitness profile details you choose to
          enter (for example height, weight, goals, activity level).
        </li>
        <li>
          <strong>Usage and activity data:</strong> workouts completed, plans and challenges joined, XP and rewards,
          in-app navigation, support messages, and device/app diagnostics needed to run the service.
        </li>
        <li>
          <strong>AI and coaching interactions:</strong> prompts or inputs you send to AI coaching features, and
          outputs generated for you, so we can provide and improve personalized guidance in Amharic, Oromifa, Tigrigna,
          English, and other supported languages.
        </li>
        <li>
          <strong>Trainer and medical flows (if you use them):</strong> content you upload, consultation bookings, and
          health-related data you voluntarily share with trainers or licensed professionals through the platform—as
          described in those product areas and your consent where required.
        </li>
        <li>
          <strong>Transactions:</strong> subscription tier, billing status, and payment-related references from
          carriers or payment partners (we do not store full payment card numbers on our servers when processing is
          handled by a third party).
        </li>
        <li>
          <strong>Technical data:</strong> IP address, approximate location, device type, operating system, and cookies
          or similar technologies for security, preferences, and analytics.
        </li>
      </ul>

      <h2>3. How we use your information</h2>
      <p>We use personal data to:</p>
      <ul>
        <li>Create and secure your account, authenticate you, and recover access.</li>
        <li>Deliver workouts, plans, challenges, games, and notifications you request.</li>
        <li>Personalize recommendations and AI-assisted coaching based on your profile and activity.</li>
        <li>Process subscriptions, renewals, and customer support requests.</li>
        <li>Operate trainer and admin tools, moderation, fraud prevention, and legal compliance.</li>
        <li>Improve reliability, safety, and product features through aggregated or de-identified analytics.</li>
        <li>Send service messages (for example billing or security alerts). Marketing emails, if any, will respect your
          choices and applicable law.</li>
      </ul>

      <h2>4. Legal bases and consent</h2>
      <p>
        Where the law requires a legal basis, we rely on performance of a contract (providing the service you signed up
        for), legitimate interests (security, product improvement, and internal reporting that does not override your
        rights), compliance with legal obligations, and your consent where we ask it—for example for certain health
        inputs, marketing, or optional analytics.
      </p>

      <h2>5. Sharing and processors</h2>
      <p>We do not sell your personal information. We may share data with:</p>
      <ul>
        <li>
          <strong>Service providers</strong> who host infrastructure, send messages, process payments or carrier billing,
          analytics, or customer support—under contracts that require protection and limited use.
        </li>
        <li>
          <strong>Trainers or programs you join</strong> so they can coach you within the product rules you accept.
        </li>
        <li>
          <strong>Medical professionals</strong> only when you use medical features and explicitly engage them through
          the platform.
        </li>
        <li>
          <strong>Authorities</strong> when required by law or to protect the rights, safety, and integrity of users
          and the public.
        </li>
        <li>
          <strong>Business transfers</strong> such as a merger or acquisition, with notice where practicable.
        </li>
      </ul>

      <h2>6. Retention</h2>
      <p>
        We keep information as long as your account is active and for a reasonable period afterward to resolve disputes,
        enforce agreements, and meet legal, tax, and accounting requirements. Some logs may be kept for shorter security
        windows. You may request deletion subject to exceptions (for example unresolved claims or legal holds).
      </p>

      <h2>7. Security</h2>
      <p>
        We use industry-standard safeguards including encryption in transit, access controls, and secure password
        handling. No method of transmission or storage is 100% secure; please use a strong, unique password and protect
        your device.
      </p>

      <h2>8. Your choices and rights</h2>
      <p>Depending on your jurisdiction, you may have the right to:</p>
      <ul>
        <li>Access or export a copy of your personal information.</li>
        <li>Correct inaccurate profile or account details in-app or via support.</li>
        <li>Request deletion or restriction of certain processing.</li>
        <li>Object to processing based on legitimate interests, where applicable.</li>
        <li>Withdraw consent where processing was consent-based, without affecting prior lawful processing.</li>
      </ul>
      <p>
        To exercise these rights, contact us using the details below. We may need to verify your identity before
        responding.
      </p>

      <h2>9. Children</h2>
      <p>
        Compound 360 is intended for users who can lawfully enter into a contract in their jurisdiction. If you believe
        a child has provided personal data without appropriate consent, contact us and we will take appropriate steps.
      </p>

      <h2>10. International transfers</h2>
      <p>
        Our primary operations are oriented toward users in Ethiopia. If data is processed in other countries, we apply
        appropriate safeguards consistent with applicable law (such as contractual clauses or adequacy decisions where
        relevant).
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will post the new version on this page and adjust the
        &quot;Last updated&quot; date. Where changes are material, we will provide additional notice as required by law
        (for example by email or in-app message).
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions or requests: <strong>support@compound-360.com</strong>
        <br />
        Mailing address: Bole, Addis Ababa, Ethiopia
        <br />
        Phone: +251 911 234 567
      </p>

      <p className="mt-8 border-t border-slate-200/80 pt-6 text-sm text-[hsl(222,20%,45%)]">
        For rules of use, see our{' '}
        <Link href="/terms" className="font-semibold text-[hsl(210,95%,28%)] underline underline-offset-2">
          Terms of Service
        </Link>
        .
      </p>
    </LegalDocShell>
  )
}
