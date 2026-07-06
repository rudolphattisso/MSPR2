"use client"

import { useTranslations } from "next-intl"
import type { LotStatus } from "@/types/domain"

// Badge de statut métier, couleurs sémantiques (vert/orange/rouge), libellé i18n.
const STYLES: Record<LotStatus, string> = {
  CONFORME:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-400/20",
  EN_ALERTE:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-400/20",
  PERIME:
    "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-400/20",
}

export function StatusBadge({ status }: { status: LotStatus }) {
  const t = useTranslations("status")
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      {t(status)}
    </span>
  )
}
