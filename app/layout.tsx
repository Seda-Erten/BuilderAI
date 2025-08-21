import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { HiddenSafelist } from "@/components/HiddenSafelist"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Builder Pro - No-Code Revolution",
  description: "Yapay zeka destekli no-code platform ile hayallerinizdeki uygulamaları dakikalar içinde oluşturun.",
  generator: 'v0.dev',
  icons: {
    icon: '/technology.png',      // Tarayıcı sekmesindeki küçük logo
    shortcut: '/technology.png',  // Windows / tarayıcı kısayolları için
    apple: '/technology.png',     // iOS cihazlar için
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {/* Ensures Tailwind emits dynamic color utilities (pink/purple etc.) */}
        <HiddenSafelist />
        {children}
      </body>
    </html>
  )
}
