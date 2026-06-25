import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Erreur dédiée : mot de passe correct mais email non vérifié.
// Le `code` remonte dans l'URL (?code=email_not_verified) pour afficher le bon
// message sur la page de login.
class EmailNotVerified extends CredentialsSignin {
  code = "email_not_verified"
}

// URL du backend pays qui détient la table users (prototype : un seul backend
// sur :3001). La vérification des identifiants est déléguée à son endpoint
// POST /api/auth/login — app-siege ne touche jamais la DB directement.
const AUTH_API_URL = process.env.AUTH_API_URL ?? "http://localhost:3001"
const SERVICE_API_KEY = process.env.SERVICE_API_KEY ?? ""

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        if (!email || !password) return null

        const res = await fetch(`${AUTH_API_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": SERVICE_API_KEY,
          },
          body: JSON.stringify({ email, password }),
        })
        // 403 = identifiants bons mais email non vérifié → erreur dédiée.
        if (res.status === 403) throw new EmailNotVerified()
        if (!res.ok) return null

        const user = await res.json()
        // L'objet retourné devient `user` dans le callback jwt.
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          countryId: user.countryId,
        }
      },
    }),
  ],
  callbacks: {
    // Propage rôle + pays dans le token (pas de requête DB à chaque appel).
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.countryId = user.countryId
      }
      return token
    },
    // Expose ces infos à l'app via la session.
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role
        session.user.countryId = token.countryId
      }
      return session
    },
  },
})
