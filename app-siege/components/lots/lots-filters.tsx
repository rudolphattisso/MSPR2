"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

const COUNTRIES = ["BR", "EC", "CO"] as const

type WarehouseOption = { id: string; name: string }

// Filtres pays / entrepôt : pilotent l'URL (?country=&warehouse=) → la page
// (server component) refait la requête filtrée. Le select pays est masqué pour
// un MANAGER_PAYS (verrouillé sur son pays).
export function LotsFilters({
  warehouses,
  lockedCountry,
  selectedCountry,
  selectedWarehouse,
}: {
  warehouses: WarehouseOption[]
  lockedCountry: string | null
  selectedCountry: string
  selectedWarehouse: string
}) {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function update(key: "country" | "warehouse", value: string) {
    const sp = new URLSearchParams(params.toString())
    if (value) sp.set(key, value)
    else sp.delete(key)
    // Changer de pays réinitialise l'entrepôt (sinon sélection incohérente).
    if (key === "country") sp.delete("warehouse")
    router.push(`${pathname}?${sp.toString()}`)
  }

  const selectClass =
    "rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-amber-600 dark:border-slate-700 dark:bg-slate-900 dark:focus:border-amber-500"

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!lockedCountry && (
        <label className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
          {t("lots.filterCountry")}
          <select
            value={selectedCountry}
            onChange={(e) => update("country", e.target.value)}
            className={selectClass}
          >
            <option value="">{t("lots.allCountries")}</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {t(`countries.${c}`)}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
        {t("lots.filterWarehouse")}
        <select
          value={selectedWarehouse}
          onChange={(e) => update("warehouse", e.target.value)}
          className={selectClass}
        >
          <option value="">{t("lots.allWarehouses")}</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
