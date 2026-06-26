import Link from "next/link"
import { getTranslations, getFormatter } from "next-intl/server"
import { getLotDetail, getMeasurements, getLotAlerts } from "@/lib/backend"
import { StatusBadge } from "@/components/ui/status-badge"
import { MeasurementsChart } from "@/components/lots/measurements-chart"

// Écran Détail d'un lot (CDC) : infos + courbes temp/humidité (Chart.js) avec
// zone idéale du pays + alertes du lot.
export default async function LotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const t = await getTranslations()
  const format = await getFormatter()

  const lot = await getLotDetail(id)

  if (!lot) {
    return (
      <div className="space-y-4">
        <Link
          href="/lots"
          className="text-sm text-amber-700 hover:underline dark:text-amber-500"
        >
          ← {t("lotDetail.back")}
        </Link>
        <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500 dark:border-slate-700 dark:text-stone-400">
          {t("lotDetail.notFound")}
        </div>
      </div>
    )
  }

  const [measurements, alerts] = await Promise.all([
    getMeasurements(id),
    getLotAlerts(id),
  ])

  const country = lot.warehouse?.country
  const labels = measurements.map((m) =>
    format.dateTime(new Date(m.recordedAt), {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  )

  return (
    <div className="space-y-6">
      <Link
        href="/lots"
        className="text-sm text-amber-700 hover:underline dark:text-amber-500"
      >
        ← {t("lotDetail.back")}
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {lot.reference}
        </h1>
        <StatusBadge status={lot.status} />
      </div>

      <dl className="grid gap-4 rounded-xl border border-stone-200 bg-white p-5 text-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
        <div>
          <dt className="text-stone-500 dark:text-stone-400">
            {t("lotDetail.warehouse")}
          </dt>
          <dd className="mt-0.5 font-medium">{lot.warehouse?.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-stone-500 dark:text-stone-400">
            {t("lotDetail.country")}
          </dt>
          <dd className="mt-0.5 font-medium">
            {lot.warehouse?.countryId
              ? t(`countries.${lot.warehouse.countryId}`)
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-stone-500 dark:text-stone-400">
            {t("lotDetail.storedAt")}
          </dt>
          <dd className="mt-0.5 font-medium">
            {format.dateTime(new Date(lot.storedAt), { dateStyle: "medium" })}
          </dd>
        </div>
      </dl>

      {measurements.length === 0 || !country ? (
        <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500 dark:border-slate-700 dark:text-stone-400">
          {t("lotDetail.noMeasurements")}
        </div>
      ) : (
        <MeasurementsChart
          labels={labels}
          temps={measurements.map((m) => m.temperature)}
          hums={measurements.map((m) => m.humidity)}
          thresholds={{
            idealTemp: country.idealTemp,
            tempTolerance: country.tempTolerance,
            idealHumidity: country.idealHumidity,
            humidityTolerance: country.humidityTolerance,
          }}
          i18n={{
            temperature: t("lotDetail.temperature"),
            humidity: t("lotDetail.humidity"),
            measured: t("lotDetail.measured"),
            idealZone: t("lotDetail.idealZone"),
          }}
        />
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("lotDetail.alertsTitle")}</h2>
        {alerts.length === 0 ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {t("lotDetail.noAlerts")}
          </p>
        ) : (
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="flex items-center gap-2">
                  <span className="font-medium text-amber-700 dark:text-amber-500">
                    {t(`alertType.${a.type}`)}
                  </span>
                  <span className="text-stone-600 dark:text-stone-300">
                    {a.message}
                  </span>
                </span>
                <span className="text-xs text-stone-400">
                  {format.dateTime(new Date(a.createdAt), {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
