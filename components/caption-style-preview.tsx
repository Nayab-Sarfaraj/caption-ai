import type { CompositionId } from '@/remotion/compositions/CaptionRoot'

type Mechanic = 'plain' | 'stroke' | 'box' | 'pill' | 'script' | 'lowercase'

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
    <div className="relative overflow-hidden rounded-t-xl" style={{ background: '#0a0a09' }}>
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

      <div className="relative flex items-center justify-center px-4 py-7 min-h-[104px]">
        {meta.mechanic === 'pill' ? (
          <span
            className="text-white rounded-md px-3 py-1.5 font-bold text-[16px] inline-block"
            style={{ fontFamily: meta.fontFamily, backgroundColor: 'rgba(28,28,26,0.92)', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
          >
            Just like this
          </span>
        ) : (
          content
        )}
      </div>
    </div>
  )
}
