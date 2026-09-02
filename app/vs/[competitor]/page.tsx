import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface CompetitorMeta {
  slug: string
  name: string
  title: string
  h1: string
  metaDescription: string
  headline: string
  subhead: string
  theirFlaws: string[]
  ourAdvantages: string[]
  faqs: Array<{ q: string; a: string }>
}

const COMPARISON_MAP: Record<string, CompetitorMeta> = {
  veed: {
    slug: 'veed',
    name: 'VEED.io',
    title: 'Instacap vs VEED.io — Best Unlimited Alternative | Instacap',
    h1: 'Instacap vs VEED.io: The Flat-Rate Caption Alternative',
    metaDescription:
      'Looking for a VEED.io alternative with no credit meters or per-render limits? Instacap offers 27 animated caption styles for a flat price.',
    headline: 'Tired of VEED.io credit limits & high subscription tiers?',
    subhead:
      'Instacap gives creators unlimited 4K video exports with word-by-word animated captions for one predictable flat price.',
    theirFlaws: [
      'Credit caps & export limits on lower tiers',
      'Confusing usage-based pricing models',
      'Slower rendering queues during peak hours',
    ],
    ourAdvantages: [
      'Flat price with zero credit meters',
      '27 real animated caption styles (Hormozi, Hype, Neon, etc.)',
      'Sub-second Deepgram AI word timestamps',
    ],
    faqs: [
      {
        q: 'Why do creators switch from VEED to Instacap?',
        a: 'Creators switch to Instacap to eliminate credit meter anxiety and get faster, higher-retention caption animations for a flat rate.',
      },
    ],
  },
  'captions-ai': {
    slug: 'captions-ai',
    name: 'Captions.ai',
    title: 'Instacap vs Captions.ai — Transparent Video Caption Generator | Instacap',
    h1: 'Instacap vs Captions.ai: Transparent Rendering & Pricing',
    metaDescription:
      'Compare Instacap and Captions.ai. Get 27 real customizable caption styles, direct SRT/VTT import, and unlimited exports with no credits.',
    headline: 'Looking for a Captions.ai web alternative with flat pricing?',
    subhead:
      'Instacap provides real customizable React caption compositions with zero credit limits and 100% transparent exports.',
    theirFlaws: [
      'Hidden credit limits per video export',
      'Black-box template engine with limited tweaking',
      'Mandatory recurring credit top-ups',
    ],
    ourAdvantages: [
      'Predictable flat pricing with no hidden meters',
      'Real Remotion React components you preview live',
      'Instant SRT / VTT subtitle file upload support',
    ],
    faqs: [
      {
        q: 'Does Instacap support Alex Hormozi and MrBeast styles?',
        a: 'Yes! Instacap natively includes Hormozi, Hype (MrBeast), Neon Glow, Comic, Karaoke, and 16 other styles.',
      },
    ],
  },
  submagic: {
    slug: 'submagic',
    name: 'Submagic',
    title: 'Instacap vs Submagic — Unlimited Render Alternative | Instacap',
    h1: 'Instacap vs Submagic: Unlimited Subtitles Without Credit Limits',
    metaDescription:
      'Submagic vs Instacap comparison. Discover why creators choose Instacap for unlimited video renders, fast AI captions, and flat pricing.',
    headline: 'Stop counting credits every time you export a short video.',
    subhead:
      'Instacap delivers studio-grade animated video subtitles with fast AI transcription and uncapped exports for short-form creators.',
    theirFlaws: [
      'Strict monthly video export limits per tier',
      'Expensive plans for high-volume content creators',
      'No custom SRT / VTT import on basic plans',
    ],
    ourAdvantages: [
      'Unlimited video renders on all paid plans',
      'Full SRT/VTT file import support',
      '27 high-retention caption styles built-in',
    ],
    faqs: [
      {
        q: 'Can I batch export multiple Reels on Instacap?',
        a: 'Yes, Instacap allows unlimited renders so you can batch as many Reels, Shorts, or TikToks as you need.',
      },
    ],
  },
}

interface Props {
  params: Promise<{ competitor: string }>
}

export async function generateStaticParams() {
  return Object.keys(COMPARISON_MAP).map((competitor) => ({ competitor }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { competitor } = await params
  const meta = COMPARISON_MAP[competitor.toLowerCase()]
  if (!meta) return {}

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://instacap.co'
  const canonicalUrl = `${appUrl}/vs/${meta.slug}`

  return {
    title: meta.title,
    description: meta.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: meta.title,
      description: meta.metaDescription,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Instacap',
    },
  }
}

export default async function CompetitorComparisonPage({ params }: Props) {
  const { competitor } = await params
  const meta = COMPARISON_MAP[competitor.toLowerCase()]

  if (!meta) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-[var(--brand)]">Insta</span>cap
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-semibold bg-[var(--brand)] text-black px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Start Free
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)] bg-[var(--brand-muted)] px-3 py-1 rounded-full">
            Competitor Comparison
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {meta.h1}
          </h1>
          <p className="text-lg text-[var(--sub)] max-w-2xl mx-auto">
            {meta.subhead}
          </p>
        </div>

        {/* Side by side comparison card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Competitor Box */}
          <div className="p-8 border border-red-500/20 bg-red-950/10 rounded-2xl space-y-4">
            <h3 className="text-xl font-bold text-red-400">{meta.name}</h3>
            <ul className="space-y-3 text-sm text-[var(--sub)]">
              {meta.theirFlaws.map((flaw, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span> {flaw}
                </li>
              ))}
            </ul>
          </div>

          {/* Instacap Box */}
          <div className="p-8 border border-[var(--brand)]/40 bg-[var(--brand-muted)]/20 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-xl font-bold text-[var(--brand)]">Instacap</h3>
            <ul className="space-y-3 text-sm text-[var(--sub)]">
              {meta.ourAdvantages.map((adv, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[var(--brand)] font-bold">✓</span> {adv}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="text-center p-10 border border-[var(--border)] bg-[var(--card)] rounded-2xl space-y-6">
          <h2 className="text-2xl font-bold">Ready to export unlimited video captions?</h2>
          <p className="text-sm text-[var(--sub)] max-w-md mx-auto">
            Try Instacap today with 3 free renders — no credit card required.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-[var(--brand)] text-black text-base font-bold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Get Started Free
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 mt-20 text-center text-xs text-[var(--mute)]">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div>© {new Date().getFullYear()} Instacap</div>
          <Link href="/" className="hover:underline">
            Home
          </Link>
        </div>
      </footer>
    </div>
  )
}
