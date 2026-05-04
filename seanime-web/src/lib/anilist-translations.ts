import { createTranslator } from "@/locales"

const t = createTranslator("es")

function translateAnilist(prefix: string, value: string): string {
    if (!value) return value
    const key = `anilist.${prefix}.${value}`
    const result = t(key)
    return result === key ? value : result
}

export const translateGenre = (v: string) => translateAnilist("genres", v)
export const translateFormat = (v: string) => translateAnilist("formats", v)
export const translateSeason = (v: string) => translateAnilist("seasons", v)
export const translateStatus = (v: string) => translateAnilist("statuses", v)
export const translateTag = (v: string) => translateAnilist("tags", v)
