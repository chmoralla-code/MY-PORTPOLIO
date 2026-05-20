import type { Metadata, Viewport } from 'next';
import { Space_Mono } from 'next/font/google';
import './globals.css';

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'CYRHIEL MORALLA | Architectural Portfolio & Automation Systems',
  description: 'Minimalist, avant-garde architectural and automation systems portfolio of Cyrhiel Moralla. High-performance layouts inspired by aboutluca.com.',
  keywords: ['Cyrhiel Moralla', 'Portfolio', 'Architectural Automation', 'Full-Stack Developer', 'WebGL', 'Three.js'],
  authors: [{ name: 'Cyrhiel Moralla' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#030303] text-white font-mono">
        {children}
      </body>
    </html>
  );
}
