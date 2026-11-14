import { createTranslator, type TranslationKeyWithoutParams } from "@/locales"

const t = createTranslator()

/**
 * Mapa de strings de error del backend Go → key de traducción.
 * El backend devuelve `err.Error()` literal (internal/handlers/response.go), de ahí el match exacto.
 * Mantener en sincronía con `locales/{es,en,pt}/modules/toasts.json`.
 * Espejo de `SERVER_TOAST_MAP` (server-toast.ts) para la ruta de errores HTTP.
 */
const SERVER_ERROR_MAP: Readonly<Record<string, TranslationKeyWithoutParams>> = {
    "list entry not found": "toast.serverErrors.validation.listEntryNotFound",
    "error: Anilist responded with an error, this is most likely a rate limit issue": "toast.serverErrors.validation.anilistRateLimit",
    "error: Anilist responded with an error, wait one minute before refreshing": "toast.serverErrors.validation.anilistWait",
    "no local files found for media id": "toast.serverErrors.validation.noMediaFiles",
    "local file not found": "toast.serverErrors.validation.localFileNotFound",
    "no local files found for selected directory": "toast.serverErrors.validation.noDirectoryFiles",
    "destination is required": "toast.serverErrors.validation.destinationRequired",
    "media id is required": "toast.serverErrors.validation.mediaIdRequired",
    "invalid rule": "toast.serverErrors.validation.invalidRule",
    "profile name is required": "toast.serverErrors.validation.profileNameRequired",
    "invalid profile id": "toast.serverErrors.validation.invalidProfileId",
    "provider extension not found": "toast.serverErrors.validation.providerExtensionNotFound",
    "dummy debrid is disabled": "toast.serverErrors.validation.dummyDebridDisabled",
    "dummy debrid settings not found": "toast.serverErrors.validation.dummyDebridSettingsNotFound",
    "no local files found": "toast.serverErrors.validation.noLocalFiles",
    "mediaId and progress is required": "toast.serverErrors.validation.mediaProgressRequired",
    "invalid media id": "toast.serverErrors.validation.invalidMediaId",
    "invalid manga source refresh mode": "toast.serverErrors.validation.invalidRefreshMode",
    "provider and manga id are required": "toast.serverErrors.validation.providerMangaRequired",
    "manga: Local provider not found": "toast.serverErrors.validation.localProviderNotFound",
    "media streaming settings not found": "toast.serverErrors.validation.mediastreamSettingsNotFound",
    "message cannot be empty": "toast.serverErrors.validation.messageRequired",
    "unavailable": "toast.serverErrors.validation.unavailable",
    "self-updating is not supported on mobile platforms": "toast.serverErrors.validation.mobileUpdateUnsupported",
    "UNAUTHENTICATED": "toast.serverErrors.debrid.notAuthenticated",
    "torrent streaming settings not found": "toast.serverErrors.validation.torrentstreamSettingsNotFound",
    "missing torrent hash": "toast.serverErrors.validation.missingTorrentHash",
    "destination path is not a library path": "toast.serverErrors.validation.destinationNotLibrary",
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
    "filename must not contain a path": "toast.serverErrors.screenshots.filenameMustNotContainPath",
    "set a screenshot folder in settings first": "toast.serverErrors.screenshots.configureFolderFirst",
    "screenshots must be saved to the configured folder": "toast.serverErrors.screenshots.useConfiguredFolder",
}

// Regex/prefijo para mensajes con valores dinámicos. El orden importa: gana la primera coincidencia.
function translateDynamicServerError(err: string): string | null {
    const screenshotDirectory = err.match(/^failed to open screenshot directory: ([\s\S]+)$/)
    if (screenshotDirectory) {
        return t("toast.serverErrors.screenshots.openDirectoryFailed", { error: screenshotDirectory[1] })
    }
    const updateStatus = err.match(/^failed to download update: status (\d+)$/)
    if (updateStatus) {
        return t("toast.serverErrors.download.failedToUpdateStatus", { status: Number(updateStatus[1]) })
    }
    if (err.startsWith("failed to download update:")) {
        const error = err.slice("failed to download update:".length).trim()
        return t("toast.serverErrors.download.failedToUpdate", { error })
    }
    if (err.startsWith("invalid download URL:")) {
        const error = err.slice("invalid download URL:".length).trim()
        return t("toast.serverErrors.download.invalidDownloadUrl", { error })
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
        const result = t(key)
        // Si la key no existe, t() devuelve la propia key → fallback silencioso al inglés.
        return result === key ? null : result
    }
    return null
}
