import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Borne Systems — Built for the Real World',
  description:
    'Borne Systems delivers AI automation and cybersecurity solutions engineered for small businesses. Military-grade discipline meets cutting-edge AI.',
  generator: 'Next.js',
  metadataBase: new URL('https://bornesystems.io'),
  openGraph: {
    title: 'Borne Systems',
    description: 'AI automation and cybersecurity engineered for small business.',
    url: 'https://bornesystems.io',
    siteName: 'Borne Systems',
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Funnel Display — modern geometric display font (inspired by Appycamper) */}
        {/* Space Grotesk — UI/body font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&family=Silkscreen:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${spaceGrotesk.variable} antialiased`} style={{ backgroundColor: '#080b10' }}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
