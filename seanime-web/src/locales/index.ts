import { defaultLocale } from "./config"
import { isValidElement, useMemo } from "react"
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
import esSettingsGeneral from "./es/settings/general.json"
import esSettingsLibrary from "./es/settings/library.json"
import esSettingsPlayers from "./es/settings/players.json"
import esSettingsStreaming from "./es/settings/streaming.json"
import esSettingsAdvanced from "./es/settings/advanced.json"
import esSettingsUi from "./es/settings/ui.json"

// ---------------------------------------------------------------------------

function flattenMessages(nestedMessages: Record<string, any>, prefix = "", acc: Record<string, string> = {}): Record<string, string> {
    for (const key in nestedMessages) {
        if (Object.prototype.hasOwnProperty.call(nestedMessages, key)) {
            const value = nestedMessages[key];
            const prefixedKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === "string") {
                acc[prefixedKey] = value;
            } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
                flattenMessages(value, prefixedKey, acc);
            }
        }
    }
    return acc;
}

const enModules = [
    enCommon, enHome, enNavigation, enVideoPlayer, enFeatures, enMisc, enEntry, 
    enManga, enExtensions, enAnilist, enGettingStarted, enChangelogTour, 
    enSettingsGeneral, enSettingsLibrary, enSettingsPlayers, enSettingsStreaming, 
    enSettingsAdvanced, enSettingsUi
] as const;

const esModules = [
    esCommon, esHome, esNavigation, esVideoPlayer, esFeatures, esMisc, esEntry, 
    esManga, esExtensions, esAnilist, esGettingStarted, esChangelogTour, 
    esSettingsGeneral, esSettingsLibrary, esSettingsPlayers, esSettingsStreaming, 
    esSettingsAdvanced, esSettingsUi
] as const;

// Inferencia estricta de la intersección de todos los JSON base
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type BaseMessages = UnionToIntersection<typeof enModules[number]>;
type EsMessages = UnionToIntersection<typeof esModules[number]>;

// Tipos auxiliares para extraer rutas en formato "padre.hijo"
type Join<K, P> = K extends string | number ? P extends string | number ? `${K}${"" extends P ? "" : "."}${P}` : never : never;
type Paths<T> = T extends object ? {
    [K in keyof T]-?: K extends string | number ? `${K}` | Join<K, Paths<T[K]>> : never
}[keyof T] : never;

// El tipo estricto de todas las keys permitidas
export type TranslationKeys = Paths<BaseMessages>;

// Tipos para identificar rutas faltantes en caso de disparidad
type EnPaths = Paths<BaseMessages>;
type EsPaths = Paths<EsMessages>;
export type MissingInEn = Exclude<EsPaths, EnPaths>;
export type MissingInEs = Exclude<EnPaths, EsPaths>;

// Validación bidireccional (Falla con TS2344 si faltan keys)
type AssertParity<MissingEn extends never, MissingEs extends never> = true;
type _VerifyParity = AssertParity<MissingInEn, MissingInEs>;

function flattenAndMerge(...modules: readonly Record<string, any>[]) {
    const result: Record<string, string> = {};
    for (const mod of modules) {
        const flat = flattenMessages(mod);
        for (const key in flat) {
            if (key in result) {
                console.error(`[i18n] 💥 COLISIÓN DETECTADA: La key "${key}" está duplicada en múltiples archivos JSON.`);
            }
            result[key] = flat[key];
        }
    }
    return result;
}

const flatEn = flattenAndMerge(...enModules);
const flatEs = flattenAndMerge(...esModules);

// ---------------------------------------------------------------------------

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

        // Prevenir crashes de React por objetos crudos (Error #31)
        if (params) {
            for (const k in params) {
                const val = params[k];
                if (val !== null && typeof val === 'object' && !Array.isArray(val) && !isValidElement(val)) {
                    console.warn(`[i18n] 🛡️ Prevención de crash: Se pasó un objeto crudo en el parámetro "${k}" para la key "${key}". Se convirtió a string.`);
                    params[k] = val instanceof Error ? val.message : String(val);
                }
            }
        }

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
