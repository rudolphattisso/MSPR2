import Link from "next/link"
import { getTranslations, getFormatter } from "next-intl/server"
import { getDashboardStats } from "@/lib/backend"
import { Card } from "@/components/ui/card"
import { CountryDonut } from "@/components/dashboard/country-donut"

// Tableau de bord : KPIs + tendances réelles (30 j) + répartition pays (donut)
// + dernières alertes. Calculs dans getDashboardStats (filtrés par rôle).
export default async function DashboardPage() {
  const t = await getTranslations()
  const format = await getFormatter()
  const stats = await getDashboardStats()

  const kpis = [
    { icon: "📦", label: t("dashboard.kpiLots"), value: stats.totalLots, trend: stats.lotsAdded30, accent: "" },
    { icon: "⚠️", label: t("dashboard.kpiActiveAlerts"), value: stats.activeAlerts, trend: stats.alertsAdded30, accent: "text-amber-700 dark:text-amber-500" },
    { icon: "⛔", label: t("dashboard.kpiPerime"), value: stats.perime, trend: stats.perimeRecent, accent: "text-red-700 dark:text-red-400" },
    { icon: "🌍", label: t("dashboard.kpiCountries"), value: stats.countries, trend: null, accent: "" },
  ]

  const donutData = stats.countryCounts.map((c) => ({
    country: c.country,
    label: t(`countries.${c.country}`),
    count: c.count,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("nav.dashboard")}</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">{t("dashboard.subtitle")}</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-stone-500 dark:text-stone-400">{k.label}</div>
                <div className={`mt-1 text-3xl font-semibold ${k.accent}`}>{k.value}</div>
                {k.trend !== null && (
                  <div className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    +{k.trend} {t("dashboard.thisMonth")}
                  </div>
                )}
              </div>
              <span className="text-2xl">{k.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Donut + dernières alertes */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold">{t("dashboard.distribution")}</h2>
          <CountryDonut data={donutData} totalLabel={t("dashboard.total")} />
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">{t("dashboard.recentAlerts")}</h2>
            <Link href="/alerts" className="text-xs font-medium text-amber-700 hover:underline dark:text-amber-500">
              {t("dashboard.viewAllAlerts")} →
            </Link>
          </div>
          <ul className="space-y-3">
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
        </Card>
      </div>
    </div>
  )
}
