import "./setup"
import fs from "node:fs"
import path from "node:path"
import { parse } from "@babel/parser"
import { describe, expect, it } from "vitest"
import { localeNames, setCurrentLocale, type Locale } from "../config"
import { getDateFnsLocale } from "../date-locale"
import translations, { dateFnsLocales, resolveDatagridLocale } from "@/components/ui/datagrid/locales"
import { useMockBrowser } from "./browser"
import { repo } from "./catalogs"

useMockBrowser()
const languages = Object.keys(localeNames).sort() as Locale[]

it("keeps actual web/native catalog directories and the native type registered together", () => {
    const directory = path.join(repo, "seanime-web/src/locales")
    expect(fs.readdirSync(directory, { withFileTypes: true }).filter(e => e.isDirectory() && !e.name.startsWith("__")).map(e => e.name).sort()).toEqual(languages)
    const nativeDirectory = path.join(repo, "seanime-denshi/locales")
    expect(fs.readdirSync(nativeDirectory).filter(f => f.endsWith(".json")).map(f => f.slice(0, -5)).sort()).toEqual(languages)
    const ast = parse(fs.readFileSync(path.join(repo, "seanime-denshi/src/main/locale.ts"), "utf8"), { sourceType: "module", plugins: ["typescript"] })
    const declaration = ast.program.body.find((node: any) => node.type === "ExportNamedDeclaration" && node.declaration?.id?.name === "DenshiLocale") as any
    expect(declaration?.declaration.typeAnnotation.types.map((node: any) => node.literal.value).sort()).toEqual(languages)
})

describe.each(languages)("registered controls (%s)", locale => {
    it("has every DataGrid label and its date locale without English fallback", () => {
        setCurrentLocale(locale)
        expect(resolveDatagridLocale()).toBe(locale)
        expect(dateFnsLocales[locale]?.code).toBe(getDateFnsLocale().code)
        for (const labels of Object.values(translations)) expect(labels[locale]?.trim()).toBeTruthy()
    })
})
