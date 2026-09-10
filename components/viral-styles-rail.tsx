import Link from 'next/link'
import type { CompositionId } from '@/remotion/compositions/CaptionRoot'
import { STYLE_PREVIEW_META } from '@/components/caption-style-preview'

export interface StyleHook {
  id: CompositionId
  label: string
  prefix?: string
  keyword: string
  suffix?: string
}

// Exactly the 32 viral caption styles (KaraokeFill is removed and excluded)
export const VIRAL_STYLE_HOOKS: StyleHook[] = [
  { id: 'Hormozi', label: 'Hormozi', prefix: 'THIS ONE SECRET', keyword: 'CHANGES', suffix: 'EVERYTHING' },
  { id: 'Karaoke', label: 'Karaoke', prefix: 'Watch how fast this', keyword: 'BLOWS UP' },
  { id: 'BoxHighlight', label: 'Box Highlight', prefix: "DON'T SKIP", keyword: 'THIS PART' },
  { id: 'Hype', label: 'Hype', keyword: 'BUILD IN PUBLIC' },
  { id: 'NeonGlow', label: 'Neon Glow', prefix: 'GLOW IN', keyword: 'THE DARK' },
  { id: 'WordHighlight', label: 'Word Highlight', prefix: 'STOP SCROLLING', keyword: 'RIGHT NOW' },
  { id: 'FocusCard', label: 'Focus Card', prefix: 'THE SECRET TO', keyword: 'VIRAL REELS' },
  { id: 'ComicStrip', label: 'Comic Strip', prefix: 'BOOM!', keyword: 'JUST LIKE THAT' },
  { id: 'SoftCandy', label: 'Soft Candy', prefix: 'Super sweet', keyword: 'AESTHETIC' },
  { id: 'RetroScript', label: 'Retro Script', prefix: 'Golden era', keyword: 'RETRO VIBES' },
  { id: 'WordByWord', label: 'Word by Word', prefix: 'Every single word', keyword: 'IN SYNC' },
  { id: 'Spring', label: 'Spring', prefix: 'Bouncing with', keyword: 'PURE ENERGY' },
  { id: 'Fade', label: 'Fade', prefix: 'Smooth and', keyword: 'SEAMLESS' },
  { id: 'Comic', label: 'Comic', prefix: 'LEVEL UP', keyword: 'YOUR CONTENT' },
  { id: 'Minimal', label: 'Minimal', prefix: 'focus on', keyword: 'what matters' },
  { id: 'Pill', label: 'Pill', prefix: 'Clean pill', keyword: 'HIGHLIGHTS' },
  { id: 'Script', label: 'Script', prefix: 'Personal touch', keyword: 'EMPHASIS' },
  { id: 'SingleWord', label: 'Single Word', keyword: 'MAX RETENTION' },
  { id: 'Typewriter', label: 'Typewriter', prefix: 'Typing out', keyword: 'THE TRUTH' },
  { id: 'CaptionBar', label: 'Caption Bar', prefix: 'Trending story', keyword: 'MUST WATCH' },
  { id: 'Gradient', label: 'Gradient', prefix: 'Vibrant color', keyword: 'FLOW' },
  { id: 'Highlighter', label: 'Highlighter', prefix: 'Mark the key', keyword: 'TAKEAWAYS' },
  { id: 'Underline', label: 'Underline', prefix: 'Underlined for', keyword: 'CLARITY' },
  { id: 'Glide', label: 'Glide', prefix: 'Gliding into', keyword: 'YOUR FEED' },
  { id: 'Outline', label: 'Outline', prefix: 'BOLD VECTOR', keyword: 'OUTLINE' },
  { id: 'Meme', label: 'Meme', prefix: 'NO WAY THIS', keyword: 'ACTUALLY WORKED' },
  { id: 'Pulse', label: 'Pulse', prefix: 'Pulsing to the', keyword: 'BEAT' },
  { id: 'Sticker', label: 'Sticker', prefix: 'Pops like a', keyword: 'STICKER' },
  { id: 'Glitch', label: 'Glitch', prefix: 'SYSTEM', keyword: 'OVERLOAD' },
  { id: 'Wave', label: 'Wave', prefix: 'Ride the', keyword: 'VIRAL WAVE' },
  { id: 'Handwritten', label: 'Handwritten', prefix: 'Notes from the', keyword: 'FOUNDER' },
  { id: 'NewsBar', label: 'News Bar', prefix: 'BREAKING', keyword: 'CREATOR NEWS' },
]

const CREATOR_BG = [
  'https://lh3.googleusercontent.com/aida/AEtjO1UsI5Z_EjmnfoQ94ck4881IHQJwvyx0xAOl_X64XYrCG3HuNSH-HIPrx1gURHX3mJH6so0VOOMdyh1aZWtLbHQvlfh8apc-brLXDR1izy6O6wZ1yEqCC_fDUHJPui2w7rzev2RXDIQM-2-gvqTFLBSguZQap4DbvI4K1fYJ-OP4gOlIiY5eX6uf8glH-zg4x9QLCmWYgHTaaoFaZHIsoZTEYJ_EelABL9A3aC7L6gdoPJjw0Zg1tRs9gsY',
  'https://lh3.googleusercontent.com/aida/AEtjO1WMYR_DgFXO8yvgOy-5FGLZ4FOjVcTBqjZ-4u8X7gHBW6kyXbGJUplO_pgYcBUD8yTkGufZvDBk00E_FEc2JmtawTqxndmtqbb_-NhtMdQmCpOlZ7xXJ07zCwROvh-P-v80eiJ5gqEf1xab7hFgbmXYT21VRdH2ILYG6MgE7jCYv31-Jgzw25Pv6W5NQ8Owo1t-BowsTzbDyBEW4_pe_mTJcMvwqSKgnmM6tPH5Un3aJFdeS-erTP_Nzw',
  'https://lh3.googleusercontent.com/aida/AEtjO1XuqgEAGN-zzpS8ZNkYlCepgidnB-QSoeq7RaQlNhzJc1WwGAGxL-k2ExYDWnWpQAQ7dzlcMHc9EoKOeSEgXtD1xW1Di5_kPtvm6BtCLREldg9xPNvb1carZ44sXUADTIBoOl9i-jFFNPImK1sWI3shAC7qPTRI-kUmmgSnLFxH4LKD_RF_omBOJCsqiv2yEbbgSuiRW9qmk2rnkLlpFmdVZUrl0YJ8T6-whJHeFAaEF4nuNNyFKQ1vzk4',
  'https://lh3.googleusercontent.com/aida/AEtjO1UbCv8-JTdsgbp_7LelbZhraW3pygcdtqsekvBNkt9NDe5yQSqSUPciRFaxof3xY3QOwv57TNqGUTdEIx3da_qXkgQ7uqYzFHhuC_Zk9llXVtG-yLjS1zOcubEpr20P9GkvplyI5i_WZaPn2ASzOwbvHF_r4CEJfyzA9bws37YxpkZLhPVTAHAmnHcXHlcjiPIoyHl4olXgCI2L9kotsP9i_e-eJfaq3wEirb0fLELNtsbIRXHFZN-Y1Wc',
  'https://lh3.googleusercontent.com/aida/AEtjO1V3ssKaYqyx0OsOLKi86cbF2ADmkaM2SDVGdek-Gx8639MTfWi6YZ-VPYY00R_y7TquGeYNoVsIVjxxXDV_wFfg7jd5kHYiY0yUJfsneR2pTYHK-gtEuYHfh-sxkvDt0459rQTzpTTrwA4To-NCSzQ85YySk2Y8dza3P0gCzrbtpv1xFo28K0T6uRpI9e_XBht0JI6ED6lyVhMgSgCn7LVZR69noPHARWaP4pGB4gYrtuqOl1764wrMPtY',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
]

const DROP_SHADOW = '0 2px 8px rgba(0,0,0,0.92), 0 0 2px rgba(0,0,0,0.9)'

function RailCaptionOverlay({ hook }: { hook: StyleHook }) {
  const meta = STYLE_PREVIEW_META[hook.id] ?? STYLE_PREVIEW_META.WordByWord
  const isStroke = meta.mechanic === 'stroke'
  const isBox = meta.mechanic === 'box'
  const isNeon = meta.mechanic === 'neon'
  const isGradient = meta.mechanic === 'gradient'
  const isHighlighter = meta.mechanic === 'highlighter'
  const isUnderline = meta.mechanic === 'underline'
  const isPill = meta.mechanic === 'pill'
  const isBar = meta.mechanic === 'bar'
  const isScript = meta.mechanic === 'script'
  const isRetro = meta.mechanic === 'retroScript'
  const isSoftCandy = meta.mechanic === 'softCandy'
  const isSticker = meta.mechanic === 'sticker'
  const isGlitch = meta.mechanic === 'glitch'
  const isWave = meta.mechanic === 'wave'
  const isNews = meta.mechanic === 'news'
  const isSingle = meta.mechanic === 'single'
  const isTypewriter = meta.mechanic === 'typewriter'
  const isMeme = meta.mechanic === 'meme'
  const isOutline = meta.mechanic === 'outline'

  const textTransform = meta.uppercase ? 'uppercase' : meta.mechanic === 'lowercase' ? 'lowercase' : 'none'
  const stroke = isStroke ? { WebkitTextStroke: '1.4px #000', paintOrder: 'stroke fill' as const } : {}

  if (isNews) {
    return (
      <div className="w-full rounded bg-black/90 p-2.5 shadow-2xl border border-white/10 text-left">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-red-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded tracking-wider uppercase">
            {hook.prefix || 'BREAKING'}
          </span>
          <span className="text-[11px] font-mono text-zinc-400 font-semibold tracking-wide">
            LIVE UPDATE
          </span>
        </div>
        <p className="font-bold text-white text-[15px] leading-tight tracking-tight">
          {hook.keyword}
        </p>
      </div>
    )
  }

  if (isSoftCandy) {
    return (
      <div className="flex flex-col items-center gap-1.5" style={{ fontFamily: meta.fontFamily }}>
        {hook.prefix && (
          <span className="px-2.5 py-0.5 font-bold text-[17px] rounded shadow-md" style={{ backgroundColor: '#FFF8DD', color: meta.baseColor }}>
            {hook.prefix}
          </span>
        )}
        <span className="px-3 py-0.5 font-extrabold text-[19px] rounded shadow-md" style={{ backgroundColor: '#FFE3E8', color: meta.keywordColor }}>
          {hook.keyword}
        </span>
      </div>
    )
  }

  if (isRetro) {
    return (
      <p
        className="text-[26px] sm:text-[28px] font-bold leading-tight"
        style={{
          fontFamily: meta.fontFamily,
          color: meta.baseColor,
          textShadow: `3px 3px 0 ${meta.glow}, 1px 1px 0 ${meta.keywordColor}, -1px -1px 0 ${meta.keywordColor}, 0 4px 8px #000`,
        }}
      >
        {hook.prefix && `${hook.prefix} `}
        <span>{hook.keyword}</span>
      </p>
    )
  }

  if (isSingle) {
    return (
      <p
        className="font-extrabold uppercase leading-none tracking-tight"
        style={{
          fontSize: '32px',
          fontFamily: meta.fontFamily,
          color: meta.keywordColor,
          WebkitTextStroke: '1.5px #000',
          paintOrder: 'stroke fill',
          textShadow: `0 0 20px ${meta.glow}`,
        }}
      >
        {hook.keyword}
      </p>
    )
  }

  if (isSticker) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        {hook.prefix && (
          <span className="font-bold text-[16px] text-white" style={{ textShadow: DROP_SHADOW }}>
            {hook.prefix}
          </span>
        )}
        <span
          className="font-black text-[18px] text-slate-900 border-2 border-white rounded-md px-3 py-0.5 rotate-[-3deg] shadow-lg"
          style={{ fontFamily: meta.fontFamily, backgroundColor: meta.keywordColor }}
        >
          {hook.keyword}
        </span>
      </div>
    )
  }

  if (isGlitch) {
    return (
      <p
        className="font-black text-[22px] uppercase tracking-wider"
        style={{
          fontFamily: meta.fontFamily,
          color: '#fff',
          textShadow: '3px 0 #00E5FF, -3px 0 #FF2851, 0 3px 6px #000',
        }}
      >
        {hook.prefix && `${hook.prefix} `}
        <span>{hook.keyword}</span>
      </p>
    )
  }

  if (isWave) {
    return (
      <div className="flex flex-col items-center gap-1">
        {hook.prefix && (
          <span className="font-bold text-[16px] text-white" style={{ textShadow: DROP_SHADOW }}>
            {hook.prefix}
          </span>
        )}
        <span className="font-black text-[20px] tracking-wide" style={{ fontFamily: meta.fontFamily, color: meta.keywordColor, textShadow: DROP_SHADOW }}>
          {hook.keyword.split('').map((char, i) => (
            <span key={i} className="inline-block" style={{ transform: i % 2 === 0 ? 'translateY(-3px)' : 'translateY(3px)' }}>
              {char}
            </span>
          ))}
        </span>
      </div>
    )
  }

  let renderedKeyword = null
  if (isBox) {
    renderedKeyword = (
      <span
        className="inline-block font-black px-2 py-0.5 rounded shadow-lg"
        style={{
          fontFamily: meta.fontFamily,
          color: meta.boxTextColor ?? '#A3E635',
          backgroundColor: meta.boxColor ?? '#7C3AED',
          boxShadow: `0 0 16px ${meta.glow}90`,
          WebkitTextStroke: '0',
        }}
      >
        {hook.keyword}
      </span>
    )
  } else if (isNeon) {
    renderedKeyword = (
      <span
        className="font-black"
        style={{
          color: meta.keywordColor,
          textShadow: `0 0 8px ${meta.glow}, 0 0 20px ${meta.glow}, 0 0 36px ${meta.glow}`,
        }}
      >
        {hook.keyword}
      </span>
    )
  } else if (isGradient) {
    renderedKeyword = (
      <span
        className="font-black bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}
      >
        {hook.keyword}
      </span>
    )
  } else if (isHighlighter) {
    renderedKeyword = (
      <span
        className="font-black text-slate-950 px-2 py-0.5 rounded shadow-md"
        style={{ backgroundColor: meta.keywordColor ?? '#FDE047' }}
      >
        {hook.keyword}
      </span>
    )
  } else if (isUnderline) {
    renderedKeyword = (
      <span
        className="font-bold border-b-[3.5px] pb-0.5"
        style={{ color: meta.keywordColor, borderColor: meta.keywordColor, textShadow: DROP_SHADOW }}
      >
        {hook.keyword}
      </span>
    )
  } else if (isPill) {
    renderedKeyword = (
      <span
        className="inline-block font-bold text-white px-2.5 py-1 rounded-md shadow-lg"
        style={{ backgroundColor: 'rgba(28,28,26,0.92)' }}
      >
        {hook.prefix} <span style={{ color: meta.keywordColor }}>{hook.keyword}</span>
      </span>
    )
  } else if (isBar) {
    renderedKeyword = (
      <span
        className="inline-block font-bold text-white px-2.5 py-1 rounded-lg shadow-lg"
        style={{ backgroundColor: 'rgba(12,12,11,0.85)' }}
      >
        {hook.prefix} <span style={{ color: meta.keywordColor }}>{hook.keyword}</span>
      </span>
    )
  } else if (isScript) {
    renderedKeyword = (
      <span
        className="italic font-bold text-[1.25em]"
        style={{ fontFamily: 'var(--font-caveat), cursive', color: meta.keywordColor, textShadow: DROP_SHADOW }}
      >
        {hook.keyword}
      </span>
    )
  } else if (isTypewriter) {
    renderedKeyword = (
      <span style={{ color: meta.keywordColor }}>
        {hook.keyword}<span className="animate-pulse">▋</span>
      </span>
    )
  } else if (isMeme) {
    renderedKeyword = (
      <span style={{ color: '#fff', WebkitTextStroke: '1.6px #000', paintOrder: 'stroke fill' as const, textShadow: DROP_SHADOW }}>
        {hook.keyword}
      </span>
    )
  } else if (isOutline) {
    renderedKeyword = (
      <span
        style={{
          color: meta.keywordColor,
          WebkitTextStroke: '1.4px #000',
          paintOrder: 'stroke fill' as const,
          textShadow: `0 0 16px ${meta.glow}80`,
        }}
      >
        {hook.keyword}
      </span>
    )
  } else {
    renderedKeyword = (
      <span
        style={{
          color: meta.keywordColor ?? '#FACC15',
          textShadow: isStroke ? `0 0 16px ${meta.glow}90` : DROP_SHADOW,
          ...stroke,
        }}
      >
        {hook.keyword}
      </span>
    )
  }

  // Pill and bar wrap prefix internally
  if (isPill || isBar) {
    return (
      <div className="font-bold text-[17px] leading-snug tracking-tight">
        {renderedKeyword}
      </div>
    )
  }

  const fontSize = isStroke ? '19px' : '17px'

  return (
    <p
      className="font-bold leading-snug tracking-tight"
      style={{
        fontSize,
        fontFamily: meta.fontFamily,
        textTransform,
        color: meta.baseColor,
        textShadow: DROP_SHADOW,
        ...stroke,
      }}
    >
      {hook.prefix && <span>{hook.prefix} </span>}
      {renderedKeyword}
      {hook.suffix && <span> {hook.suffix}</span>}
    </p>
  )
}

export function ViralStylesRail() {
  // Duplicate array into 2 sets for a completely seamless, continuous marquee loop
  const seamlessRailItems = [...VIRAL_STYLE_HOOKS, ...VIRAL_STYLE_HOOKS]

  return (
    <section className="w-full py-28 relative overflow-hidden bg-[#100f0d]/80 border-y border-white/[0.06]" id="styles">
      {/* Ambient background glows matching mockup */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[400px] bg-[#ff4d00]/[0.05] blur-[160px] pointer-events-none -z-10" aria-hidden="true" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[500px] h-[350px] bg-[#7c3aed]/[0.04] blur-[150px] pointer-events-none -z-10" aria-hidden="true" />

      {/* Section Header */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 mb-10">
        <div className="flex flex-col items-start max-w-3xl">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-5 h-[2px] bg-[#ff4d00] rounded-full inline-block" />
            <span className="font-mono text-[11px] sm:text-[12px] uppercase font-bold tracking-[0.2em] text-[#ff4d00]">
              VIRAL CAPTION STYLES
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-white leading-[1.12] mb-5 font-[family-name:var(--font-display),sans-serif]">
            Designed to stop the scroll and boost watch time.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal max-w-3xl">
            Over 85% of social video is watched muted. Choose from 32 high-converting animated styles tuned specifically for Reels, Shorts, and TikTok.
          </p>
        </div>
      </div>

      {/* Clean Uniform Flat Video-First Horizontal Rail */}
      <div className="relative w-full overflow-hidden fade-mask-edges py-3 marquee-rail-container">
        <div className="marquee-track flex items-center gap-6">
          {seamlessRailItems.map((hook, index) => {
            const bgImage = CREATOR_BG[index % CREATOR_BG.length]

            return (
              <Link
                key={`${hook.id}-${index}`}
                href="/sign-up"
                className="flex flex-col items-center flex-shrink-0 w-[284px] group cursor-pointer no-underline"
              >
                <div className="relative w-[284px] aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-white/10 transition-all duration-300 group-hover:border-white/25 group-hover:scale-[1.018] shadow-2xl group-hover:shadow-[0_20px_48px_-10px_rgba(0,0,0,0.9),0_0_24px_-4px_rgba(255,77,0,0.25)]">
                  {/* Creator Video Still Backdrop */}
                  <img
                    alt={`${hook.label} caption style`}
                    className="w-full h-full object-cover select-none transition-all duration-500 brightness-95 group-hover:brightness-105"
                    src={bgImage}
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Dark Vignette & Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/40 pointer-events-none" />

                  {/* Camera / Top Bar Chrome */}
                  <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-white/90 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                      REC
                    </span>
                    <span className="font-mono text-[10px] font-bold text-white/60 bg-black/50 px-1.5 py-0.5 rounded border border-white/10">
                      4K
                    </span>
                  </div>

                  {/* Lower-Third Authentic Live Caption Overlay */}
                  <div className="absolute inset-x-3 bottom-8 z-20 flex flex-col items-center text-center select-none pointer-events-none">
                    <RailCaptionOverlay hook={hook} />
                  </div>
                </div>

                {/* Style Label Under Card */}
                <span className="text-sm font-medium text-white/90 group-hover:text-[#ff4d00] transition-colors text-center mt-4 tracking-wide flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d00] opacity-80" />
                  {hook.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
