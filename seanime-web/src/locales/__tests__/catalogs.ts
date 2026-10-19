import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { Locale } from "../config"

export const repo = fileURLToPath(new URL("../../../../", import.meta.url))

export function files(directory: string, extension: string): string[] {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const file = path.join(directory, entry.name)
        return entry.isDirectory() ? ["vendor_habari", "testmocks"].includes(entry.name) ? [] : files(file, extension)
            : file.endsWith(extension) && !file.endsWith("_test.go") ? [file] : []
    }).sort()
}

function flatten(value: unknown, prefix = "", output: Record<string, string> = {}): Record<string, string> {
    if (!value || typeof value !== "object") return output
    for (const [key, child] of Object.entries(value)) {
        const full = prefix ? `${prefix}.${key}` : key
        if (typeof child === "string") output[full] = child
        else flatten(child, full, output)
    }
    return output
}

// Read expected strings independently of createTranslator and its caches.
export function readCatalog(locale: Locale): Record<string, string> {
    return Object.assign({}, ...files(path.join(repo, "seanime-web/src/locales", locale), ".json")
        .map(file => flatten(JSON.parse(fs.readFileSync(file, "utf8")))))
}

export function stripGoComments(source: string): string {
    return source.replace(/("(?:\\.|[^"\\])*"|`[^`]*`)|(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, (match, literal) => literal || match.replace(/[^\n]/g, " "))
}

export function httpErrors(source: string): string[] {
    return [...stripGoComments(source).matchAll(/RespondWith(?:Status)?Error\(\s*c,\s*(?:[\w.]+,\s*)?errors\.New\("((?:\\.|[^"\\])*)"\)/g)].map(match => match[1])
}

export function toastExamples(source: string): string[] {
    return [...stripGoComments(source).matchAll(/\bSendEvent(?:To)?\(\s*(?:[\w.]+,\s*)?\w+\.(?:Info|Success|Warning|Error)Toast,\s*(?:fmt\.Sprintf\(\s*)?"((?:\\.|[^"\\])*)"/g)].map(match => {
        let message = match[1].replace(/%[a-z]/g, "12")
        if (message === "anilist: Rate limited, retrying in ") message += "12 seconds"
        if (message.endsWith(": ")) message += "EACCES"
        return message
    })
}
