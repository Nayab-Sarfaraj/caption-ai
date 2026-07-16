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
        <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -1, display: 'flex' }}>
          <span style={{ color: '#c1361f' }}>Insta</span>
          <span style={{ color: '#1a1917' }}>cap</span>
        </div>
        <div style={{ fontSize: 28, color: '#6b6862', marginTop: 24 }}>
          Word-by-word animated captions
        </div>
      </div>
    ),
    { ...size }
  )
}
