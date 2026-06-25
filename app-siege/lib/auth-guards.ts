import { auth } from "@/auth"
import { redirect } from "next/navigation"

type Role = "ADMIN" | "MANAGER_PAYS" | "VIEWER"

// Helpers à utiliser dans les Server Components / Route Handlers du front
// (Bloc 7) pour appliquer les gardes par rôle de façon homogène.
//
// Le middleware garantit déjà qu'on est connecté ; ces helpers ajoutent le
// contrôle FIN par rôle (et restent une défense en profondeur côté page).

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return session
}

// Autorise uniquement les rôles passés en argument, sinon renvoie à l'accueil.
// Ex : await requireRole("ADMIN") ou requireRole("ADMIN", "MANAGER_PAYS")
export async function requireRole(...roles: Role[]) {
  const session = await requireAuth()
  const role = session.user.role as Role | undefined
  if (!role || !roles.includes(role)) {
    redirect("/")
  }
  return session
}

// VIEWER = lecture seule : à appeler avant toute action de modification.
export async function requireWriteAccess() {
  return requireRole("ADMIN", "MANAGER_PAYS")
}
