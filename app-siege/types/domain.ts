// Formes des données renvoyées par le backend pays (consommées par l'agrégateur
// et l'UI). Volontairement minimales : ce dont le front a besoin.

export type Role = "ADMIN" | "MANAGER_PAYS" | "VIEWER"

export type LotStatus = "CONFORME" | "EN_ALERTE" | "PERIME"

export type AlertType = "SEUIL_TEMPERATURE" | "SEUIL_HUMIDITE" | "PEREMPTION"

export interface Country {
  id: string // "BR" | "EC" | "CO"
  name: string
  idealTemp: number
  tempTolerance: number
  idealHumidity: number
  humidityTolerance: number
}

export interface Warehouse {
  id: string
  name: string
  countryId: string
  country?: Country
}

export interface Lot {
  id: string
  reference: string
  warehouseId: string
  storedAt: string
  status: LotStatus
  warehouse?: Warehouse
}

export interface Measurement {
  warehouseId: string
  temperature: number
  humidity: number
  recordedAt: string
}

export interface Alert {
  id: string
  lotId: string
  type: AlertType
  message: string
  isResolved: boolean
  createdAt: string
  resolvedAt: string | null
  lot?: Lot
}
