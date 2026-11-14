import "./setup"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { execFileSync } from "node:child_process"
import { describe, expect, it } from "vitest"
import { applyReviews, compareSources, investigateUpstream, sourceProfile } from "../../../scripts/i18n-upstream.mjs"

const file = "seanime-web/src/component.tsx"
const translated = 'import { createTranslator as make } from "@/locales"; const tr = make(); export const View = () => <p>{tr("common.buttons.save")}</p>'

describe("upstream translation regression detection", () => {
    it("detects a translation replaced by English, including expression literals", () => {
        const result = compareSources(file, { previousFork: translated, fork: 'export const View = () => <p>{"Save changed"}</p>' })
        expect(result).toMatchObject([{ kind: "translation-removed", detail: "common.buttons.save" }])
    })

    it("does not treat comments, whitespace, unrelated factories or shadowed names as translations", () => {
        expect(compareSources(file, { previousFork: translated, fork: `// tr("bad.key")\n ${translated.replace("<p>", "<p>\n ")}` })).toEqual([])
        const unrelated = 'import { createTranslator } from "unrelated"; const t = createTranslator(); t("not.a.key");'
        expect(sourceProfile(file, unrelated).translations).toEqual([])
        const shadow = translated + '; function callback(tr: (s: string) => string) { tr("ignored") }'
        expect(sourceProfile(file, shadow).translations.map((entry: any) => entry.key)).toEqual(["common.buttons.save"])
    })

    it("recognizes relative imports, namespace factories and directly invoked factories", () => {
        const source = 'import * as l from "./locales/index"; const tx = l.createTranslator(); tx("a"); l.createTranslator()("b");'
        expect(sourceProfile(file, source).translations.map((entry: any) => entry.key)).toEqual(["a", "b"])
    })

    it("tracks repeated usages and dynamic expressions, not just whether a key exists somewhere", () => {
        expect(compareSources(file, { previousFork: translated + '; tr("common.buttons.save");', fork: translated })).toHaveLength(1)
        const dynamic = translated + '; tr(`status.${value}` as any);'
        expect(compareSources(file, { previousFork: dynamic, fork: translated })[0].detail).toBe('`status.${value}`')
    })

    it("requires context review even when new upstream text has already been translated", () => {
        const options = { previousFork: translated, upstreamBefore: 'const View = () => <p>Save</p>', upstreamAfter: 'const View = () => <p>Save all files</p>' }
        expect(compareSources(file, { ...options, fork: translated })[0].kind).toBe("upstream-context-review")
        expect(compareSources(file, { ...options, fork: 'const View = () => <p>Save all files</p>' }).some((item: any) => item.kind === "upstream-text-untranslated")).toBe(true)
    })

    it("reports changed formatting and never certifies an unparseable file", () => {
        expect(compareSources(file, { fork: "", upstreamBefore: "", upstreamAfter: 'const value = date.toLocaleString()' })[0].detail).toContain("date/number-review")
        expect(() => sourceProfile(file, 'const View = <p>{')).toThrow()
    })

    it("distinguishes visible fallback text from comparison identifiers and translated-only templates", () => {
        const source = 'const View = () => <p>{state === "FINISHED" ? "Ready to play" : "Please wait"}{`${label}`}</p>'
        expect(sourceProfile(file, source).visible.map((entry: any) => entry.text)).toEqual(["Ready to play", "Please wait"])
        const conditional = 'const View = () => <Alert title={selected ? `Missing source ${selected}` : "No source"} />'
        expect(sourceProfile(file, conditional).visible.map((entry: any) => entry.text)).toEqual(["Missing source {expression}", "No source"])
    })

    it("requires explicit reasons and rejects duplicate review entries", () => {
        const finding = { id: "test", detail: "removed", kind: "translation-removed" }
        expect(applyReviews([finding], []).map((item: any) => item.reviewed)).toEqual([false])
        expect(applyReviews([finding], [{ id: "test", reason: "Moved to a tested display helper" }])[0].reviewed).toBe(true)
        expect(() => applyReviews([finding], [{ id: "test", reason: " " }])).toThrow()
        expect(() => applyReviews([finding], [{ id: "test", reason: "A" }, { id: "test", reason: "B" }])).toThrow("Duplicate")
    })

    it("reads explicit Git snapshots and invalidates approval when the working file changes", () => {
        const temporary = process.platform === "win32" ? path.join(os.tmpdir(), "opencode") : os.tmpdir()
        fs.mkdirSync(temporary, { recursive: true })
        const root = fs.mkdtempSync(path.join(temporary, "i18n-upstream-"))
        const git = (...args: string[]) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim()
        const target = path.join(root, file)
        const write = (source: string) => { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, source) }
        const commit = () => { git("add", "."); git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "-c", "commit.gpgsign=false", "commit", "--no-verify", "-qm", "fixture"); return git("rev-parse", "HEAD") }
        try {
            git("init", "-q")
            write('const View = () => <p>Save</p>')
            const from = commit()
            write(translated)
            const unicodeFile = "seanime-web/src/componente-ñ.tsx"
            fs.writeFileSync(path.join(root, unicodeFile), translated)
            const baseline = commit()
            write('const View = () => <p>Save all files</p>\n')
            const to = commit()
            const result = investigateUpstream({ root, baseline, from, to })
            expect(result.findings.some((item: any) => item.kind === "translation-removed")).toBe(true)
            expect(result.findings.some((item: any) => item.kind === "upstream-text-untranslated")).toBe(true)
            const reviews = result.findings.map((item: any) => ({ id: item.id, reason: "Fixture approval" }))
            expect(investigateUpstream({ root, baseline, from, to, reviews }).findings.every((item: any) => item.reviewed)).toBe(true)
            write('const View = () => <p>Save all files</p>\r\n')
            expect(investigateUpstream({ root, baseline, from, to, reviews }).findings.every((item: any) => item.reviewed)).toBe(true)
            write('const View = () => <p>Different text</p>')
            expect(investigateUpstream({ root, baseline, from, to, reviews }).findings.some((item: any) => !item.reviewed)).toBe(true)
            fs.renameSync(path.join(root, unicodeFile), path.join(root, "seanime-web/src/renamed.tsx"))
            git("add", ".")
            expect(investigateUpstream({ root, baseline }).findings.some((item: any) => item.file === unicodeFile && item.kind === "translation-removed")).toBe(true)
            expect(() => investigateUpstream({ root, baseline: "not-a-revision" })).toThrow()
            expect(() => investigateUpstream({ root, baseline, from })).toThrow("together")
        } finally { fs.rmSync(root, { recursive: true, force: true }) }
    })
})
