import { describe, it, expect, beforeEach } from "vitest"
import crypto from "node:crypto" // Corrigé pour SonarLint (S7772)
import { prisma } from "../lib/prisma.js"
import bcrypt from "bcryptjs"
import { POST as loginHandler } from "../app/api/auth/login/route"
import { POST as registerHandler } from "../app/api/auth/register/route"
import { GET as verifyHandler } from "../app/api/auth/verify/route"
import { NextRequest } from "next/server"

// Utilise NextRequest pour correspondre aux attentes des routes Next.js API
const makeRequest = (url: string, body: unknown) =>
  new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

async function parseJson(response: Response) {
  return response.json()
}

describe("auth API", () => {
  beforeEach(async () => {
    await prisma.verificationToken.deleteMany()
    await prisma.user.deleteMany({ where: { email: { contains: "test" } } })
  })

  it("should register a new user and create verification token", async () => {
    const req = makeRequest("http://localhost/api/auth", {
      name: "Test User",
      email: "test.user@futurekawa.local",
      password: "Password123!",
    })

    const response = await registerHandler(req)
    expect(response.status).toBe(201)

    const data = await parseJson(response)
    expect(data.email).toBe("test.user@futurekawa.local")
    expect(data.requiresVerification).toBe(true)

    const token = await prisma.verificationToken.findFirst({
      where: { email: "test.user@futurekawa.local" },
    })
    expect(token).not.toBeNull()
  })

  it("should reject login with invalid credentials", async () => {
    const req = makeRequest("http://localhost/api/auth", { email: "missing@test.local", password: "wrong" })
    const response = await loginHandler(req)
    expect(response.status).toBe(401)
    const data = await parseJson(response)
    expect(data.error).toBe("Identifiants invalides")
  })

  it("should verify a token and mark email as verified", async () => {
    const email = "verify.user@futurekawa.local"
    const hash = await bcrypt.hash("Password123!", 10)
    const user = await prisma.user.create({
      data: {
        name: "Verify User",
        email,
        password: hash,
        role: "VIEWER",
      },
    })
    const token = crypto.randomBytes(32).toString("hex")
    await prisma.verificationToken.create({
      data: { token, email, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    })

    const response = await verifyHandler(new NextRequest(`http://localhost/api/auth/verify?token=${token}`))
    expect(response.status).toBe(200)

    const updated = await prisma.user.findUnique({ where: { id: user.id } })
    expect(updated?.emailVerified).not.toBeNull()
  })
})