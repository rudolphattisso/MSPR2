import { getTranslations } from "next-intl/server"
import { getLots, getWarehouses, getScope } from "@/lib/backend"
import { LotsFilters } from "@/components/lots/lots-filters"
import { LotsTable } from "@/components/lots/lots-table"

// Écran Liste des lots (CDC) : sélection pays/entrepôt, tri FIFO, statuts,
// lignes cliquables vers le détail. Données via l'agrégateur (filtré par rôle).
export default async function LotsPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; warehouse?: string }>
}) {
  const { country: reqCountry, warehouse: reqWarehouse } = await searchParams
  const t = await getTranslations()
  const { role, country: userCountry } = await getScope()

  const [warehouses, lots] = await Promise.all([
    getWarehouses(reqCountry),
    getLots({ country: reqCountry, warehouse: reqWarehouse }),
  ])

  const lockedCountry = role === "MANAGER_PAYS" ? userCountry : null

  return (
    <div className="flex flex-1 flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("nav.lots")}</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {t("lots.subtitle")}
        </p>
      </div>

      <LotsFilters
        warehouses={warehouses.map((w) => ({ id: w.id, name: w.name }))}
        lockedCountry={lockedCountry}
        selectedCountry={reqCountry ?? ""}
        selectedWarehouse={reqWarehouse ?? ""}
      />

      <LotsTable
        lots={lots.map((lot) => ({
          id: lot.id,
          reference: lot.reference,
          warehouseName: lot.warehouse?.name ?? "—",
          countryId: lot.warehouse?.countryId ?? null,
          storedAt: lot.storedAt,
          status: lot.status,
        }))}
      />
    </div>
  )
}
