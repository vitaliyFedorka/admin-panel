import type { Metadata } from 'next'
import { Fira_Code, Fira_Sans } from 'next/font/google'
import './globals.css'
import { ThemeScript } from './theme-script'

const firaSans = Fira_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Admin panel for managing users and entities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${firaSans.variable} ${firaCode.variable}`}>
      <head>
          <title>Admin Panel</title>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  )
}
