import { createTranslator } from "@/locales"

const t = createTranslator()

/**
 * Mapa de strings de error del backend Go → key de traducción.
 * El backend devuelve `err.Error()` literal (internal/handlers/response.go), de ahí el match exacto.
 * Mantener en sincronía con `locales/{es,en,pt}/modules/toasts.json`.
 * Espejo de `SERVER_TOAST_MAP` (misc-events.listeners.ts) para la ruta de errores HTTP.
 */
const SERVER_ERROR_MAP: Record<string, string> = {
    // Compartidos entre dominios
    "invalid id": "toast.serverErrors.common.invalidId",
    "missing arguments": "toast.serverErrors.common.missingArguments",
    "missing parameters": "toast.serverErrors.common.missingArguments",
    "missing required fields": "toast.serverErrors.common.missingRequiredFields",
    "destination not found": "toast.serverErrors.common.destinationNotFound",
    "destination must be an absolute path": "toast.serverErrors.common.destinationMustBeAbsolute",
    "destination path must be absolute": "toast.serverErrors.common.destinationMustBeAbsolute",
    "directory not found": "toast.serverErrors.common.directoryNotFound",
    "directory does not exist": "toast.serverErrors.common.directoryNotFound",
    "client session not found": "toast.serverErrors.common.clientSessionNotFound",

    // Registros y caché (internal/handlers/status.go)
    "cannot delete the newest log file": "toast.serverErrors.logs.cannotDeleteNewestLog",
    "invalid filename": "toast.serverErrors.logs.invalidFilename",
    "unsupported file extension": "toast.serverErrors.logs.unsupportedFileExtension",
    "failed to lookup memory profile": "toast.serverErrors.logs.failedToLookupMemoryProfile",
    "failed to lookup goroutine profile": "toast.serverErrors.logs.failedToLookupGoroutineProfile",

    // Ajustes (internal/handlers/settings.go)
    "library paths cannot be subdirectories of each other": "toast.serverErrors.settings.libraryPathsNested",
    "settings path is empty": "toast.serverErrors.settings.settingsPathEmpty",
    "interval must be at least 15 minutes": "toast.serverErrors.settings.intervalTooShort",

    // Cliente de torrent (internal/handlers/torrent_client.go)
    "could not start torrent client, verify your settings": "toast.serverErrors.torrentClient.couldNotStart",
    "could not contact torrent client, verify your settings or make sure it's running": "toast.serverErrors.torrentClient.couldNotContact",
    "smart select is not supported for multiple torrents": "toast.serverErrors.torrentClient.smartSelectMultiple",
    "Seanime torrent client is not active": "toast.serverErrors.torrentClient.notActive",
    "action is only available for the Seanime torrent client": "toast.serverErrors.torrentClient.actionOnlySeanime",

    // Debrid (internal/handlers/debrid.go + internal/debrid/*)
    "debrid settings not found": "toast.serverErrors.debrid.settingsNotFound",
    "debrid provider not set": "toast.serverErrors.debrid.providerNotSet",
    "debrid: Provider not set": "toast.serverErrors.debrid.providerNotSet",
    "not authenticated": "toast.serverErrors.debrid.notAuthenticated",
    "failed to authenticate": "toast.serverErrors.debrid.failedToAuthenticate",
    "stream interrupted": "toast.serverErrors.debrid.streamInterrupted",
    "no torrents found, please select manually": "toast.serverErrors.debrid.noTorrentsFound",

    // Descargas / updater (internal/handlers/download.go)
    "invalid version string": "toast.serverErrors.download.invalidVersionString",
    "verification code expired": "toast.serverErrors.download.verificationCodeExpired",
    "invalid verification code": "toast.serverErrors.download.invalidVerificationCode",
    "failed to download multiple files": "toast.serverErrors.download.failedMultiple",

    // Nakama (internal/handlers/nakama.go)
    "host is not sharing its anime library": "toast.serverErrors.nakama.hostNotSharing",
    "not connected to host": "toast.serverErrors.nakama.notConnectedToHost",
    "only hosts can create watch parties": "toast.serverErrors.nakama.onlyHostsCreate",
    "hosts cannot join watch parties": "toast.serverErrors.nakama.hostsCannotJoin",
    "not acting as host": "toast.serverErrors.nakama.notActingAsHost",

    // Streaming en línea (internal/handlers/onlinestream.go)
    "enable online streaming in the settings": "toast.serverErrors.onlinestream.enableInSettings",
}

// Regex/prefijo para mensajes con valores dinámicos. El orden importa: gana la primera coincidencia.
function translateDynamicServerError(err: string): string | null {
    const updateStatus = err.match(/^failed to download update: status (\d+)$/)
    if (updateStatus) {
        return t("toast.serverErrors.download.failedToUpdateStatus", { status: updateStatus[1] } as any)
    }
    if (err.startsWith("failed to download update:")) {
        const error = err.slice("failed to download update:".length).trim()
        return t("toast.serverErrors.download.failedToUpdate", { error } as any)
    }
    if (err.startsWith("invalid download URL:")) {
        const error = err.slice("invalid download URL:".length).trim()
        return t("toast.serverErrors.download.invalidDownloadUrl", { error } as any)
    }
    return null
}

/**
 * Traduce un string de error crudo del backend. Devuelve el mensaje SIN el prefijo "Error: "
 * (el llamador lo envuelve) o `null` si es desconocido → fallback al inglés.
 */
export function translateServerApiError(err: string): string | null {
    const trimmed = err.trim()
    if (!trimmed) return null

    const dynamic = translateDynamicServerError(trimmed)
    if (dynamic) return dynamic

    const key = SERVER_ERROR_MAP[trimmed]
    if (typeof key === "string") {
        const result = t(key as any)
        // Si la key no existe, t() devuelve la propia key → fallback silencioso al inglés.
        return result === key ? null : result
    }
    return null
}
