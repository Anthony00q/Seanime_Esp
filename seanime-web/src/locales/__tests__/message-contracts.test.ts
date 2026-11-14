import "./setup"
import fs from "node:fs"
import path from "node:path"
import { describe, expect, it, vi } from "vitest"
import { IntlMessageFormat } from "intl-messageformat"
import { generateContracts, messageArguments, normalizeContractSource } from "../../../scripts/message-contracts.mjs"
import { createTranslator, translateOptional } from "../index"
import { formatMessageText, renderMessageText } from "../message-format"
import { useMockBrowser } from "./browser"
import { repo, readCatalog } from "./catalogs"
import policy from "../message-policy.json"

useMockBrowser()

it("keeps generated contracts deterministic and current", () => {
    const generated = generateContracts()
    expect(generateContracts()).toBe(generated)
    expect(normalizeContractSource(fs.readFileSync(path.join(repo, "seanime-web/src/locales/message-params.generated.ts"), "utf8"))).toBe(generated)
    expect(normalizeContractSource(generated.replace(/\n/g, "\r\n"))).toBe(generated)
})

it("extracts nested typed arguments independently of interpolation order", () => {
    const ast = new IntlMessageFormat("{count} {count, plural, one {{mode, select, true {{time, date}} other {No}}} other {#}}", "en").getAst()
    expect(Object.fromEntries(messageArguments(ast))).toEqual({ count: "number", mode: "select", time: "date" })
    for (const text of ["{state} {state, select, true {On} other {Off}}", "{state, select, true {On} other {Off}} {state}"]) {
        expect(Object.fromEntries(messageArguments(new IntlMessageFormat(text, "en").getAst()))).toEqual({ state: "string" })
    }
    expect(Object.fromEntries(messageArguments(new IntlMessageFormat("{time, date} {time}", "en").getAst()))).toEqual({ time: "number" })
    expect(() => messageArguments(new IntlMessageFormat("{value, number} {value, select, other {Unknown}}", "en").getAst())).toThrow("Incompatible")
})

describe.each(["en", "es", "pt"] as const)("text boundary (%s)", locale => {
    it("renders the complete real catalog through the production engine", () => {
        const t = createTranslator(locale) as (key: string, params?: Record<string, unknown>) => string
        const literals = new Set<string>(policy.literalKeys)
        for (const [key, text] of Object.entries(readCatalog(locale))) {
            if (literals.has(key)) { expect(t(key), key).toBe(text); continue }
            const formatter = new IntlMessageFormat(text, locale)
            const args = messageArguments(formatter.getAst()) as Map<string, string>
            const params = Object.fromEntries([...args].map(([name, kind]) => [name, kind === "number" ? 2 : kind === "date" ? new Date(0) : "sample"]))
            expect(t(key, args.size ? params : undefined), key).toBe(formatter.format(params))
        }
    })
    it.each([undefined, {}, { count: "invalid" }, { count: NaN }, { count: Infinity }, { count: null }, { count: [] }])(
        "recovers from invalid plural parameters %j without exposing ICU", params => {
            vi.mocked(console.warn).mockImplementation(() => {})
            const t = createTranslator(locale)
            // @ts-expect-error Deliberately untyped inputs at the runtime boundary.
            const actual = t("manga.sourceRefresh.installedProviders", params)
            expect(actual).toBe(t("common.messages.translationUnavailable"))
            expect(actual).not.toMatch(/NaN|Infinity|\{|\}/)
        })

    it.each([true, ["a", "b"], { detail: "private data" }, null, undefined])("rejects non-text interpolation %j", error => {
        const warning = vi.mocked(console.warn).mockImplementation(() => {})
        const t = createTranslator(locale)
        // @ts-expect-error Arrays, booleans and arbitrary objects are not message text.
        const actual = t("toast.client.error", { error })
        expect(typeof actual).toBe("string")
        expect(actual).toBe(t("common.messages.translationUnavailable"))
        expect(warning.mock.calls.flat().join(" ")).not.toContain("private data")
    })

    it("resolves real boolean selects without requiring unselected branch parameters", () => {
        expect(formatMessageText("fixture", "{enabled, select, true {{name}} other {Off}}", locale, { enabled: false })).toBe("Off")
        expect(formatMessageText("fixture", "{enabled, select, true {{name}} other {Off}}", locale, { enabled: true, name: "OK" })).toBe("OK")
        expect(formatMessageText("fixture", "{enabled, select, true {On} other {Off}}", locale, { enabled: "constructor" })).toBe("Off")
    })

    it("interpolates socket placeholders rather than escaping their braces", () => {
        const value = createTranslator(locale)("settings.mediaPlayer.defaultSocket", { default: "/tmp/mpv.sock" })
        expect(value).toContain("'/tmp/mpv.sock'")
        expect(value).not.toContain("{default}")
    })

    it("keeps external provider names literal inside complete translated messages", () => {
        const t = createTranslator(locale)
        const provider = "Fansub {name} <custom>"
        expect(t("manga.chapterList.savedSourceUnavailableHelp", { provider })).toContain(provider)
    })
})

it("falls back to English only when the English message is actually usable", () => {
    vi.mocked(console.warn).mockImplementation(() => {})
    expect(renderMessageText("fixture", "es", "{n, plural, other {broken}", "Count: {n}", "unavailable", { n: 2 })).toBe("Count: 2")
    expect(renderMessageText("fixture", "es", "{n}", "Count: {n}", "unavailable")).toBe("unavailable")
})

it("preserves literal technical templates and rejects rich output", () => {
    expect(formatMessageText("settings.mediaPlayer.customSchemePlaceholder", "outplayer://{url}", "es")).toBe("outplayer://{url}")
    expect(() => formatMessageText("fixture", "<b>{name}</b>", "es", { name: "A", b: () => ({}) })).toThrow("Rich text")
})

it("preserves external values without creating missing-key warnings", () => {
    expect(translateOptional("anilist.formats.NEW_FORMAT", "NEW_FORMAT")).toBe("NEW_FORMAT")
    expect(translateOptional("constructor", "original")).toBe("original")
    expect(console.warn).not.toHaveBeenCalled()
})
