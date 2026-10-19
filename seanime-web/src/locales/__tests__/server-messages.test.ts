import "./setup"
import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { setCurrentLocale } from "../config"
import { translateServerApiError } from "@/lib/helpers/server-error"
import { translateServerMessage } from "@/lib/helpers/server-toast"
import { files, httpErrors, readCatalog, repo, toastExamples } from "./catalogs"
import { useMockBrowser } from "./browser"

useMockBrowser()
const errors = [...new Set(files(path.join(repo, "internal/handlers"), ".go").flatMap(file => httpErrors(fs.readFileSync(file, "utf8"))))]
const toasts = [...new Set(files(path.join(repo, "internal"), ".go").flatMap(file => toastExamples(fs.readFileSync(file, "utf8"))))]
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

describe("fork backend fixture discovery", () => {
    it("handles multiline calls and ignores comments without stripping URLs", () => {
        expect(httpErrors(`// RespondWithError(c, errors.New("ignored"))
            return h.RespondWithStatusError(
                c, http.StatusBadRequest, errors.New("invalid id"))
            return h.RespondWithError(c, errors.New("https://example.com"))`)).toEqual(["invalid id", "https://example.com"])
        expect(toastExamples(`/* SendEvent(events.ErrorToast, "ignored") */
            SendEvent(events.ErrorToast, fmt.Sprintf("debrid: failed: %v", err))`)).toEqual(["debrid: failed: 12"])
        expect(toastExamples('SendEventTo(m.clientId, events.ErrorToast, "Failed to retrieve playlist info")')).toEqual(["Failed to retrieve playlist info"])
    })
    it("discovers representative real handlers instead of an empty fixture list", () => {
        expect(errors).toContain("invalid id")
        expect(errors).toContain("missing torrent hash")
        expect(toasts).toContain("The AniList API is back online")
        expect(toasts).toContain("Failed to retrieve playlist info")
    })
})

describe.each(["en", "es", "pt"] as const)("fork HTTP adapters (%s)", locale => {
    const catalog = readCatalog(locale)
    const expected = new Set(Object.entries(catalog).filter(([key]) => key.startsWith("toast.serverErrors.")).map(([, value]) => value))
    it.each(errors)("returns a real catalog value for %s", message => {
        setCurrentLocale(locale)
        const actual = translateServerApiError(message)
        expect(typeof actual).toBe("string")
        expect(expected.has(actual!)).toBe(true)
        expect(Object.hasOwn(catalog, actual!)).toBe(false)
        expect(actual).not.toMatch(/\{[^}]+\}/)
    })
    it("keeps technical path details and translates the dynamic wrapper", () => {
        setCurrentLocale(locale)
        const template = catalog["toast.serverErrors.screenshots.openDirectoryFailed"]
        expect(translateServerApiError("failed to open screenshot directory: EACCES C:/Captures"))
            .toBe(template.replace("{error}", "EACCES C:/Captures"))
        expect(translateServerApiError("unknown error")).toBeNull()
        expect(translateServerApiError("constructor")).toBeNull()
    })
    it("keeps all fork screenshot error mappings exact", () => {
        setCurrentLocale(locale)
        for (const [message, key] of [
            ["filename must not contain a path", "filenameMustNotContainPath"],
            ["set a screenshot folder in settings first", "configureFolderFirst"],
            ["screenshots must be saved to the configured folder", "useConfiguredFolder"],
        ]) expect(translateServerApiError(message)).toBe(catalog[`toast.serverErrors.screenshots.${key}`])
    })
})

describe.each(["es", "pt"] as const)("fork WebSocket adapters (%s)", locale => {
    const catalog = readCatalog(locale)
    const patterns = Object.entries(catalog).filter(([key]) => key.startsWith("toast.")
        || ["entry.debridStream.sendingStream", "scanner.status.scanCompleted", "manga.chaptersAddedToDownloadQueue"].includes(key))
        .map(([, template]) => new RegExp(`^${template.split(/\{\w+\}/).map(escape).join("[\\s\\S]*")}$`))

    it.each(toasts)("returns localized text, never a raw key/ICU message: %s", message => {
        setCurrentLocale(locale)
        const actual = translateServerMessage(message)
        expect(actual).not.toBe(message)
        expect(Object.hasOwn(catalog, actual)).toBe(false)
        expect(actual).not.toMatch(/\{[^}]+\}/)
        expect(patterns.some(pattern => pattern.test(actual))).toBe(true)
    })

    it.each([
        ["Host did not return torrent stream start options", "missingTorrentParams"],
        ["Torrent streaming is not enabled", "torrentNotEnabled"],
        ["Host did not return onlinestream params", "missingOnlinestreamParams"],
    ])("preserves the exact Watch Party mapping for %s", (reason, key) => {
        setCurrentLocale(locale)
        expect(translateServerMessage(`Watch party: Failed to play media: ${reason}`)).toBe(catalog[`toast.watchParty.${key}`])
    })

    it("preserves unknown strings rather than inventing translations", () => {
        expect(translateServerMessage("unknown technical message")).toBe("unknown technical message")
        expect(translateServerMessage("toString")).toBe("toString")
    })
})
