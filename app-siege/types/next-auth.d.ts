import { DefaultSession } from "next-auth"

type Role = "ADMIN" | "MANAGER_PAYS" | "VIEWER"

// Étend les types NextAuth pour transporter role + countryId (rôles métier
// FutureKawa : ADMIN siège / MANAGER_PAYS / VIEWER).
declare module "next-auth" {
  interface User {
    role?: Role
    countryId?: string | null
  }
  interface Session {
    user: {
      id: string
      role?: Role
      countryId?: string | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: Role
    countryId?: string | null
  }
}
