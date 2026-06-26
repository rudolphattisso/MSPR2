"use client"

import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"

// Bascule clair/sombre. L'icône est pilotée en CSS via la classe .dark (posée
// par next-themes avant l'hydratation) → pas d'état, pas de mismatch.
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations("theme")

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label={t("toggle")}
      title={t("toggle")}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 text-base hover:bg-stone-100 dark:border-slate-700 dark:hover:bg-slate-800"
    >
      <span className="hidden dark:inline">☀️</span>
      <span className="inline dark:hidden">🌙</span>
    </button>
  )
}
