"use client"

import { useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { setLocale } from "@/lib/locale-actions"
import { LOCALES, type Locale } from "@/i18n/config"

// Sélecteur de langue : mémorise le choix (cookie) puis rafraîchit la page.
export function LanguageSwitcher() {
  const locale = useLocale()
  const t = useTranslations("lang")
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <select
      aria-label={t("label")}
      value={locale}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as Locale
        startTransition(async () => {
          await setLocale(next)
          router.refresh()
        })
      }}
      className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm text-stone-700 outline-none focus:border-amber-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-stone-200"
    >
      {LOCALES.map((l) => (
        <option key={l} value={l}>
          {t(l)}
        </option>
      ))}
    </select>
  )
}
