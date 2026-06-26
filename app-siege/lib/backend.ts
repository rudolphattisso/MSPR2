import { auth } from "@/auth"
import type { Role, Warehouse, Lot, Alert, Measurement } from "@/types/domain"

const SERVICE_API_KEY = process.env.SERVICE_API_KEY ?? ""

// Carte pays -> URL du backend pays. En prototype, les 3 pointent sur le même
// backend (une seule BDD contient les 3 pays). En production multi-backend, ces
// URLs diffèrent et l'agrégateur interroge réellement chaque pays.
const BACKENDS: Record<string, string> = {
  BR: process.env.BACKEND_BRESIL_URL ?? "http://localhost:3001",
  EC: process.env.BACKEND_EQUATEUR_URL ?? "http://localhost:3001",
  CO: process.env.BACKEND_COLOMBIE_URL ?? "http://localhost:3001",
}

// URLs uniques (dédoublonne : en prototype = une seule).
function uniqueBackends(): string[] {
  return [...new Set(Object.values(BACKENDS))]
}

// Appel bas niveau d'un backend pays, avec la clé de service (M2M).
export async function backendFetch<T = unknown>(
  baseUrl: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { ...(init?.headers ?? {}), "x-api-key": SERVICE_API_KEY },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Backend ${path} → ${res.status}`)
  return res.json() as Promise<T>
}

// Ressource unique : prend le premier backend (suffisant en prototype 1 backend).
export async function backendFetchFirst<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  return backendFetch<T>(uniqueBackends()[0], path, init)
}

// Agrège un endpoint « liste » sur tous les backends pays et concatène.
export async function aggregateArray<T>(path: string): Promise<T[]> {
  const lists = await Promise.all(
    uniqueBackends().map((url) =>
      backendFetch<T[]>(url, path).catch(() => [] as T[]),
    ),
  )
  return lists.flat()
}

// Rôle + pays de l'utilisateur connecté.
export async function getScope(): Promise<{
  role: Role | null
  country: string | null
}> {
  const session = await auth()
  return {
    role: (session?.user.role as Role) ?? null,
    country: session?.user.countryId ?? null,
  }
}

// Filtre pays effectif selon le rôle :
// - MANAGER_PAYS : forcé à son pays (ignore le pays demandé)
// - ADMIN / VIEWER : pays demandé, ou tous si non précisé
export async function resolveCountryFilter(requested?: string | null) {
  const { role, country } = await getScope()
  if (role === "MANAGER_PAYS") return country
  return requested ?? null
}

// --- Accès métier consolidés (utilisés par les routes API ET les pages) ---

export async function getWarehouses(requestedCountry?: string | null) {
  const country = await resolveCountryFilter(requestedCountry)
  let warehouses = await aggregateArray<Warehouse>("/api/warehouses")
  if (country) warehouses = warehouses.filter((w) => w.countryId === country)
  return warehouses
}

export async function getLots(opts?: {
  country?: string | null
  warehouse?: string | null
}) {
  const country = await resolveCountryFilter(opts?.country)
  let lots = await aggregateArray<Lot>("/api/lots")
  if (country) lots = lots.filter((l) => l.warehouse?.countryId === country)
  if (opts?.warehouse) lots = lots.filter((l) => l.warehouseId === opts.warehouse)
  // FIFO : les plus anciens d'abord.
  lots.sort(
    (a, b) => new Date(a.storedAt).getTime() - new Date(b.storedAt).getTime(),
  )
  return lots
}

export async function getAlerts(requestedCountry?: string | null) {
  const country = await resolveCountryFilter(requestedCountry)
  let alerts = await aggregateArray<Alert>("/api/alerts")
  if (country) {
    alerts = alerts.filter((a) => a.lot?.warehouse?.countryId === country)
  }
  return alerts
}

// Détail d'un lot avec autorisation par rôle. null = introuvable OU interdit
// (on ne distingue pas → ne révèle pas l'existence d'un lot d'un autre pays).
export async function getLotDetail(id: string): Promise<Lot | null> {
  let lot: Lot
  try {
    lot = await backendFetchFirst<Lot>(`/api/lots/${id}`)
  } catch {
    return null
  }
  const { role, country } = await getScope()
  if (role === "MANAGER_PAYS" && lot.warehouse?.countryId !== country) {
    return null
  }
  return lot
}

// Mesures d'un lot, triées chronologiquement (pour les courbes).
export async function getMeasurements(lotId: string) {
  const measurements = await backendFetchFirst<Measurement[]>(
    `/api/lots/${lotId}/measurements`,
  ).catch(() => [] as Measurement[])
  return [...measurements].sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  )
}

// Alertes d'un lot précis.
export async function getLotAlerts(lotId: string) {
  return backendFetchFirst<Alert[]>(
    `/api/alerts?lotId=${encodeURIComponent(lotId)}`,
  ).catch(() => [] as Alert[])
}

const DAY = 86_400_000

// Statistiques consolidées du tableau de bord (KPIs + tendances réelles 30 j +
// répartition pays + dernières alertes), filtrées par rôle.
export async function getDashboardStats() {
  const [lots, alerts] = await Promise.all([getLots(), getAlerts()])
  const now = Date.now()
  const ageDays = (d: string) => (now - new Date(d).getTime()) / DAY
  const within30 = (d: string) => now - new Date(d).getTime() <= 30 * DAY

  return {
    totalLots: lots.length,
    activeAlerts: alerts.filter((a) => !a.isResolved).length,
    perime: lots.filter((l) => l.status === "PERIME").length,
    countries: new Set(lots.map((l) => l.warehouse?.countryId).filter(Boolean))
      .size,
    // Tendances réelles (30 derniers jours).
    lotsAdded30: lots.filter((l) => within30(l.storedAt)).length,
    alertsAdded30: alerts.filter((a) => within30(a.createdAt)).length,
    perimeRecent: lots.filter((l) => {
      const a = ageDays(l.storedAt)
      return a > 365 && a <= 395
    }).length,
    countryCounts: ["BR", "EC", "CO"].map((c) => ({
      country: c,
      count: lots.filter((l) => l.warehouse?.countryId === c).length,
    })),
    recentAlerts: [...alerts]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 4),
  }
}
