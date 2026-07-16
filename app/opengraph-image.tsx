import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

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
          background: '#faf9f6',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: '6px solid #c1361f',
              display: 'flex',
            }}
          />
          <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -1, color: '#1a1917' }}>
            Instacap
          </div>
        </div>
        <div style={{ fontSize: 28, color: '#6b6862', marginTop: 24 }}>
          Word-by-word animated captions
        </div>
      </div>
    ),
    { ...size }
  )
}
