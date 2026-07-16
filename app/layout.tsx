import type { Metadata } from 'next'
import { Geist, Geist_Mono, Courier_Prime, Bangers, Anton, Fredoka, Montserrat, Roboto, Caveat } from 'next/font/google'
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

const courierPrime = Courier_Prime({
  variable: '--font-cc',
  weight: ['400', '700'],
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
  title: 'Hypecap — Word-by-word animated captions',
  description: 'Upload your video, get beautiful animated captions powered by Remotion.',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Hypecap — Word-by-word animated captions',
    description: 'Upload your video, get beautiful animated captions powered by Remotion.',
    url: appUrl,
    siteName: 'Hypecap',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hypecap — Word-by-word animated captions',
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
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${courierPrime.variable} ${PREVIEW_FONT_VARS} h-full antialiased dark scroll-smooth`}>
        <body className="min-h-full flex flex-col">
            <Providers>{children}</Providers>
          </body>
      </html>
    </ClerkProvider>
  )
}
