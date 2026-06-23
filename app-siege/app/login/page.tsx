import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"

// Page de connexion — formulaire email/mot de passe.
// La soumission passe par une Server Action qui appelle signIn("credentials").
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; code?: string; verified?: string }>
}) {
  const { error, code, verified } = await searchParams
  // ?error=email_not_verified (notre action) ou ?code=email_not_verified (callback NextAuth)
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
      // signIn lève une erreur de redirection en cas de succès → la relancer.
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
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <form
        action={authenticate}
        className="w-full max-w-sm space-y-6 rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-900"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">FutureKawa</h1>
          <p className="text-sm text-zinc-500">Suivi des stocks — connexion</p>
        </div>

        {verified && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
            Email vérifié ✓ Tu peux te connecter.
          </p>
        )}

        {unverified && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Email non vérifié. Consulte ta boîte mail et clique sur le lien
            d&apos;activation.
          </p>
        )}

        {invalid && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            Identifiants invalides.
          </p>
        )}

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
            placeholder="admin@futurekawa.com"
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
            autoComplete="current-password"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-zinc-100"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Se connecter
        </button>

        <p className="text-center text-sm text-zinc-500">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-medium underline">
            Créer un compte
          </Link>
        </p>
      </form>
    </div>
  )
}
