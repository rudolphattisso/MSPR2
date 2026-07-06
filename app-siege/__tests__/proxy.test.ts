import { describe, it, expect, vi } from "vitest"
import { NextRequest } from "next/server"

// Mock the auth wrapper to immediately invoke the callback for easy testing
vi.mock("@/auth", () => {
  return {
    auth: vi.fn().mockImplementation((cb) => {
      return (req: any) => {
        req.auth = cb.authVal
        return cb(req)
      }
    }),
  }
})

describe("app-siege Routing Proxy Middleware", () => {
  const getMiddlewareWithAuth = (isLoggedIn: boolean) => {
    const cb = vi.mocked(require("@/auth").auth).mock.calls[0][0]
    cb.authVal = isLoggedIn ? { user: { name: "Test User" } } : null
    return (req: any) => cb(req)
  }

  it("should redirect anonymous users trying to access private page to /login", async () => {
    const middleware = getMiddlewareWithAuth(false)
    const req = new NextRequest("http://localhost/dashboard")
    const res = await middleware(req)
    
    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toBe("http://localhost/login")
  })

  it("should allow anonymous users to access public routes like /login", async () => {
    const middleware = getMiddlewareWithAuth(false)
    const req = new NextRequest("http://localhost/login")
    const res = await middleware(req)
    
    expect(res.status).toBe(200)
  })

  it("should redirect authenticated users trying to access /login back to home /", async () => {
    const middleware = getMiddlewareWithAuth(true)
    const req = new NextRequest("http://localhost/login")
    const res = await middleware(req)
    
    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toBe("http://localhost/")
  })

  it("should allow authenticated users to access private routes", async () => {
    const middleware = getMiddlewareWithAuth(true)
    const req = new NextRequest("http://localhost/dashboard")
    const res = await middleware(req)
    
    expect(res.status).toBe(200)
  })
})
