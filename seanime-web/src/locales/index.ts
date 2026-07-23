import { defaultLocale } from "./config"
import { isValidElement, useMemo } from "react"
import { IntlMessageFormat } from "intl-messageformat"

// --- Importaciones de secciones en inglés (modular) ---
import enCommon from "./en/common.json"
import enHome from "./en/home.json"
import enNavigation from "./en/navigation.json"
import enVideoPlayer from "./en/videoPlayer.json"
import enFeatures from "./en/features.json"
import enEntry from "./en/entry.json"
import enToasts from "./en/modules/toasts.json"
import enDownloader from "./en/modules/downloader.json"
import enLibrary from "./en/modules/library.json"
import enStreaming from "./en/modules/streaming.json"
import enPlayback from "./en/modules/playback.json"
import enUiStatus from "./en/modules/ui-status.json"
import enServices from "./en/modules/services.json"
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
import enSettingsLocale from "./en/settings/locale.json"

// --- Importaciones de secciones en español ---
import esCommon from "./es/common.json"
import esHome from "./es/home.json"
import esNavigation from "./es/navigation.json"
import esVideoPlayer from "./es/videoPlayer.json"
import esFeatures from "./es/features.json"
import esEntry from "./es/entry.json"
import esToasts from "./es/modules/toasts.json"
import esDownloader from "./es/modules/downloader.json"
import esLibrary from "./es/modules/library.json"
import esStreaming from "./es/modules/streaming.json"
import esPlayback from "./es/modules/playback.json"
import esUiStatus from "./es/modules/ui-status.json"
import esServices from "./es/modules/services.json"
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
import esSettingsLocale from "./es/settings/locale.json"

// --- Importaciones de secciones en portugués ---
import ptCommon from "./pt/common.json"
import ptHome from "./pt/home.json"
import ptNavigation from "./pt/navigation.json"
import ptVideoPlayer from "./pt/videoPlayer.json"
import ptFeatures from "./pt/features.json"
import ptEntry from "./pt/entry.json"
import ptToasts from "./pt/modules/toasts.json"
import ptDownloader from "./pt/modules/downloader.json"
import ptLibrary from "./pt/modules/library.json"
import ptStreaming from "./pt/modules/streaming.json"
import ptPlayback from "./pt/modules/playback.json"
import ptUiStatus from "./pt/modules/ui-status.json"
import ptServices from "./pt/modules/services.json"
import ptManga from "./pt/manga.json"
import ptExtensions from "./pt/extensions.json"
import ptAnilist from "./pt/anilist.json"
import ptGettingStarted from "./pt/gettingStarted.json"
import ptChangelogTour from "./pt/changelogTour.json"
import ptSettingsGeneral from "./pt/settings/general.json"
import ptSettingsLibrary from "./pt/settings/library.json"
import ptSettingsPlayers from "./pt/settings/players.json"
import ptSettingsStreaming from "./pt/settings/streaming.json"
import ptSettingsAdvanced from "./pt/settings/advanced.json"
import ptSettingsUi from "./pt/settings/ui.json"
import ptSettingsLocale from "./pt/settings/locale.json"

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
    enCommon, enHome, enNavigation, enVideoPlayer, enFeatures, enEntry,
    enToasts, enDownloader, enLibrary, enStreaming, enPlayback, enUiStatus, enServices,
    enManga, enExtensions, enAnilist, enGettingStarted, enChangelogTour, 
    enSettingsGeneral, enSettingsLibrary, enSettingsPlayers, enSettingsStreaming, 
    enSettingsAdvanced, enSettingsUi, enSettingsLocale
] as const;

const esModules = [
    esCommon, esHome, esNavigation, esVideoPlayer, esFeatures, esEntry,
    esToasts, esDownloader, esLibrary, esStreaming, esPlayback, esUiStatus, esServices,
    esManga, esExtensions, esAnilist, esGettingStarted, esChangelogTour, 
    esSettingsGeneral, esSettingsLibrary, esSettingsPlayers, esSettingsStreaming, 
    esSettingsAdvanced, esSettingsUi, esSettingsLocale
] as const;

const ptModules = [
    ptCommon, ptHome, ptNavigation, ptVideoPlayer, ptFeatures, ptEntry,
    ptToasts, ptDownloader, ptLibrary, ptStreaming, ptPlayback, ptUiStatus, ptServices,
    ptManga, ptExtensions, ptAnilist, ptGettingStarted, ptChangelogTour, 
    ptSettingsGeneral, ptSettingsLibrary, ptSettingsPlayers, ptSettingsStreaming, 
    ptSettingsAdvanced, ptSettingsUi, ptSettingsLocale
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

// Validación de paridad bidireccional
type CheckParity<TargetPaths, BasePaths = TranslationKeys> = 
    Exclude<BasePaths, TargetPaths> extends never 
    ? (Exclude<TargetPaths, BasePaths> extends never ? true : "Error: Keys extra en el idioma")
    : "Error: Faltan keys en el idioma";

type AssertParity<T extends true> = T;

// Validadores por idioma (Arroja TS2344 si hay disparidad con el inglés)
type _VerifyEs = AssertParity<CheckParity<Paths<EsMessages>>>;
type PtMessages = UnionToIntersection<typeof ptModules[number]>;
type _VerifyPt = AssertParity<CheckParity<Paths<PtMessages>>>;

function flattenAndMerge(...modules: readonly Record<string, any>[]) {
    const result: Record<string, string> = {};
    for (const mod of modules) {
        const flat = flattenMessages(mod);
        for (const key in flat) {
            if (key in result) {
                throw new Error(`[i18n] 💥 COLISIÓN DETECTADA: La key "${key}" está duplicada en múltiples archivos JSON. El sistema i18n abortará para proteger la integridad estructural.`);
            }
            result[key] = flat[key];
        }
    }
    return result;
}

// ---------------------------------------------------------------------------
// Diccionarios e inicialización diferida (Lazy Evaluation)

const languageModules: Record<string, readonly Record<string, any>[]> = {
    en: enModules,
    es: esModules,
    pt: ptModules,
};

const translationsCache: Record<string, Record<string, string>> = {};

function getTranslations(locale: string): Record<string, string> {
    if (!translationsCache[locale]) {
        const modules = languageModules[locale] || languageModules.en;
        translationsCache[locale] = flattenAndMerge(...modules);
    }
    return translationsCache[locale];
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

let defaultTranslator: ((key: TranslationKeys, params?: Record<string, any>) => string) | null = null;

export function createTranslator(locale?: string) {
    if (!locale && defaultTranslator) {
        return defaultTranslator;
    }

    const resolved = locale ?? defaultLocale
    
    // Carga diferida del idioma activo y el fallback (inglés)
    const messages = getTranslations(resolved)
    const fallbackMessages = getTranslations("en")

    function t(key: TranslationKeys, params?: Record<string, any>): string {
        const translation = messages[key as string]

        let safeParams = params;

        // Prevenir crashes de React por objetos crudos (Error #31)
        if (safeParams) {
            let paramsCloned = false;
            for (const k in safeParams) {
                const val = safeParams[k];
                if (val !== null && typeof val === 'object' && !Array.isArray(val) && !isValidElement(val)) {
                    if (!paramsCloned) {
                        safeParams = { ...safeParams };
                        paramsCloned = true;
                    }
                    console.warn(`[i18n] 🛡️ Prevención de crash: Se pasó un objeto crudo en el parámetro "${k}" para la key "${key}". Se convirtió a string.`);
                    safeParams[k] = val instanceof Error ? val.message : String(val);
                }
            }
        }

        if (translation) {
            return interpolate(translation, resolved, safeParams)
        }

        const fallback = fallbackMessages[key as string]
        if (fallback) {
            return interpolate(fallback, "en", safeParams)
        }

        console.warn(`[i18n] Missing translation for key: ${key as string}`)

        if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
            const missing: Map<string, number> = (window as any).__seanime_i18n_missingKeys ||= new Map()
            missing.set(key as string, (missing.get(key as string) || 0) + 1)
        }

        return key as string
    }

    if (!locale) {
        defaultTranslator = t;
    }

    return t;
}

export function useTranslation() {
    const t = useMemo(() => {
        return createTranslator()
    }, [])

    return { t }
}
