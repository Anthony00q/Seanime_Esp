import "./setup"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { beforeEach, afterEach, describe, expect, it } from "vitest"
import { auditTranslations } from "../../../scripts/i18n-audit.mjs"
import { repo } from "./catalogs"

let root: string
const localeFile = (locale: string) => path.join(root, "seanime-web/src/locales", locale, "common.json")
const indexFile = () => path.join(root, "seanime-web/src/locales/index.ts")
const sourceFile = () => path.join(root, "seanime-web/src/component.tsx")
const write = (file: string, text: string) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text) }
const mutate = (locale: string, change: (value: any) => void) => {
    const data = JSON.parse(fs.readFileSync(localeFile(locale), "utf8"))
    change(data)
    write(localeFile(locale), JSON.stringify(data))
}
const rejects = (fragment: string) => expect(auditTranslations({ root }).errors.some((error: string) => error.includes(fragment))).toBe(true)

beforeEach(() => {
    const temporary = process.platform === "win32" ? path.join(os.tmpdir(), "opencode") : os.tmpdir()
    fs.mkdirSync(temporary, { recursive: true })
    root = fs.mkdtempSync(path.join(temporary, "fork-i18n-audit-"))
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
        write(sourceFile(), 'const t = createTranslator(); t("extensions.addModal.repoPlaceholder");')
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
    ])("rejects bad source call %s", (call, diagnostic) => {
        write(sourceFile(), `const t = createTranslator(); ${call};`)
        rejects(diagnostic)
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
