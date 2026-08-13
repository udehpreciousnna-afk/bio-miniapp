import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BIO Mining',
  description: 'Mine BIO, complete tasks, refer friends.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body>{children}</body>
    </html>
  )
}
