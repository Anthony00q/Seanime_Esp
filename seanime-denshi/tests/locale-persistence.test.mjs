import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import vm from "node:vm"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import ts from "typescript"

const require = createRequire(import.meta.url)
const appPath = fileURLToPath(new URL("..", import.meta.url))
const locale = require("../dist/main/locale.js")
const { loadDenshiStrings } = locale

// Evaluate the actual compiled IPC registrations, without refactoring production
// handlers for tests or loading Electron, windows, players and the whole app.
function settingsHandlers(settings, initial, { save = settings.saveDenshiSettings, onLogin = () => {} } = {}) {
    const filename = path.join(appPath, "dist/main/index.js")
    const source = ts.createSourceFile(filename, fs.readFileSync(filename, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
    const registrations = []
    const channels = new Map()
    function visit(node) {
        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
            && node.expression.name.text === "handle" && node.arguments[0] && ts.isStringLiteral(node.arguments[0])
            && ["denshi:getSettings", "denshi:setSettings"].includes(node.arguments[0].text)) registrations.push(node.getText(source))
        ts.forEachChild(node, visit)
    }
    visit(source)
    assert.equal(registrations.length, 2, "Expected the two real Denshi settings IPC handlers")
    const context = vm.createContext({
        electron_1: { ipcMain: { handle: (channel, handler) => channels.set(channel, handler) }, app: { setLoginItemSettings: onLogin } },
        denshi_settings_1: { ...settings, saveDenshiSettings: save },
        locale_1: locale,
        denshiSettings: initial,
        logger: { settings: { info() {} } },
        _development: false,
        process: { platform: "win32" },
    })
    vm.runInContext(registrations.join(";\n"), context, { filename })
    return {
        get: () => channels.get("denshi:getSettings")(),
        set: input => channels.get("denshi:setSettings")({}, input),
    }
}

function fixture(t, { failRename = false } = {}) {
    const temporary = process.platform === "win32" ? path.join(os.tmpdir(), "seanime-i18n") : os.tmpdir()
    fs.mkdirSync(temporary, { recursive: true })
    const directory = fs.mkdtempSync(path.join(temporary, "fork-i18n-native-"))
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }))
    const filename = path.join(appPath, "dist/main/denshi-settings.js")
    const compiledRequire = createRequire(filename)
    const exports = {}
    const filesystem = failRename ? { ...fs, renameSync() { throw new Error("simulated rename failure") } } : fs
    vm.runInNewContext(fs.readFileSync(filename, "utf8"), {
        exports,
        require: name => name === "electron" ? { app: { getPath: () => directory } }
            : name === "electron-log/main" ? { error() {} }
            : name === "node:fs" ? filesystem : compiledRequire(name),
    }, { filename })
    return { directory, settings: exports, file: path.join(directory, "denshi-settings.json") }
}

test("fork IPC + actual filesystem + native strings round trip", t => {
    const { file, directory, settings } = fixture(t)
    const logins = []
    const handlers = settingsHandlers(settings, settings.loadDenshiSettings(), {
        onLogin: options => {
            assert.equal(JSON.parse(fs.readFileSync(file, "utf8")).openAtLaunch, options.openAtLogin)
            logins.push(options.openAtLogin)
        },
    })
    for (const [locale, quit] of [["en", "Quit Seanime"], ["pt", "Sair do Seanime"], ["es", "Salir de Seanime"]]) {
        const saved = handlers.set({ locale })
        assert.equal(settings.loadDenshiSettings().locale, locale)
        assert.equal(loadDenshiStrings(appPath, saved.locale).tray.quit, quit)
    }
    assert.deepEqual(logins, [false, false, false])
    assert.deepEqual(fs.readdirSync(directory), ["denshi-settings.json"])
    const copy = handlers.get()
    copy.locale = "pt"
    assert.equal(handlers.get().locale, "es")
})

test("fork failed rename preserves the actual previous JSON and does not apply state", t => {
    const { file, settings } = fixture(t, { failRename: true })
    const original = { ...settings.DENSHI_SETTINGS_DEFAULTS, locale: "en" }
    fs.writeFileSync(file, JSON.stringify(original))
    let applied = false
    const handlers = settingsHandlers(settings, original, { onLogin: () => { applied = true } })
    assert.throws(() => handlers.set({ locale: "pt" }), /Failed to persist/)
    assert.equal(applied, false)
    assert.equal(JSON.parse(fs.readFileSync(file, "utf8")).locale, "en")
    assert.equal(handlers.get().locale, "en")
})

test("fork corrupt on-disk JSON falls back to safe defaults", t => {
    const { file, settings } = fixture(t)
    fs.writeFileSync(file, "{invalid")
    assert.equal(settings.loadDenshiSettings().locale, "es")
})

test("fork compiled locale module resolves catalogs from the packaged directory layout", t => {
    const { directory } = fixture(t)
    const packaged = path.join(directory, "package")
    fs.mkdirSync(path.join(packaged, "dist/main"), { recursive: true })
    fs.mkdirSync(path.join(packaged, "locales"))
    const modulePath = path.join(packaged, "dist/main/locale.js")
    fs.copyFileSync(path.join(appPath, "dist/main/locale.js"), modulePath)
    for (const locale of ["en", "es", "pt"]) {
        fs.copyFileSync(path.join(appPath, "locales", `${locale}.json`), path.join(packaged, "locales", `${locale}.json`))
    }
    const { loadDenshiStrings: packagedLoader } = createRequire(modulePath)(modulePath)
    for (const locale of ["en", "es", "pt"]) assert.deepEqual(packagedLoader(packaged, locale), loadDenshiStrings(appPath, locale))
    const config = JSON.parse(fs.readFileSync(path.join(appPath, "package.json"), "utf8"))
    assert.ok(config.build.files.includes("locales/**/*"))
    assert.ok(config.build.files.includes("dist/main/**/*"))
})

test("fork IPC rejects invalid locale requests before touching persistence or login state", t => {
    const { settings } = fixture(t)
    let saved = 0
    let applied = 0
    const handlers = settingsHandlers(settings, settings.DENSHI_SETTINGS_DEFAULTS, { save: () => { saved++; return true }, onLogin: () => { applied++ } })
    for (const input of [null, [], "pt", { locale: "__proto__" }, { locale: "../en" }, { locale: ["pt"] }]) {
        assert.throws(() => handlers.set(input), /Invalid Denshi settings/)
    }
    assert.equal(saved, 0)
    assert.equal(applied, 0)
})

test("fork settings IPC preserves unrelated settings and applies the upstream login callback", t => {
    const { settings } = fixture(t)
    const initial = { ...settings.DENSHI_SETTINGS_DEFAULTS, minimizeToTray: false, updateChannel: "custom", windowBounds: { x: 1, y: 2, width: 800, height: 600 } }
    const logins = []
    const handlers = settingsHandlers(settings, initial, { onLogin: options => logins.push(options.openAtLogin) })
    const saved = handlers.set({ openAtLaunch: true })
    assert.equal(saved.locale, "es")
    assert.equal(saved.minimizeToTray, false)
    assert.equal(saved.updateChannel, "custom")
    assert.deepEqual(saved.windowBounds, initial.windowBounds)
    assert.deepEqual(logins, [true])
    assert.equal(settings.loadDenshiSettings().openAtLaunch, true)
})

test("fork settings IPC retains upstream defaults for settings added after an old saved file", t => {
    const { settings } = fixture(t)
    const handlers = settingsHandlers(settings, { locale: "en", minimizeToTray: false })
    const saved = handlers.set({ locale: "pt" })
    for (const [key, value] of Object.entries(settings.DENSHI_SETTINGS_DEFAULTS)) {
        if (key !== "locale" && key !== "minimizeToTray") assert.deepEqual(saved[key], value)
    }
    assert.equal(saved.locale, "pt")
    assert.equal(saved.minimizeToTray, false)
})
