import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const countryId = searchParams.get("countryId") ?? undefined

  const warehouses = await prisma.warehouse.findMany({
    where: countryId ? { countryId } : undefined,
    include: { country: true },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(warehouses)
}
