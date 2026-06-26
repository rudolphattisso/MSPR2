import Link from "next/link"
import { getTranslations } from "next-intl/server"

const AUTH_API_URL = process.env.AUTH_API_URL ?? "http://localhost:3001"
const SERVICE_API_KEY = process.env.SERVICE_API_KEY ?? ""

// Cible du lien reçu par email : valide le token via le backend, affiche le résultat.
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const t = await getTranslations()

  let ok = false
  if (token) {
    const res = await fetch(
      `${AUTH_API_URL}/api/auth/verify?token=${encodeURIComponent(token)}`,
      { headers: { "x-api-key": SERVICE_API_KEY }, cache: "no-store" },
    )
    ok = res.ok
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("common.appName")}
        </h1>

        {ok ? (
          <>
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              {t("auth.verifiedBadge")}
            </p>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {t("auth.verifiedMessage")}
            </p>
            <Link
              href="/login?verified=1"
              className="inline-block rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
            >
              {t("auth.signIn")}
            </Link>
          </>
        ) : (
          <>
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {t("auth.verifyErrorBadge")}
            </p>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {t("auth.verifyErrorMessage")}
            </p>
            <Link
              href="/register"
              className="inline-block rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {t("auth.createAccountLink")}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
