import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

// Page de connexion — formulaire email/mot de passe (Server Action signIn).
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; code?: string; verified?: string }>
}) {
  const { error, code, verified } = await searchParams
  const t = await getTranslations()

  const unverified =
    error === "email_not_verified" || code === "email_not_verified"
  const invalid = !!error && !unverified

  async function authenticate(formData: FormData) {
    "use server"
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/",
      })
    } catch (err) {
      if (err instanceof AuthError) {
        const c = (err as { code?: string }).code
        redirect(
          `/login?error=${c === "email_not_verified" ? "email_not_verified" : "1"}`,
        )
      }
      throw err
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <form
        action={authenticate}
        className="w-full max-w-sm space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("common.appName")}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {t("auth.subtitleLogin")}
          </p>
        </div>

        {verified && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            {t("auth.verifiedOk")}
          </p>
        )}
        {unverified && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            {t("auth.unverified")}
          </p>
        )}
        {invalid && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {t("auth.invalid")}
          </p>
        )}

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
            placeholder="admin@futurekawa.com"
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-amber-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            {t("auth.password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-amber-500"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-800"
        >
          {t("auth.signIn")}
        </button>

        <p className="text-center text-sm text-stone-500 dark:text-stone-400">
          {t("auth.noAccount")}{" "}
          <Link href="/register" className="font-medium text-amber-700 underline dark:text-amber-500">
            {t("auth.createAccountLink")}
          </Link>
        </p>
      </form>
    </div>
  )
}
