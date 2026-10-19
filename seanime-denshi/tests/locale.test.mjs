import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"
import vm from "node:vm"
import { test } from "node:test"

const require = createRequire(import.meta.url)
const appPath = fileURLToPath(new URL("..", import.meta.url))
const { isDenshiLocale, resolveDenshiLocale, loadDenshiStrings } = require("../dist/main/locale.js")

for (const locale of ["es", "en", "pt"]) {
    test(`loads every native section (${locale})`, () => {
        const expected = JSON.parse(fs.readFileSync(path.join(appPath, "locales", `${locale}.json`), "utf8"))
        assert.deepEqual(loadDenshiStrings(appPath, locale), expected)
    })
}

test("rejects unsupported locales and path traversal", () => {
    for (const locale of ["__proto__", "constructor", "toString", "../en", "fr", null, {}]) {
        assert.equal(isDenshiLocale(locale), false)
        assert.equal(resolveDenshiLocale(locale), "es")
        assert.deepEqual(loadDenshiStrings(appPath, locale), loadDenshiStrings(appPath, "es"))
    }
})

test("falls back to packaged Spanish when the selected file is missing", () => {
    assert.deepEqual(loadDenshiStrings(path.join(appPath, "missing"), "pt"), loadDenshiStrings(appPath, "es"))
})

test("returned catalogs cannot mutate the fallback", () => {
    const strings = loadDenshiStrings(appPath, "es")
    strings.tray.quit = "changed"
    assert.notEqual(loadDenshiStrings(appPath, "es").tray.quit, "changed")
})

function localeWithContents(contents) {
    const filename = path.join(appPath, "dist/main/locale.js")
    const localRequire = createRequire(filename)
    const exports = {}
    vm.runInNewContext(fs.readFileSync(filename, "utf8"), {
        exports, structuredClone,
        require: name => name === "node:fs" ? { readFileSync: () => contents } : localRequire(name),
    }, { filename })
    return exports.loadDenshiStrings(appPath, "pt")
}

test("falls back on malformed JSON", () => {
    assert.deepEqual(localeWithContents("{invalid"), loadDenshiStrings(appPath, "es"))
})

test("merges valid translations while rejecting empty or non-string labels", () => {
    const strings = localeWithContents(JSON.stringify({ tray: { quit: "Sair", toggleVisibility: 7, removeFromDock: " " }, error: null }))
    const fallback = loadDenshiStrings(appPath, "es")
    assert.equal(strings.tray.quit, "Sair")
    assert.equal(strings.tray.toggleVisibility, fallback.tray.toggleVisibility)
    assert.equal(strings.tray.removeFromDock, fallback.tray.removeFromDock)
    assert.deepEqual(strings.error, fallback.error)
})

function settingsModule({ data = {}, failRename = false, failWrite = false } = {}) {
    const calls = []
    const exports = {}
    const fakeFs = {
        existsSync: () => true,
        readFileSync: () => JSON.stringify(data),
        writeFileSync: (...args) => { calls.push(["write", ...args]); if (failWrite) throw new Error("disk full") },
        renameSync: (...args) => { calls.push(["rename", ...args]); if (failRename) throw new Error("access denied") },
    }
    const filename = path.join(appPath, "dist/main/denshi-settings.js")
    vm.runInNewContext(fs.readFileSync(filename, "utf8"), {
        exports,
        require: name => name === "electron" ? { app: { getPath: () => "user-data" } }
            : name === "electron-log/main" ? { error() {} }
            : name === "node:fs" ? fakeFs
            : name === "./locale" ? { resolveDenshiLocale }
            : require(name),
    }, { filename })
    return { settings: exports, calls }
}

test("normalizes a corrupt saved locale", () => {
    const { settings } = settingsModule({ data: { locale: "../en" } })
    assert.equal(settings.loadDenshiSettings().locale, "es")
})

test("writes a temporary file before replacing saved settings", () => {
    const { settings, calls } = settingsModule()
    assert.equal(settings.saveDenshiSettings({ ...settings.DENSHI_SETTINGS_DEFAULTS, locale: "pt" }), true)
    assert.deepEqual(calls.map(call => call[0]), ["write", "rename"])
    assert.match(calls[0][1], /denshi-settings\.json\.tmp$/)
    assert.match(calls[1][2], /denshi-settings\.json$/)
})

for (const failure of ["failWrite", "failRename"]) {
    test(`reports persistence failure (${failure})`, () => {
        const { settings } = settingsModule({ [failure]: true })
        assert.equal(settings.saveDenshiSettings(settings.DENSHI_SETTINGS_DEFAULTS), false)
    })
}
