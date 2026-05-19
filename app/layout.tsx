import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import MenuBackground from '../components/menu-background'

export const metadata: Metadata = {
  title: 'CURA',
  description: 'Aprenda a Cuidar de Ferida CURA',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <MenuBackground />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
