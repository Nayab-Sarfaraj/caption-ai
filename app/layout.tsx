import type { Metadata } from 'next'
import { Geist, Geist_Mono, Bricolage_Grotesque, Bangers, Anton, Fredoka, Montserrat, Roboto, Caveat } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { clerkAppearance } from '@/src/lib/clerk-appearance'
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
  title: 'Instacap — AI Video Caption Generator & Subtitles',
  description:
    'Generate word-by-word animated captions for Instagram Reels, TikTok, and YouTube Shorts in seconds. Powered by fast AI transcription with zero credit limits.',
  keywords: [
    'video caption generator',
    'ai subtitle generator',
    'animated captions reels',
    'tiktok captions maker',
    'word by word captions',
    'hormozi subtitles generator',
    'auto captions online free',
    'youtube shorts subtitles',
  ],
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Instacap — AI Video Caption Generator & Subtitles',
    description:
      'Generate word-by-word animated captions for Instagram Reels, TikTok, and YouTube Shorts in seconds. Powered by fast AI transcription with zero credit limits.',
    url: appUrl,
    siteName: 'Instacap',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instacap — AI Video Caption Generator & Subtitles',
    description:
      'Generate word-by-word animated captions for Instagram Reels, TikTok, and YouTube Shorts in seconds.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${PREVIEW_FONT_VARS} h-full antialiased dark scroll-smooth`}>
        <body className="min-h-full flex flex-col">
            <Providers>{children}</Providers>
          </body>
      </html>
    </ClerkProvider>
  )
}
