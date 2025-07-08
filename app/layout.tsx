import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata: Metadata = {
  title: "Elena Rodriguez Photography | Capturing Moments That Last Forever",
  description:
    "Professional photographer specializing in weddings, portraits, and events. Browse our stunning gallery of captured moments.",
  keywords: "photographer, wedding photography, portrait photography, event photography, professional photos",
  authors: [{ name: "Elena Rodriguez" }],
  openGraph: {
    title: "Elena Rodriguez Photography",
    description: "Capturing Moments That Last Forever",
    type: "website",
    images: ["/hero-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elena Rodriguez Photography",
    description: "Capturing Moments That Last Forever",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
