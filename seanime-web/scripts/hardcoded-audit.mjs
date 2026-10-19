import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parse } from "@babel/parser"

const sourceRoot = fileURLToPath(new URL("../src", import.meta.url))
const technical = new Set(["Anime", "Manga", "Beta", "Alpha", "HTML5", "HEVC/H.265", "DTS/DCA", "EAC3", "Opus/Vorbis", "FLAC/ALAC", "qBittorrent", "Chromecast", "Enter", "/spoilers"])
let candidates = 0

function files(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const file = path.join(directory, entry.name)
        if (entry.isDirectory()) return ["test", "tests", "docs"].includes(entry.name) ? [] : files(file)
        return /\.(ts|tsx)$/.test(file) && !/\.(test|spec)\.tsx?$|\.d\.ts$/.test(file) ? [file] : []
    })
}

function walk(node, visit) {
    if (!node || typeof node !== "object") return
    if (typeof node.type === "string") visit(node)
    for (const [key, value] of Object.entries(node)) {
        if (/comments|loc|start|end/i.test(key)) continue
        if (Array.isArray(value)) value.forEach(child => walk(child, visit))
        else if (value && typeof value === "object") walk(value, visit)
    }
}

for (const file of files(sourceRoot)) {
    const ast = parse(fs.readFileSync(file, "utf8"), { sourceType: "module", plugins: file.endsWith(".tsx") ? ["typescript", "jsx"] : ["typescript"] })
    const report = (node, text, kind) => {
        text = text.replace(/\s+/g, " ").trim()
        if (!/[a-zA-Z]{3}/.test(text) || technical.has(text)) return
        console.log(`${kind}: ${path.relative(sourceRoot, file)}:${node.loc.start.line}: ${text}`)
        candidates++
    }
    walk(ast, node => {
        if (node.type === "JSXText") report(node, node.value, "JSX")
        if (node.type === "JSXAttribute" && ["label", "title", "placeholder", "aria-label", "alt", "help", "description", "error"].includes(node.name?.name)
            && node.value?.type === "StringLiteral") report(node, node.value.value, "PROP")
        if (node.type === "CallExpression" && node.callee?.object?.name === "toast"
            && ["success", "error", "warning", "info", "loading"].includes(node.callee?.property?.name)
            && node.arguments[0]?.type === "StringLiteral") report(node, node.arguments[0].value, "TOAST")
        if (node.type === "CallExpression" && node.callee?.property?.name === "replace"
            && node.callee.object?.type === "CallExpression" && ["t", "tr", "tx"].includes(node.callee.object.callee?.name)) {
            report(node, node.arguments[0]?.value || "translation.replace(...)", "INTERPOLATION")
        }
    })
}
console.log(`${candidates} candidates. AST ignores comments; review technical strings and accessibility fallbacks manually. This advisory scan is not a completeness guarantee.`)
