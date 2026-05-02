export type Locale = "en" | "es"

export const defaultLocale: Locale = "es"

export const localeNames: Record<Locale, string> = {
    en: "English",
    es: "Español",
}

export function isValidLocale(value: string): value is Locale {
    return value === "en" || value === "es"
}

export function getLocaleFromBrowser(): Locale {
    if (typeof window !== "undefined") {
        const browserLang = navigator.language.split("-")[0]
        if (browserLang === "es") return "es"
    }
    return "en"
}
