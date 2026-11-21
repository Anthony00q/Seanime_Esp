import assert from "node:assert/strict"
import fs from "node:fs"
import vm from "node:vm"
import { test } from "node:test"

const splash = fs.readFileSync(new URL("../src/splash.html", import.meta.url), "utf8")
const script = splash.match(/<script>([\s\S]*?)<\/script>/)?.[1]

function renderSplash(params, year = 2026) {
    const root = { lang: "es" }
    const version = { textContent: "" }
    const attributes = new Map()
    const classes = new Set()
    const document = {
        documentElement: root,
        body: { classList: { add: value => classes.add(value) } },
        getElementById: id => id === "version" ? version : null,
        querySelector: selector => selector === "main" ? { setAttribute: (key, value) => attributes.set(key, value) } : null,
    }
    class SplashDate extends Date {
        static now() { return new Date(year, 10, 21).getTime() }
    }
    assert.ok(script, "Expected an inline splash script")
    vm.runInNewContext(script, {
        window: { location: { search: `?${new URLSearchParams(params)}` } },
        URLSearchParams,
        Date: SplashDate,
        document,
    })
    return { root, version, attributes, classes }
}

test("splash keeps the upstream version and background alongside native startup translations", () => {
    for (const [locale, lang] of [["en", "en"], ["es", "es"], ["pt", "pt-BR"]]) {
        const { startup } = JSON.parse(fs.readFileSync(new URL(`../locales/${locale}.json`, import.meta.url), "utf8"))
        const result = renderSplash({ version: "3.10.5", locale, starting: startup.starting })
        assert.equal(result.version.textContent, "v3.10.5")
        assert.equal(result.root.lang, lang)
        assert.equal(result.attributes.get("aria-label"), startup.starting)
        assert.ok(result.classes.has("event"))
    }
    assert.ok(!renderSplash({}, 2027).classes.has("event"))
    const { build } = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"))
    assert.ok(build.files.includes("assets/**/*"))
    assert.ok(fs.existsSync(new URL("../assets/splash-bg.jpg", import.meta.url)))
})
