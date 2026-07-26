import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CaptionStylePreview } from '@/components/caption-style-preview'
import { STYLE_SEO_MAP } from '@/src/helpers/style-seo-data'
import {
  generateFaqSchema,
  generateBreadcrumbSchema,
  generateSoftwareAppSchema,
} from '@/src/helpers/seo-schema'

interface Props {
  params: Promise<{ style: string }>
}

export async function generateStaticParams() {
  return Object.keys(STYLE_SEO_MAP).map((style) => ({ style }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { style } = await params
  const meta = STYLE_SEO_MAP[style.toLowerCase()]
  if (!meta) return {}

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://instacap.co'
  const canonicalUrl = `${appUrl}/styles/${meta.slug}`

  return {
    title: meta.title,
    description: meta.metaDescription,
    keywords: meta.searchIntentKeywords,
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
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.metaDescription,
    },
  }
}

export default async function StyleLandingPage({ params }: Props) {
  const { style } = await params
  const meta = STYLE_SEO_MAP[style.toLowerCase()]

  if (!meta) {
    notFound()
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://instacap.co'
  const breadcrumbItems = [
    { name: 'Home', url: appUrl },
    { name: 'Caption Styles', url: `${appUrl}/#styles` },
    { name: meta.h1, url: `${appUrl}/styles/${meta.slug}` },
  ]

  const softwareSchema = generateSoftwareAppSchema(appUrl)
  const faqSchema = generateFaqSchema(meta.faqs)
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems)

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Header / Nav */}
      <header className="border-b border-[var(--border)] py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-[var(--brand)]">Insta</span>cap
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-[var(--mute)] hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-semibold bg-[var(--brand)] text-black px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Try {meta.compositionId} Free
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        {/* Breadcrumb Trail */}
        <nav className="text-xs text-[var(--mute)] mb-8 flex items-center gap-2">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span>/</span>
          <Link href="/#styles" className="hover:underline">
            Styles
          </Link>
          <span>/</span>
          <span className="text-white font-medium">{meta.h1}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left copy column */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand)] bg-[var(--brand-muted)] px-3 py-1 rounded-full">
              ⚡ Instant AI Caption Style
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {meta.h1}
            </h1>
            <p className="text-lg text-[var(--sub)] leading-relaxed">
              {meta.description}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href="/sign-up"
                className="bg-[var(--brand)] text-black text-base font-bold px-6 py-3.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[var(--brand-glow)]"
              >
                Create Video with {meta.compositionId} Style — Free
              </Link>
              <a
                href="#faqs"
                className="border border-[var(--border)] text-sm font-semibold px-5 py-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                View FAQs
              </a>
            </div>

            {/* Key benefits list */}
            <div className="pt-6 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[var(--sub)]">
              <div className="flex items-center gap-2">
                <span className="text-[var(--brand)] font-bold">✓</span> Fast AI Word Timestamps
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--brand)] font-bold">✓</span> 4K Studio Render Quality
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--brand)] font-bold">✓</span> Zero Credit Limits
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--brand)] font-bold">✓</span> Export for Reels & TikTok
              </div>
            </div>
          </div>

          {/* Right Live Interactive Preview */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm border border-[var(--border)] bg-[var(--card)] p-4 rounded-2xl shadow-2xl">
              <div className="text-xs text-center font-mono text-[var(--mute)] mb-3">
                LIVE STYLE PREVIEW ({meta.compositionId})
              </div>
              <div className="aspect-[9/16] overflow-hidden rounded-xl bg-black">
                <CaptionStylePreview id={meta.compositionId} />
              </div>
            </div>
          </div>
        </div>

        {/* Use cases section */}
        <section className="mt-20 pt-12 border-t border-[var(--border)]">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Best Use Cases for {meta.h1}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {meta.useCases.map((uc, i) => (
              <div
                key={i}
                className="p-6 border border-[var(--border)] bg-[var(--card)] rounded-xl"
              >
                <div className="text-lg font-bold mb-2 text-[var(--brand)]">
                  0{i + 1}
                </div>
                <p className="text-sm text-[var(--sub)]">{uc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs section */}
        <section id="faqs" className="mt-20 pt-12 border-t border-[var(--border)]">
          <h2 className="text-2xl font-bold tracking-tight mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6 max-w-3xl">
            {meta.faqs.map((faq, i) => (
              <div
                key={i}
                className="p-6 border border-[var(--border)] bg-[var(--card)] rounded-xl space-y-2"
              >
                <h3 className="font-semibold text-lg">{faq.q}</h3>
                <p className="text-sm text-[var(--sub)] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 mt-20 text-center text-xs text-[var(--mute)]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Instacap. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
