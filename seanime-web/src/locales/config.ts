export type Locale = "en" | "es" | "pt"

export const localeNames: Record<Locale, string> = {
    en: "English",
    es: "Español",
    pt: "Português",
}

export function isValidLocale(value: unknown): value is Locale {
    return typeof value === "string" && Object.prototype.hasOwnProperty.call(localeNames, value)
}

let _cachedLocale: Locale | null = null
let _cachedRaw: string | null = null
let _memoryLocale: Locale | null = null

export function getCurrentLocale(): Locale {
    if (typeof window === "undefined") return "es"
    if (_memoryLocale) return _memoryLocale
    let raw: string | null
    try {
        raw = window.localStorage.getItem("seanime-locale")
    } catch {
        return _cachedLocale || "es"
    }
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
    if (!isValidLocale(locale)) return false
    _cachedLocale = locale
    _cachedRaw = locale
    if (typeof window !== "undefined") {
        try {
            window.localStorage.setItem("seanime-locale", locale)
            _memoryLocale = null
        } catch {
            _memoryLocale = locale
            return false
        }
    }
    return true
}

export function updateDocumentLocale() {
    if (typeof document !== "undefined") {
        document.documentElement.lang = getCurrentLocale() === "pt" ? "pt-BR" : getCurrentLocale()
    }
}

// Compat: snapshot legacy (deprecated, usar getCurrentLocale() para dinamico).
// Se mantiene exportado solo por compatibilidad con código antiguo o futuro del
// upstream que importe `defaultLocale`. NO usar en código nuevo: queda congelado
// en el idioma del arranque y NO reacciona a `setCurrentLocale()`.
export const defaultLocale: Locale = getCurrentLocale()
