import { createTranslator } from "@/locales"

function translateAnilist(prefix: string, value: string): string {
    if (!value) return value
    const t = createTranslator()
    const key = `anilist.${prefix}.${value}`
    const result = t(key as any)
    return result === key ? value : result
}

export const translateGenre = (v: string) => translateAnilist("genres", v)
export const translateFormat = (v: string) => translateAnilist("formats", v)
export const translateSeason = (v: string) => translateAnilist("seasons", v)
export const translateStatus = (v: string) => translateAnilist("statuses", v)
export const translateTag = (v: string) => translateAnilist("tags", v)

function translateCountryAnilist(value: string): string {
    if (!value) return value
    const t = createTranslator()
    const key = `seaCommand.countries.${value}`
    const result = t(key as any)
    return result === key ? value : result
}

export const translateCountry = (v: string) => translateCountryAnilist(v)
