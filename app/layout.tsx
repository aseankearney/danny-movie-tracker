import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Danny's Movie Tracker",
  description: 'Track movies that Danny has seen',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

