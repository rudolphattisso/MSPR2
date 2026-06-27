import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Sidebar } from "@/components/shell/sidebar"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"

// Shell des pages authentifiées : sidebar + header (langue, thème, user, logout).
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const t = await getTranslations()
  const { name, role } = session.user
  const initials =
    name
      ?.split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"

  async function logout() {
    "use server"
    await signOut({ redirectTo: "/login" })
  }

  return (
    <div className="flex flex-1">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:px-6">
          <span className="flex items-center gap-2 font-semibold md:hidden">
            ☕ FutureKawa
          </span>

          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="mx-1 hidden h-8 w-px bg-stone-200 sm:block dark:bg-slate-800" />

            <Link
              href="/account"
              className="flex items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-stone-100 dark:hover:bg-slate-800"
            >
              <div className="hidden text-right sm:block">
                <div className="text-sm font-medium leading-tight">{name}</div>
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  {role ? t(`user.role.${role}`) : ""}
                </div>
              </div>
              <div
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-coffee-700 text-sm font-semibold text-white"
              >
                {initials}
              </div>
            </Link>

            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-stone-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                {t("user.logout")}
              </button>
            </form>
          </div>
        </header>

        <main className="flex flex-1 flex-col p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
