import fs from "node:fs"
import path from "node:path"

import { denshiLocales, type DenshiLocale } from "./locale-registry.generated"

export { denshiLocales, type DenshiLocale } from "./locale-registry.generated"

type DenshiStrings = {
    tray: { toggleVisibility: string; removeFromDock: string; quit: string }
    error: { title: string; uncaughtException: string; checkLogs: string; mpvCoreStartFailed: string }
    logging: { restartNow: string; later: string; restartRequired: string; restartMessage: string }
    startup: { starting: string }
}

const fallback: DenshiStrings = require("../../locales/es.json")

export function isDenshiLocale(value: unknown): value is DenshiLocale {
    return typeof value === "string" && (denshiLocales as readonly string[]).includes(value)
}

export function resolveDenshiLocale(value: unknown): DenshiLocale {
    return isDenshiLocale(value) ? value : "es"
}

export function loadDenshiStrings(appPath: string, locale: unknown): DenshiStrings {
    const result: DenshiStrings = structuredClone(fallback)
    try {
        const data = JSON.parse(fs.readFileSync(path.join(appPath, "locales", `${resolveDenshiLocale(locale)}.json`), "utf8"))
        for (const section of Object.keys(result) as (keyof DenshiStrings)[]) {
            const target = result[section] as Record<string, string>
            for (const key of Object.keys(target)) {
                if (Object.prototype.hasOwnProperty.call(data?.[section] || {}, key)
                    && typeof data[section][key] === "string" && data[section][key].trim()) {
                    target[key] = data[section][key]
                }
            }
        }
    } catch {
        // The packaged Spanish catalog is the emergency fallback for missing/corrupt files.
    }
    return result
}
