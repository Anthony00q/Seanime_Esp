import "./setup"
import { afterEach, expect, it, vi } from "vitest"
import registry from "../registry.json"

afterEach(() => {
    vi.doUnmock("../registry.json")
    vi.resetModules()
})

it("derives selection, validation, storage and HTML language for a fourth regional locale", async () => {
    vi.resetModules()
    vi.doMock("../registry.json", () => ({
        default: { ...registry, "fr-CA": { name: "Français canadien", intlLocale: "fr-CA", htmlLang: "fr-CA" } },
    }))
    const storage = new Map<string, string>()
    vi.stubGlobal("window", {
        localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) },
    })
    vi.stubGlobal("document", { documentElement: { lang: "" } })
    const config = await import("../config")
    expect(config.supportedLocales).toHaveLength(4)
    expect(config.supportedLocales).toContain("fr-CA")
    expect(config.localeNames).toHaveProperty("fr-CA", "Français canadien")
    expect(config.isValidLocale("fr-CA")).toBe(true)
    expect(config.isValidLocale("../fr-CA")).toBe(false)
    // The fixture adds a runtime locale without changing the production type union.
    expect((config.setCurrentLocale as (value: string) => boolean)("fr-CA")).toBe(true)
    expect(config.getCurrentLocale()).toBe("fr-CA")
    expect(storage.get("seanime-locale")).toBe("fr-CA")
    config.updateDocumentLocale()
    expect(document.documentElement.lang).toBe("fr-CA")
    const { formatMessageText } = await import("../message-format")
    expect(formatMessageText("fixture", "{value, number}", "fr-CA", { value: 12345.6 }))
        .toBe(new Intl.NumberFormat("fr-CA").format(12345.6))
})

it("uses registry regional plural rules consistently for validation and rendering", async () => {
    vi.resetModules()
    vi.doMock("../registry.json", () => ({
        default: { ...registry, pt: { ...registry.pt, intlLocale: "pt-PT" } },
    }))
    const { formatMessageText } = await import("../message-format")
    // Portuguese from Portugal selects other for zero; Brazil selects one.
    // Missing 'name' must only be checked if the one branch is actually selected.
    expect(formatMessageText("fixture", "{count, plural, one {{name}} other {plural}}", "pt", { count: 0 })).toBe("plural")
})
