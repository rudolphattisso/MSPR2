"use client"

import { ThemeProvider } from "next-themes"

// Fournit le mode clair/sombre (classe .dark sur <html>, mémorisé).
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
