import { getDateFnsLocale } from "@/locales/date-locale"

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(getDateFnsLocale().code, options).format(value)
}
