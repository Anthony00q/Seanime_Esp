import { es, enUS, ptBR, Locale } from "date-fns/locale"
import { defaultLocale } from "./config"

const DATE_FNS_LOCALES: Record<string, Locale> = {
    es,
    pt: ptBR,
    en: enUS,
}

export function getDateFnsLocale(): Locale {
    return DATE_FNS_LOCALES[defaultLocale] || es
}
