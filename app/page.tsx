import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { CaptionStylePreview, STYLE_PREVIEW_META } from '@/components/caption-style-preview'
import { ScrollToHash } from '@/components/scroll-to-hash'
import { SupportTrigger } from '@/components/support-trigger'
import type { CompositionId } from '@/remotion/compositions/CaptionRoot'
import { PRICING_TIERS } from '@/src/helpers/pricing-tiers'

const STYLE_LABELS: Record<CompositionId, string> = {
  WordByWord: 'Word by Word',
  Karaoke: 'Karaoke',
  Fade: 'Fade',
  Spring: 'Spring',
  Hype: 'Hype',
  Hormozi: 'Hormozi',
  Minimal: 'Minimal',
  BoxHighlight: 'Box Highlight',
  Comic: 'Comic',
  Pill: 'Pill',
  Script: 'Script',
}

const STEPS = [
  { n: '01', title: 'Upload', desc: 'Drop an MP4 or MOV — up to 500MB, 10 minutes.' },
  { n: '02', title: 'Transcribe', desc: 'Deepgram transcribes word-by-word, or bring your own SRT/VTT.' },
  { n: '03', title: 'Pick a style', desc: 'Choose from real caption styles — see exactly how it looks before export.' },
  { n: '04', title: 'Export', desc: 'Rendered by Remotion, downloaded straight to you.' },
]

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Instacap',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web',
  description: 'Word-by-word animated captions for uploaded video, rendered via Remotion. No credit system, real caption styles instead of a black-box config.',
  offers: [
    { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Weekly', price: '6.99', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Monthly', price: '14.99', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Yearly', price: '119', priceCurrency: 'USD' },
  ],
}

export default async function RootPage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-cc)] text-[#1a1917]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <ScrollToHash />
      {/* Nav */}
      <header className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold tracking-[0.08em] uppercase"><span className="text-[#c1361f]">Insta</span>cap</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#styles" className="text-xs text-[#6b6862] hover:text-[#1a1917] transition-colors">
            Styles
          </a>
          <a href="#how-it-works" className="text-xs text-[#6b6862] hover:text-[#1a1917] transition-colors">
            How it works
          </a>
          <a href="#pricing" className="text-xs text-[#6b6862] hover:text-[#1a1917] transition-colors">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-5">
          <Link href="/sign-in" className="text-xs text-[#6b6862] hover:text-[#1a1917] transition-colors">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-xs font-bold bg-[#c1361f] text-white px-3.5 py-2 hover:brightness-[1.08] transition-all"
          >
            Get started free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-12 sm:pt-20 pb-16 text-center">
        <p className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96] mb-3">
          {'// Word-by-word animated captions'}
        </p>
        <h1 className="text-[32px] sm:text-[46px] font-bold tracking-tight leading-[1.05] max-w-3xl mx-auto text-balance">
          Captions that actually look like the style you picked.
        </h1>
        <p className="text-[15px] sm:text-base text-[#6b6862] mt-5 max-w-xl mx-auto">
          Upload a video, pick a real caption style, export. No credits, no black-box
          templates, no watching a spinner guess what you&rsquo;ll get.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link
            href="/sign-up"
            className="text-sm font-bold bg-[#c1361f] text-white px-5 py-3 hover:brightness-[1.08] transition-all"
          >
            Start free — no card required
          </Link>
          <a
            href="#styles"
            className="text-sm text-[#1a1917] px-5 py-3 border border-[#14120f1f] hover:border-[#14120f3d] transition-colors"
          >
            See caption styles
          </a>
        </div>
      </section>

      {/* Style showcase */}
      <section id="styles" className="max-w-5xl mx-auto px-4 sm:px-8 py-14 border-t border-[#14120f1f]">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96]">{'// Caption Styles'}</h2>
          <span className="text-[11px] text-[#a39e96]">{Object.keys(STYLE_PREVIEW_META).length} real styles, not mockups</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {(Object.keys(STYLE_PREVIEW_META) as CompositionId[]).map((id) => (
            <div key={id} className="overflow-hidden rounded-xl ring-1 ring-inset ring-[#14120f1f]">
              <CaptionStylePreview id={id} />
              <div className="px-3 py-2.5 bg-white">
                <p className="text-xs font-medium">{STYLE_LABELS[id]}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-8 py-14 border-t border-[#14120f1f]">
        <h2 className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96] mb-5">{'// How it works'}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#14120f1f] border border-[#14120f1f]">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-white p-5">
              <span className="text-xs text-[#c1361f]">{s.n}</span>
              <h3 className="text-sm font-bold mt-1.5">{s.title}</h3>
              <p className="text-xs text-[#6b6862] mt-1 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why not a black box */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-14 border-t border-[#14120f1f]">
        <h2 className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96] mb-5">{'// Why this, not veed / captions.ai'}</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-bold">Real components, not a config file</h3>
            <p className="text-xs text-[#6b6862] mt-1.5 leading-relaxed">
              Every style is an actual React/Remotion composition. What you preview is
              exactly what renders — no surprise output.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold">One price, no credits</h3>
            <p className="text-xs text-[#6b6862] mt-1.5 leading-relaxed">
              Flat monthly tier. No credit balance to track, no per-export fee, no
              &ldquo;upgrade to render this one.&rdquo;
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold">Transparent limits</h3>
            <p className="text-xs text-[#6b6862] mt-1.5 leading-relaxed">
              10-minute / 500MB uploads, MP4 or MOV. Stated up front, not discovered at
              checkout.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 sm:px-8 py-14 border-t border-[#14120f1f]">
        <h2 className="text-[11px] tracking-[0.15em] uppercase text-[#a39e96] mb-5">{'// Pricing'}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl">
          <div className="border border-[#14120f1f] bg-white p-6">
            <p className="text-xs text-[#a39e96] uppercase tracking-wide">Free</p>
            <p className="text-3xl font-bold mt-2">$0</p>
            <ul className="text-xs text-[#6b6862] mt-4 space-y-2">
              <li>· 3 renders / month</li>
              <li>· Watermarked export</li>
              <li>· No card required</li>
            </ul>
            <Link
              href="/sign-up"
              className="mt-6 inline-block text-xs font-bold border border-[#14120f1f] px-4 py-2.5 hover:border-[#14120f3d] transition-colors"
            >
              Start free
            </Link>
          </div>
          {PRICING_TIERS.map((t) => (
            <div key={t.id} className="border-2 border-[#c1361f] bg-white p-6 relative">
              {t.badge && (
                <span className="absolute top-0 right-0 bg-[#c1361f] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wide">
                  {t.badge}
                </span>
              )}
              <p className="text-xs text-[#a39e96] uppercase tracking-wide">{t.label}</p>
              <p className="text-3xl font-bold mt-2">
                {t.price}<span className="text-sm font-normal text-[#6b6862]">{t.period}</span>
              </p>
              {t.note && <p className="text-[11px] text-[#a39e96] mt-1">{t.note}</p>}
              <ul className="text-xs text-[#6b6862] mt-4 space-y-2">
                <li>· Unlimited renders</li>
                <li>· No watermark</li>
                <li>· All caption styles</li>
              </ul>
              <Link
                href="/sign-up"
                className="mt-6 inline-block text-xs font-bold bg-[#c1361f] text-white px-4 py-2.5 hover:brightness-[1.08] transition-all"
              >
                Get {t.label}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-8 py-8 border-t border-[#14120f1f] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wide uppercase text-[#a39e96]"><span className="text-[#c1361f]">Insta</span>cap</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="text-xs text-[#a39e96] hover:text-[#c1361f] transition-colors">Terms</Link>
          <Link href="/privacy" className="text-xs text-[#a39e96] hover:text-[#c1361f] transition-colors">Privacy</Link>
          <SupportTrigger className="text-xs text-[#a39e96] hover:text-[#c1361f] transition-colors" />
          <p className="text-xs text-[#a39e96]">© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}
