import { IntlMessageFormat } from "intl-messageformat"
import policy from "./message-policy.json"

const literalKeys = new Set<string>(policy.literalKeys)
const formatters = new Map<string, IntlMessageFormat>()
const MAX_FORMATTERS = 500
const pluralRules = new Map<string, Intl.PluralRules>()

function formatterFor(text: string, locale: string) {
    const key = `${locale}:${text}`
    let formatter = formatters.get(key)
    if (!formatter) {
        formatter = new IntlMessageFormat(text, locale)
        if (formatters.size >= MAX_FORMATTERS) formatters.delete(formatters.keys().next().value!)
        formatters.set(key, formatter)
    }
    return formatter
}

// Validate only the branch actually rendered; an unused branch may need other values.
function validateArguments(ast: ReturnType<IntlMessageFormat["getAst"]>, params: Record<string, unknown>, locale: string) {
    for (const element of ast) {
        if (element.type >= 1 && element.type <= 6) {
            const name = (element as { value: string }).value
            if (!Object.hasOwn(params, name)) throw new Error(`Missing argument: ${name}`)
            const value = params[name]
            if ([2, 6].includes(element.type) && (typeof value !== "number" || !Number.isFinite(value))) {
                throw new Error(`Invalid numeric argument: ${name}`)
            }
            if ([3, 4].includes(element.type) && !((value instanceof Date && Number.isFinite(value.getTime()))
                || (typeof value === "number" && Number.isFinite(value)))) throw new Error(`Invalid date argument: ${name}`)
            if (element.type === 1 && !((typeof value === "string") || (typeof value === "number" && Number.isFinite(value)))) {
                throw new Error(`Invalid text argument: ${name}`)
            }
        }
        if (element.type === 5) {
            const value = params[element.value]
            if (typeof value !== "string" && typeof value !== "boolean") throw new Error(`Invalid select argument: ${element.value}`)
            const option = Object.hasOwn(element.options, String(value)) ? element.options[String(value)] : element.options.other
            validateArguments(option.value, params, locale)
        }
        if (element.type === 6) {
            const value = params[element.value] as number
            const ruleKey = `${locale}:${element.pluralType}`
            let rules = pluralRules.get(ruleKey)
            if (!rules) {
                rules = new Intl.PluralRules(locale, { type: element.pluralType })
                pluralRules.set(ruleKey, rules)
            }
            const rule = rules.select(value - element.offset)
            const option = element.options[`=${value}`] || element.options[rule] || element.options.other
            validateArguments(option.value, params, locale)
        }
        // t() is deliberately text-only. Rich tags must not turn its result into React objects.
        if (element.type === 8) throw new Error("Rich text requires a separate renderer")
    }
}

export function formatMessageText(key: string, text: string, locale: string, params?: Record<string, unknown>): string {
    if (literalKeys.has(key)) {
        if (params && Object.keys(params).length) throw new Error("Literal template cannot be interpolated")
        return text
    }
    // Preserve the cheap path for ordinary labels; only ICU/escaping needs a formatter.
    if (!/[{}<>']/.test(text)) return text
    const formatter = formatterFor(text, locale)
    const safeParams = { ...params }
    for (const [name, value] of Object.entries(safeParams)) {
        if (value instanceof Error) {
            console.warn(`[i18n] Error parameter converted to text: ${key}.${name}`)
            safeParams[name] = value.message
        }
    }
    validateArguments(formatter.getAst(), safeParams, locale)
    const result = formatter.format(safeParams as Parameters<IntlMessageFormat["format"]>[0])
    if (typeof result !== "string") throw new Error("Non-text formatting result")
    return result
}

/** Pure recovery boundary; diagnostics never include parameter values or server paths. */
export function renderMessageText(key: string, locale: string, text: string, fallback: string | undefined,
    unavailable: string, params?: Record<string, unknown>): string {
    try {
        return formatMessageText(key, text, locale, params)
    } catch {
        console.warn(`[i18n] Format error: ${locale}:${key}`)
        if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
            const errors: Map<string, number> = (window as any).__seanime_i18n_formatErrors ||= new Map()
            const identifier = `${locale}:${key}`
            errors.set(identifier, (errors.get(identifier) || 0) + 1)
        }
        if (locale !== "en" && fallback !== undefined) {
            try { return formatMessageText(key, fallback, "en", params) } catch { /* Invalid data also affects English. */ }
        }
        return unavailable
    }
}
