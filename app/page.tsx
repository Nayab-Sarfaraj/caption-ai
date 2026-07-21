import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { CaptionStylePreview, STYLE_PREVIEW_META } from '@/components/caption-style-preview'
import { HeroCaptionDemo } from '@/components/hero-caption-demo'
import { ScrollToHash } from '@/components/scroll-to-hash'
import { SupportTrigger } from '@/components/support-trigger'
import type { CompositionId } from '@/remotion/compositions/CaptionRoot'
import { PRICING_TIERS } from '@/src/helpers/pricing-tiers'
import s from './page.module.css'

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

const STYLE_IDS = Object.keys(STYLE_PREVIEW_META) as CompositionId[]

// dot color per style — same source the previews render from
const chipColor = (id: CompositionId) =>
  STYLE_PREVIEW_META[id].keywordColor ?? STYLE_PREVIEW_META[id].glow

const STEPS = [
  { n: '01', title: 'Upload', desc: 'Drop an MP4 or MOV — up to 500MB, 10 minutes.' },
  { n: '02', title: 'Transcribe', desc: 'Deepgram transcribes word-by-word, or bring your own SRT/VTT.' },
  { n: '03', title: 'Pick a style', desc: 'Choose a real caption style — see exactly how it looks before export.' },
  { n: '04', title: 'Export', desc: 'Rendered by Remotion, downloaded straight to you.' },
]

const PROOF = [
  { av: 'MR', color: 'var(--pop-violet)', name: 'Maya R.', handle: '@mayamakes · 120K', quote: 'The preview is the render. I stopped exporting three times to check caption timing — it’s right the first time.' },
  { av: 'DK', color: 'var(--pop-green)', name: 'Devon K.', handle: '@devonclips · 88K', quote: 'No credits is the whole thing for me. I batch 20 Reels on a Sunday and never think about a meter.' },
  { av: 'SL', color: 'var(--pop-cyan)', name: 'Sam L.', handle: '@sledits · 54K', quote: 'Hormozi style that actually looks like Hormozi style. The stroke and pop are dead on.' },
]

function Check() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
      <path d="M4 10l4 4 8-9" />
    </svg>
  )
}
function Cross() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  )
}

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
    <div className={s.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <ScrollToHash />

      {/* Nav */}
      <header className={s.nav}>
        <div className={`${s.wrap} ${s.navIn}`}>
          <Link href="/" className={s.logo}><b>Insta</b>cap</Link>
          <nav className={s.navLinks}>
            <a href="#styles">Styles</a>
            <a href="#how">How it works</a>
            <a href="#why">Why Instacap</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className={s.navCta}>
            <Link href="/sign-in" className={s.signin}>Sign in</Link>
            <Link href="/sign-up" className={`${s.btn} ${s.btnPrimary}`} style={{ padding: '10px 18px', fontSize: 14 }}>
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={s.hero}>
        <div className={`${s.wrap} ${s.heroIn}`}>
          <div>
            <span className={s.eyebrow}>Word-by-word animated captions</span>
            <h1 className={s.h1}>The caption looks exactly like the <span className={s.hl}>style you picked.</span></h1>
            <p className={s.sub}>
              Upload a video, pick a real caption style, export. No credits, no black-box templates,
              no watching a spinner guess what you&rsquo;ll get.
            </p>
            <div className={s.heroActions}>
              <Link href="/sign-up" className={`${s.btn} ${s.btnPrimary}`}>Start free — no card</Link>
              <a href="#styles" className={`${s.btn} ${s.btnGhost}`}>See {STYLE_IDS.length} caption styles</a>
            </div>
            <div className={s.microtrust}>
              <span className={s.stars}>★★★★★</span>
              <span>What you preview is what renders — every pixel.</span>
            </div>
          </div>
          <div className={s.stageCol}>
            <HeroCaptionDemo />
          </div>
        </div>
      </section>

      {/* Style marquee */}
      <div className={s.marquee} aria-hidden="true">
        <div className={s.mqRow}>
          {[...STYLE_IDS, ...STYLE_IDS].map((id, idx) => (
            <span key={`${id}-${idx}`} className={s.mchip}>
              <span className={s.dot} style={{ background: chipColor(id) }} />
              {STYLE_LABELS[id]}
            </span>
          ))}
        </div>
      </div>

      {/* Stat band */}
      <section className={s.stats}>
        <div className={s.wrap}>
          <div className={s.statsGrid}>
            <div className={s.stat}><div className={s.statN}><b>{STYLE_IDS.length}</b></div><div className={s.statL}>Real caption styles — actual Remotion components, not config presets</div></div>
            <div className={s.stat}><div className={s.statN}><b>0</b></div><div className={s.statL}>Credits to track. One flat price, unlimited renders</div></div>
            <div className={s.stat}><div className={s.statN}>1:1</div><div className={s.statL}>Preview matches export exactly — no surprise output</div></div>
            <div className={s.stat}><div className={s.statN}>7<span className={s.statSm}>days</span></div><div className={s.statL}>Auto-delete of your source + renders. Stated up front</div></div>
          </div>
        </div>
      </section>

      {/* Style gallery */}
      <section id="styles" className={s.blk}>
        <div className={s.wrap}>
          <div className={s.secHead}>
            <span className={s.eyebrow}>Caption styles</span>
            <h2>Every style is a real render, not a mockup.</h2>
            <p>These aren&rsquo;t screenshots of a settings panel. Each one is a live React/Remotion composition — the exact code that renders your video.</p>
          </div>
          <div className={s.gallery}>
            {STYLE_IDS.map((id) => (
              <div key={id} className={s.gcard}>
                <CaptionStylePreview id={id} />
                <div className={s.glabel}><span>{STYLE_LABELS[id]}</span><span className={s.real}>live</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why / bento */}
      <section id="why" className={`${s.blk} ${s.alt}`}>
        <div className={s.wrap}>
          <div className={s.secHead}>
            <span className={s.eyebrow}>Why Instacap, not veed / captions.ai</span>
            <h2>You shouldn&rsquo;t need a credit calculator to caption a video.</h2>
          </div>
          <div className={s.bento}>
            <div className={`${s.cell} ${s.big}`}>
              <div>
                <h3>Real components, not a config file you can&rsquo;t see inside.</h3>
                <p>Competitors hide styling behind a black-box template and a credit meter. Every Instacap style is an actual composition — what you preview is what renders, down to the pixel.</p>
              </div>
              <div className={s.compare}>
                <div className={`${s.col} ${s.them}`}>
                  <h4>Them</h4>
                  <ul>
                    <li><Cross />Credits per export</li>
                    <li><Cross />Preview ≠ output</li>
                    <li><Cross />Surprise watermark</li>
                  </ul>
                </div>
                <div className={`${s.col} ${s.us}`}>
                  <h4>Instacap</h4>
                  <ul>
                    <li style={{ color: 'var(--brand)' }}><Check />Unlimited renders</li>
                    <li style={{ color: 'var(--brand)' }}><Check />1:1 preview</li>
                    <li style={{ color: 'var(--brand)' }}><Check />No-watermark tiers</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className={s.cell}>
              <div className={s.ic}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2v20M2 12h20" /></svg></div>
              <h3>One price, no credits</h3>
              <p>Flat tier. No balance to top up, no per-export fee, no &ldquo;upgrade to render this one.&rdquo;</p>
            </div>
            <div className={s.cell}>
              <div className={s.ic}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 6h16M4 12h10M4 18h7" /></svg></div>
              <h3>Bring your own transcript</h3>
              <p>Auto-transcribe word-by-word, or drop an SRT/VTT and skip straight to styling.</p>
            </div>
            <div className={s.cell}>
              <div className={s.ic}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 3l8 4v6c0 4-3 7-8 8-5-1-8-4-8-8V7z" /></svg></div>
              <h3>Transparent limits</h3>
              <p>10 min / 500MB uploads, MP4 or MOV. Stated up front — not discovered at checkout.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className={s.blk}>
        <div className={s.wrap}>
          <div className={s.secHead}>
            <span className={s.eyebrow}>How it works</span>
            <h2>Upload to download in four steps.</h2>
          </div>
          <div className={s.steps}>
            {STEPS.map((step) => (
              <div key={step.n} className={s.step}>
                <span className={s.stepK}>{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof */}
      <section className={`${s.blk} ${s.alt}`}>
        <div className={s.wrap}>
          <div className={s.secHead}>
            <span className={s.eyebrow}>From creators</span>
            <h2>Made for people who post every day.</h2>
          </div>
          <div className={s.proof}>
            {PROOF.map((p) => (
              <div key={p.name} className={s.quote}>
                <div className={s.qstars}>★★★★★</div>
                <p>&ldquo;{p.quote}&rdquo;</p>
                <div className={s.who}>
                  <span className={s.av} style={{ background: p.color }}>{p.av}</span>
                  <div>
                    <div className={s.nm}>{p.name}</div>
                    <div className={s.hd}>{p.handle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className={s.slotNote}>{'// Placeholder testimonials — swap for real creator quotes / G2 · Trustpilot ratings at launch'}</p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={s.blk}>
        <div className={s.wrap}>
          <div className={s.secHead}>
            <span className={s.eyebrow}>Pricing</span>
            <h2>One set of features. Pick a cadence.</h2>
            <p>Every paid plan is identical — unlimited renders within the upload limits, no watermark, all {STYLE_IDS.length} styles. Only the billing period changes.</p>
          </div>
          <div className={s.prices}>
            <div className={s.price}>
              <span className={s.tier}>Free</span>
              <div className={s.amt}>$0</div>
              <div className={s.pnote}>No card required</div>
              <ul>
                <li><Check />3 renders / month</li>
                <li><Check />Watermarked export</li>
                <li><Check />All caption styles</li>
              </ul>
              <Link href="/sign-up" className={`${s.btn} ${s.btnOut}`}>Start free</Link>
            </div>
            {PRICING_TIERS.map((t) => {
              const featured = Boolean(t.badge)
              return (
                <div key={t.id} className={featured ? `${s.price} ${s.feat}` : s.price}>
                  {t.badge && <span className={s.badge}>{t.badge}</span>}
                  <span className={s.tier}>{t.label}</span>
                  <div className={s.amt}>{t.price}<span>{t.period}</span></div>
                  <div className={s.pnote}>{t.note ?? ''}</div>
                  <ul>
                    <li><Check />Unlimited renders</li>
                    <li><Check />No watermark</li>
                    <li><Check />All {STYLE_IDS.length} styles</li>
                  </ul>
                  <Link href="/sign-up" className={featured ? `${s.btn} ${s.btnPrimary}` : `${s.btn} ${s.btnOut}`}>
                    Get {t.label}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={s.final}>
        <div className={`${s.wrap} ${s.finalIn}`}>
          <h2>Caption your next video in minutes.</h2>
          <p>Free to start, no card. Pick a style, hit export, get exactly what you saw.</p>
          <Link href="/sign-up" className={`${s.btn} ${s.btnPrimary}`} style={{ fontSize: 16, padding: '15px 28px' }}>
            Start free — no card required
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={s.footer}>
        <div className={`${s.wrap} ${s.footIn}`}>
          <span className={s.logo} style={{ fontSize: 15 }}><b>Insta</b>cap</span>
          <div className={s.links}>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <SupportTrigger className={s.footLink} />
          </div>
          <span className={s.cr}>© {new Date().getFullYear()} Instacap</span>
        </div>
      </footer>
    </div>
  )
}
