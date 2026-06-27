import Link from "next/link"
import type { ReactNode } from "react"
import { getTranslations, getFormatter } from "next-intl/server"
import { getDashboardStats } from "@/lib/backend"
import { Card } from "@/components/ui/card"
import { CountryDonut } from "@/components/dashboard/country-donut"

// Icônes KPI (SVG inline, stroke courant — pas de dépendance).
const ICONS: Record<string, ReactNode> = {
  lots: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  alerts: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
  perime: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m4.9 4.9 14.2 14.2" />
    </svg>
  ),
  countries: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  ),
}

// Tableau de bord : KPIs + tendances réelles (30 j) + répartition pays (donut)
// + dernières alertes. Calculs dans getDashboardStats (filtrés par rôle).
export default async function DashboardPage() {
  const t = await getTranslations()
  const format = await getFormatter()
  const stats = await getDashboardStats()

  const kpis = [
    { key: "lots", label: t("dashboard.kpiLots"), value: stats.totalLots, trend: stats.lotsAdded30, gradient: "from-coffee-500 to-coffee-700", iconClass: "bg-coffee-100 text-coffee-700 dark:bg-coffee-900/40 dark:text-coffee-300" },
    { key: "alerts", label: t("dashboard.kpiActiveAlerts"), value: stats.activeAlerts, trend: stats.alertsAdded30, gradient: "from-amber-500 to-orange-600", iconClass: "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400" },
    { key: "perime", label: t("dashboard.kpiPerime"), value: stats.perime, trend: stats.perimeRecent, gradient: "from-red-500 to-rose-600", iconClass: "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400" },
    { key: "countries", label: t("dashboard.kpiCountries"), value: stats.countries, trend: null, gradient: "from-emerald-500 to-teal-600", iconClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
  ]

  const donutData = stats.countryCounts.map((c) => ({
    country: c.country,
    label: t(`countries.${c.country}`),
    count: c.count,
  }))

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("nav.dashboard")}</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">{t("dashboard.subtitle")}</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.key}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-stone-500 dark:text-stone-400">{k.label}</div>
                <div className={`mt-1 bg-gradient-to-r bg-clip-text text-3xl font-semibold text-transparent ${k.gradient}`}>
                  {k.value}
                </div>
                {k.trend !== null && (
                  <div className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    +{k.trend} {t("dashboard.thisMonth")}
                  </div>
                )}
              </div>
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${k.iconClass}`}>
                {ICONS[k.key]}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Donut + dernières alertes — remplit la hauteur restante */}
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <Card className="flex h-full flex-col">
          <h2 className="mb-4 text-sm font-semibold">{t("dashboard.distribution")}</h2>
          <div className="flex flex-1 items-center justify-center">
            <CountryDonut data={donutData} totalLabel={t("dashboard.total")} />
          </div>
        </Card>

        <Card className="flex h-full flex-col">
          <h2 className="mb-3 text-sm font-semibold">{t("dashboard.recentAlerts")}</h2>
          <ul className="flex-1 space-y-3">
            {stats.recentAlerts.map((a) => (
              <li key={a.id} className="flex items-start gap-3 text-sm">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    a.type === "PEREMPTION" ? "bg-red-500" : "bg-amber-500"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/lots/${a.lotId}`} className="font-medium hover:underline">
                      {a.lot?.reference ?? "—"}
                    </Link>
                    <span className="shrink-0 text-xs text-stone-400">
                      {format.relativeTime(new Date(a.createdAt))}
                    </span>
                  </div>
                  <div className="truncate text-stone-500 dark:text-stone-400">
                    {t(`alertType.${a.type}`)}
                    {a.lot?.warehouse?.name ? ` · ${a.lot.warehouse.name}` : ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/alerts"
            className="mt-4 block rounded-lg border border-coffee-200 px-4 py-2 text-center text-sm font-medium text-coffee-700 transition-colors hover:bg-coffee-50 dark:border-coffee-800 dark:text-coffee-300 dark:hover:bg-coffee-900/30"
          >
            {t("dashboard.viewAllAlerts")}
          </Link>
        </Card>
      </div>
    </div>
  )
}
