import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Builder Pro - No-Code Revolution",
  description: "Yapay zeka destekli no-code platform ile hayallerinizdeki uygulamaları dakikalar içinde oluşturun.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      {/* body'ye flex flex-col min-h-screen ekledik */}
      <body className={`${inter.className} flex flex-col min-h-screen`}>{children}</body>
    </html>
  )
}
