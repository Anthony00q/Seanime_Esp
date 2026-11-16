import { es, enUS, ptBR, type Locale as DateFnsLocale } from "date-fns/locale"
import { getCurrentLocale, type Locale } from "./config"

export const DATE_FNS_LOCALES = {
    es,
    pt: ptBR,
    en: enUS,
} satisfies Record<Locale, DateFnsLocale>

export function getDateFnsLocale(): DateFnsLocale {
    return DATE_FNS_LOCALES[getCurrentLocale()] || es
}
