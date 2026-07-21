import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Cinematic dark card echoing the landing hero — a sample caption on a stage.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b0b0a',
          backgroundImage:
            'radial-gradient(1000px 500px at 50% -10%, rgba(224,67,31,0.28), transparent 70%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 76, fontWeight: 800, letterSpacing: -2 }}>
          <span style={{ color: '#e0431f' }}>Insta</span>
          <span style={{ color: '#f7f5f0' }}>cap</span>
        </div>

        {/* sample caption chip — Hormozi-style keyword pop */}
        <div
          style={{
            display: 'flex',
            marginTop: 46,
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: -1,
            textTransform: 'uppercase',
            color: '#f7f5f0',
          }}
        >
          <span>Stop&nbsp;</span>
          <span style={{ color: '#facc15' }}>the scroll</span>
        </div>

        <div style={{ display: 'flex', fontSize: 26, color: '#948d80', marginTop: 48, letterSpacing: 0.5 }}>
          Word-by-word animated captions · no credits · what you preview is what renders
        </div>
      </div>
    ),
    { ...size }
  )
}
