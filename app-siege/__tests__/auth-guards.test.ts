import { describe, it, expect, vi, beforeEach } from "vitest"
import { requireAuth, requireRole, requireWriteAccess } from "../lib/auth-guards"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))

describe("Auth Guards", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("requireAuth - should redirect to /login if no user is in session", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null)

    await requireAuth()

    expect(redirect).toHaveBeenCalledWith("/login")
  })

  it("requireAuth - should return session if user is logged in", async () => {
    const mockSession = { user: { name: "Test User" } }
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)

    const session = await requireAuth()

    expect(session).toBe(mockSession)
    expect(redirect).not.toHaveBeenCalled()
  })

  it("requireRole - should redirect to / if user does not have the specified role", async () => {
    const mockSession = { user: { name: "Test User", role: "VIEWER" } }
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)

    await requireRole("ADMIN")

    expect(redirect).toHaveBeenCalledWith("/")
  })

  it("requireRole - should return session if user has one of the allowed roles", async () => {
    const mockSession = { user: { name: "Test User", role: "MANAGER_PAYS" } }
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)

    const session = await requireRole("ADMIN", "MANAGER_PAYS")

    expect(session).toBe(mockSession)
    expect(redirect).not.toHaveBeenCalled()
  })

  it("requireWriteAccess - should allow ADMIN or MANAGER_PAYS, but redirect VIEWER", async () => {
    // 1. MANAGER_PAYS
    const mockManagerSession = { user: { name: "Manager", role: "MANAGER_PAYS" } }
    vi.mocked(auth).mockResolvedValueOnce(mockManagerSession as any)
    await requireWriteAccess()
    expect(redirect).not.toHaveBeenCalled()

    // 2. VIEWER
    const mockViewerSession = { user: { name: "Viewer", role: "VIEWER" } }
    vi.mocked(auth).mockResolvedValueOnce(mockViewerSession as any)
    await requireWriteAccess()
    expect(redirect).toHaveBeenCalledWith("/")
  })
})
