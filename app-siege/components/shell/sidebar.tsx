"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

const NAV = [
  { href: "/", key: "dashboard", icon: "▦" },
  { href: "/lots", key: "lots", icon: "▤" },
  { href: "/alerts", key: "alerts", icon: "⚠" },
] as const

// Barre latérale (bleu nuit). Lien actif surligné en accent café.
// Repliable via le bouton en bas (mode icônes seules).
export function Sidebar() {
  const pathname = usePathname()
  const t = useTranslations("nav")
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r border-stone-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900 md:flex ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div
        className={`flex items-center gap-2 border-b border-stone-200 py-4 dark:border-slate-800 ${
          collapsed ? "justify-center px-0" : "px-5"
        }`}
      >
        <span className="text-xl">☕</span>
        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight text-coffee-800 dark:text-coffee-200">
            FutureKawa
          </span>
        )}
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
              title={collapsed ? t(item.key) : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-amber-700 text-white"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-slate-800"
              }`}
            >
              <span className="w-4 text-center">{item.icon}</span>
              {!collapsed && t(item.key)}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-stone-200 p-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? t("expand") : t("collapse")}
          title={collapsed ? t("expand") : t("collapse")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-slate-800 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          {!collapsed && t("collapse")}
        </button>
      </div>
    </aside>
  )
}
