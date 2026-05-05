import { Models_HomeItem, Nullish } from "@/api/generated/types"
import { ADVANCED_SEARCH_COUNTRIES_MANGA, ADVANCED_SEARCH_MEDIA_GENRES } from "@/app/(main)/search/_lib/advanced-search-constants"
import { createTranslator } from "@/locales"

export const DEFAULT_HOME_ITEMS: Models_HomeItem[] = [
    {
        id: "anime-continue-watching",
        type: "anime-continue-watching",
        schemaVersion: 1,
    },
    {
        id: "anime-library",
        type: "anime-library",
        schemaVersion: 1,
        options: {
            statuses: ["CURRENT", "PAUSED", "PLANNING", "COMPLETED", "DROPPED"],
            layout: "grid",
        },
    },
]

export function isAnimeLibraryItemsOnly(items: Nullish<Models_HomeItem[]>) {
    if (!items) return true

    for (const item of items) {
        if (![
            "anime-continue-watching",
            "anime-library",
            "anime-continue-watching-header",
            "local-anime-library",
            "local-anime-library-stats",
            "library-upcoming-episodes",
        ].includes(item.type)) {
            return false
        }
    }
    return true
}

type HomeItemSchema = {
    name: string
    kind: ("row" | "header")[]
    options?: { label: string, name: string, type: string, options?: any[] }[]
    schemaVersion: number
    description?: string
}

const t = createTranslator("es")

const _carouselOptions = [
    {
        label: t("common.labels.name"),
        type: "text",
        name: "name",
    },
    {
        label: t("home.items.options.sorting.label"),
        type: "select",
        name: "sorting",
        options: [
            {
                label: t("home.items.options.sorting.popular"),
                value: "POPULARITY_DESC",
            },
            {
                label: t("home.items.options.sorting.trending"),
                value: "TRENDING_DESC",
            },
            {
                label: t("home.items.options.sorting.romajiTitle"),
                value: "TITLE_ROMAJI_ASC",
            },
            {
                label: t("home.items.options.sorting.romajiTitleDesc"),
                value: "TITLE_ROMAJI_DESC",
            },
            {
                label: t("home.items.options.sorting.englishTitle"),
                value: "TITLE_ENGLISH_ASC",
            },
            {
                label: t("home.items.options.sorting.englishTitleDesc"),
                value: "TITLE_ENGLISH_DESC",
            },
            {
                label: t("home.items.options.sorting.score"),
                value: "SCORE",
            },
            {
                label: t("home.items.options.sorting.scoreDesc"),
                value: "SCORE_DESC",
            },
        ],
    },
    {
        label: t("home.items.options.status.label"),
        type: "multi-select",
        name: "status",
        options: [
            {
                label: t("home.items.options.status.releasing"),
                value: "RELEASING",
            },
            {
                label: t("home.items.options.status.finished"),
                value: "FINISHED",
            },
            {
                label: t("home.items.options.status.notYetReleased"),
                value: "NOT_YET_RELEASED",
            },
        ],
    },
    {
        label: t("home.items.options.format.label"),
        type: "select",
        name: "format",
        options: [
            {
                label: t("home.items.options.format.tv"),
                value: "TV",
            },
            {
                label: t("home.items.options.format.movie"),
                value: "MOVIE",
            },
            {
                label: t("home.items.options.format.ova"),
                value: "OVA",
            },
            {
                label: t("home.items.options.format.ona"),
                value: "ONA",
            },
            {
                label: t("home.items.options.format.special"),
                value: "SPECIAL",
            },
        ],
    },
    {
        label: t("home.items.options.genres.label"),
        type: "multi-select",
        options: ADVANCED_SEARCH_MEDIA_GENRES.map(n => ({ value: n, label: n })),
        name: "genres",
    },
    {
        label: t("home.items.options.season.label"),
        type: "select",
        name: "season",
        options: [
            { value: "WINTER", label: t("home.items.options.season.winter") },
            { value: "SPRING", label: t("home.items.options.season.spring") },
            { value: "SUMMER", label: t("home.items.options.season.summer") },
            { value: "FALL", label: t("home.items.options.season.fall") },
        ],
    },
    {
        label: t("home.items.options.year.label"),
        type: "number",
        name: "year",
        min: 0,
        max: 2100,
    },
    {
        label: t("home.items.options.countryOfOrigin.label"),
        type: "select",
        name: "countryOfOrigin",
        options: ADVANCED_SEARCH_COUNTRIES_MANGA,
    },
]

export const HOME_ITEMS: Record<string, HomeItemSchema> = {
    "centered-title": {
        name: t("home.items.centeredTitle.name"),
        kind: ["row"],
        schemaVersion: 1,
        description: t("home.items.centeredTitle.description"),
        options: [{
            label: t("home.items.options.text"),
            type: "text",
            name: "text",
        }],
    },
    "anime-continue-watching": {
        name: t("home.items.continueWatching.name"),
        kind: ["row", "header"],
        schemaVersion: 1,
        description: t("home.items.continueWatching.description"),
    },
    "anime-continue-watching-header": {
        name: t("home.items.continueWatchingHeader.name"),
        kind: ["header"],
        schemaVersion: 1,
        description: t("home.items.continueWatchingHeader.description"),
    },
    "anime-library": {
        name: t("home.items.animeLibrary.name"),
        kind: ["row"],
        schemaVersion: 2,
        description: t("home.items.animeLibrary.description"),
        options: [
            {
                label: t("home.items.options.statuses"),
                name: "statuses",
                type: "multi-select",
                options: [
                    {
                        value: "CURRENT",
                        label: t("status.currentlyWatching"),
                    },
                    {
                        value: "PAUSED",
                        label: t("status.paused"),
                    },
                    {
                        value: "PLANNING",
                        label: t("status.planning"),
                    },
                    {
                        value: "COMPLETED",
                        label: t("status.completed"),
                    },
                    {
                        value: "DROPPED",
                        label: t("status.dropped"),
                    },
                ],
            },
            {
                label: t("home.items.options.layout.label"),
                name: "layout",
                type: "select",
                options: [
                    {
                        label: t("home.items.options.layout.grid"),
                        value: "grid",
                    },
                    {
                        label: t("home.items.options.layout.carousel"),
                        value: "carousel",
                    },
                ],
            },
        ],
    },
    "my-lists": {
        name: t("home.items.myLists.name"),
        kind: ["row"],
        schemaVersion: 1,
        description: t("home.items.myLists.description"),
        options: [
            {
                label: t("home.items.options.statuses"),
                name: "statuses",
                type: "multi-select",
                options: [
                    {
                        value: "CURRENT",
                        label: t("status.current"),
                    },
                    {
                        value: "REPEATING",
                        label: t("status.repeating"),
                    },
                    {
                        value: "PAUSED",
                        label: t("status.paused"),
                    },
                    {
                        value: "PLANNING",
                        label: t("status.planning"),
                    },
                    {
                        value: "COMPLETED",
                        label: t("status.completed"),
                    },
                    {
                        value: "DROPPED",
                        label: t("status.dropped"),
                    },
                ],
            },
            {
                label: t("home.items.options.layout.label"),
                name: "layout",
                type: "select",
                options: [
                    {
                        label: t("home.items.options.layout.grid"),
                        value: "grid",
                    },
                    {
                        label: t("home.items.options.layout.carousel"),
                        value: "carousel",
                    },
                ],
            },
            {
                label: t("home.items.options.type.label"),
                name: "type",
                type: "select",
                options: [
                    {
                        label: t("home.items.options.type.anime"),
                        value: "anime",
                    },
                    {
                        label: t("home.items.options.type.manga"),
                        value: "manga",
                    },
                ],
            },
            {
                label: t("home.items.options.customListName.label"),
                type: "text",
                name: "customListName",
            },
        ],
    },
    "local-anime-library": {
        name: t("home.items.localAnimeLibrary.name"),
        kind: ["row"],
        schemaVersion: 2,
        description: t("home.items.localAnimeLibrary.description"),
        options: [
            {
                label: t("home.items.options.layout.label"),
                name: "layout",
                type: "select",
                options: [
                    {
                        label: t("home.items.options.layout.grid"),
                        value: "grid",
                    },
                    {
                        label: t("home.items.options.layout.carousel"),
                        value: "carousel",
                    },
                ],
            },
        ],
    },
    "library-upcoming-episodes": {
        name: t("home.items.upcomingEpisodes.name"),
        kind: ["row"],
        schemaVersion: 1,
        description: t("home.items.upcomingEpisodes.description"),
    },
    "aired-recently": {
        name: t("home.items.airedRecently.name"),
        kind: ["row"],
        schemaVersion: 1,
        description: t("home.items.airedRecently.description"),
    },
    "missed-sequels": {
        name: t("home.items.missedSequels.name"),
        kind: ["row"],
        schemaVersion: 1,
        description: t("home.items.missedSequels.description"),
    },
    "anime-schedule-calendar": {
        name: t("home.items.animeScheduleCalendar.name"),
        kind: ["row"],
        schemaVersion: 2,
        description: t("home.items.animeScheduleCalendar.description"),
        options: [
            {
                label: t("home.items.options.carouselType.label"),
                name: "type",
                type: "select",
                options: [
                    {
                        label: t("home.items.options.carouselType.myLists"),
                        value: "my-lists",
                    },
                    {
                        label: t("home.items.options.carouselType.global"),
                        value: "global",
                    },
                ],
            },
        ],
    },
    "local-anime-library-stats": {
        name: t("home.items.localAnimeLibraryStats.name"),
        kind: ["row"],
        schemaVersion: 1,
        description: t("home.items.localAnimeLibraryStats.description"),
    },
    "discover-header": {
        name: t("home.items.discoverHeader.name"),
        kind: ["header"],
        schemaVersion: 1,
        description: t("home.items.discoverHeader.description"),
    },
    "anime-carousel": {
        name: t("home.items.animeCarousel.name"),
        kind: ["row"],
        schemaVersion: 3,
        options: _carouselOptions,
        description: t("home.items.animeCarousel.description"),
    },
    "manga-carousel": {
        name: t("home.items.mangaCarousel.name"),
        kind: ["row"],
        schemaVersion: 1,
        description: t("home.items.mangaCarousel.description"),
        options: _carouselOptions.map(n => {
            if (n.name === "format") {
                return {
                    ...n,
                    options: [
                        {
                            label: t("home.items.options.format.manga"),
                            value: "MANGA",
                        },
                        {
                            label: t("home.items.options.format.oneShot"),
                            value: "ONE_SHOT",
                        },
                    ],
                }
            }
            return n
        }),
    },
    "manga-library": {
        name: t("home.items.mangaLibrary.name"),
        kind: ["row", "header"],
        schemaVersion: 2,
        description: t("home.items.mangaLibrary.description"),
        options: [
            {
                label: t("home.items.options.statuses"),
                name: "statuses",
                type: "multi-select",
                options: [
                    {
                        value: "CURRENT",
                        label: t("status.currentlyReading"),
                    },
                    {
                        value: "PAUSED",
                        label: t("status.paused"),
                    },
                ],
            },
            {
                label: t("home.items.options.layout.label"),
                name: "layout",
                type: "select",
                options: [
                    {
                        label: t("home.items.options.layout.grid"),
                        value: "grid",
                    },
                    {
                        label: t("home.items.options.layout.carousel"),
                        value: "carousel",
                    },
                ],
            },
        ],
    },
}

export const HOME_ITEM_IDS = Object.keys(HOME_ITEMS)