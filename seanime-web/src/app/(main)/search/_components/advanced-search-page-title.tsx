import { __advancedSearch_getValue, __advancedSearch_paramsAtom } from "@/app/(main)/search/_lib/advanced-search.atoms"
import { useAtomValue } from "jotai/react"
import React from "react"
import { translateSeason, translateGenre } from "@/lib/anilist-translations"

export function AdvancedSearchPageTitle() {

    const params = useAtomValue(__advancedSearch_paramsAtom)

    const title = React.useMemo(() => {
        let str = ""
        if (params.title && params.title.length > 0) {
            str += params.title.charAt(0).toUpperCase() + params.title.slice(1)
            return str
        }
        if (params.type === "anime") str += "Anime"
        else str += "Manga"
        if (__advancedSearch_getValue(params.sorting)?.includes("SCORE_DESC")) str += " mejor valorado"
        if (__advancedSearch_getValue(params.sorting)?.includes("TRENDING_DESC")) str += " en tendencia"
        if (__advancedSearch_getValue(params.sorting)?.includes("POPULARITY_DESC")) str += " popular"
        if (__advancedSearch_getValue(params.sorting)?.includes("START_DATE_DESC")) str += " más reciente"
        if (__advancedSearch_getValue(params.sorting)?.includes("EPISODES_DESC")) str += " con más episodios"
        if (__advancedSearch_getValue(params.sorting)?.includes("CHAPTERS_DESC")) str += " con más capítulos"
        if (!!__advancedSearch_getValue(params.genre)) str += ` de ${params.genre?.map(g => translateGenre(g)).join(", ")}`
        if (params.season || params.year) str += ` de`
        if (params.season) str += ` ${translateSeason(params.season)}`
        if (params.year) str += ` ${params.year}`
        if (!!str) return str
        return params.type === "anime" ? "Anime más gustado" : "Manga más gustado"
    }, [params.title, params.genre, params.sorting, params.type, params.season, params.year])

    return (
        <div data-advanced-search-page-title-container>
            <h2 data-advanced-search-page-title className="line-clamp-2">{title}</h2>
        </div>
    )
}
