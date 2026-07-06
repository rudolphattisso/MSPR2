import { describe, it, expect, vi } from "vitest"
import { NextRequest } from "next/server"

// État de connexion contrôlable, injecté par le mock de `auth`.
// vi.hoisted → accessible dans la factory de vi.mock (hoistée en haut du fichier).
const state = vi.hoisted(() => ({ loggedIn: false }))

// auth(cb) renvoie un middleware qui pose req.auth puis appelle le callback du proxy.
vi.mock("@/auth", () => ({
  auth:
    (cb: (req: { auth: unknown }) => unknown) =>
    (req: { auth: unknown }) => {
      req.auth = state.loggedIn ? { user: { name: "Test User" } } : null
      return cb(req)
    },
}))

// Import APRÈS le mock : déclenche `export default auth(cb)` → `middleware` est le proxy.
import middleware from "@/proxy"

describe("app-siege — middleware de routage (proxy)", () => {
  it("redirige un anonyme depuis une page privée vers /login", async () => {
    state.loggedIn = false
    const res = await middleware(new NextRequest("http://localhost/dashboard"))
    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toBe("http://localhost/login")
  })

  it("laisse un anonyme accéder aux routes publiques (/login)", async () => {
    state.loggedIn = false
    const res = await middleware(new NextRequest("http://localhost/login"))
    expect(res.status).toBe(200)
  })

  it("redirige un utilisateur connecté depuis /login vers l'accueil /", async () => {
    state.loggedIn = true
    const res = await middleware(new NextRequest("http://localhost/login"))
    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toBe("http://localhost/")
  })

  it("laisse un utilisateur connecté accéder aux routes privées", async () => {
    state.loggedIn = true
    const res = await middleware(new NextRequest("http://localhost/dashboard"))
    expect(res.status).toBe(200)
  })
})
