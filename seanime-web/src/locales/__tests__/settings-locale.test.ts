import { describe, expect, it } from "vitest"
import { isLocaleOnlySettingsChange } from "@/lib/helpers/settings-locale"
import { settingsSchema } from "@/lib/server/settings"
import { supportedLocales } from "../config"

const defaults = {
    defaultPlayer: "mpv",
    mediaPlayerHost: "localhost",
    vlcPort: 8080,
    mpcPort: 13579,
    qbittorrentPort: 8080,
    locale: "es",
}

describe("settings locale-only save notification", () => {
    it.each(supportedLocales.filter(locale => locale !== "es"))("silences a language-only change to %s, including schema defaults", locale => {
        const values = settingsSchema.parse({ ...defaults, locale })
        expect(isLocaleOnlySettingsChange(values, defaults, "es")).toBe(true)
    })

    it("keeps the notification when another setting changes", () => {
        expect(isLocaleOnlySettingsChange({ ...defaults, locale: "pt", enableManga: false }, defaults, "es")).toBe(false)
    })

    it("keeps the notification for spoiler and native update channel changes", () => {
        for (const change of [{ hideAnimeSpoilers: true }, { updateChannel: "nightly" }]) {
            expect(isLocaleOnlySettingsChange({ ...defaults, locale: "pt", ...change }, defaults, "es")).toBe(false)
        }
    })

    it("compares arrays by value and notices changed contents", () => {
        const initial = { ...defaults, libraryPaths: ["C:/Anime"], nakamaHostUnsharedAnimeIds: [1, 2] }
        const submitted = { ...initial, locale: "pt", libraryPaths: ["C:/Anime"], nakamaHostUnsharedAnimeIds: [1, 2] }
        expect(isLocaleOnlySettingsChange(submitted, initial, "es")).toBe(true)
        expect(isLocaleOnlySettingsChange({ ...submitted, libraryPaths: ["D:/Anime"] }, initial, "es")).toBe(false)
    })

    it("silences the notification after another setting is changed and restored", () => {
        const values = { ...defaults, locale: "pt", enableManga: false }
        values.enableManga = true
        expect(isLocaleOnlySettingsChange(values, defaults, "es")).toBe(true)
    })

    it("uses the active locale rather than a possibly pending default locale", () => {
        expect(isLocaleOnlySettingsChange({ ...defaults, locale: "pt" }, { ...defaults, locale: "pt" }, "es")).toBe(true)
    })

    it.each(["es", "", "invalid", undefined])("keeps normal notifications without a valid language change (%s)", locale => {
        expect(isLocaleOnlySettingsChange({ ...defaults, locale }, defaults, "es")).toBe(false)
    })

    it("fails safely when the baseline or submission cannot be validated", () => {
        expect(isLocaleOnlySettingsChange({ ...defaults, locale: "pt" }, undefined, "es")).toBe(false)
        expect(isLocaleOnlySettingsChange({}, defaults, "es")).toBe(false)
    })
})
