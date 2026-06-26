"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

const COUNTRIES = ["BR", "EC", "CO"] as const

// Filtre pays pour les alertes (masqué pour un MANAGER_PAYS, verrouillé).
export function AlertsFilter({
  lockedCountry,
  selectedCountry,
}: {
  lockedCountry: string | null
  selectedCountry: string
}) {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  if (lockedCountry) return null

  function update(value: string) {
    const sp = new URLSearchParams(params.toString())
    if (value) sp.set("country", value)
    else sp.delete("country")
    router.push(`${pathname}?${sp.toString()}`)
  }

  return (
    <label className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
      {t("lots.filterCountry")}
      <select
        value={selectedCountry}
        onChange={(e) => update(e.target.value)}
        className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-amber-600 dark:border-slate-700 dark:bg-slate-900 dark:focus:border-amber-500"
      >
        <option value="">{t("lots.allCountries")}</option>
        {COUNTRIES.map((c) => (
          <option key={c} value={c}>
            {t(`countries.${c}`)}
          </option>
        ))}
      </select>
    </label>
  )
}
