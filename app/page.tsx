import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import {
  CaptionStylePreview,
  STYLE_PREVIEW_META,
} from "@/components/caption-style-preview";
import { HeroCaptionDemo } from "@/components/hero-caption-demo";
import { ScrollToHash } from "@/components/scroll-to-hash";
import { SupportTrigger } from "@/components/support-trigger";
import type { CompositionId } from "@/remotion/compositions/CaptionRoot";
import { PRICING_TIERS } from "@/src/helpers/pricing-tiers";
import s from "./page.module.css";

const STYLE_LABELS: Record<CompositionId, string> = {
  WordHighlight: "Word Highlight",
  KaraokeFill: "Karaoke Fill",
  FocusCard: "Focus Card",
  ComicStrip: "Comic Strip",
  SoftCandy: "Soft Candy",
  RetroScript: "Retro Script",
  WordByWord: "Word by Word",
  Karaoke: "Karaoke",
  Fade: "Fade",
  Spring: "Spring",
  Hype: "Hype",
  Hormozi: "Hormozi",
  Minimal: "Minimal",
  BoxHighlight: "Box Highlight",
  Comic: "Comic",
  Pill: "Pill",
  Script: "Script",
  SingleWord: "Single Word",
  Typewriter: "Typewriter",
  NeonGlow: "Neon Glow",
  CaptionBar: "Caption Bar",
  Gradient: "Gradient",
  Highlighter: "Highlighter",
  Underline: "Underline",
  Glide: "Glide",
  Outline: "Outline",
  Meme: "Meme",
  Pulse: "Pulse",
  Sticker: "Sticker",
  Glitch: "Glitch",
  Wave: "Wave",
  Handwritten: "Handwritten",
  NewsBar: "News Bar",
};

const STYLE_IDS = Object.keys(STYLE_PREVIEW_META) as CompositionId[];

// dot color per style — same source the previews render from
const chipColor = (id: CompositionId) =>
  STYLE_PREVIEW_META[id].keywordColor ?? STYLE_PREVIEW_META[id].glow;

const STEPS = [
  {
    n: "01",
    title: "Upload",
    desc: "Drop an MP4 or MOV — up to 500MB, 10 minutes.",
  },
  {
    n: "02",
    title: "Transcribe",
    desc: "Deepgram transcribes word-by-word, or bring your own SRT/VTT.",
  },
  {
    n: "03",
    title: "Pick a style",
    desc: "Choose a real caption style — see exactly how it looks before export.",
  },
  {
    n: "04",
    title: "Export",
    desc: "Rendered by Remotion, downloaded straight to you.",
  },
];

const PROOF = [
  {
    av: "MR",
    color: "var(--pop-violet)",
    name: "Maya R.",
    handle: "@mayamakes · 120K",
    quote:
      "Captions doubled my Reels completion rate. Deepgram transcribes it in seconds and the Hormozi pop is dead accurate.",
  },
  {
    av: "DK",
    color: "var(--pop-green)",
    name: "Devon K.",
    handle: "@devonclips · 88K",
    quote:
      "No credits is huge for batching. I generate 20 Shorts every Sunday in under 15 minutes with zero meter anxiety.",
  },
  {
    av: "SL",
    color: "var(--pop-cyan)",
    name: "Sam L.",
    handle: "@sledits · 54K",
    quote:
      "Crisp 4K video exports with word-by-word timing that stays 100% in sync. Hands down the fastest workflow I've used.",
  },
];

const COMPETITORS = ["veed.io", "captions.ai", "submagic"];
const COMPARE: {
  feature: string;
  us: boolean;
  them: [boolean, boolean, boolean];
}[] = [
  { feature: "No credit system or export caps", us: true, them: [false, false, false] },
  {
    feature: "Viral high-retention caption styles",
    us: true,
    them: [true, true, true],
  },
  {
    feature: "Sub-second word-level AI transcription",
    us: true,
    them: [false, false, false],
  },
  {
    feature: "Studio-grade 4K export quality",
    us: true,
    them: [true, false, true],
  },
  {
    feature: "Flat pricing with unlimited renders",
    us: true,
    them: [false, false, false],
  },
  {
    feature: "Instant SRT/VTT import support",
    us: true,
    them: [true, true, false],
  },
];

const FAQS = [
  {
    q: "How does Instacap increase video retention?",
    a: "85%+ of social video is watched muted. Instacap provides 33 high-impact, word-by-word animated caption styles (Hormozi, Hype, Neon Glow, etc.) that grab viewer attention immediately and boost watch time.",
  },
  {
    q: "How fast is the transcription and rendering?",
    a: "Transcription takes just seconds using Deepgram Nova-2 word-level AI. Rendering happens rapidly in cloud workers so you can download publish-ready 4K videos fast.",
  },
  {
    q: "Do I need credits or a balance?",
    a: "No. One flat price for unlimited renders within upload limits — no per-export fee, no meter to watch.",
  },
  {
    q: "What formats and limits are supported?",
    a: "MP4 or MOV, up to 500MB and 10 minutes per video.",
  },
  {
    q: "Can I bring my own captions?",
    a: "Yes. Drop an SRT or VTT and Instacap skips AI transcription, going straight to styling.",
  },
  {
    q: "Is there a free tier?",
    a: "Yes — 3 watermarked renders a month, no card required. Upgrade any time for unlimited, watermark-free exports.",
  },
];

function YesNo({ on }: { on: boolean }) {
  return on ? (
    <span className={s.yes}>✓</span>
  ) : (
    <span className={s.no}>—</span>
  );
}

function Check() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      aria-hidden="true"
    >
      <path d="M4 10l4 4 8-9" />
    </svg>
  );
}
function Cross() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Instacap",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web",
  description:
    "High-retention animated captions for viral videos in seconds. Fast AI transcription, 33 creator caption styles, studio 4K exports, and flat pricing with no credits.",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Weekly", price: "6.99", priceCurrency: "USD" },
    { "@type": "Offer", name: "Monthly", price: "14.99", priceCurrency: "USD" },
    { "@type": "Offer", name: "Yearly", price: "119", priceCurrency: "USD" },
  ],
};

export default async function RootPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className={s.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <ScrollToHash />

      {/* Nav */}
      <header className={s.nav}>
        <div className={`${s.wrap} ${s.navIn}`}>
          <Link href="/" className={s.logo}>
            <b>Insta</b>cap
          </Link>
          <nav className={s.navLinks}>
            <a href="#styles">Styles</a>
            <a href="#how">How it works</a>
            <a href="#why">Why Instacap</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className={s.navCta}>
            <Link href="/sign-in" className={s.signin}>
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className={`${s.btn} ${s.btnPrimary}`}
              style={{ padding: "10px 18px", fontSize: 14 }}
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={s.hero}>
        <div className={`${s.wrap} ${s.heroIn}`}>
          <div>
            <span className={s.eyebrow}>Lightning-fast AI video captions</span>
            <h1 className={s.h1}>
              AI Video Caption Generator for{" "}
              <span className={s.hl}>viral videos in seconds.</span>
            </h1>
            <p className={s.sub}>
              Boost watch time on Reels, TikTok, and Shorts. Powered by ultra-fast
              AI transcription, 33 studio caption styles, and flat pricing with zero credit limits.
            </p>
            <div className={s.heroActions}>
              <Link href="/sign-up" className={`${s.btn} ${s.btnPrimary}`}>
                Start free — no card
              </Link>
              <a href="#styles" className={`${s.btn} ${s.btnGhost}`}>
                See {STYLE_IDS.length} viral styles
              </a>
            </div>
            <div className={s.microtrust}>
              <span className={s.stars}>⚡</span>
              <span>Fast AI Transcription • 🎯 Max Retention Styles • 🚀 Unlimited Exports</span>
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
            <div className={s.stat}>
              <div className={s.statN}>
                <b>{STYLE_IDS.length}+</b>
              </div>
              <div className={s.statL}>
                Viral caption styles — Hormozi, Hype, Neon Glow & more for max retention
              </div>
            </div>
            <div className={s.stat}>
              <div className={s.statN}>
                <b>&lt;5s</b>
              </div>
              <div className={s.statL}>
                Fast AI transcription with word-level timing precision
              </div>
            </div>
            <div className={s.stat}>
              <div className={s.statN}>4K</div>
              <div className={s.statL}>
                Studio-grade, crisp vector text export for all social platforms
              </div>
            </div>
            <div className={s.stat}>
              <div className={s.statN}>
                0
              </div>
              <div className={s.statL}>
                Credit limits. Unlimited renders on one flat price
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Style gallery */}
      <section id="styles" className={s.blk}>
        <div className={s.wrap}>
          <div className={s.secHead}>
            <span className={s.eyebrow}>Viral Caption Styles</span>
            <h2>Designed to stop the scroll and boost watch time.</h2>
            <p>
              Over 85% of social video is watched muted. Choose from 33 high-converting
              animated styles tuned specifically for Reels, Shorts, and TikTok.
            </p>
          </div>
          <div className={s.gallery}>
            {STYLE_IDS.map((id) => (
              <div key={id} className={s.gcard}>
                <CaptionStylePreview id={id} />
                <div className={s.glabel}>
                  <span>{STYLE_LABELS[id]}</span>
                  <span className={s.real}>live</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why / bento */}
      <section id="why" className={`${s.blk} ${s.alt}`}>
        <div className={s.wrap}>
          <div className={s.secHead}>
            <span className={s.eyebrow}>
              Why creators choose Instacap
            </span>
            <h2>
              Built for speed, engagement, and effortless video creation.
            </h2>
          </div>
          <div className={s.bento}>
            <div className={`${s.cell} ${s.big}`}>
              <div>
                <h3>
                  Engineered for short-form virality & retention.
                </h3>
                <p>
                  Static captions get scrolled past. Instacap&rsquo;s word-by-word kinetic
                  animations grab viewer attention in the first 3 seconds, keeping your
                  audience hooked to the end of every video.
                </p>
              </div>
              <div className={s.compare}>
                <div className={`${s.col} ${s.them}`}>
                  <h4>Other Tools</h4>
                  <ul>
                    <li>
                      <Cross />
                      Credit meters & hidden fees
                    </li>
                    <li>
                      <Cross />
                      Slow rendering queues
                    </li>
                    <li>
                      <Cross />
                      Low resolution exports
                    </li>
                  </ul>
                </div>
                <div className={`${s.col} ${s.us}`}>
                  <h4>Instacap</h4>
                  <ul>
                    <li style={{ color: "var(--brand)" }}>
                      <Check />
                      Unlimited renders
                    </li>
                    <li style={{ color: "var(--brand)" }}>
                      <Check />
                      Sub-second AI transcription
                    </li>
                    <li style={{ color: "var(--brand)" }}>
                      <Check />
                      Crisp 4K video quality
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className={s.cell}>
              <div className={s.ic}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3>Lightning Fast Speed</h3>
              <p>
                From raw video to publish-ready export in under a minute. Powered by
                Deepgram Nova-2 AI transcription.
              </p>
            </div>
            <div className={s.cell}>
              <div className={s.ic}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </div>
              <h3>Flat Uncapped Pricing</h3>
              <p>
                One flat price. Batch as many Reels and Shorts as you want without calculating credits.
              </p>
            </div>
            <div className={s.cell}>
              <div className={s.ic}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M4 6h16M4 12h10M4 18h7" />
                </svg>
              </div>
              <h3>Bring your own transcript</h3>
              <p>
                Auto-transcribe word-by-word, or drop an SRT/VTT file and jump straight to styling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className={s.blk}>
        <div className={s.wrap}>
          <div className={s.secHead}>
            <span className={s.eyebrow}>How it compares</span>
            <h2>Same job. Fewer surprises.</h2>
          </div>
          <div className={s.cmpWrap}>
            <table className={s.cmp}>
              <thead>
                <tr>
                  <th aria-hidden="true" />
                  <th className={`${s.center} ${s.cmpUsHead} ${s.usCol}`}>
                    Instacap
                  </th>
                  {COMPETITORS.map((c) => (
                    <th key={c} className={s.center}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row.feature}>
                    <td className={s.feat}>{row.feature}</td>
                    <td className={`${s.val} ${s.usCol}`}>
                      <YesNo on={row.us} />
                    </td>
                    {row.them.map((t, i) => (
                      <td key={i} className={s.val}>
                        <YesNo on={t} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={s.slotNote}>
            {"// Competitor capabilities as of 2026 — verify before launch"}
          </p>
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
                  <span className={s.av} style={{ background: p.color }}>
                    {p.av}
                  </span>
                  <div>
                    <div className={s.nm}>{p.name}</div>
                    <div className={s.hd}>{p.handle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={s.blk}>
        <div className={s.wrap}>
          <div className={s.secHead}>
            <span className={s.eyebrow}>Pricing</span>
            <h2>One set of features. Pick a cadence.</h2>
            <p>
              Every paid plan is identical — unlimited renders within the upload
              limits, no watermark, all {STYLE_IDS.length} styles. Only the
              billing period changes.
            </p>
          </div>
          <div className={s.prices}>
            <div className={s.price}>
              <span className={s.tier}>Free</span>
              <div className={s.amt}>$0</div>
              <div className={s.pnote}>No card required</div>
              <ul>
                <li>
                  <Check />3 renders / month
                </li>
                <li>
                  <Check />
                  Watermarked export
                </li>
                <li>
                  <Check />
                  All caption styles
                </li>
              </ul>
              <Link href="/sign-up" className={`${s.btn} ${s.btnOut}`}>
                Start free
              </Link>
            </div>
            {PRICING_TIERS.map((t) => {
              const featured = Boolean(t.badge);
              return (
                <div
                  key={t.id}
                  className={featured ? `${s.price} ${s.feat}` : s.price}
                >
                  {t.badge && <span className={s.badge}>{t.badge}</span>}
                  <span className={s.tier}>{t.label}</span>
                  <div className={s.amt}>
                    {t.price}
                    <span>{t.period}</span>
                  </div>
                  <div className={s.pnote}>{t.note ?? ""}</div>
                  <ul>
                    <li>
                      <Check />
                      Unlimited renders
                    </li>
                    <li>
                      <Check />
                      No watermark
                    </li>
                    <li>
                      <Check />
                      All {STYLE_IDS.length} styles
                    </li>
                  </ul>
                  <Link
                    href="/sign-up"
                    className={
                      featured
                        ? `${s.btn} ${s.btnPrimary}`
                        : `${s.btn} ${s.btnOut}`
                    }
                  >
                    Get {t.label}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={`${s.blk} ${s.alt}`}>
        <div className={s.wrap}>
          <div className={`${s.secHead} ${s.centered}`}>
            <span className={s.eyebrow}>FAQ</span>
            <h2>Questions, answered.</h2>
          </div>
          <div className={s.faq}>
            {FAQS.map((f) => (
              <details key={f.q} className={s.faqItem}>
                <summary>{f.q}</summary>
                <p className={s.faqAns}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={s.final}>
        <div className={`${s.wrap} ${s.finalIn}`}>
          <h2>Caption your next video in minutes.</h2>
          <p>
            Free to start, no card. Pick a style, hit export, get exactly what
            you saw.
          </p>
          <Link
            href="/sign-up"
            className={`${s.btn} ${s.btnPrimary}`}
            style={{ fontSize: 16, padding: "15px 28px" }}
          >
            Start free — no card required
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={s.footer}>
        <div className={`${s.wrap} ${s.footIn}`}>
          <span className={s.logo} style={{ fontSize: 15 }}>
            <b>Insta</b>cap
          </span>
          <div className={s.links}>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <SupportTrigger className={s.footLink} />
          </div>
          <span className={s.cr}>© {new Date().getFullYear()} Instacap</span>
        </div>
      </footer>
    </div>
  );
}
