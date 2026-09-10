import type { CompositionId } from '@/remotion/compositions/CaptionRoot'

type Mechanic = 'plain' | 'stroke' | 'box' | 'pill' | 'script' | 'lowercase' | 'single' | 'typewriter' | 'neon' | 'bar' | 'gradient' | 'highlighter' | 'underline' | 'glide' | 'outline' | 'meme' | 'sticker' | 'glitch' | 'wave' | 'news' | 'softCandy' | 'karaokeFill' | 'retroScript'

interface StyleMeta {
  mechanic: Mechanic
  fontFamily: string
  baseColor: string
  keywordColor?: string
  boxColor?: string
  boxTextColor?: string
  uppercase?: boolean
  glow: string
}

// Mirrors the real per-composition look (remotion/compositions/*.tsx) so the
// picker preview matches what actually renders, not an approximation.
export const STYLE_PREVIEW_META: Record<CompositionId, StyleMeta> = {
  WordHighlight: { mechanic: 'stroke', fontFamily: 'var(--font-anton), sans-serif', baseColor: '#fff', keywordColor: '#FFD329', uppercase: true, glow: '#FFD329' },
  KaraokeFill: { mechanic: 'karaokeFill', fontFamily: 'var(--font-montserrat), sans-serif', baseColor: '#fff', keywordColor: '#FFD60A', glow: '#FFD60A' },
  FocusCard: { mechanic: 'bar', fontFamily: 'var(--font-montserrat), sans-serif', baseColor: '#fff', keywordColor: '#FACC15', glow: '#FACC15' },
  ComicStrip: { mechanic: 'stroke', fontFamily: 'var(--font-bangers), cursive', baseColor: '#FFF4C7', keywordColor: '#F05268', uppercase: true, glow: '#F05268' },
  SoftCandy: { mechanic: 'softCandy', fontFamily: 'var(--font-montserrat), sans-serif', baseColor: '#34231F', keywordColor: '#D63D61', glow: '#D63D61' },
  RetroScript: { mechanic: 'retroScript', fontFamily: 'var(--font-lobster), cursive', baseColor: '#FF9A3E', keywordColor: '#FFE08A', glow: '#B51D62' },
  WordByWord:   { mechanic: 'plain',     fontFamily: 'var(--font-geist-sans), sans-serif', baseColor: '#fff', keywordColor: '#FACC15', glow: '#FACC15' },
  Karaoke:      { mechanic: 'plain',     fontFamily: 'var(--font-geist-sans), sans-serif', baseColor: '#fff', keywordColor: '#FACC15', glow: '#FACC15' },
  Spring:       { mechanic: 'plain',     fontFamily: 'var(--font-geist-sans), sans-serif', baseColor: '#fff', keywordColor: '#FACC15', glow: '#FACC15' },
  Fade:         { mechanic: 'plain',     fontFamily: 'var(--font-geist-sans), sans-serif', baseColor: '#fff', glow: '#8a8378' },
  Hype:         { mechanic: 'stroke',    fontFamily: 'var(--font-bangers), cursive',       baseColor: '#fff', keywordColor: '#22C55E', uppercase: true, glow: '#22C55E' },
  Hormozi:      { mechanic: 'stroke',    fontFamily: 'var(--font-anton), sans-serif',      baseColor: '#fff', keywordColor: '#F7C204', uppercase: true, glow: '#F7C204' },
  Comic:        { mechanic: 'stroke',    fontFamily: 'var(--font-fredoka), sans-serif',    baseColor: '#fff', keywordColor: '#38BDF8', uppercase: true, glow: '#38BDF8' },
  Minimal:      { mechanic: 'lowercase', fontFamily: 'var(--font-geist-sans), sans-serif', baseColor: '#fff', glow: '#8a8378' },
  BoxHighlight: { mechanic: 'box',       fontFamily: 'var(--font-montserrat), sans-serif', baseColor: '#fff', boxColor: '#7C3AED', boxTextColor: '#A3E635', uppercase: true, glow: '#7C3AED' },
  Pill:         { mechanic: 'pill',      fontFamily: 'var(--font-roboto), sans-serif',     baseColor: '#fff', glow: '#8a8378' },
  Script:       { mechanic: 'script',    fontFamily: 'var(--font-geist-sans), sans-serif', baseColor: '#fff', keywordColor: '#FBBF24', glow: '#FBBF24' },
  SingleWord:   { mechanic: 'single',    fontFamily: 'var(--font-anton), sans-serif',      baseColor: '#fff', keywordColor: '#FACC15', uppercase: true, glow: '#FACC15' },
  Typewriter:   { mechanic: 'typewriter', fontFamily: 'var(--font-geist-mono), monospace', baseColor: '#fff', keywordColor: '#FACC15', glow: '#FACC15' },
  NeonGlow:     { mechanic: 'neon',      fontFamily: 'var(--font-montserrat), sans-serif', baseColor: '#fff', keywordColor: '#22D3EE', glow: '#22D3EE' },
  CaptionBar:   { mechanic: 'bar',       fontFamily: 'var(--font-montserrat), sans-serif', baseColor: '#fff', keywordColor: '#FACC15', glow: '#FACC15' },
  Gradient:     { mechanic: 'gradient',  fontFamily: 'var(--font-montserrat), sans-serif', baseColor: '#fff', keywordColor: '#A855F7', glow: '#A855F7' },
  Highlighter:  { mechanic: 'highlighter', fontFamily: 'var(--font-montserrat), sans-serif', baseColor: '#fff', keywordColor: '#FDE047', glow: '#FDE047' },
  Underline:    { mechanic: 'underline', fontFamily: 'var(--font-montserrat), sans-serif', baseColor: '#fff', keywordColor: '#38BDF8', glow: '#38BDF8' },
  Glide:        { mechanic: 'glide',     fontFamily: 'var(--font-montserrat), sans-serif', baseColor: '#fff', keywordColor: '#FACC15', glow: '#FACC15' },
  Outline:      { mechanic: 'outline',   fontFamily: 'var(--font-anton), sans-serif',      baseColor: '#fff', keywordColor: '#FACC15', uppercase: true, glow: '#FACC15' },
  Meme:         { mechanic: 'meme',      fontFamily: 'Impact, "Arial Black", sans-serif',  baseColor: '#fff', uppercase: true, glow: '#8a8378' },
  Pulse:        { mechanic: 'plain',     fontFamily: 'var(--font-montserrat), sans-serif', baseColor: '#fff', keywordColor: '#F43F5E', glow: '#F43F5E' },
  Sticker:      { mechanic: 'sticker',   fontFamily: 'var(--font-fredoka), sans-serif',    baseColor: '#fff', keywordColor: '#22C55E', glow: '#22C55E' },
  Glitch:       { mechanic: 'glitch',    fontFamily: 'var(--font-anton), sans-serif',      baseColor: '#fff', keywordColor: '#fff', uppercase: true, glow: '#00E5FF' },
  Wave:         { mechanic: 'wave',      fontFamily: 'var(--font-fredoka), sans-serif',    baseColor: '#fff', keywordColor: '#A855F7', glow: '#A855F7' },
  Handwritten:  { mechanic: 'script',    fontFamily: 'var(--font-geist-sans), sans-serif', baseColor: '#fff', keywordColor: '#FACC15', glow: '#FACC15' },
  NewsBar:      { mechanic: 'news',      fontFamily: 'var(--font-montserrat), sans-serif', baseColor: '#fff', keywordColor: '#DC2626', glow: '#DC2626' },
}

const DROP_SHADOW = '0 2px 5px rgba(0,0,0,0.85), 0 0 1px rgba(0,0,0,0.9)'

export function CaptionStylePreview({ id }: { id: CompositionId }) {
  const meta = STYLE_PREVIEW_META[id]
  const isStroke = meta.mechanic === 'stroke'
  const textTransform = meta.uppercase ? 'uppercase' : meta.mechanic === 'lowercase' ? 'lowercase' : 'none'
  const stroke = isStroke ? { WebkitTextStroke: '1.25px #000', paintOrder: 'stroke fill' as const } : {}
  const fontSize = isStroke ? '19px' : '16px'

  const base = (
    <span style={{ color: meta.baseColor, fontFamily: meta.fontFamily, textTransform, textShadow: DROP_SHADOW, ...stroke }}>
      Just like{' '}
    </span>
  )

  let keyword: React.ReactNode
  if (meta.mechanic === 'box') {
    keyword = (
      <span
        style={{
          display: 'inline-block',
          fontFamily: meta.fontFamily,
          textTransform,
          color: meta.boxTextColor,
          backgroundColor: meta.boxColor,
          padding: '2px 7px',
          borderRadius: 4,
          lineHeight: 1.4,
        }}
      >
        this
      </span>
    )
  } else if (meta.mechanic === 'script') {
    keyword = (
      <span style={{ fontFamily: 'var(--font-caveat), cursive', color: meta.keywordColor, fontStyle: 'italic', fontSize: '1.3em', textShadow: DROP_SHADOW }}>
        this
      </span>
    )
  } else if (meta.mechanic === 'lowercase') {
    keyword = (
      <span style={{ color: meta.baseColor, fontFamily: meta.fontFamily, textTransform, textShadow: DROP_SHADOW }}>this</span>
    )
  } else if (meta.mechanic === 'neon') {
    keyword = (
      <span style={{ color: meta.keywordColor, fontFamily: meta.fontFamily, textTransform, textShadow: `0 0 6px ${meta.glow}, 0 0 18px ${meta.glow}, 0 0 36px ${meta.glow}` }}>this</span>
    )
  } else if (meta.mechanic === 'gradient') {
    keyword = (
      <span style={{ fontFamily: meta.fontFamily, textTransform, backgroundImage: `linear-gradient(90deg, ${meta.keywordColor}, #F9A8D4)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}>this</span>
    )
  } else if (meta.mechanic === 'highlighter') {
    keyword = (
      <span style={{ fontFamily: meta.fontFamily, textTransform, color: '#171717', backgroundColor: meta.keywordColor, padding: '1px 7px', borderRadius: 4, lineHeight: 1.4 }}>this</span>
    )
  } else if (meta.mechanic === 'underline') {
    keyword = (
      <span style={{ fontFamily: meta.fontFamily, textTransform, color: meta.keywordColor, borderBottom: `3px solid ${meta.keywordColor}`, paddingBottom: 1, textShadow: DROP_SHADOW }}>this</span>
    )
  } else {
    keyword = (
      <span style={{ color: meta.keywordColor ?? meta.baseColor, fontFamily: meta.fontFamily, textTransform, textShadow: isStroke ? `0 0 14px ${meta.glow}80` : DROP_SHADOW, ...stroke }}>
        this
      </span>
    )
  }

  const content = (
    <span className="font-bold leading-tight tracking-tight" style={{ fontSize }}>
      {base}
      {keyword}
    </span>
  )

  return (
    <div className="relative overflow-hidden rounded-t-xl w-full" style={{ background: '#0a0a09' }}>
      {/* base cinematic gradient */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(130% 100% at 25% 10%, #302f2c 0%, #1a1917 55%, #0a0a09 100%)' }}
      />
      {/* ambient accent glow, ties card to its style color without a literal dot */}
      <div
        className="absolute inset-0 opacity-25"
        style={{ background: `radial-gradient(60% 70% at 78% 82%, ${meta.glow}, transparent 70%)` }}
      />
      {/* top glass sheen */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 opacity-[0.06] pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #fff, transparent)' }}
      />
      {/* vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 26px 4px rgba(0,0,0,0.6)' }} />

      <div className="relative flex items-center justify-center px-3 py-6 min-h-[96px] text-center">
        {meta.mechanic === 'pill' ? (
          <span
            className="text-white rounded-md px-3 py-1.5 font-bold text-[16px] inline-block"
            style={{ fontFamily: meta.fontFamily, backgroundColor: 'rgba(28,28,26,0.92)', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
          >
            Just like this
          </span>
        ) : meta.mechanic === 'bar' ? (
          <span
            className="rounded-lg px-3 py-1.5 font-bold text-[15px] inline-block"
            style={{ fontFamily: meta.fontFamily, color: '#fff', backgroundColor: 'rgba(12,12,11,0.82)', boxShadow: '0 4px 12px rgba(0,0,0,0.45)' }}
          >
            Just like <span style={{ color: meta.keywordColor }}>this</span>
          </span>
        ) : meta.mechanic === 'karaokeFill' ? (
          <span className="font-black text-[18px]" style={{ fontFamily: meta.fontFamily, color: '#fff', WebkitTextStroke: '1px #080808', paintOrder: 'stroke fill' as const, textShadow: '0 2px 5px rgba(0,0,0,0.85)' }}>
            Just like <span style={{ backgroundImage: 'linear-gradient(90deg, #FFD60A 0%, #FFD60A 55%, #fff 55%, #fff 100%)', backgroundClip: 'text', color: 'transparent', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>this</span>
          </span>
        ) : meta.mechanic === 'retroScript' ? (
          <span className="text-[25px] leading-none" style={{ color: meta.baseColor, fontFamily: meta.fontFamily, textShadow: `3px 3px 0 ${meta.glow}, 1px 1px 0 ${meta.keywordColor}, -1px -1px 0 ${meta.keywordColor}, 0 3px 5px #3A1720` }}>
            Just like this
          </span>
        ) : meta.mechanic === 'softCandy' ? (
          <span className="inline-flex flex-col items-center gap-1" style={{ fontFamily: meta.fontFamily }}>
            <span className="px-2 py-0.5 font-bold" style={{ backgroundColor: '#FFF8DD', color: meta.baseColor }}>Just like</span>
            <span className="px-2 py-0.5 font-bold" style={{ backgroundColor: '#FFE3E8', color: meta.keywordColor }}>this</span>
          </span>
        ) : meta.mechanic === 'sticker' ? (
          <span className="font-extrabold text-[16px] text-slate-900 border-2 border-white rounded-md px-2 py-0.5 rotate-[-3deg]" style={{ fontFamily: meta.fontFamily, backgroundColor: meta.keywordColor }}>this</span>
        ) : meta.mechanic === 'glitch' ? (
          <span className="font-extrabold text-[21px] uppercase" style={{ fontFamily: meta.fontFamily, color: '#fff', textShadow: '3px 0 #00E5FF, -3px 0 #FF2851, 0 2px 4px #000' }}>this</span>
        ) : meta.mechanic === 'wave' ? (
          <span className="font-extrabold text-[18px]" style={{ fontFamily: meta.fontFamily, color: meta.keywordColor }}><span className="inline-block -translate-y-1">t</span><span className="inline-block translate-y-1">h</span><span className="inline-block -translate-y-1">i</span><span className="inline-block translate-y-1">s</span></span>
        ) : meta.mechanic === 'news' ? (
          <span className="w-full overflow-hidden rounded-sm text-left" style={{ fontFamily: meta.fontFamily }}><span className="inline-block bg-red-600 px-1.5 py-1 text-[8px] font-black tracking-wide text-white">NEWS</span><span className="inline-block bg-slate-900 px-1.5 py-1 text-[9px] font-bold text-white">Your headline</span></span>
        ) : meta.mechanic === 'single' ? (
          <span
            style={{ fontFamily: meta.fontFamily, textTransform: 'uppercase', color: meta.keywordColor, fontWeight: 800, fontSize: '34px', WebkitTextStroke: '1.4px #000', paintOrder: 'stroke fill' as const, textShadow: `0 0 16px ${meta.glow}80` }}
          >
            THIS
          </span>
        ) : meta.mechanic === 'typewriter' ? (
          <span className="font-bold text-[15px]" style={{ fontFamily: meta.fontFamily, color: '#fff' }}>
            Just like this<span style={{ color: meta.keywordColor }}>▋</span>
          </span>
        ) : meta.mechanic === 'outline' ? (
          <span className="font-bold" style={{ fontSize: '20px', fontFamily: meta.fontFamily, textTransform: 'uppercase' }}>
            <span style={{ color: 'transparent', WebkitTextStroke: '1.3px #fff', paintOrder: 'stroke fill' as const }}>Just like </span>
            <span style={{ color: meta.keywordColor, WebkitTextStroke: `1.3px ${meta.keywordColor}`, paintOrder: 'stroke fill' as const }}>this</span>
          </span>
        ) : meta.mechanic === 'meme' ? (
          <span style={{ fontFamily: meta.fontFamily, textTransform: 'uppercase', color: '#fff', WebkitTextStroke: '2px #000', paintOrder: 'stroke fill' as const, fontSize: '20px', fontWeight: 400, letterSpacing: '0.02em' }}>
            Just like this
          </span>
        ) : (
          content
        )}
      </div>
    </div>
  )
}
