import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parse, parseExpression } from "@babel/parser"
import { IntlMessageFormat } from "intl-messageformat"

const defaultRoot = fileURLToPath(new URL("../..", import.meta.url))

// Callable with an isolated fixture root: importing this module never audits or exits.
export function auditTranslations({ root = defaultRoot } = {}) {
const localeRoot = path.join(root, "seanime-web/src/locales")
const languages = ["en", "es", "pt"]
const errors = []
let formatChecks = 0
const fail = message => { errors.push(message) }

function files(directory, extension) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const file = path.join(directory, entry.name)
        return entry.isDirectory() ? files(file, extension) : extension.test(file) ? [file] : []
    }).sort()
}

function walk(node, visit) {
    if (!node || typeof node !== "object") return
    if (typeof node.type === "string") visit(node)
    for (const [key, value] of Object.entries(node)) {
        if (["loc", "start", "end", "comments", "leadingComments", "trailingComments"].includes(key)) continue
        if (Array.isArray(value)) value.forEach(child => walk(child, visit))
        else if (value && typeof value === "object") walk(value, visit)
    }
}

function readJson(file) {
    const raw = fs.readFileSync(file, "utf8")
    walk(parseExpression(raw), node => {
        if (node.type !== "ObjectExpression") return
        const seen = new Set()
        for (const property of node.properties) {
            const key = property.key?.value ?? property.key?.name
            if (seen.has(key)) fail(`${file}:${property.loc.start.line}: duplicate JSON key ${key}`)
            seen.add(key)
        }
    })
    return JSON.parse(raw)
}

function flatten(value, prefix = "", output = Object.create(null)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid object at ${prefix}`)
    for (const [key, child] of Object.entries(value)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        if (typeof child === "string") {
            if (!child.trim()) fail(`Empty translation: ${fullKey}`)
            output[fullKey] = child
        } else if (child && typeof child === "object" && !Array.isArray(child)) flatten(child, fullKey, output)
        else fail(`Non-string translation: ${fullKey}`)
    }
    return output
}

// These are documented literal templates/HTML, not messages to interpolate.
// Keep this list explicit so new malformed ICU cannot silently bypass validation.
const literals = new Set([
    "extensions.addModal.repoPlaceholder", "gettingStarted.player.iinaAlert",
    "libraryExplorerSuper.simpleCounter", "libraryExplorerSuper.startFrom",
    "libraryExplorerSuper.incrementBy", "libraryExplorerSuper.padZeros",
    "libraryExplorerSuper.combinedStart", "libraryExplorerSuper.combinedPad", "libraryExplorerSuper.combinedAll",
    "settings.mediaPlayer.customSchemePlaceholder", "nakama.nakamaServerURLPlaceholder",
    "changelogTour.3_8_0.externalPlayerLink.content",
])

function analyze(text, locale, key) {
    const variables = new Map()
    const cases = [{}]
    const formatter = new IntlMessageFormat(text, locale)
    function visit(elements, ancestors = {}) {
        for (const element of elements) {
            if ([1, 2, 3, 4, 5, 6].includes(element.type)) {
                const kind = element.type === 6 || element.type === 2 ? "number" : element.type === 3 || element.type === 4 ? "date" : "string"
                if (!variables.has(element.value) || kind !== "string") variables.set(element.value, kind)
            }
            if (element.type === 5 || element.type === 6) {
                if (locale === "pt" && element.type === 6 && element.pluralType === "cardinal" && !element.options["=0"]) {
                    fail(`pt:${key}: plural ${element.value} requires an explicit =0 branch`)
                }
                for (const [selector, option] of Object.entries(element.options)) {
                    let witness
                    if (element.type === 5) witness = selector === "other" ? "__unmatched__" : selector
                    else if (selector.startsWith("=")) witness = Number(selector.slice(1))
                    else {
                        const rules = new Intl.PluralRules(locale, { type: element.pluralType })
                        witness = [...Array(201).keys(), 0.5, 1.5, 1000000].find(number =>
                            !element.options[`=${number}`] && rules.select(number - (element.offset || 0)) === selector)
                    }
                    if (witness !== undefined) {
                        const scenario = { ...ancestors, [element.value]: witness }
                        cases.push(scenario)
                        visit(option.value, scenario)
                    } else visit(option.value, ancestors)
                }
            }
            if (element.children) visit(element.children)
        }
    }
    visit(formatter.getAst())
    // Exercise numeric zero/one/many plus reachable categorical/nested branches.
    for (const count of [0, 1, 2]) {
        for (const scenario of cases) {
            const params = { ...Object.fromEntries([...variables].map(([name, kind]) => [name, kind === "number" ? count : kind === "date" ? new Date(0) : "sample"])), ...scenario }
            formatter.format(params)
            formatChecks++
        }
    }
    return variables
}

const catalogs = Object.create(null)
const signatures = Object.create(null)
const moduleFiles = Object.create(null)
const index = fs.readFileSync(path.join(localeRoot, "index.ts"), "utf8")
const imports = new Map()
const arrays = new Map()
const registered = new Map()
const unwrap = node => node?.type === "TSAsExpression" || node?.type === "TSSatisfiesExpression" ? unwrap(node.expression) : node
walk(parse(index, { sourceType: "module", plugins: ["typescript"] }), node => {
    if (node.type === "ImportDeclaration") {
        for (const specifier of node.specifiers) imports.set(specifier.local.name, node.source.value)
    }
    if (node.type !== "VariableDeclarator") return
    const value = unwrap(node.init)
    if (value?.type === "ArrayExpression") arrays.set(node.id.name, value.elements.map(element => element?.name))
    if (node.id.name === "languageModules" && value?.type === "ObjectExpression") {
        for (const property of value.properties) registered.set(property.key?.name ?? property.key?.value, property.value?.name)
    }
})
for (const locale of languages) {
    catalogs[locale] = Object.create(null)
    signatures[locale] = Object.create(null)
    moduleFiles[locale] = Object.create(null)
    for (const file of files(path.join(localeRoot, locale), /\.json$/)) {
        const relative = path.relative(path.join(localeRoot, locale), file).replaceAll("\\", "/")
        try {
            const messages = flatten(readJson(file))
            const filename = path.basename(file, ".json")
            if (relative === "features.json" && Object.keys(messages).some(key => key.startsWith("features."))) fail(`${locale}/${relative}: unexpected features wrapper`)
            if (relative.startsWith("modules/") && filename !== "toasts"
                && Object.keys(messages).some(key => key === filename || key.startsWith(`${filename}.`))) fail(`${locale}/${relative}: unexpected filename wrapper`)
            moduleFiles[locale][relative] = Object.keys(messages).sort()
            const members = arrays.get(registered.get(locale)) || []
            const matches = members.filter(name => imports.get(name) === `./${locale}/${relative}`)
            if (matches.length !== 1) fail(`Unregistered or repeated catalog: ${locale}/${relative} (must be imported and used once in languageModules)`)
            for (const [key, text] of Object.entries(messages)) {
                if (Object.hasOwn(catalogs[locale], key)) fail(`${locale}:${key}: catalog collision`)
                catalogs[locale][key] = text
                signatures[locale][key] = literals.has(key) ? new Map() : analyze(text, locale, key)
            }
        } catch (error) { fail(`${locale}/${relative}: ${error.message}`) }
    }
}

for (const locale of ["es", "pt"]) {
    if (JSON.stringify(moduleFiles.en) !== JSON.stringify(moduleFiles[locale])) fail(`${locale}: file/key structure differs from English`)
    for (const key of Object.keys(catalogs.en)) {
        const signature = vars => JSON.stringify([...vars].sort(([a], [b]) => a.localeCompare(b)))
        if (signatures.en[key] && signatures[locale][key] && signature(signatures.en[key]) !== signature(signatures[locale][key])) {
            fail(`${locale}:${key}: ICU argument names/types differ from English`)
        }
    }
}

for (const file of files(path.join(root, "seanime-web/src"), /\.(ts|tsx)$/)) {
    if (/\.(test|spec)\.tsx?$|\.d\.ts$/.test(file)) continue
    try {
        const ast = parse(fs.readFileSync(file, "utf8"), { sourceType: "module", plugins: file.endsWith(".tsx") ? ["typescript", "jsx"] : ["typescript"] })
        const factories = new Set(["createTranslator"])
        const translators = new Set(["t", "tr", "tx"])
        walk(ast, node => {
            if (node.type === "ImportSpecifier" && node.imported?.name === "createTranslator") factories.add(node.local.name)
            if (node.type === "VariableDeclarator" && node.id.type === "Identifier"
                && node.init?.type === "CallExpression" && factories.has(node.init.callee?.name)) translators.add(node.id.name)
        })
        walk(ast, node => {
            if (node.type !== "CallExpression" || !translators.has(node.callee?.name) || node.arguments[0]?.type !== "StringLiteral") return
            const key = node.arguments[0].value
            const at = `${path.relative(root, file)}:${node.loc.start.line}`
            if (!Object.hasOwn(catalogs.en, key)) { fail(`${at}: unknown translation key ${key}`); return }
            const params = node.arguments[1]
            const required = signatures.en[key]
            if (literals.has(key) && params) fail(`${at}: literal template ${key} must not be interpolated`)
            if (!required?.size) return
            if (!params) { fail(`${at}: ${key} requires ${[...required.keys()].join(", ")}`); return }
            const object = unwrap(params)
            if (object.type !== "ObjectExpression" || object.properties.some(property => property.type === "SpreadElement")) return
            const provided = new Map(object.properties.map(property => [property.key?.name ?? property.key?.value, property.value]))
            for (const [name, kind] of required) {
                if (!provided.has(name)) fail(`${at}: ${key} is missing argument ${name}`)
                const value = provided.get(name)
                const stringConversion = value?.type === "CallExpression" && (value.callee?.name === "String" || value.callee?.name === "formatNumber"
                    || ["toString", "toLocaleString", "toFixed"].includes(value.callee?.property?.name))
                if (kind === "number" && (["StringLiteral", "BooleanLiteral", "NullLiteral", "TemplateLiteral", "ArrayExpression", "ObjectExpression"].includes(value?.type) || stringConversion)) fail(`${at}: ${key}.${name} must be numeric`)
            }
        })
    } catch (error) { fail(`${file}: ${error.message}`) }
}

const denshiRoot = path.join(root, "seanime-denshi/locales")
const nativeBase = Object.keys(flatten(readJson(path.join(denshiRoot, "en.json")))).sort()
for (const locale of languages) {
    const native = Object.keys(flatten(readJson(path.join(denshiRoot, `${locale}.json`)))).sort()
    if (JSON.stringify(native) !== JSON.stringify(nativeBase)) fail(`Denshi ${locale}: key parity failed`)
}

return { errors, keyCount: Object.keys(catalogs.en).length, nativeKeyCount: nativeBase.length, formatChecks }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const rootFlag = process.argv.indexOf("--root")
        if (rootFlag >= 0 && !process.argv[rootFlag + 1]) throw new Error("--root requires a fixture directory")
        const result = auditTranslations(rootFlag >= 0 ? { root: path.resolve(process.argv[rootFlag + 1]) } : {})
        for (const error of result.errors) console.error(`ERROR: ${error}`)
        console.log(`i18n: ${result.keyCount} keys × 3 languages; ${result.nativeKeyCount} native keys per language; ${result.formatChecks} ICU format checks`)
        console.log(result.errors.length ? `FAILED: ${result.errors.length} error(s)` : "OK: registered catalogs, JSON parity/collisions, ICU branches/arguments, source calls and Denshi")
        process.exitCode = result.errors.length ? 1 : 0
    } catch (error) {
        console.error(`ERROR: ${error.message}`)
        process.exitCode = 1
    }
}
