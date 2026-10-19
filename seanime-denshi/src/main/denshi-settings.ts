import { app } from "electron"
import log from "electron-log/main"
import fs from "node:fs"
import path from "node:path"
import { resolveDenshiLocale, type DenshiLocale } from "./locale"

export type DenshiSettings = {
    minimizeToTray: boolean
    openInBackground: boolean
    openAtLaunch: boolean
    updateChannel: string
    windowBounds: Electron.Rectangle | null
    windowMaximized: boolean
    mpvPrismLogging: boolean
    locale: DenshiLocale
}

export const DENSHI_SETTINGS_DEFAULTS: DenshiSettings = {
    minimizeToTray: true,
    openInBackground: false,
    openAtLaunch: false,
    updateChannel: "github",
    windowBounds: null,
    windowMaximized: true,
    mpvPrismLogging: false,
    locale: "es",
}

function getDenshiSettingsPath(): string {
    return path.join(app.getPath("userData"), "denshi-settings.json")
}

export function loadDenshiSettings(): DenshiSettings {
    try {
        const settingsPath = getDenshiSettingsPath()
        if (fs.existsSync(settingsPath)) {
            const data = JSON.parse(fs.readFileSync(settingsPath, "utf-8"))
            return { ...DENSHI_SETTINGS_DEFAULTS, ...data, locale: resolveDenshiLocale(data?.locale) }
        }
    }
    catch (error) {
        log.error("[Denshi] Failed to load settings:", error)
    }
    return { ...DENSHI_SETTINGS_DEFAULTS }
}

export function saveDenshiSettings(settings: DenshiSettings): boolean {
    const settingsPath = getDenshiSettingsPath()
    const temporaryPath = `${settingsPath}.tmp`
    try {
        fs.writeFileSync(temporaryPath, JSON.stringify(settings, null, 2), "utf-8")
        fs.renameSync(temporaryPath, settingsPath)
        return true
    }
    catch (error) {
        log.error("[Denshi] Failed to save settings:", error)
        return false
    }
}
