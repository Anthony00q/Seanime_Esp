import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { sourceProfile } from "./i18n-upstream.mjs"

const sourceRoot = fileURLToPath(new URL("../src", import.meta.url))
const technical = new Set(["Anime", "Manga", "Beta", "Alpha", "HTML5", "HEVC/H.265", "DTS/DCA", "EAC3", "Opus/Vorbis", "FLAC/ALAC", "qBittorrent", "Chromecast", "Enter", "/spoilers"])
let candidates = 0

function files(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const file = path.join(directory, entry.name)
        if (entry.isDirectory()) return ["test", "tests", "docs", "__tests__"].includes(entry.name) ? [] : files(file)
        return /\.(ts|tsx)$/.test(file) && !/\.(test|spec)\.tsx?$|\.d\.ts$|\.generated\.ts$/.test(file) ? [file] : []
    })
}

for (const file of files(sourceRoot)) {
    const relative = path.relative(sourceRoot, file).replaceAll("\\", "/")
    const profile = sourceProfile(`seanime-web/src/${relative}`, fs.readFileSync(file, "utf8"))
    for (const entry of profile.visible) {
        if (technical.has(entry.text)) continue
        console.log(`${entry.kind.toUpperCase()}: ${relative}:${entry.line}: ${entry.text}`)
        candidates++
    }
}
console.log(`${candidates} candidates. Includes expression/template literals and formatting calls; ignores comments. Technical text and unused props require human review. Not a completeness guarantee.`)
