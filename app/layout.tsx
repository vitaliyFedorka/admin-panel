import type { Metadata } from 'next'
import './globals.css'
import { ThemeScript } from './theme-script'

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
    <html lang="en" suppressHydrationWarning>
      <head>
          <title>Admin Panel</title>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  )
}

