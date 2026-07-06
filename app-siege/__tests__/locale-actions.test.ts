import { describe, it, expect, vi } from "vitest"

// Mock du cookie store de next/headers (vi.hoisted → utilisable dans la factory).
const { set } = vi.hoisted(() => ({ set: vi.fn() }))
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ set }),
}))

import { setLocale } from "@/lib/locale-actions"

describe("locale-actions", () => {
  it("setLocale écrit le cookie de langue (1 an, path /)", async () => {
    await setLocale("fr" as never)
    expect(set).toHaveBeenCalledWith(
      expect.any(String),
      "fr",
      expect.objectContaining({ path: "/", maxAge: 60 * 60 * 24 * 365 }),
    )
  })
})
