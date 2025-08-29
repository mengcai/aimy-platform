import './globals.css'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AIMYA - AI-Powered Investment Platform',
  description: 'Transform your real-world assets into digital investments with AI-driven insights and blockchain technology.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
