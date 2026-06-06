import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lotId = searchParams.get("lotId") ?? undefined
  const isResolvedParam = searchParams.get("isResolved")
  const isResolved =
    isResolvedParam === "true"
      ? true
      : isResolvedParam === "false"
        ? false
        : undefined

  const alerts = await prisma.alert.findMany({
    where: {
      ...(lotId ? { lotId } : {}),
      ...(isResolved !== undefined ? { isResolved } : {}),
    },
    include: {
      lot: { include: { warehouse: { include: { country: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(alerts)
}
