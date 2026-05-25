export type Locale = "en" | "es"

export const defaultLocale: Locale = "es"

export const localeNames: Record<Locale, string> = {
    en: "English",
    es: "Español",
}

export function isValidLocale(value: string): value is Locale {
    return value in localeNames
}
