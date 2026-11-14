import "./setup"
import { describe, expect, it, vi } from "vitest"
import { createTranslator } from "../index"
import { getCurrentLocale, isValidLocale, setCurrentLocale, updateDocumentLocale, type Locale } from "../config"
import { useMockBrowser } from "./browser"

const browser = useMockBrowser()

describe("fork locale engine", () => {
    it.each(["__proto__", "constructor", "toString", "fr", "", "pt-BR", null, undefined, ["en"], {}])("rejects invalid input %j", value => {
        expect(isValidLocale(value)).toBe(false)
    })

    it("keeps the cached translator dynamic and explicit translators static", () => {
        const t = createTranslator()
        const english = createTranslator("en")
        expect(createTranslator()).toBe(t)
        setCurrentLocale("pt")
        expect(t("common.buttons.save")).toBe("Salvar")
        expect(english("common.buttons.save")).toBe("Save")
        setCurrentLocale("es")
        expect(t("common.buttons.save")).toBe("Guardar")
    })

    it("uses Spanish for invalid saved/explicit locales", () => {
        browser().storage.set("seanime-locale", "__proto__")
        expect(getCurrentLocale()).toBe("es")
        expect(createTranslator("__proto__" as Locale)("common.buttons.save")).toBe("Guardar")
    })

    it("survives denied read and write access using memory only", () => {
        browser().localStorage.getItem.mockImplementation(() => { throw new Error("SecurityError") })
        browser().localStorage.setItem.mockImplementation(() => { throw new Error("SecurityError") })
        expect(getCurrentLocale()).toBe("es")
        expect(setCurrentLocale("pt")).toBe(false)
        expect(createTranslator()("common.buttons.save")).toBe("Salvar")
    })

    it("updates HTML accessibility language", () => {
        vi.stubGlobal("document", { documentElement: { lang: "en" } })
        setCurrentLocale("pt")
        updateDocumentLocale()
        expect(document.documentElement.lang).toBe("pt-BR")
    })

    it("sanitizes raw errors without modifying caller parameters", () => {
        const warning = vi.mocked(console.warn).mockImplementation(() => {})
        const params = { error: new Error("EACCES") }
        // @ts-expect-error Exercise the runtime boundary for callers outside TypeScript.
        expect(createTranslator("es")("toast.client.error", params)).toBe("Error: EACCES")
        // @ts-expect-error Explicit and dynamic translators must have the same recovery.
        expect(createTranslator()("toast.client.error", params)).toBe("Error: EACCES")
        expect(params.error).toBeInstanceOf(Error)
        expect(warning).toHaveBeenCalledTimes(2)
    })
})

describe.each([
    { locale: "en", forms: ["0 installed providers", "1 installed provider", "2 installed providers"] },
    { locale: "es", forms: ["0 proveedores instalados", "1 proveedor instalado", "2 proveedores instalados"] },
    { locale: "pt", forms: ["0 provedores instalados", "1 provedor instalado", "2 provedores instalados"] },
] as const)("ICU ($locale)", ({ locale, forms }) => {
    it.each([0, 1, 2])("renders the expected grammatical form for %i", count => {
        expect(createTranslator(locale)("manga.sourceRefresh.installedProviders", { count })).toBe(forms[count])
    })

    it("interpolates a nested resource only in its selected branch", () => {
        const t = createTranslator(locale)
        const withResource = t("extensions.prompt.request", { extension: "Example", hasResource: true, resource: "C:/Anime" })
        const withoutResource = t("extensions.prompt.request", { extension: "Example", hasResource: false, resource: "C:/Anime" })
        expect(withResource).toContain('"C:/Anime"')
        expect(withoutResource).not.toContain("C:/Anime")
        for (const message of [withResource, withoutResource]) expect(message).not.toMatch(/\{[^}]+\}/)
    })
})
