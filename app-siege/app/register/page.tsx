import { redirect } from "next/navigation"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { PasswordInput } from "@/components/ui/password-input"

const AUTH_API_URL = process.env.AUTH_API_URL ?? "http://localhost:3001"
const SERVICE_API_KEY = process.env.SERVICE_API_KEY ?? ""

const ERROR_KEYS: Record<string, string> = {
  exists: "auth.registerExists",
  invalid: "auth.registerInvalid",
  server: "auth.registerServer",
}

// Inscription publique (compte VIEWER forcé côté backend), inactif jusqu'à la
// vérification de l'email.
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>
}) {
  const { error, sent } = await searchParams
  const t = await getTranslations()

  async function register(formData: FormData) {
    "use server"
    const name = formData.get("name")
    const email = formData.get("email")
    const password = formData.get("password")
    const countryId = formData.get("countryId") || null

    const res = await fetch(`${AUTH_API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": SERVICE_API_KEY,
      },
      body: JSON.stringify({ name, email, password, countryId }),
    })

    if (!res.ok) {
      const code =
        res.status === 409 ? "exists" : res.status === 400 ? "invalid" : "server"
      redirect(`/register?error=${code}`)
    }

    redirect("/register?sent=1")
  }

  if (sent) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("common.appName")}
          </h1>
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            {t("auth.sentBadge")}
          </p>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {t("auth.sentMessage")}
          </p>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
          >
            {t("auth.goToLogin")}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <form
        action={register}
        className="w-full max-w-sm space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("common.appName")}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {t("auth.subtitleRegister")}
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {t(ERROR_KEYS[error] ?? "auth.registerServer")}
          </p>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">
            {t("auth.name")}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-amber-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            {t("auth.email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-amber-500"
          />
        </div>

        <PasswordInput
          id="password"
          name="password"
          label={t("auth.password")}
          showLabel={t("auth.showPassword")}
          hideLabel={t("auth.hidePassword")}
          autoComplete="new-password"
          minLength={8}
          hint={t("auth.passwordHint")}
        />

        <div className="space-y-2">
          <label htmlFor="countryId" className="block text-sm font-medium">
            {t("auth.country")}
          </label>
          <select
            id="countryId"
            name="countryId"
            defaultValue=""
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-amber-500"
          >
            <option value="">{t("auth.countryNone")}</option>
            <option value="BR">{t("auth.countries.BR")}</option>
            <option value="EC">{t("auth.countries.EC")}</option>
            <option value="CO">{t("auth.countries.CO")}</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-800"
        >
          {t("auth.createAccount")}
        </button>

        <p className="text-center text-sm text-stone-500 dark:text-stone-400">
          {t("auth.haveAccount")}{" "}
          <Link href="/login" className="font-medium text-amber-700 underline dark:text-amber-500">
            {t("auth.signIn")}
          </Link>
        </p>
      </form>
    </div>
  )
}
