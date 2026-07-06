// Constantes i18n réutilisables côté client ET serveur (aucun import serveur ici).
export const LOCALES = ["fr", "en", "es", "pt-BR"] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "fr"
export const LOCALE_COOKIE = "NEXT_LOCALE"
