import type { Metadata } from 'next'
import { Geist, Geist_Mono, Bricolage_Grotesque, Bangers, Anton, Fredoka, Montserrat, Roboto, Caveat } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from '@/components/providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Display face for headlines — a characterful grotesque, readable at every
// size. Body/labels/numbers stay Geist; caption fonts (Anton etc) stay product-only.
const bricolage = Bricolage_Grotesque({
  variable: '--font-display',
  weight: ['600', '700', '800'],
  subsets: ['latin'],
})

// Caption-style preview fonts — loaded so the style picker can render
// accurate live-look previews instead of falling back to system fonts.
const bangers = Bangers({ variable: '--font-bangers', weight: '400', subsets: ['latin'] })
const anton = Anton({ variable: '--font-anton', weight: '400', subsets: ['latin'] })
const fredoka = Fredoka({ variable: '--font-fredoka', weight: '700', subsets: ['latin'] })
const montserrat = Montserrat({ variable: '--font-montserrat', weight: '900', subsets: ['latin'] })
const roboto = Roboto({ variable: '--font-roboto', weight: '700', subsets: ['latin'] })
const caveat = Caveat({ variable: '--font-caveat', weight: '700', subsets: ['latin'] })

const PREVIEW_FONT_VARS = [bangers, anton, fredoka, montserrat, roboto, caveat]
  .map((f) => f.variable)
  .join(' ')

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'Instacap — Word-by-word animated captions',
  description: 'Upload your video, get beautiful animated captions powered by Remotion.',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Instacap — Word-by-word animated captions',
    description: 'Upload your video, get beautiful animated captions powered by Remotion.',
    url: appUrl,
    siteName: 'Instacap',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instacap — Word-by-word animated captions',
    description: 'Upload your video, get beautiful animated captions powered by Remotion.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${PREVIEW_FONT_VARS} h-full antialiased dark scroll-smooth`}>
        <body className="min-h-full flex flex-col">
            <Providers>{children}</Providers>
          </body>
      </html>
    </ClerkProvider>
  )
}
