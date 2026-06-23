import { redirect } from "next/navigation"
import Link from "next/link"

const AUTH_API_URL = process.env.AUTH_API_URL ?? "http://localhost:3001"
const SERVICE_API_KEY = process.env.SERVICE_API_KEY ?? ""

const ERROR_MESSAGES: Record<string, string> = {
  exists: "Cet email est déjà utilisé.",
  invalid: "Champs invalides (mot de passe : 8 caractères minimum).",
  server: "Erreur serveur, réessayez.",
}

// Inscription publique. Le compte est créé en VIEWER (forcé côté backend) et
// reste inactif jusqu'à la vérification de l'email (lien envoyé par mail).
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>
}) {
  const { error, sent } = await searchParams

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

    // Pas d'auto-login : le compte doit d'abord être vérifié par email.
    redirect("/register?sent=1")
  }

  // Écran de confirmation après inscription réussie.
  if (sent) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <h1 className="text-2xl font-semibold tracking-tight">FutureKawa</h1>
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
            Compte créé ✓
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Un email de vérification vient d&apos;être envoyé. Clique sur le lien
            qu&apos;il contient pour activer ton compte, puis connecte-toi.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Aller à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <form
        action={register}
        className="w-full max-w-sm space-y-6 rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-900"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">FutureKawa</h1>
          <p className="text-sm text-zinc-500">Créer un compte</p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {ERROR_MESSAGES[error] ?? ERROR_MESSAGES.server}
          </p>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">
            Nom
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-zinc-100"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-zinc-100"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-zinc-100"
          />
          <p className="text-xs text-zinc-400">8 caractères minimum.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="countryId" className="block text-sm font-medium">
            Pays
          </label>
          <select
            id="countryId"
            name="countryId"
            defaultValue=""
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-zinc-100"
          >
            <option value="">Aucun (siège)</option>
            <option value="BR">Brésil</option>
            <option value="EC">Équateur</option>
            <option value="CO">Colombie</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Créer mon compte
        </button>

        <p className="text-center text-sm text-zinc-500">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  )
}
