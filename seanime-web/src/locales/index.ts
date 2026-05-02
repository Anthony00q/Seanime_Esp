import { useMemo } from "react"
import en from "./en.json"
import es from "./es.json"

type Messages = typeof en

const translations: Record<string, Messages> = {
    en,
    es,
}

function getNestedValue(obj: any, path: string): string | undefined {
    const keys = path.split(".")
    let current: any = obj

    for (const key of keys) {
        if (current === undefined || current === null) return undefined
        current = current[key]
    }

    return typeof current === "string" ? current : undefined
}

function interpolate(text: string, params?: Record<string, string | number>): string {
    if (!params) return text

    return text.replace(/\{(\w+)\}/g, (_, key) => {
        const value = params[key]
        return value !== undefined ? String(value) : `{${key}}`
    })
}

export function createTranslator(locale: string) {
    const messages = translations[locale] || translations.en

    return function t(key: string, params?: Record<string, string | number>): string {
        const translation = getNestedValue(messages, key)

        if (translation) {
            return interpolate(translation, params)
        }

        const fallback = getNestedValue(translations.en, key)
        if (fallback) {
            return interpolate(fallback, params)
        }

        console.warn(`[i18n] Missing translation for key: ${key}`)
        return key
    }
}

export function useTranslation() {
    const t = useMemo(() => {
        return createTranslator("es")
    }, [])

    return { t }
}
