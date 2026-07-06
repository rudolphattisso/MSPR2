"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const TICK = "rgba(148, 163, 184, 1)"
const GRID = "rgba(148, 163, 184, 0.18)"

// Courbe globale des conditions de stockage : température (°C) + humidité (%)
// moyennes par jour, double axe Y. Alimentée par l'agrégateur siège.
export function ConditionsChart({
  labels,
  temps,
  hums,
  i18n,
  height = "h-72",
}: {
  labels: string[]
  temps: number[]
  hums: number[]
  i18n: { temperature: string; humidity: string }
  height?: string
}) {
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: { legend: { labels: { color: TICK } } },
    scales: {
      x: { grid: { color: GRID }, ticks: { color: TICK, maxRotation: 0, autoSkip: true } },
      y: {
        type: "linear",
        position: "left",
        grid: { color: GRID },
        ticks: { color: "#ea580c" },
        title: { display: true, text: i18n.temperature, color: "#ea580c" },
      },
      y1: {
        type: "linear",
        position: "right",
        grid: { drawOnChartArea: false },
        ticks: { color: "#0284c7" },
        title: { display: true, text: i18n.humidity, color: "#0284c7" },
      },
    },
  }

  return (
    <div className={height}>
      <Line
        options={options}
        data={{
          labels,
          datasets: [
            {
              label: i18n.temperature,
              data: temps,
              borderColor: "#ea580c",
              backgroundColor: "#ea580c",
              pointRadius: 0,
              tension: 0.3,
              yAxisID: "y",
            },
            {
              label: i18n.humidity,
              data: hums,
              borderColor: "#0284c7",
              backgroundColor: "#0284c7",
              pointRadius: 0,
              tension: 0.3,
              yAxisID: "y1",
            },
          ],
        }}
      />
    </div>
  )
}
