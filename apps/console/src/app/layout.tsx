import './globals.css'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AIMYA Console - Issuer Management Platform',
  description: 'Professional platform for asset tokenization and management',
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
