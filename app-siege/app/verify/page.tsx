import Link from "next/link"

const AUTH_API_URL = process.env.AUTH_API_URL ?? "http://localhost:3001"
const SERVICE_API_KEY = process.env.SERVICE_API_KEY ?? ""

// Cible du lien reçu par email. Appelle le backend (avec la clé de service)
// pour valider le token, puis affiche le résultat.
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  let ok = false
  if (token) {
    const res = await fetch(
      `${AUTH_API_URL}/api/auth/verify?token=${encodeURIComponent(token)}`,
      { headers: { "x-api-key": SERVICE_API_KEY }, cache: "no-store" },
    )
    ok = res.ok
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold tracking-tight">FutureKawa</h1>

        {ok ? (
          <>
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
              Email vérifié ✓
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Ton compte est activé. Tu peux maintenant te connecter.
            </p>
            <Link
              href="/login?verified=1"
              className="inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Se connecter
            </Link>
          </>
        ) : (
          <>
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              Lien de vérification invalide ou expiré.
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Le lien a peut-être déjà été utilisé ou a expiré (24 h).
            </p>
            <Link
              href="/register"
              className="inline-block rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Créer un compte
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
