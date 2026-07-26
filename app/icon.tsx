import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#e0431f',
          borderRadius: 8,
          color: '#ffffff',
          fontSize: 22,
          fontWeight: 800,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        I
      </div>
    ),
    { ...size }
  )
}
