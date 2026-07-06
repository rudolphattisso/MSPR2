"use client"

import { useState, type ReactNode } from "react"

type Tab = { key: string; label: string; content: ReactNode }

// Onglets du tableau de bord. Seul l'onglet actif est monté (les graphiques
// Chart.js se dimensionnent correctement à l'affichage, pas en display:none).
export function DashboardTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.key)
  const current = tabs.find((t) => t.key === active) ?? tabs[0]

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex gap-1 border-b border-stone-200 dark:border-slate-800">
        {tabs.map((t) => {
          const isActive = t.key === active
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              aria-current={isActive ? "page" : undefined}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-amber-700 text-amber-700 dark:border-amber-500 dark:text-amber-500"
                  : "border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="min-h-0 flex-1">{current?.content}</div>
    </div>
  )
}
