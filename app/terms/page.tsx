import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — Instacap',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-cc)] text-[#1a1917]">
      <header className="max-w-3xl mx-auto px-4 sm:px-8 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[13px] font-bold tracking-[0.08em] uppercase"><span className="text-[#c1361f]">Insta</span>cap</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96] mb-1.5">{'// Legal'}</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-wide uppercase mb-2">Terms of Service</h1>
        <p className="text-xs text-[#a39e96] mb-10">Last updated: July 17, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-[#3a3733]">
          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using Instacap (&ldquo;the Service&rdquo;), you agree to these Terms of
              Service. If you do not agree, do not use the Service. We may update these terms from time to time;
              continued use after a change constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">2. What Instacap Does</h2>
            <p>
              Instacap lets you upload a video, generate a word-level transcript (via automated speech
              recognition, or from an SRT/VTT file you provide), and render animated captions onto your video
              using one of the available caption styles. Rendered output is made available for you to download.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">3. Accounts</h2>
            <p>
              You must sign in with a valid Google account to use the Service. You are responsible for
              maintaining the security of your account and for all activity under it. You must be at least 13
              years old to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">4. Your Content</h2>
            <p>
              You retain all ownership rights to the videos, audio, and other content you upload
              (&ldquo;Your Content&rdquo;). By uploading Your Content, you grant us a limited license to store,
              process, and transform it solely for the purpose of providing the Service to you — generating
              transcripts, rendering captioned output, and displaying it back to you.
            </p>
            <p className="mt-2">
              You are solely responsible for Your Content and for having the necessary rights to upload and
              process it. You agree not to upload content that is illegal, infringes another person&rsquo;s rights,
              or is sexually explicit, violent, or otherwise objectionable. We reserve the right to remove
              content or suspend accounts that violate this policy. To report content, use the Contact/Support
              option in the app.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">5. Plans, Billing &amp; Cancellation</h2>
            <p>
              The free tier includes a limited number of watermarked renders per month, no card required. Paid
              plans (weekly, monthly, or yearly) remove the watermark and render limit. Payments are processed
              by Polar, our merchant of record — we do not store your card details. Subscriptions renew
              automatically at the end of each billing period until cancelled. Cancelling stops future renewals;
              you keep access through the end of the period you&rsquo;ve already paid for. No partial refunds are
              provided for unused time within a billing period, except where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">6. Upload Limits &amp; Fair Use</h2>
            <p>
              Uploads are limited to 10 minutes and 500MB per video, in MP4 or MOV format. Free-tier accounts are
              limited to a set number of uploads/renders per month, stated in the app. We may flag or restrict
              accounts with unusually high usage patterns to protect service stability for all users.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">7. Data Retention</h2>
            <p>
              Uploaded source videos and rendered output are automatically deleted 7 days after creation.
              Transcript data may be retained longer to support re-rendering. See our{' '}
              <Link href="/privacy" className="text-[#c1361f] hover:underline">Privacy Policy</Link> for details.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">8. Service Availability</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee
              uninterrupted or error-free operation. Rendering depends on third-party infrastructure
              (transcription, cloud storage, compute) that is outside our direct control.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Instacap and its operators are not liable for any
              indirect, incidental, or consequential damages arising from your use of the Service, including
              loss of data, lost profits, or service interruptions. Our total liability for any claim is limited
              to the amount you paid us in the 3 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">10. Termination</h2>
            <p>
              You may stop using the Service and delete your account at any time by contacting us. We may
              suspend or terminate accounts that violate these terms, including the content policy in Section 4.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1917] mb-2">11. Contact</h2>
            <p>
              Questions about these terms — use the Contact/Support option in the app, available from the
              dashboard sidebar or the site footer.
            </p>
          </section>

          <p className="text-xs text-[#a39e96] pt-4 border-t border-[#14120f1f]">
            This is a template Terms of Service intended for an early-stage product and has not been reviewed by
            a lawyer. It will be replaced with a professionally reviewed version as the business grows.
          </p>
        </div>
      </main>
    </div>
  )
}
