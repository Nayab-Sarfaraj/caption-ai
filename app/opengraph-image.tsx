import { ImageResponse } from 'next/og'

export const alt = 'Instacap — word-by-word animated captions. No credits. What you preview is what renders.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Cinematic dark card that SHOWS the product: brand + hook on the left, a phone
// still with a real Hormozi-style caption (colored keyword pops) on the right —
// the word-by-word look is the whole differentiator, so the card leads with it.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          background: '#0b0b0a',
          backgroundImage:
            'radial-gradient(900px 520px at 22% -10%, rgba(224,67,31,0.30), transparent 68%)',
          fontFamily: 'system-ui, sans-serif',
          padding: '0 76px',
        }}
      >
        {/* LEFT — brand + hook + trust line */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1.25 }}>
          <div style={{ display: 'flex', fontSize: 60, fontWeight: 800, letterSpacing: -2 }}>
            <span style={{ color: '#e0431f' }}>Insta</span>
            <span style={{ color: '#f7f5f0' }}>cap</span>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              marginTop: 34,
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: -2.5,
              lineHeight: 1.02,
              color: '#f7f5f0',
            }}
          >
            <span>Stop the&nbsp;</span>
            <span style={{ color: '#e0431f' }}>scroll.</span>
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 30,
              fontSize: 27,
              lineHeight: 1.35,
              color: '#948d80',
              maxWidth: 560,
            }}
          >
            Word-by-word animated captions. No credits — what you preview is exactly what renders.
          </div>

          {/* trust chips */}
          <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
            {['No credits', 'No black box', 'Flat pricing'].map((t) => (
              <div
                key={t}
                style={{
                  display: 'flex',
                  fontSize: 20,
                  color: '#cbc5ba',
                  border: '1px solid #2a2723',
                  borderRadius: 999,
                  padding: '8px 18px',
                  background: '#141311',
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — phone still with a live-style caption */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', flex: 1 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: 300,
              height: 534,
              borderRadius: 44,
              border: '2px solid #2a2723',
              background: 'linear-gradient(160deg, #1c1a17 0%, #0e0d0c 100%)',
              boxShadow: '0 40px 90px -30px rgba(224,67,31,0.45)',
              padding: 22,
            }}
          >
            {/* top chrome — REC + timecode */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', width: 12, height: 12, borderRadius: 999, background: '#e0431f' }} />
                <span style={{ display: 'flex', fontSize: 16, fontWeight: 700, color: '#f7f5f0', letterSpacing: 1 }}>REC</span>
              </div>
              <span style={{ display: 'flex', fontSize: 16, color: '#948d80', fontFamily: 'monospace' }}>0:07</span>
            </div>

            {/* caption block near lower third */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 26 }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  fontSize: 40,
                  fontWeight: 800,
                  letterSpacing: -0.5,
                  textTransform: 'uppercase',
                  color: '#f7f5f0',
                  textAlign: 'center',
                  lineHeight: 1.05,
                }}
              >
                <span>This&nbsp;</span>
                <span style={{ color: '#facc15' }}>changed&nbsp;</span>
                <span style={{ color: '#34d399' }}>everything</span>
              </div>
              {/* style label chip */}
              <div
                style={{
                  display: 'flex',
                  marginTop: 18,
                  fontSize: 14,
                  letterSpacing: 2,
                  color: '#948d80',
                  border: '1px solid #2a2723',
                  borderRadius: 999,
                  padding: '5px 14px',
                }}
              >
                HORMOZI
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
