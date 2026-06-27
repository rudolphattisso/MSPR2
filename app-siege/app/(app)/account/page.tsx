import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Card } from "@/components/ui/card"

// Page compte : informations du profil de l'utilisateur connecté (lecture seule).
export default async function AccountPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const t = await getTranslations()
  const { name, email, role, countryId } = session.user

  const initials =
    name
      ?.split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"

  const fields = [
    { label: t("home.name"), value: name ?? "—" },
    { label: t("home.email"), value: email ?? "—" },
    { label: t("home.role"), value: role ? t(`user.role.${role}`) : "—" },
    {
      label: t("home.country"),
      value: countryId ? t(`countries.${countryId}`) : t("home.allCountries"),
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("account.title")}</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">{t("account.subtitle")}</p>
      </div>

      <Card className="max-w-2xl">
        <div className="flex items-center gap-4 border-b border-stone-200 pb-5 dark:border-slate-800">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-coffee-700 text-xl font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold">{name}</div>
            <div className="truncate text-sm text-stone-500 dark:text-stone-400">{email}</div>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.label}>
              <dt className="text-xs uppercase tracking-wide text-stone-400">{f.label}</dt>
              <dd className="mt-1 text-sm font-medium">{f.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  )
}
