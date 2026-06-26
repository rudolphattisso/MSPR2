"use server"

import { cookies } from "next/headers"
import { LOCALE_COOKIE, type Locale } from "@/i18n/config"

// Mémorise la langue choisie dans un cookie (1 an).
export async function setLocale(locale: Locale) {
  const store = await cookies()
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })
}
