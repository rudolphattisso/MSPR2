import Link from "next/link"
import { getTranslations, getFormatter } from "next-intl/server"
import { getLots, getWarehouses, getScope } from "@/lib/backend"
import { StatusBadge } from "@/components/ui/status-badge"
import { LotsFilters } from "@/components/lots/lots-filters"

// Écran Liste des lots (CDC) : sélection pays/entrepôt, tri FIFO, statuts,
// lignes cliquables vers le détail. Données via l'agrégateur (filtré par rôle).
export default async function LotsPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; warehouse?: string }>
}) {
  const { country: reqCountry, warehouse: reqWarehouse } = await searchParams
  const t = await getTranslations()
  const format = await getFormatter()
  const { role, country: userCountry } = await getScope()

  const [warehouses, lots] = await Promise.all([
    getWarehouses(reqCountry),
    getLots({ country: reqCountry, warehouse: reqWarehouse }),
  ])

  const lockedCountry = role === "MANAGER_PAYS" ? userCountry : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("nav.lots")}</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {t("lots.subtitle")}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <LotsFilters
          warehouses={warehouses.map((w) => ({ id: w.id, name: w.name }))}
          lockedCountry={lockedCountry}
          selectedCountry={reqCountry ?? ""}
          selectedWarehouse={reqWarehouse ?? ""}
        />
        <span className="text-sm text-stone-500 dark:text-stone-400">
          {t("lots.count", { count: lots.length })}
        </span>
      </div>

      {lots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500 dark:border-slate-700 dark:text-stone-400">
          {t("lots.empty")}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="hidden grid-cols-[2fr_2fr_1.5fr_auto] gap-4 bg-stone-100 px-4 py-2 text-xs font-medium uppercase tracking-wide text-stone-500 dark:bg-slate-800 dark:text-stone-400 sm:grid">
            <span>{t("lots.colReference")}</span>
            <span>{t("lots.colWarehouse")}</span>
            <span>{t("lots.colStoredAt")}</span>
            <span>{t("lots.colStatus")}</span>
          </div>

          {lots.map((lot) => (
            <Link
              key={lot.id}
              href={`/lots/${lot.id}`}
              className="grid grid-cols-1 gap-1 border-t border-stone-200 px-4 py-3 text-sm transition-colors first:border-t-0 hover:bg-stone-50 dark:border-slate-800 dark:hover:bg-slate-800/50 sm:grid-cols-[2fr_2fr_1.5fr_auto] sm:items-center sm:gap-4 sm:first:border-t"
            >
              <span className="font-medium">{lot.reference}</span>
              <span className="text-stone-600 dark:text-stone-300">
                {lot.warehouse?.name}
                {lot.warehouse?.countryId
                  ? ` · ${t(`countries.${lot.warehouse.countryId}`)}`
                  : ""}
              </span>
              <span className="text-stone-600 dark:text-stone-300">
                {format.dateTime(new Date(lot.storedAt), { dateStyle: "medium" })}
              </span>
              <span>
                <StatusBadge status={lot.status} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
