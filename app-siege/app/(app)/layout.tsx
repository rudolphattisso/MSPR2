import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
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
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium leading-tight">{name}</div>
              <div className="text-xs text-stone-500 dark:text-stone-400">
                {role ? t(`user.role.${role}`) : ""}
              </div>
            </div>
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

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
