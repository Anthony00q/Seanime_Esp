import "./setup"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { beforeEach, afterEach, describe, expect, it } from "vitest"
import { auditTranslations } from "../../../scripts/i18n-audit.mjs"
import { repo } from "./catalogs"
import { generateNativeLocaleRegistry, readLocaleRegistry, checkNativeLocaleRegistry } from "../../../scripts/locale-registry.mjs"

let root: string
const localeFile = (locale: string) => path.join(root, "seanime-web/src/locales", locale, "common.json")
const indexFile = () => path.join(root, "seanime-web/src/locales/index.ts")
const sourceFile = () => path.join(root, "seanime-web/src/component.tsx")
const registryFile = () => path.join(root, "seanime-web/src/locales/registry.json")
const nativeRegistryFile = () => path.join(root, "seanime-denshi/src/main/locale-registry.generated.ts")
const datesFile = () => path.join(root, "seanime-web/src/locales/date-locale.ts")
const gridFile = () => path.join(root, "seanime-web/src/components/ui/datagrid/locales.ts")
const regenerateNative = () => write(nativeRegistryFile(), generateNativeLocaleRegistry(root))
const translatorSource = (body: string) => `import { createTranslator } from "@/locales"; const t = createTranslator(); ${body}`
const write = (file: string, text: string) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text) }
const mutate = (locale: string, change: (value: any) => void) => {
    const data = JSON.parse(fs.readFileSync(localeFile(locale), "utf8"))
    change(data)
    write(localeFile(locale), JSON.stringify(data))
}
const rejects = (fragment: string) => expect(auditTranslations({ root }).errors.some((error: string) => error.includes(fragment))).toBe(true)

function addFixtureLocale(code = "fr", intlLocale = "fr") {
    const registry = readLocaleRegistry(root)
    registry[code] = { name: "Fixture", intlLocale, htmlLang: intlLocale }
    write(registryFile(), JSON.stringify(registry))
    write(localeFile(code), fs.readFileSync(localeFile("en"), "utf8"))
    write(path.join(root, "seanime-denshi/locales", `${code}.json`),
        fs.readFileSync(path.join(root, "seanime-denshi/locales/en.json"), "utf8"))
    write(indexFile(), fs.readFileSync(indexFile(), "utf8")
        .replace("const languageModules", `import fixtureCommon from "./${code}/common.json";\nconst fixtureModules = [fixtureCommon] as const;\nconst languageModules`)
        .replace("pt: ptModules }", `pt: ptModules, "${code}": fixtureModules }`))
    write(datesFile(), fs.readFileSync(datesFile(), "utf8").replace("pt: ptBR }", `pt: ptBR, "${code}": fixtureDate }`))
    if (code !== "fr") {
        write(gridFile(), fs.readFileSync(gridFile(), "utf8")
            .replace("pt: ptBR, fr }", `pt: ptBR, fr, "${code}": fixtureDate }`)
            .replace('fr: "Filtres" }', `fr: "Filtres", "${code}": "Fixture" }`))
    }
    regenerateNative()
}

beforeEach(() => {
    const temporary = process.platform === "win32" ? path.join(os.tmpdir(), "seanime-i18n") : os.tmpdir()
    fs.mkdirSync(temporary, { recursive: true })
    root = fs.mkdtempSync(path.join(temporary, "fork-i18n-audit-"))
    write(registryFile(), JSON.stringify({
        en: { name: "English", intlLocale: "en-US", htmlLang: "en" },
        es: { name: "Español", intlLocale: "es", htmlLang: "es" },
        pt: { name: "Português", intlLocale: "pt-BR", htmlLang: "pt-BR" },
    }))
    regenerateNative()
    write(path.join(root, "seanime-web/src/locales/message-policy.json"),
        fs.readFileSync(path.join(repo, "seanime-web/src/locales/message-policy.json"), "utf8"))
    write(datesFile(), "const DATE_FNS_LOCALES = { en: enUS, es, pt: ptBR };")
    write(gridFile(), `const dateFnsLocales = { en: enUS, es, pt: ptBR, fr };
        export default { filters: { en: "Filters", es: "Filtros", pt: "Filtros", fr: "Filtres" } };`)
    for (const locale of ["en", "es", "pt"]) {
        write(localeFile(locale), JSON.stringify({ common: {
            greet: "Hello {name}",
            count: `{count, plural, ${locale === "pt" ? "=0 {# items} " : ""}one {# item} other {# items}}`,
            mode: "{state, select, enabled {On} disabled {Off} other {Unknown}}",
        } }))
        write(path.join(root, "seanime-denshi/locales", `${locale}.json`), JSON.stringify({ tray: { quit: "Quit" } }))
    }
    write(indexFile(), [
        ...["en", "es", "pt"].map(locale => `import ${locale}Common from "./${locale}/common.json";`),
        ...["en", "es", "pt"].map(locale => `const ${locale}Modules = [${locale}Common] as const;`),
        "const languageModules = { en: enModules, es: esModules, pt: ptModules };",
    ].join("\n"))
    write(sourceFile(), 'import { createTranslator } from "@/locales"; const t = createTranslator(); t("common.greet", { name: "A" });')
})

afterEach(() => { fs.rmSync(root, { recursive: true, force: true }) }) // only this test's mkdtemp directory

describe("fork auditor accepts valid input", () => {
    it("checks actual registrations, ICU variants and native parity", () => {
        const result = auditTranslations({ root })
        expect(result.errors).toEqual([])
        expect(result.keyCount).toBe(3)
        expect(result.formatChecks).toBeGreaterThan(30)
    })
    it("does not treat comments as calls or literal templates as interpolation", () => {
        write(sourceFile(), '// t("not.a.key")\n/* t("common.greet") */')
        expect(auditTranslations({ root }).errors).toEqual([])
    })
    it("preserves the explicit technical-template exception", () => {
        for (const locale of ["en", "es", "pt"]) mutate(locale, data => {
            data.extensions = { addModal: { repoPlaceholder: "https://example.com/{user}" } }
        })
        write(sourceFile(), translatorSource('t("extensions.addModal.repoPlaceholder");'))
        expect(auditTranslations({ root }).errors).toEqual([])
    })
    it("ignores unrelated functions and imports named like translators", () => {
        write(sourceFile(), `
            import { createTranslator as unrelatedFactory } from "some-library";
            function t(value: string) { return value }
            const tr = unrelatedFactory();
            const tx = (value: string) => value;
            t("not.a.key"); tr("not.a.key"); tx("not.a.key");
            function createTranslator() { return tx }
            const other = createTranslator(); other("not.a.key");
        `)
        expect(auditTranslations({ root }).errors).toEqual([])
    })
    it("respects parameter and block bindings that shadow a real translator", () => {
        write(sourceFile(), translatorSource(`
            function callback(t: (value: string) => string) { t("not.a.key") }
            { const t = (value: string) => value; t("not.a.key") }
            t("common.greet", { name: "A" });
        `))
        expect(auditTranslations({ root }).errors).toEqual([])
    })
    it("respects a local factory that shadows the imported factory", () => {
        write(sourceFile(), `
            import { createTranslator } from "@/locales";
            function callback(createTranslator: () => (value: string) => string) {
                const t = createTranslator(); t("not.a.key");
            }
        `)
        expect(auditTranslations({ root }).errors).toEqual([])
    })
    it("allows reordering and repeating select clauses and locale-specific plural categories", () => {
        mutate("es", data => {
            data.common.mode = "{state, select, other {Desconocido} disabled {No} enabled {Sí}} {state, select, enabled {Activo} other {Desconocido} disabled {Inactivo}}"
        })
        mutate("pt", data => {
            data.common.count = "{count, plural, =0 {# itens} one {# item} many {# itens} other {# itens}}"
        })
        expect(auditTranslations({ root }).errors).toEqual([])
    })
    it.each(["2 as number", "(2 as number)!", "2 satisfies number"])("accepts numeric values wrapped in TypeScript: %s", value => {
        write(sourceFile(), translatorSource(`t("common.count", { count: ${value} });`))
        expect(auditTranslations({ root }).errors).toEqual([])
    })
})

describe("fork auditor rejects deliberate defects", () => {
    it("detects malformed JSON", () => { write(localeFile("es"), "{invalid"); rejects("es/common.json") })
    it("detects duplicate JSON keys before their values are lost", () => {
        write(localeFile("es"), '{"common":{"greet":"A","greet":"B"}}')
        rejects("duplicate JSON key greet")
    })
    it("detects collisions between catalogs", () => {
        write(path.join(path.dirname(localeFile("en")), "extra.json"), '{"common":{"greet":"Duplicate"}}')
        rejects("catalog collision")
    })
    it("detects missing keys and non-string leaves", () => {
        mutate("es", data => { delete data.common.greet; data.common.count = 7 })
        rejects("file/key structure")
        rejects("Non-string translation")
    })
    it("rejects malformed ICU", () => { mutate("es", data => { data.common.mode = "{state, select, enabled {On}}" }); rejects("MISSING_OTHER_CLAUSE") })
    it("compares nested ICU variables, not just the outer select", () => {
        mutate("es", data => { data.common.mode = "{state, select, enabled {{renamed}} other {Off}}" })
        rejects("ICU argument names/types")
    })
    it.each([
        "{state, select, activado {Sí} disabled {No} other {Desconocido}}",
        "{state, select, enabled {Sí} other {Desconocido}}",
        "{state, select, enabled {Sí} disabled {No} extra {Extra} other {Desconocido}}",
    ])("rejects renamed, missing or added select options: %s", message => {
        mutate("es", data => { data.common.mode = message })
        rejects("ICU select options differ")
    })
    it("compares nested select options inside locale-dependent plurals", () => {
        for (const locale of ["en", "es", "pt"]) mutate(locale, data => {
            const select = `{state, select, ${locale === "es" ? "activado" : "enabled"} {On} other {Off}}`
            data.common.mode = `{count, plural, ${locale === "pt" ? `=0 {${select}} ` : ""}one {${select}} other {${select}}}`
        })
        rejects("es:common.mode: ICU select options differ")
        expect(auditTranslations({ root }).errors.some((error: string) => error.startsWith("pt:"))).toBe(false)
    })
    it("does not merge different option sets for the same select argument", () => {
        for (const locale of ["en", "es", "pt"]) mutate(locale, data => {
            data.common.mode = locale === "es"
                ? "{state, select, enabled {On} disabled {Off} other {Unknown}}"
                : "{state, select, enabled {On} other {Unknown}} {state, select, disabled {Off} other {Unknown}}"
        })
        rejects("ICU select options differ")
    })
    it("exercises non-boolean branches instead of always formatting other", () => {
        mutate("en", data => { data.common.mode = "{state, select, enabled {<b>On</b>} other {Off}}" })
        rejects('"b"')
    })
    it("requires Portuguese zero plurals", () => {
        mutate("pt", data => { data.common.count = "{count, plural, one {# item} other {# items}}" })
        rejects("requires an explicit =0")
    })
    it("detects a catalog imported but omitted from its module array", () => {
        write(indexFile(), fs.readFileSync(indexFile(), "utf8").replace("[enCommon]", "[]"))
        rejects("Unregistered or repeated catalog: en/common.json")
    })
    it("does not accept a commented-out import as registration", () => {
        write(indexFile(), fs.readFileSync(indexFile(), "utf8").replace("import enCommon", "// import enCommon"))
        rejects("Unregistered or repeated catalog: en/common.json")
    })
    it("detects a repeated catalog in a module array", () => {
        write(indexFile(), fs.readFileSync(indexFile(), "utf8").replace("[enCommon]", "[enCommon, enCommon]"))
        rejects("Unregistered or repeated catalog")
    })
    it.each([
        ['t("missing.key")', "unknown translation key"],
        ['t("common.greet")', "requires name"],
        ['t("common.greet", { wrong: "A" })', "missing argument name"],
        ['t("common.count", { count: "2" })', "must be numeric"],
        ['t("common.count", { count: String(2) })', "must be numeric"],
        ['t("common.count", { count: false })', "must be numeric"],
        ['t("common.count", { count: null })', "must be numeric"],
        ['t("common.count", { count: "2" as any })', "must be numeric"],
        ['t("common.count", { count: (("2" as unknown) as number)! })', "must be numeric"],
        ['t("common.count", { count: "2" satisfies string })', "must be numeric"],
        ['t("common.count", { count: String(2) as any })', "must be numeric"],
        ['t("common.count", { count: (2).toLocaleString() as any })', "must be numeric"],
        ['t("common.count", { count: (false as unknown) as number })', "must be numeric"],
    ])("rejects bad source call %s", (call, diagnostic) => {
        write(sourceFile(), translatorSource(`${call};`))
        rejects(diagnostic)
    })
    it("unwraps angle-bracket type assertions in non-JSX source", () => {
        write(sourceFile().replace(/\.tsx$/, ".ts"), translatorSource('t("common.count", { count: <number><unknown>"2" });'))
        rejects("must be numeric")
    })
    it.each(["t", "tr", "tx", "translate"])("recognizes actual translator bindings regardless of name: %s", name => {
        write(sourceFile(), `import { createTranslator } from "@/locales"; const ${name} = createTranslator(); ${name}("common.greet");`)
        rejects("requires name")
    })
    it.each(["./locales", "./locales/index", "./locales/index.ts"])("recognizes relative locale imports: %s", source => {
        write(sourceFile(), `import { createTranslator } from "${source}"; const t = createTranslator(); t("common.greet");`)
        rejects("requires name")
    })
    it("checks the real binding after leaving a scope with a shadowed translator", () => {
        write(sourceFile(), translatorSource(`
            function callback(t: (value: string) => string) { t("not.a.key") }
            t("common.greet");
        `))
        const errors = auditTranslations({ root }).errors
        expect(errors).toHaveLength(1)
        expect(errors[0]).toContain("requires name")
    })
    it("recognizes namespace imports and directly invoked translator factories", () => {
        write(sourceFile(), `import * as locales from "@/locales"; const t = locales.createTranslator(); t("common.greet");`)
        rejects("requires name")
        write(sourceFile(), 'import { createTranslator } from "@/locales"; createTranslator()("common.greet");')
        rejects("requires name")
    })
    it("recognizes a renamed translator factory and instance", () => {
        write(sourceFile(), 'import {createTranslator as make} from "@/locales"; const translate = make(); translate("common.greet");')
        rejects("requires name")
    })
    it("validates native parity as well as web catalogs", () => {
        write(path.join(root, "seanime-denshi/locales/pt.json"), '{"tray":{}}')
        rejects("Denshi pt: key parity failed")
    })
    it("makes the CLI exit nonzero on a real failing fixture", () => {
        mutate("pt", data => { delete data.common.greet })
        const result = spawnSync(process.execPath, [path.join(repo, "seanime-web/scripts/i18n-audit.mjs"), "--root", root], { encoding: "utf8" })
        expect(result.status).toBe(1)
        expect(result.stderr).toContain("file/key structure")
    })
})

describe("registry-driven expansion in isolated fixtures", () => {
    it("audits a fourth language automatically, including its actual module and controls registrations", () => {
        addFixtureLocale()
        const result = auditTranslations({ root })
        expect(result.errors).toEqual([])
        expect(result.languages).toEqual(["en", "es", "fr", "pt"])
        expect(result.formatChecks).toBeGreaterThan(40)
    })
    it("preserves regional locale codes rather than truncating them", () => {
        addFixtureLocale("fr-CA", "fr-CA")
        expect(auditTranslations({ root }).errors).toEqual([])
        expect(generateNativeLocaleRegistry(root)).toContain('"fr-CA"')
    })
    it("allows a fourth language to use its own plural categories", () => {
        addFixtureLocale("ru", "ru")
        mutate("ru", data => { data.common.count = "{count, plural, one {# файл} few {# файла} many {# файлов} other {# файла}}" })
        expect(auditTranslations({ root }).errors).toEqual([])
    })
    it("compares missing and extra keys in the fourth language against English", () => {
        addFixtureLocale()
        mutate("fr", data => { delete data.common.greet; data.common.extra = "Extra" })
        rejects("fr: file/key structure differs")
    })
    it("detects renamed ICU arguments in the fourth language", () => {
        addFixtureLocale()
        mutate("fr", data => { data.common.greet = "Bonjour {renamed}" })
        rejects("fr:common.greet: ICU argument names/types")
    })
    it("detects changed select options in the fourth language", () => {
        addFixtureLocale()
        mutate("fr", data => { data.common.mode = "{state, select, changed {On} other {Off}}" })
        rejects("fr:common.mode: ICU select options differ")
    })
    it("detects duplicate JSON keys and cross-file collisions in the fourth language", () => {
        addFixtureLocale()
        write(localeFile("fr"), '{"common":{"greet":"A","greet":"B"}}')
        write(path.join(path.dirname(localeFile("fr")), "extra.json"), '{"common":{"greet":"Collision"}}')
        rejects("duplicate JSON key greet")
        rejects("fr:common.greet: catalog collision")
    })
    it("rejects a fourth catalog omitted from its module array", () => {
        addFixtureLocale()
        write(indexFile(), fs.readFileSync(indexFile(), "utf8").replace("[fixtureCommon]", "[]"))
        rejects("Unregistered or repeated catalog: fr/common.json")
    })
    it("rejects a fourth catalog repeated in its module array", () => {
        addFixtureLocale()
        write(indexFile(), fs.readFileSync(indexFile(), "utf8").replace("[fixtureCommon]", "[fixtureCommon, fixtureCommon]"))
        rejects("Unregistered or repeated catalog: fr/common.json")
    })
    it("rejects a fourth locale omitted from languageModules", () => {
        addFixtureLocale()
        write(indexFile(), fs.readFileSync(indexFile(), "utf8").replace(', "fr": fixtureModules', ""))
        rejects("Web modules: locale registrations differ")
    })
    it("rejects modules accidentally imported from a different language", () => {
        addFixtureLocale()
        write(indexFile(), fs.readFileSync(indexFile(), "utf8").replace("[fixtureCommon]", "[fixtureCommon, enCommon]"))
        rejects("Invalid catalog member: fr:enCommon")
    })
    it("rejects non-canonical import paths that escape the locale directory", () => {
        addFixtureLocale()
        write(indexFile(), fs.readFileSync(indexFile(), "utf8")
            .replace("const fixtureModules", 'import wrongCommon from "./fr/../es/common.json";\nconst fixtureModules')
            .replace("[fixtureCommon]", "[fixtureCommon, wrongCommon]"))
        rejects("Invalid catalog member: fr:wrongCommon")
    })
    it("rejects missing or extra web catalog directories", () => {
        write(localeFile("fr"), '{"common":{}}')
        rejects("Web catalog directories: locale registrations differ")
        addFixtureLocale()
        fs.renameSync(path.dirname(localeFile("fr")), path.join(root, "seanime-web/missing-fixture-catalog"))
        rejects("Missing web catalog directory: fr")
    })
    it("rejects a missing fourth native catalog", () => {
        addFixtureLocale()
        fs.unlinkSync(path.join(root, "seanime-denshi/locales/fr.json"))
        rejects("Denshi catalogs: locale registrations differ")
        rejects("Denshi fr:")
    })
    it("compares native keys for the fourth language too", () => {
        addFixtureLocale()
        write(path.join(root, "seanime-denshi/locales/fr.json"), '{"tray":{}}')
        rejects("Denshi fr: key parity failed")
    })
    it("detects a stale generated native registry", () => {
        addFixtureLocale()
        write(nativeRegistryFile(), "// stale")
        rejects("Stale native locale registry")
        expect(() => checkNativeLocaleRegistry(root)).toThrow("Stale native locale registry")
    })
    it("requires the fourth date locale", () => {
        addFixtureLocale()
        write(datesFile(), fs.readFileSync(datesFile(), "utf8").replace(', "fr": fixtureDate', ""))
        rejects("Date locales: locale registrations differ")
    })
    it("requires the fourth DataGrid date locale", () => {
        addFixtureLocale()
        write(gridFile(), fs.readFileSync(gridFile(), "utf8").replace("pt: ptBR, fr }", "pt: ptBR }"))
        rejects("DataGrid fr: missing date locale")
    })
    it("requires every DataGrid label in the fourth language", () => {
        addFixtureLocale()
        write(gridFile(), fs.readFileSync(gridFile(), "utf8").replace('fr: "Filtres"', 'fr: ""'))
        rejects("DataGrid fr: missing or empty label filters")
    })
    it("reports the actual number of languages in CLI output", () => {
        addFixtureLocale()
        const result = spawnSync(process.execPath, [path.join(repo, "seanime-web/scripts/i18n-audit.mjs"), "--root", root], { encoding: "utf8" })
        expect(result.status, result.stderr).toBe(0)
        expect(result.stdout).toContain("× 4 languages")
    })
    it("generates the standalone native registration deterministically without writing during checks", () => {
        addFixtureLocale()
        const before = fs.readFileSync(nativeRegistryFile(), "utf8")
        expect(generateNativeLocaleRegistry(root)).toBe(before)
        expect(() => checkNativeLocaleRegistry(root)).not.toThrow()
        expect(fs.readFileSync(nativeRegistryFile(), "utf8")).toBe(before)
        write(nativeRegistryFile(), before.replace(/\n/g, "\r\n"))
        expect(() => checkNativeLocaleRegistry(root)).not.toThrow()
    })
})

describe("locale registry validation", () => {
    it.each(["../en", "__proto__", "constructor", "EN", "fr_CA"])("rejects unsafe or non-canonical codes: %s", code => {
        const registry = readLocaleRegistry(root)
        write(registryFile(), JSON.stringify({ ...registry, [code]: { name: "Fixture", intlLocale: "fr", htmlLang: "fr" } }))
        expect(() => readLocaleRegistry(root)).toThrow()
    })
    it.each(["en", "es"])("requires the existing fallback %s", code => {
        const registry = readLocaleRegistry(root)
        delete registry[code]
        write(registryFile(), JSON.stringify(registry))
        expect(() => readLocaleRegistry(root)).toThrow("requires fallback")
    })
    it("rejects duplicate registry keys before JSON parsing loses them", () => {
        const text = fs.readFileSync(registryFile(), "utf8")
        write(registryFile(), text.replace('{"en":', '{"en":{},"en":'))
        expect(() => readLocaleRegistry(root)).toThrow("duplicate key en")
    })
    it.each([
        { name: "", intlLocale: "fr", htmlLang: "fr" },
        { name: "Français", intlLocale: "en-US", htmlLang: "fr" },
        { name: "Français", intlLocale: "fr", htmlLang: "es" },
        { name: "Français", intlLocale: "fr_CA", htmlLang: "fr" },
        { name: "Français", intlLocale: "fr", htmlLang: "fr", unknown: true },
        null,
        [],
    ])("rejects invalid or inconsistent metadata: %j", metadata => {
        write(registryFile(), JSON.stringify({ ...readLocaleRegistry(root), fr: metadata }))
        expect(() => readLocaleRegistry(root)).toThrow()
    })
})
