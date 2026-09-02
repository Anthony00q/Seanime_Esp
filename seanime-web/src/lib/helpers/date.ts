import { format, FormatDistanceToNowOptions, FormatOptions, Locale } from "date-fns"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { getDateFnsLocale } from "@/locales/date-locale"

export function formatDistanceToNowSafe(value: string, options?: FormatDistanceToNowOptions & { locale?: Locale }) {
    try {
        return formatDistanceToNow(value, { addSuffix: true, locale: getDateFnsLocale(), ...options })
    }
    catch (e) {
        return "N/A"
    }
}

export function newDateSafe(value: string) {
    try {
        return new Date(value)
    }
    catch (e) {
        return new Date()
    }
}

/**
 * @deprecated Usa `formatLocalized()` para textos visibles al usuario.
 * `formatSafe` no inyecta locale y quedará en inglés si el formato contiene
 * nombres de días/meses. Solo úsalo para formatos máquina (HH:mm, yyyy-MM-dd).
 */
export function formatSafe(value: Date, formatString: string, options?: FormatOptions | undefined) {
    try {
        return format(value, formatString, options)
    }
    catch (e) {
        let v = new Date()
        return format(v, formatString, options)
    }
}

export function formatLocalized(value: Date, formatString: string, options?: FormatOptions | undefined) {
    try {
        return format(value, formatString, { locale: getDateFnsLocale(), ...options })
    }
    catch (e) {
        let v = new Date()
        return format(v, formatString, { locale: getDateFnsLocale(), ...options })
    }
}

export function normalizeDate(value: string) {
    try {
        let arr = value.split(/[\-\+ :T]/)
        let year = parseInt(arr[0])
        let month = parseInt(arr[1]) - 1
        let day = parseInt(arr[2])

        return new Date(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00`)
    }
    catch (e) {
        return new Date(value)
    }
}
