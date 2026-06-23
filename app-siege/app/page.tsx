import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur (siège)",
  MANAGER_PAYS: "Manager pays",
  VIEWER: "Observateur",
}

// Accueil provisoire (le vrai front = Bloc 7).
// Sert pour l'instant à vérifier l'auth : utilisateur connecté + rôle + logout.
export default async function Home() {
  const session = await auth()
  if (!session) redirect("/login")

  const { name, email, role, countryId } = session.user

  async function logout() {
    "use server"
    await signOut({ redirectTo: "/login" })
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <main className="w-full max-w-md space-y-6 rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">FutureKawa</h1>
          <p className="text-sm text-zinc-500">Vous êtes connecté.</p>
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Nom</dt>
            <dd className="font-medium">{name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Email</dt>
            <dd className="font-medium">{email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Rôle</dt>
            <dd className="font-medium">{role ? ROLE_LABELS[role] ?? role : "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Pays</dt>
            <dd className="font-medium">{countryId ?? "Tous (siège)"}</dd>
          </div>
        </dl>

        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Se déconnecter
          </button>
        </form>
      </main>
    </div>
  )
}
