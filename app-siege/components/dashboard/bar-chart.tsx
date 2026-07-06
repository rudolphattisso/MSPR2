"use client"

import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  type ChartOptions,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const TICK = "rgba(148, 163, 184, 1)"
const GRID = "rgba(148, 163, 184, 0.18)"

// Diagramme en barres générique (statuts des lots, alertes par jour, …).
// `colors` : une couleur par barre, ou une seule couleur pour toutes.
export function BarChart({
  labels,
  values,
  colors,
  height = "h-64",
}: {
  labels: string[]
  values: number[]
  colors: string | string[]
  height?: string
}) {
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: TICK, maxRotation: 0, autoSkip: true } },
      y: { beginAtZero: true, grid: { color: GRID }, ticks: { color: TICK, precision: 0 } },
    },
  }

  return (
    <div className={height}>
      <Bar
        options={options}
        data={{
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: colors,
              borderRadius: 6,
              maxBarThickness: 48,
            },
          ],
        }}
      />
    </div>
  )
}
