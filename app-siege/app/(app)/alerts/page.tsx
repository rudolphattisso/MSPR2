import { getTranslations } from "next-intl/server"
import { getAlerts, getScope } from "@/lib/backend"
import { AlertsFilter } from "@/components/alerts/alerts-filter"
import { AlertsTable } from "@/components/alerts/alerts-table"

// Écran Alertes (CDC) : liste filtrable par pays, type + message + lot + date +
// état (active/résolue). Données via l'agrégateur (filtré par rôle).
export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>
}) {
  const { country: reqCountry } = await searchParams
  const t = await getTranslations()
  const { role, country: userCountry } = await getScope()

  const alerts = await getAlerts(reqCountry)
  // Les plus récentes d'abord.
  alerts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const lockedCountry = role === "MANAGER_PAYS" ? userCountry : null

  return (
    <div className="flex flex-1 flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("nav.alerts")}
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {t("alertsList.subtitle")}
        </p>
      </div>

      <AlertsFilter
        lockedCountry={lockedCountry}
        selectedCountry={reqCountry ?? ""}
      />

      <AlertsTable
        alerts={alerts.map((a) => ({
          id: a.id,
          type: a.type,
          lotId: a.lotId,
          lotReference: a.lot?.reference ?? null,
          message: a.message,
          createdAt: a.createdAt,
          isResolved: a.isResolved,
        }))}
      />
    </div>
  )
}
