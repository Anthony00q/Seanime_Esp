import "./setup"
import fs from "node:fs"
import path from "node:path"
import { describe, expect, it, vi } from "vitest"
import { localeNames, localeRegistry, supportedLocales, setCurrentLocale, updateDocumentLocale } from "../config"
import { checkNativeLocaleRegistry } from "../../../scripts/locale-registry.mjs"
import { getDateFnsLocale } from "../date-locale"
import translations, { dateFnsLocales, resolveDatagridLocale } from "@/components/ui/datagrid/locales"
import { useMockBrowser } from "./browser"
import { repo } from "./catalogs"

useMockBrowser()
const languages = [...supportedLocales].sort()

it("keeps actual web/native catalog directories and the native type registered together", () => {
    const directory = path.join(repo, "seanime-web/src/locales")
    expect(fs.readdirSync(directory, { withFileTypes: true }).filter(e => e.isDirectory() && !e.name.startsWith("__")).map(e => e.name).sort()).toEqual(languages)
    const nativeDirectory = path.join(repo, "seanime-denshi/locales")
    expect(fs.readdirSync(nativeDirectory).filter(f => f.endsWith(".json")).map(f => f.slice(0, -5)).sort()).toEqual(languages)
    expect(() => checkNativeLocaleRegistry(repo)).not.toThrow()
    expect(Object.keys(localeNames).sort()).toEqual(languages)
})

describe.each(languages)("registered controls (%s)", locale => {
    it("has every DataGrid label and its date locale without English fallback", () => {
        setCurrentLocale(locale)
        expect(resolveDatagridLocale()).toBe(locale)
        expect(resolveDatagridLocale("__proto__")).toBe(locale)
        expect(resolveDatagridLocale("not-a-registered-locale")).toBe(locale)
        expect(resolveDatagridLocale("fr")).toBe("fr")
        expect(getDateFnsLocale().code).toBe(localeRegistry[locale].intlLocale)
        expect(dateFnsLocales[locale]?.code).toBe(localeRegistry[locale].intlLocale)
        for (const labels of Object.values(translations)) expect(labels[locale]?.trim()).toBeTruthy()
    })
    it("keeps the native name and document language in the common registry", () => {
        setCurrentLocale(locale)
        expect(localeNames[locale]).toBe(localeRegistry[locale].name)
        // Node suites do not need a DOM to check the accessibility metadata.
        const document = { documentElement: { lang: "" } }
        vi.stubGlobal("document", document)
        updateDocumentLocale()
        expect(document.documentElement.lang).toBe(localeRegistry[locale].htmlLang)
    })
})
