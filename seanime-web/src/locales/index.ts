import { defaultLocale } from "./config"
import { useMemo } from "react"
import { IntlMessageFormat } from "intl-messageformat"

// --- Importaciones de secciones en inglés (modular) ---
import enCommon from "./en/common.json"
import enHome from "./en/home.json"
import enNavigation from "./en/navigation.json"
import enVideoPlayer from "./en/videoPlayer.json"
import enFeatures from "./en/features.json"
import enMisc from "./en/misc.json"
import enEntry from "./en/entry.json"
import enManga from "./en/manga.json"
import enExtensions from "./en/extensions.json"
import enAnilist from "./en/anilist.json"
import enGettingStarted from "./en/gettingStarted.json"
import enChangelogTour from "./en/changelogTour.json"
import enSettingsGeneral from "./en/settings/general.json"
import enSettingsLibrary from "./en/settings/library.json"
import enSettingsPlayers from "./en/settings/players.json"
import enSettingsStreaming from "./en/settings/streaming.json"
import enSettingsAdvanced from "./en/settings/advanced.json"
import enSettingsUi from "./en/settings/ui.json"

// --- Importaciones de secciones en español ---
import esCommon from "./es/common.json"
import esHome from "./es/home.json"
import esNavigation from "./es/navigation.json"
import esVideoPlayer from "./es/videoPlayer.json"
import esFeatures from "./es/features.json"
import esMisc from "./es/misc.json"
import esEntry from "./es/entry.json"
import esManga from "./es/manga.json"
import esExtensions from "./es/extensions.json"
import esAnilist from "./es/anilist.json"
import esGettingStarted from "./es/gettingStarted.json"
import esChangelogTour from "./es/changelogTour.json"

// Secciones de settings
import esSettingsGeneral from "./es/settings/general.json"
import esSettingsLibrary from "./es/settings/library.json"
import esSettingsPlayers from "./es/settings/players.json"
import esSettingsStreaming from "./es/settings/streaming.json"
import esSettingsAdvanced from "./es/settings/advanced.json"
import esSettingsUi from "./es/settings/ui.json"

// ---------------------------------------------------------------------------

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

// Construye el objeto de traducciones en inglés mergeando todos los archivos (para uso en runtime)
const en = deepMerge(
    {},
    enCommon,
    enHome,
    enNavigation,
    enVideoPlayer,
    enFeatures,
    enMisc,
    enEntry,
    enManga,
    enExtensions,
    enAnilist,
    enGettingStarted,
    enChangelogTour,
    enSettingsGeneral,
    enSettingsLibrary,
    enSettingsPlayers,
    enSettingsStreaming,
    enSettingsAdvanced,
    enSettingsUi,
)

// Generar la inferencia estricta mediante intersección de todos los JSON base en inglés
type BaseMessages = typeof enCommon 
    & typeof enHome 
    & typeof enNavigation 
    & typeof enVideoPlayer 
    & typeof enFeatures 
    & typeof enMisc 
    & typeof enEntry 
    & typeof enManga 
    & typeof enExtensions 
    & typeof enAnilist 
    & typeof enGettingStarted 
    & typeof enChangelogTour 
    & typeof enSettingsGeneral 
    & typeof enSettingsLibrary 
    & typeof enSettingsPlayers 
    & typeof enSettingsStreaming 
    & typeof enSettingsAdvanced 
    & typeof enSettingsUi;

// Tipos auxiliares para extraer rutas en formato "padre.hijo"
type Join<K, P> = K extends string | number ? P extends string | number ? `${K}${"" extends P ? "" : "."}${P}` : never : never;

type Paths<T> = T extends object ? {
    [K in keyof T]-?: K extends string | number ? `${K}` | Join<K, Paths<T[K]>> : never
}[keyof T] : never;

// El tipo estricto de todas las keys permitidas
export type TranslationKeys = Paths<BaseMessages>;

type Messages = BaseMessages

// Construye el objeto de traducciones en español mergeando todos los archivos
const es = deepMerge(
    {},
    esCommon,
    esHome,
    esNavigation,
    esVideoPlayer,
    esFeatures,
    esMisc,
    esEntry,
    esManga,
    esExtensions,
    esAnilist,
    esGettingStarted,
    esChangelogTour,
    esSettingsGeneral,
    esSettingsLibrary,
    esSettingsPlayers,
    esSettingsStreaming,
    esSettingsAdvanced,
    esSettingsUi,
) as Messages

// ---------------------------------------------------------------------------

function flattenMessages(nestedMessages: Record<string, any>, prefix = ""): Record<string, string> {
    return Object.keys(nestedMessages).reduce((acc: Record<string, string>, key) => {
        const value = nestedMessages[key]
        const prefixedKey = prefix ? `${prefix}.${key}` : key

        if (typeof value === "string") {
            acc[prefixedKey] = value
        } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            Object.assign(acc, flattenMessages(value, prefixedKey))
        }
        return acc
    }, {})
}

const flatEn = flattenMessages(en)
const flatEs = flattenMessages(es)

const translations: Record<string, Record<string, string>> = {
    en: flatEn,
    es: flatEs,
}

const formattersCache = new Map<string, IntlMessageFormat>()

function interpolate(text: string, locale: string, params?: Record<string, any>): string {
    if (!params) return text

    try {
        const cacheKey = `${locale}:${text}`
        let formatter = formattersCache.get(cacheKey)
        if (!formatter) {
            formatter = new IntlMessageFormat(text, locale)
            formattersCache.set(cacheKey, formatter)
        }
        return formatter.format(params) as string
    } catch (e) {
        console.warn(`[i18n] Fallo al parsear sintaxis ICU para el texto: "${text}". Fallback a regex.`, e)
        return text.replace(/\{(\w+)\}/g, (_, key) => {
            const value = params[key]
            return value !== undefined ? String(value) : `{${key}}`
        })
    }
}

export function createTranslator(locale?: string) {
    const resolved = locale ?? defaultLocale
    const messages = translations[resolved] || translations.en

    return function t(key: TranslationKeys, params?: Record<string, any>): string {
        const translation = messages[key as string]

        if (translation) {
            return interpolate(translation, resolved, params)
        }

        const fallback = translations.en[key as string]
        if (fallback) {
            return interpolate(fallback, "en", params)
        }

        console.warn(`[i18n] Missing translation for key: ${key as string}`)
        return key as string
    }
}

export function useTranslation() {
    const t = useMemo(() => {
        return createTranslator()
    }, [])

    return { t }
}
