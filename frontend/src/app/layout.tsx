import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'SoulConnect - Find Your Perfect Life Partner',
  description: 'India\'s most trusted matrimonial platform for finding your perfect life partner. Safe, elegant, and marriage-oriented matchmaking.',
  keywords: 'matrimony, marriage, matchmaking, Indian matrimonial, wedding, life partner',
  openGraph: {
    title: 'SoulConnect - Find Your Perfect Life Partner',
    description: 'India\'s most trusted matrimonial platform',
    type: 'website',
    locale: 'en_IN',
    siteName: 'SoulConnect',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-neutral-50 font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#363636',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            },
            success: {
              iconTheme: {
                primary: '#cd3c61',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
