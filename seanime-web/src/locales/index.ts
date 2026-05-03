import { useMemo } from "react"
import en from "./en.json"

// --- Importaciones de secciones en español ---
import esCommon from "./es/common.json"
import esHome from "./es/home.json"
import esNavigation from "./es/navigation.json"
import esVideoPlayer from "./es/videoPlayer.json"
import esFeatures from "./es/features.json"
import esMisc from "./es/misc.json"

// Secciones de settings
import esSettingsGeneral from "./es/settings/general.json"
import esSettingsLibrary from "./es/settings/library.json"
import esSettingsPlayers from "./es/settings/players.json"
import esSettingsStreaming from "./es/settings/streaming.json"
import esSettingsAdvanced from "./es/settings/advanced.json"
import esSettingsUi from "./es/settings/ui.json"

// ---------------------------------------------------------------------------

type Messages = typeof en

/**
 * Deep merge de objetos. Las propiedades del source sobreescriben las del target.
 */
function deepMerge(target: Record<string, any>, ...sources: Record<string, any>[]): Record<string, any> {
    for (const source of sources) {
        for (const key in source) {
            if (
                source[key] !== null &&
                typeof source[key] === "object" &&
                !Array.isArray(source[key])
            ) {
                if (!target[key] || typeof target[key] !== "object") {
                    target[key] = {}
                }
                deepMerge(target[key], source[key])
            } else {
                target[key] = source[key]
            }
        }
    }
    return target
}

// Construye el objeto de traducciones en español mergeando todos los archivos
const es = deepMerge(
    {},
    esCommon,
    esHome,
    esNavigation,
    esVideoPlayer,
    esFeatures,
    esMisc,
    esSettingsGeneral,
    esSettingsLibrary,
    esSettingsPlayers,
    esSettingsStreaming,
    esSettingsAdvanced,
    esSettingsUi,
) as Messages

// ---------------------------------------------------------------------------

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
