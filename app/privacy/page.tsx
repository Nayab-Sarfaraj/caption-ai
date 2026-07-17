import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — Instacap',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-cc)] text-[#1a1917]">
      <header className="max-w-3xl mx-auto px-4 sm:px-8 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[13px] font-bold tracking-[0.08em] uppercase"><span className="text-[#c1361f]">Insta</span>cap</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96] mb-1.5">{'// Legal'}</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-wide uppercase mb-2">Privacy Policy</h1>
        <p className="text-xs text-[#a39e96] mb-10">Last updated: July 17, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-[#3a3733]">
          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">1. What We Collect</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account info</strong> — your name and email address, via Google sign-in (handled by Clerk).</li>
              <li><strong>Uploaded content</strong> — the video files you upload, and the transcripts generated from them.</li>
              <li><strong>Billing info</strong> — if you subscribe, your subscription status and billing history. Card details are handled entirely by Polar, our payment processor — we never see or store them.</li>
              <li><strong>Usage &amp; analytics</strong> — pages visited, features used, and general product-usage events, collected via PostHog, to understand how the product is used and improve it.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">2. How We Use It</h2>
            <p>
              We use your data to provide the Service — transcribing and rendering your videos, managing your
              account and subscription, and communicating with you about your renders or account. We use
              aggregated usage data to improve the product. We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">3. Third-Party Processors</h2>
            <p>We rely on the following third-party services to operate Instacap. Each processes a subset of your data on our behalf:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Clerk</strong> — authentication and account management.</li>
              <li><strong>MongoDB Atlas</strong> — stores account, job, and transcript data.</li>
              <li><strong>Cloudflare R2</strong> — stores uploaded videos and rendered output.</li>
              <li><strong>Deepgram</strong> — transcribes uploaded audio into text.</li>
              <li><strong>Polar</strong> — processes subscription payments (merchant of record).</li>
              <li><strong>PostHog</strong> — product analytics.</li>
              <li><strong>Google Cloud Platform</strong> — hosts the application and rendering infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">4. Data Retention</h2>
            <p>
              Uploaded source videos and rendered output are automatically deleted <strong>7 days</strong> after
              creation. Transcript data is retained longer to support re-rendering without re-uploading. Account
              and billing records are retained for as long as your account is active, and as required for legal
              and accounting purposes after that.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">5. Cookies &amp; Tracking</h2>
            <p>
              We use cookies for authentication (via Clerk) and PostHog for product analytics, which may set
              cookies or similar identifiers in your browser to distinguish sessions. We do not use this data
              for third-party advertising.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">6. Your Rights</h2>
            <p>
              You can request access to, correction of, or deletion of your personal data at any time by
              contacting us through the Contact/Support option in the app. Deleting your account removes your
              account record; uploaded content already follows the 7-day auto-delete policy in Section 4
              regardless.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">7. Children&rsquo;s Privacy</h2>
            <p>
              The Service is not directed at children under 13, and we do not knowingly collect data from
              children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">8. Changes to This Policy</h2>
            <p>
              We may update this policy as the product evolves. Material changes will be reflected by updating
              the &ldquo;Last updated&rdquo; date above.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">9. Contact</h2>
            <p>
              Questions about this policy, or requests regarding your data — use the Contact/Support option in
              the app, available from the dashboard sidebar or the site footer.
            </p>
          </section>

          <p className="text-xs text-[#a39e96] pt-4 border-t border-[#14120f1f]">
            This is a template Privacy Policy intended for an early-stage product and has not been reviewed by a
            lawyer. It will be replaced with a professionally reviewed version as the business grows. See also
            our <Link href="/terms" className="text-[#c1361f] hover:underline">Terms of Service</Link>.
          </p>
        </div>
      </main>
    </div>
  )
}
