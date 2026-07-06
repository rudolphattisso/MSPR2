"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useTranslations, useFormatter } from "next-intl"
import { StatusBadge } from "@/components/ui/status-badge"
import { Pagination, useFillRows } from "@/components/ui/pagination"
import type { LotStatus } from "@/types/domain"

export type LotRow = {
  id: string
  reference: string
  warehouseName: string
  countryId: string | null
  storedAt: string
  status: LotStatus
}

const DAY = 86_400_000
const STATUSES: LotStatus[] = ["CONFORME", "EN_ALERTE", "PERIME"]

// Tableau des lots (déjà triés FIFO + filtrés par rôle côté serveur).
// Recherche, filtre par statut et pagination (nombre de lignes adapté à la
// hauteur pour remplir le tableau) — tout côté client.
export function LotsTable({ lots }: { lots: LotRow[] }) {
  const t = useTranslations("lots")
  const tStatus = useTranslations("status")
  const tCountries = useTranslations("countries")
  const format = useFormatter()

  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<LotStatus | "ALL">("ALL")
  const [page, setPage] = useState(1)
  const { rows: perPage, ref: cardRef } = useFillRows()

  // Toute modification de filtre ramène à la première page.
  useEffect(() => setPage(1), [query, status])

  const ageDays = (storedAt: string) =>
    Math.max(0, Math.floor((Date.now() - new Date(storedAt).getTime()) / DAY))

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return lots.filter(
      (l) =>
        (status === "ALL" || l.status === status) &&
        (!q || l.reference.toLowerCase().includes(q)),
    )
  }, [lots, query, status])

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage))
  const current = Math.min(page, pageCount)
  const pageItems = filtered.slice((current - 1) * perPage, current * perPage)

  const filterBtn = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "bg-amber-700 text-white"
        : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-slate-800"
    }`

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search")}
            className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap gap-1">
          <button type="button" onClick={() => setStatus("ALL")} className={filterBtn(status === "ALL")}>
            {t("statusAll")}
          </button>
          {STATUSES.map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)} className={filterBtn(status === s)}>
              {tStatus(s)}
            </button>
          ))}
        </div>

        <span className="ml-auto text-sm text-stone-500 dark:text-stone-400">
          {t("count", { count: filtered.length })}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500 dark:border-slate-700 dark:text-stone-400">
          {query.trim() || status !== "ALL" ? t("noResults") : t("empty")}
        </div>
      ) : (
        <div ref={cardRef} className="flex-1 overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="hidden grid-cols-[2fr_2fr_1.5fr_1fr_auto] gap-4 bg-stone-100 px-4 py-2 text-xs font-medium uppercase tracking-wide text-stone-500 dark:bg-slate-800 dark:text-stone-400 sm:grid">
            <span>{t("colReference")}</span>
            <span>{t("colWarehouse")}</span>
            <span>{t("colStoredAt")}</span>
            <span>{t("colAge")}</span>
            <span>{t("colStatus")}</span>
          </div>

          {pageItems.map((lot) => (
            <Link
              key={lot.id}
              href={`/lots/${lot.id}`}
              className="grid grid-cols-1 gap-1 border-t border-stone-200 px-4 py-3 text-sm transition-colors first:border-t-0 hover:bg-stone-50 dark:border-slate-800 dark:hover:bg-slate-800/50 sm:grid-cols-[2fr_2fr_1.5fr_1fr_auto] sm:items-center sm:gap-4 sm:first:border-t"
            >
              <span className="font-medium">{lot.reference}</span>
              <span className="text-stone-600 dark:text-stone-300">
                {lot.warehouseName}
                {lot.countryId ? ` · ${tCountries(lot.countryId)}` : ""}
              </span>
              <span className="text-stone-600 dark:text-stone-300">
                {format.dateTime(new Date(lot.storedAt), { dateStyle: "medium" })}
              </span>
              <span className="text-stone-600 dark:text-stone-300">
                {t("ageDays", { count: ageDays(lot.storedAt) })}
              </span>
              <span>
                <StatusBadge status={lot.status} />
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-stone-400">{t("fifoLabel")}</p>
        <Pagination
          current={current}
          pageCount={pageCount}
          onChange={setPage}
          prevLabel={t("prevPage")}
          nextLabel={t("nextPage")}
        />
      </div>
    </div>
  )
}
