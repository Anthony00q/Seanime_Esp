import { translateOptional } from "@/locales"

function translateAnilist(prefix: string, value: string): string {
    if (!value) return value
    const key = `anilist.${prefix}.${value}`
    return translateOptional(key, value)
}

export const translateGenre = (v: string) => translateAnilist("genres", v)
export const translateFormat = (v: string) => translateAnilist("formats", v)
export const translateSeason = (v: string) => translateAnilist("seasons", v)
export const translateStatus = (v: string) => translateAnilist("statuses", v)
export const translateTag = (v: string) => translateAnilist("tags", v)

function translateCountryAnilist(value: string): string {
    if (!value) return value
    const key = `seaCommand.countries.${value}`
    return translateOptional(key, value)
}

export const translateCountry = (v: string) => translateCountryAnilist(v)
