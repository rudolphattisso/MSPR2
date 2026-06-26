import Link from "next/link"
import { getTranslations, getFormatter } from "next-intl/server"
import { getAlerts, getScope } from "@/lib/backend"
import { AlertsFilter } from "@/components/alerts/alerts-filter"

// Écran Alertes (CDC) : liste filtrable par pays, type + message + lot + date +
// état (active/résolue). Données via l'agrégateur (filtré par rôle).
export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>
}) {
  const { country: reqCountry } = await searchParams
  const t = await getTranslations()
  const format = await getFormatter()
  const { role, country: userCountry } = await getScope()

  const alerts = await getAlerts(reqCountry)
  // Les plus récentes d'abord.
  alerts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const lockedCountry = role === "MANAGER_PAYS" ? userCountry : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("nav.alerts")}
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {t("alertsList.subtitle")}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <AlertsFilter
          lockedCountry={lockedCountry}
          selectedCountry={reqCountry ?? ""}
        />
        <span className="text-sm text-stone-500 dark:text-stone-400">
          {t("alertsList.count", { count: alerts.length })}
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500 dark:border-slate-700 dark:text-stone-400">
          {t("alertsList.empty")}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="hidden grid-cols-[1.2fr_1fr_2fr_1.2fr_auto] gap-4 bg-stone-100 px-4 py-2 text-xs font-medium uppercase tracking-wide text-stone-500 dark:bg-slate-800 dark:text-stone-400 lg:grid">
            <span>{t("alertsList.colType")}</span>
            <span>{t("alertsList.colLot")}</span>
            <span>{t("alertsList.colMessage")}</span>
            <span>{t("alertsList.colDate")}</span>
            <span>{t("alertsList.colStatus")}</span>
          </div>

          {alerts.map((a) => (
            <div
              key={a.id}
              className="grid grid-cols-1 gap-1 border-t border-stone-200 px-4 py-3 text-sm first:border-t-0 dark:border-slate-800 lg:grid-cols-[1.2fr_1fr_2fr_1.2fr_auto] lg:items-center lg:gap-4 lg:first:border-t"
            >
              <span className="font-medium text-amber-700 dark:text-amber-500">
                {t(`alertType.${a.type}`)}
              </span>
              <span>
                {a.lot ? (
                  <Link
                    href={`/lots/${a.lotId}`}
                    className="text-stone-700 underline-offset-2 hover:underline dark:text-stone-200"
                  >
                    {a.lot.reference}
                  </Link>
                ) : (
                  "—"
                )}
              </span>
              <span className="text-stone-600 dark:text-stone-300">
                {a.message}
              </span>
              <span className="text-stone-500 dark:text-stone-400">
                {format.dateTime(new Date(a.createdAt), {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
              <span>
                {a.isResolved ? (
                  <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 dark:bg-slate-800 dark:text-stone-300">
                    {t("alertsList.resolved")}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300">
                    {t("alertsList.active")}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
