export type Locale = "en" | "es" | "pt"

export const defaultLocale: Locale = (() => {
    if (typeof window !== "undefined") {
        const saved = window.localStorage.getItem("seanime-locale")
        if (saved === "en" || saved === "es" || saved === "pt") return saved as Locale
    }
    return "es"
})()

export const localeNames: Record<Locale, string> = {
    en: "English",
    es: "Español",
    pt: "Português",
}

export function isValidLocale(value: string): value is Locale {
    return value in localeNames
}
