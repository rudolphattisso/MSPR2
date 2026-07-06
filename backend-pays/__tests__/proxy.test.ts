import { describe, it, expect } from "vitest"
import proxy from "../proxy"
import { NextRequest } from "next/server"

describe("Backend Proxy Middleware", () => {
  it("should return 401 if x-api-key header is missing or incorrect", async () => {
    const req1 = new NextRequest("http://localhost/api/lots", {
      headers: {},
    })
    const res1 = proxy(req1)
    expect(res1.status).toBe(401)
    const json1 = await res1.json()
    expect(json1.error).toContain("invalide ou manquante")

    const req2 = new NextRequest("http://localhost/api/lots", {
      headers: { "x-api-key": "wrong-key" },
    })
    const res2 = proxy(req2)
    expect(res2.status).toBe(401)
  })

  it("should allow request through if x-api-key is valid", () => {
    const req = new NextRequest("http://localhost/api/lots", {
      headers: { "x-api-key": "test-service-key" },
    })
    const res = proxy(req)
    // NextResponse.next() returns a response with a private flag or header representation
    expect(res.status).toBe(200)
  })
})
