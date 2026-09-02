export type Locale = "en" | "es" | "pt"

export const localeNames: Record<Locale, string> = {
    en: "English",
    es: "Español",
    pt: "Português",
}

export function isValidLocale(value: string): value is Locale {
    return value in localeNames
}

let _cachedLocale: Locale | null = null
let _cachedRaw: string | null = null

export function getCurrentLocale(): Locale {
    if (typeof window === "undefined") return "es"
    const raw = window.localStorage.getItem("seanime-locale")
    if (raw === _cachedRaw && _cachedLocale) return _cachedLocale
    _cachedRaw = raw
    if (raw && isValidLocale(raw)) {
        _cachedLocale = raw as Locale
        return _cachedLocale
    }
    _cachedLocale = "es"
    return "es"
}

export function setCurrentLocale(locale: Locale) {
    _cachedLocale = locale
    _cachedRaw = locale
    if (typeof window !== "undefined") {
        window.localStorage.setItem("seanime-locale", locale)
    }
}

// Compat: snapshot legacy (deprecated, usar getCurrentLocale() para dinamico).
// Se mantiene exportado solo por compatibilidad con código antiguo o futuro del
// upstream que importe `defaultLocale`. NO usar en código nuevo: queda congelado
// en el idioma del arranque y NO reacciona a `setCurrentLocale()`.
export const defaultLocale: Locale = getCurrentLocale()
