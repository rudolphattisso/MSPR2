import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"
import { LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "./config"

// i18n sans routing : la langue est lue dans un cookie (pas de /fr/ /en/ dans
// l'URL → pas d'impact sur l'auth/proxy). Défaut : français.
export default getRequestConfig(async () => {
  const store = await cookies()
  const cookieLocale = store.get(LOCALE_COOKIE)?.value
  const locale: Locale = LOCALES.includes(cookieLocale as Locale)
    ? (cookieLocale as Locale)
    : DEFAULT_LOCALE

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
