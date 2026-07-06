"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
)

// Couleurs neutres lisibles en clair ET sombre.
const GRID = "rgba(148, 163, 184, 0.18)"
const TICK = "rgba(148, 163, 184, 1)"

const baseOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: "index" },
  plugins: {
    legend: {
      labels: {
        color: TICK,
        filter: (item) => !item.text?.startsWith("__"),
      },
    },
  },
  scales: {
    x: { grid: { color: GRID }, ticks: { color: TICK, maxRotation: 0 } },
    y: { grid: { color: GRID }, ticks: { color: TICK } },
  },
}

function MetricChart({
  labels,
  values,
  ideal,
  tolerance,
  color,
  measuredLabel,
  zoneLabel,
}: {
  labels: string[]
  values: number[]
  ideal: number
  tolerance: number
  color: string
  measuredLabel: string
  zoneLabel: string
}) {
  const upper = labels.map(() => ideal + tolerance)
  const lower = labels.map(() => ideal - tolerance)

  return (
    <div className="h-64">
      <Line
        options={baseOptions}
        data={{
          labels,
          datasets: [
            {
              label: zoneLabel,
              data: upper,
              borderColor: "transparent",
              backgroundColor: "rgba(120, 120, 120, 0.12)",
              pointRadius: 0,
              fill: "+1",
            },
            {
              label: "__lower",
              data: lower,
              borderColor: "transparent",
              backgroundColor: "transparent",
              pointRadius: 0,
              fill: false,
            },
            {
              label: measuredLabel,
              data: values,
              borderColor: color,
              backgroundColor: color,
              pointRadius: 2,
              tension: 0.3,
              fill: false,
            },
          ],
        }}
      />
    </div>
  )
}

export type Thresholds = {
  idealTemp: number
  tempTolerance: number
  idealHumidity: number
  humidityTolerance: number
}

const DAY = 86_400_000
const PERIODS = [7, 30] as const

export function MeasurementsChart({
  labels,
  times,
  temps,
  hums,
  thresholds,
  i18n,
}: {
  labels: string[]
  times: string[]
  temps: number[]
  hums: number[]
  thresholds: Thresholds
  i18n: {
    temperature: string
    humidity: string
    measured: string
    idealZone: string
  }
}) {
  const tLots = useTranslations("lots")
  const [period, setPeriod] = useState<number>(30)

  // Les mesures arrivent triées par date croissante : on garde la fenêtre voulue.
  const start = useMemo(() => {
    const cutoff = Date.now() - period * DAY
    const idx = times.findIndex((ts) => new Date(ts).getTime() >= cutoff)
    return idx === -1 ? times.length : idx
  }, [times, period])

  const view = {
    labels: labels.slice(start),
    temps: temps.slice(start),
    hums: hums.slice(start),
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-stone-300 p-0.5 dark:border-slate-700">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                period === p
                  ? "bg-amber-700 text-white"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-slate-800"
              }`}
            >
              {tLots("ageDays", { count: p })}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-medium">{i18n.temperature}</h3>
          <MetricChart
            labels={view.labels}
            values={view.temps}
            ideal={thresholds.idealTemp}
            tolerance={thresholds.tempTolerance}
            color="#ea580c"
            measuredLabel={i18n.measured}
            zoneLabel={i18n.idealZone}
          />
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-medium">{i18n.humidity}</h3>
          <MetricChart
            labels={view.labels}
            values={view.hums}
            ideal={thresholds.idealHumidity}
            tolerance={thresholds.humidityTolerance}
            color="#0284c7"
            measuredLabel={i18n.measured}
            zoneLabel={i18n.idealZone}
          />
        </div>
      </div>
    </div>
  )
}
