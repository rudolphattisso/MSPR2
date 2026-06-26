"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

const NAV = [
  { href: "/", key: "dashboard", icon: "▦" },
  { href: "/lots", key: "lots", icon: "▤" },
  { href: "/alerts", key: "alerts", icon: "⚠" },
] as const

// Barre latérale (bleu nuit). Lien actif surligné en accent café.
export function Sidebar() {
  const pathname = usePathname()
  const t = useTranslations("nav")

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-stone-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:flex">
      <div className="flex items-center gap-2 border-b border-stone-200 px-5 py-4 dark:border-slate-800">
        <span className="text-xl">☕</span>
        <span className="text-lg font-semibold tracking-tight">FutureKawa</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-amber-700 text-white"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-slate-800"
              }`}
            >
              <span className="w-4 text-center">{item.icon}</span>
              {t(item.key)}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
