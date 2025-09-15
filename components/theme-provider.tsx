'use client'

/**
 * Amaç: next-themes tabanlı tema sağlayıcısını proje genelinde sarmalamak.
 * Kullanım: app/layout.tsx veya ilgili üst bileşenlerde bu provider ile çocukları sarmalayın.
 */
import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
