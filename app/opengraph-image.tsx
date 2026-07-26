import { ImageResponse } from 'next/og'

export const alt = 'Instacap — word-by-word animated captions. No credits. What you preview is what renders.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// The whole card IS the video still — cinematic dark stage, player chrome, and a
// hero caption in the box-highlight style (the premium Submagic/MrBeast look).
// Reads as a real export frame, not a toy phone mock.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a09',
          backgroundImage:
            'radial-gradient(1200px 720px at 50% -8%, rgba(224,67,31,0.30), transparent 62%), radial-gradient(900px 600px at 50% 120%, rgba(52,211,153,0.10), transparent 60%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* vignette for depth */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            boxShadow: 'inset 0 0 240px 70px rgba(0,0,0,0.6)',
          }}
        />

        {/* top chrome — wordmark + REC/timecode */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '44px 52px',
          }}
        >
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
            <span style={{ color: '#e0431f' }}>Insta</span>
            <span style={{ color: '#f7f5f0' }}>cap</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', width: 11, height: 11, borderRadius: 999, background: '#e0431f' }} />
            <span style={{ display: 'flex', fontSize: 18, fontWeight: 700, letterSpacing: 2, color: '#cbc5ba' }}>REC</span>
            <span style={{ display: 'flex', fontSize: 18, color: '#948d80', fontFamily: 'monospace', marginLeft: 6 }}>0:07</span>
          </div>
        </div>

        {/* HERO caption — word-by-word, box-highlight keyword */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: -3,
              textTransform: 'uppercase',
              color: '#f7f5f0',
              textShadow: '0 6px 30px rgba(0,0,0,0.55)',
            }}
          >
            Stop the
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: -2,
              textTransform: 'uppercase',
              color: '#ffffff',
              background: '#e0431f',
              borderRadius: 20,
              padding: '6px 34px 14px',
              boxShadow: '0 18px 50px -12px rgba(224,67,31,0.7)',
            }}
          >
            Scroll
          </div>

          {/* context strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginTop: 40,
              fontSize: 23,
              color: '#cbc5ba',
              border: '1px solid #2a2723',
              background: 'rgba(20,19,17,0.6)',
              borderRadius: 999,
              padding: '12px 26px',
            }}
          >
            <span style={{ display: 'flex' }}>Word-by-word animated captions</span>
            <span style={{ display: 'flex', color: '#4a453d' }}>•</span>
            <span style={{ display: 'flex', color: '#facc15' }}>no credits</span>
            <span style={{ display: 'flex', color: '#4a453d' }}>•</span>
            <span style={{ display: 'flex', color: '#34d399' }}>what you preview is what renders</span>
          </div>
        </div>

        {/* bottom chrome — scrubber */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '0 52px 44px',
          }}
        >
          <span style={{ display: 'flex', fontSize: 16, color: '#948d80', fontFamily: 'monospace' }}>0:03</span>
          <div style={{ display: 'flex', flex: 1, height: 6, borderRadius: 999, background: '#2a2723' }}>
            <div style={{ display: 'flex', width: '38%', height: 6, borderRadius: 999, background: '#e0431f' }} />
          </div>
          <span style={{ display: 'flex', fontSize: 16, color: '#948d80', fontFamily: 'monospace' }}>0:09</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
