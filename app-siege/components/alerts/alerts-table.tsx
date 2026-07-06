"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useTranslations, useFormatter } from "next-intl"
import { Pagination, useFillRows } from "@/components/ui/pagination"

type AlertType = "SEUIL_TEMPERATURE" | "SEUIL_HUMIDITE" | "PEREMPTION"
const TYPES: AlertType[] = ["SEUIL_TEMPERATURE", "SEUIL_HUMIDITE", "PEREMPTION"]

export type AlertRow = {
  id: string
  type: AlertType
  lotId: string
  lotReference: string | null
  message: string
  createdAt: string
  isResolved: boolean
}

// Tableau des alertes (déjà triées par date + filtrées par pays/rôle côté serveur).
// Filtre par catégorie + pagination (lignes adaptées à la hauteur) côté client.
export function AlertsTable({ alerts }: { alerts: AlertRow[] }) {
  const t = useTranslations()
  const format = useFormatter()
  const [type, setType] = useState<AlertType | "ALL">("ALL")
  const [page, setPage] = useState(1)
  const { rows: perPage, ref: cardRef } = useFillRows()

  useEffect(() => setPage(1), [type])

  const filtered = useMemo(
    () => (type === "ALL" ? alerts : alerts.filter((a) => a.type === type)),
    [alerts, type],
  )

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
        <div className="flex flex-wrap gap-1">
          <button type="button" onClick={() => setType("ALL")} className={filterBtn(type === "ALL")}>
            {t("lots.statusAll")}
          </button>
          {TYPES.map((ty) => (
            <button key={ty} type="button" onClick={() => setType(ty)} className={filterBtn(type === ty)}>
              {t(`alertType.${ty}`)}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-stone-500 dark:text-stone-400">
          {t("alertsList.count", { count: filtered.length })}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500 dark:border-slate-700 dark:text-stone-400">
          {t("alertsList.empty")}
        </div>
      ) : (
        <div ref={cardRef} className="flex-1 overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="hidden grid-cols-[1.2fr_1fr_2fr_1.2fr_auto] gap-4 bg-stone-100 px-4 py-2 text-xs font-medium uppercase tracking-wide text-stone-500 dark:bg-slate-800 dark:text-stone-400 lg:grid">
            <span>{t("alertsList.colType")}</span>
            <span>{t("alertsList.colLot")}</span>
            <span>{t("alertsList.colMessage")}</span>
            <span>{t("alertsList.colDate")}</span>
            <span>{t("alertsList.colStatus")}</span>
          </div>

          {pageItems.map((a) => (
            <div
              key={a.id}
              className="grid grid-cols-1 gap-1 border-t border-stone-200 px-4 py-3 text-sm first:border-t-0 dark:border-slate-800 lg:grid-cols-[1.2fr_1fr_2fr_1.2fr_auto] lg:items-center lg:gap-4 lg:first:border-t"
            >
              <span className="font-medium text-amber-700 dark:text-amber-500">
                {t(`alertType.${a.type}`)}
              </span>
              <span>
                {a.lotReference ? (
                  <Link
                    href={`/lots/${a.lotId}`}
                    className="text-stone-700 underline-offset-2 hover:underline dark:text-stone-200"
                  >
                    {a.lotReference}
                  </Link>
                ) : (
                  "—"
                )}
              </span>
              <span className="text-stone-600 dark:text-stone-300">{a.message}</span>
              <span className="text-stone-500 dark:text-stone-400">
                {format.dateTime(new Date(a.createdAt), {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
              <span>
                {a.isResolved ? (
                  <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 dark:bg-slate-800 dark:text-stone-300">
                    {t("alertsList.resolved")}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300">
                    {t("alertsList.active")}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Pagination
          current={current}
          pageCount={pageCount}
          onChange={setPage}
          prevLabel={t("lots.prevPage")}
          nextLabel={t("lots.nextPage")}
        />
      </div>
    </div>
  )
}
