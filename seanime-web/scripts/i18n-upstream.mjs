import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { fileURLToPath } from "node:url"
import { parse } from "@babel/parser"
import traverseModule from "@babel/traverse"

const traverse = traverseModule.default ?? traverseModule
const defaultRoot = fileURLToPath(new URL("../..", import.meta.url))
const unwrap = node => ["TSAsExpression", "TSSatisfiesExpression", "TSTypeAssertion", "TSNonNullExpression", "ParenthesizedExpression"].includes(node?.type) ? unwrap(node.expression) : node
const visibleProps = new Set(["label", "title", "placeholder", "aria-label", "alt", "help", "description", "error"])
const webSource = file => file.startsWith("seanime-web/src/") && /\.[jt]sx?$/.test(file)
    && !/\.(test|spec)\.[jt]sx?$|\.d\.ts$|\/locales\/|\.generated\.ts$/.test(file)
const nativeSource = file => file.startsWith("seanime-denshi/src/") && /\.(ts|js|html)$/.test(file)
const backendSource = file => file.startsWith("internal/") && file.endsWith(".go") && !file.endsWith("_test.go")

/** Read-only AST inventory. It is deliberately not a semantic merge or an automatic translator. */
export function sourceProfile(file, source) {
    const translations = []
    const visible = []
    const ast = parse(source, { sourceType: "module", plugins: /\.[jt]sx$/.test(file) ? ["typescript", "jsx"] : ["typescript"] })
    function localeImport(binding) {
        const declaration = binding?.path.parentPath?.node
        if (declaration?.type !== "ImportDeclaration" || declaration.importKind === "type") return false
        const imported = declaration.source.value.replace(/\.tsx?$/, "")
        const resolved = imported.startsWith("@/") ? `seanime-web/src/${imported.slice(2)}`
            : path.posix.normalize(path.posix.join(path.posix.dirname(file), imported))
        return ["seanime-web/src/locales", "seanime-web/src/locales/index"].includes(resolved)
    }
    function factory(node, scope) {
        if (node?.type !== "CallExpression") return false
        const callee = unwrap(node.callee)
        if (callee?.type === "Identifier") {
            const binding = scope.getBinding(callee.name)
            return localeImport(binding) && binding.path.isImportSpecifier()
                && (binding.path.node.imported.name ?? binding.path.node.imported.value) === "createTranslator"
        }
        if (callee?.type === "MemberExpression" && callee.object.type === "Identifier"
            && (callee.computed ? callee.property.value : callee.property.name) === "createTranslator") {
            const binding = scope.getBinding(callee.object.name)
            return localeImport(binding) && binding.path.isImportNamespaceSpecifier()
        }
        return false
    }
    function translator(node, scope) {
        const callee = unwrap(node.callee)
        if (factory(callee, scope)) return true
        if (callee?.type !== "Identifier") return false
        const binding = scope.getBinding(callee.name)
        return binding?.path.isVariableDeclarator() && factory(unwrap(binding.path.node.init), binding.path.scope)
    }
    function addVisible(node, text, kind) {
        text = text.replace(/\s+/g, " ").trim()
        if (/\p{L}{2}/u.test(text)) visible.push({ kind, text, line: node.loc.start.line })
    }
    function visibleExpression(p) {
        const attribute = p.findParent(parent => parent.isJSXAttribute())
        if (attribute && !visibleProps.has(attribute.node.name?.name)) return false
        const expression = p.findParent(parent => parent.isJSXExpressionContainer())
        if (!expression) return false
        let current = p
        while (current.parentPath && current.parentPath !== expression) {
            const parent = current.parentPath
            if (parent.isCallExpression() || parent.isNewExpression() || parent.isMemberExpression()
                || parent.isBinaryExpression() || parent.isAssignmentExpression()) return false
            if (parent.isConditionalExpression() && current.key === "test") return false
            if (parent.isLogicalExpression() && current.key === "left") return false
            current = parent
        }
        return true
    }
    traverse(ast, {
        CallExpression(p) {
            const node = p.node
            if (translator(node, p.scope)) {
                const argument = unwrap(node.arguments[0])
                const key = argument?.type === "StringLiteral" ? argument.value : source.slice(argument?.start, argument?.end).replace(/\s+/g, " ")
                translations.push({ key, line: node.loc.start.line })
            }
            if (node.callee?.type === "MemberExpression" && node.callee.property?.name === "replace"
                && node.callee.object?.type === "CallExpression" && translator(node.callee.object, p.scope)) {
                addVisible(node, "translation.replace(...)", "interpolation-review")
            }
            if (node.callee?.object?.name === "toast" && ["success", "error", "warning", "info", "loading"].includes(node.callee?.property?.name)) {
                const argument = unwrap(node.arguments[0])
                if (argument?.type === "StringLiteral") addVisible(node, argument.value, "toast")
                if (argument?.type === "TemplateLiteral") addVisible(node, source.slice(argument.start, argument.end), "toast")
            }
            if (["toLocaleString", "toLocaleDateString", "toLocaleTimeString"].includes(node.callee?.property?.name) || node.callee?.name === "formatSafe") {
                addVisible(node, source.slice(node.start, node.end), "date/number-review")
            }
        },
        NewExpression(p) {
            if (p.node.callee?.object?.name === "Intl" && p.node.callee?.property?.name === "DateTimeFormat") {
                addVisible(p.node, source.slice(p.node.start, p.node.end), "date-review")
            }
        },
        JSXText(p) { addVisible(p.node, p.node.value, "jsx") },
        StringLiteral(p) {
            const attribute = p.findParent(parent => parent.isJSXAttribute())
            if (attribute && !visibleProps.has(attribute.node.name?.name)) return
            if (p.parentPath.isJSXAttribute()) { addVisible(p.node, p.node.value, "prop"); return }
            // Do not mistake translation keys, format tokens or identifiers in calls for UI text.
            if (visibleExpression(p)) addVisible(p.node, p.node.value, "expression")
        },
        TemplateLiteral(p) {
            if (!visibleExpression(p)) return
            const literal = p.node.quasis.map(part => part.value.raw).join("")
            if (!/\p{L}{2}/u.test(literal)) return
            addVisible(p.node, p.node.quasis.map(part => part.value.raw).join("{expression}"), "template")
        },
    })
    return { translations, visible }
}

function removed(before, after, identity) {
    const remaining = new Map()
    for (const item of after) { const key = identity(item); remaining.set(key, (remaining.get(key) || 0) + 1) }
    return before.filter(item => {
        const key = identity(item)
        const count = remaining.get(key) || 0
        if (!count) return true
        remaining.set(key, count - 1)
        return false
    })
}

/** @param {string} file
 * @param {{previousFork?: string, fork?: string, upstreamBefore?: string, upstreamAfter?: string}} options */
export function compareSources(file, { previousFork = "", fork = "", upstreamBefore, upstreamAfter } = {}) {
    const before = sourceProfile(file, previousFork)
    const after = sourceProfile(file, fork)
    const findings = []
    for (const entry of removed(before.translations, after.translations, item => item.key)) {
        findings.push({ kind: "translation-removed", file, line: entry.line, detail: entry.key })
    }
    if (upstreamBefore !== undefined && upstreamAfter !== undefined && upstreamBefore !== upstreamAfter) {
        const oldUpstream = sourceProfile(file, upstreamBefore)
        const newUpstream = sourceProfile(file, upstreamAfter)
        for (const entry of removed(newUpstream.visible, oldUpstream.visible, item => `${item.kind}:${item.text}`)) {
            const rawStillPresent = after.visible.some(item => item.kind === entry.kind && item.text === entry.text)
            findings.push({ kind: rawStillPresent ? "upstream-text-untranslated" : "upstream-context-review", file, line: entry.line, detail: `${entry.kind}: ${entry.text}` })
        }
    }
    return findings
}

/** @param {Array<any>} findings @param {Array<{id: string, reason: string}>} reviews */
export function applyReviews(findings, reviews = []) {
    if (!Array.isArray(reviews)) throw new Error("reviews must be an array")
    const approved = new Map()
    for (const review of reviews) {
        if (typeof review.id !== "string" || typeof review.reason !== "string" || !review.reason.trim()) throw new Error("Each review needs an id and a nonempty reason")
        if (approved.has(review.id)) throw new Error(`Duplicate review: ${review.id}`)
        approved.set(review.id, review.reason)
    }
    return findings.map(finding => ({ ...finding, reviewed: approved.has(finding.id), reason: approved.get(finding.id) }))
}

/** @param {{root?: string, baseline: string, from?: string, to?: string, reviews?: Array<{id: string, reason: string}>}} options */
export function investigateUpstream({ root = defaultRoot, baseline, from, to, reviews = [] }) {
    const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] }).trim()
    const resolve = ref => git("rev-parse", "--verify", "--end-of-options", `${ref}^{commit}`)
    if (!baseline) throw new Error("--baseline is required (the fork commit before the update)")
    if (!!from !== !!to) throw new Error("--from and --to must be provided together")
    const previous = resolve(baseline)
    const upstreamBefore = from ? resolve(from) : undefined
    const upstreamAfter = to ? resolve(to) : undefined
    const treeFiles = ref => new Set(git("ls-tree", "-r", "--name-only", "-z", ref).split("\0").filter(Boolean))
    const baselineFiles = treeFiles(previous)
    const oldFiles = upstreamBefore ? treeFiles(upstreamBefore) : new Set()
    const newFiles = upstreamAfter ? treeFiles(upstreamAfter) : new Set()
    // Treat renames as deletion+addition so neither the old translated path nor Unicode names disappear.
    const changed = new Set(git("diff", "--no-renames", "--name-only", "-z", previous, "--", "seanime-web/src", "seanime-denshi/src", "internal").split("\0").filter(Boolean))
    if (upstreamBefore) for (const file of git("diff", "--no-renames", "--name-only", "-z", upstreamBefore, upstreamAfter, "--", "seanime-web/src", "seanime-denshi/src", "internal").split("\0").filter(Boolean)) changed.add(file)
    const show = (ref, files, file) => files.has(file) ? execFileSync("git", ["show", `${ref}:${file}`], { cwd: root, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }) : ""
    const findings = []
    let inspected = 0
    for (const file of [...changed].sort()) {
        if (!webSource(file) && !nativeSource(file) && !backendSource(file)) continue
        const filename = path.join(root, file)
        const fork = fs.existsSync(filename) ? fs.readFileSync(filename, "utf8") : ""
        const firstFinding = findings.length
        if (webSource(file)) {
            inspected++
            findings.push(...compareSources(file, { previousFork: show(previous, baselineFiles, file), fork,
                ...(upstreamBefore ? { upstreamBefore: show(upstreamBefore, oldFiles, file), upstreamAfter: show(upstreamAfter, newFiles, file) } : {}) }))
        } else if (upstreamBefore && show(upstreamBefore, oldFiles, file) !== show(upstreamAfter, newFiles, file)) {
            inspected++
            // Native HTML/IPC and composed Go errors cannot be certified by the JSX scanner.
            findings.push({ kind: "native/backend-review", file, line: 1, detail: "Review changed native UI/backend messages, including dynamic strings" })
        }
        for (let i = firstFinding; i < findings.length; i++) {
            findings[i].context = createHash("sha256").update(fork.replace(/\r\n/g, "\n")).digest("hex")
        }
    }
    const identified = findings.map(finding => ({ ...finding, id: createHash("sha256").update(JSON.stringify([previous, upstreamBefore, upstreamAfter, finding.kind, finding.file, finding.detail, finding.context])).digest("hex").slice(0, 20) }))
    // The same key removed twice is one review item, not an ambiguous duplicate id.
    return { baseline: previous, from: upstreamBefore, to: upstreamAfter, inspected,
        findings: applyReviews([...new Map(identified.map(item => [item.id, item])).values()], reviews) }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const args = process.argv.slice(2)
        if (args.includes("--help")) {
            console.log("Read-only: --baseline <previous-fork-SHA> [--from <old-upstream-SHA> --to <new-upstream-SHA>] [--review <json>] [--json]\nExit 1: pending reviews; exit 2: invalid input/analysis failure. No fetch, checkout, merge or automatic approval.")
        } else {
            const options = {}
            for (let i = 0; i < args.length; i++) {
                if (args[i] === "--json") { options.json = true; continue }
                const name = args[i].replace(/^--/, "")
                if (!["baseline", "from", "to", "review"].includes(name) || !args[i + 1] || args[i + 1].startsWith("--") || options[name]) throw new Error(`Invalid argument: ${args[i]}`)
                options[name] = args[++i]
            }
            const reviews = options.review ? JSON.parse(fs.readFileSync(options.review, "utf8")) : []
            const result = investigateUpstream({ ...options, reviews })
            if (options.json) console.log(JSON.stringify(result, null, 2))
            else {
                console.log(`Fork baseline: ${result.baseline}`)
                if (result.from) console.log(`Upstream: ${result.from} -> ${result.to}`)
                console.log(`i18n regression review: ${result.inspected} changed files inspected`)
                for (const item of result.findings) console.log(`${item.reviewed ? "REVIEWED" : "PENDING"} ${item.id} ${item.file}:${item.line} ${item.kind}: ${item.detail}${item.reason ? ` (${item.reason})` : ""}`)
                console.log("AST inventory is not a completeness or semantic-equivalence guarantee. Review renames/deletions and test affected flows.")
            }
            process.exitCode = result.findings.some(item => !item.reviewed) ? 1 : 0
        }
    } catch (error) { console.error(`i18n upstream analysis failed: ${error.message}`); process.exitCode = 2 }
}
