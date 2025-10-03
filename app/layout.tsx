/**
 * Amaç: Uygulamanın kök layout'u. Global stilleri, fontu uygular.
 */
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { HiddenSafelist } from "@/components/HiddenSafelist"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Builder - No-Code Revolution",
  description: "Yapay zeka destekli no-code platform ile hayallerinizdeki uygulamaları dakikalar içinde oluşturun.",
  icons: {
    icon: '/technology.png',     
    shortcut: '/technology.png',  
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
        <HiddenSafelist />
        {children}
      </body>
    </html>
  )
}
