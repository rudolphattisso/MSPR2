"use client"

import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js"

ChartJS.register(ArcElement, Tooltip)

// Couleur par pays (cohérente avec une éventuelle carte).
const COLORS: Record<string, string> = {
  BR: "#16a34a",
  EC: "#0ea5e9",
  CO: "#f59e0b",
}

type Slice = { country: string; label: string; count: number }

export function CountryDonut({
  data,
  totalLabel,
}: {
  data: Slice[]
  totalLabel: string
}) {
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8 lg:flex-row lg:gap-12">
      <div className="relative h-72 w-72 shrink-0 sm:h-96 sm:w-96 lg:h-[28rem] lg:w-[28rem]">
        <Doughnut
          data={{
            labels: data.map((d) => d.label),
            datasets: [
              {
                data: data.map((d) => d.count),
                backgroundColor: data.map((d) => COLORS[d.country]),
                borderWidth: 0,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: "70%",
            plugins: { legend: { display: false } },
          }}
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold">{total}</span>
          <span className="text-sm text-stone-500 dark:text-stone-400">
            {totalLabel}
          </span>
        </div>
      </div>

      <ul className="space-y-3 text-base">
        {data.map((d) => (
          <li key={d.country} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[d.country] }}
            />
            <span className="text-stone-600 dark:text-stone-300">{d.label}</span>
            <span className="font-medium">{d.count}</span>
            <span className="text-stone-400">
              ({total ? Math.round((d.count / total) * 100) : 0}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
