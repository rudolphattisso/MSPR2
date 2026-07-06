"use client"

import { useCallback, useRef, useState } from "react"

// Calcule dynamiquement le nombre de lignes qui remplissent la hauteur du
// conteneur mesuré (via le `ref` à poser sur la carte du tableau).
export function useFillRows(rowHeight = 45, headerHeight = 33, fallback = 12) {
  const [rows, setRows] = useState(fallback)
  const observerRef = useRef<ResizeObserver | null>(null)

  const ref = useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect()
      if (!node) return
      const compute = () =>
        setRows(
          Math.max(5, Math.floor((node.clientHeight - headerHeight) / rowHeight)),
        )
      compute()
      const ro = new ResizeObserver(compute)
      ro.observe(node)
      observerRef.current = ro
    },
    [rowHeight, headerHeight],
  )

  return { rows, ref }
}

// Construit la liste de pages avec ellipses : 1 … 4 5 6 … 16
// (au-delà de 5 pages, on « fenêtre » autour de la page courante).
function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | "…")[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push("…")
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push("…")
  pages.push(total)
  return pages
}

// Contrôles de pagination réutilisables (‹ 1 2 … n ›).
export function Pagination({
  current,
  pageCount,
  onChange,
  prevLabel,
  nextLabel,
}: {
  current: number
  pageCount: number
  onChange: (page: number) => void
  prevLabel: string
  nextLabel: string
}) {
  if (pageCount <= 1) return null

  return (
    <nav className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        aria-label={prevLabel}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-stone-300 dark:hover:bg-slate-800"
      >
        ‹
      </button>
      {pageList(current, pageCount).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-sm text-stone-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === current ? "page" : undefined}
            className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-colors ${
              p === current
                ? "border-amber-700 bg-amber-700 text-white"
                : "border-stone-300 text-stone-600 hover:bg-stone-100 dark:border-slate-700 dark:text-stone-300 dark:hover:bg-slate-800"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(current + 1)}
        disabled={current === pageCount}
        aria-label={nextLabel}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-stone-300 dark:hover:bg-slate-800"
      >
        ›
      </button>
    </nav>
  )
}
