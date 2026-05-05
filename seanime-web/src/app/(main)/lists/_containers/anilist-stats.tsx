import { AL_Stats } from "@/api/generated/types"
import { AppLayoutStack } from "@/components/ui/app-layout"
import { AreaChart, BarChart, DonutChart } from "@/components/ui/charts"
import { Separator } from "@/components/ui/separator"
import { Stats } from "@/components/ui/stats"
import React from "react"
import { createTranslator } from "@/locales"
import { translateFormat, translateGenre } from "@/lib/anilist-translations"
import { FaRegStar } from "react-icons/fa"
import { FiBookOpen } from "react-icons/fi"
import { LuHourglass } from "react-icons/lu"
import { PiTelevisionSimpleBold } from "react-icons/pi"
import { TbHistory } from "react-icons/tb"

type AnilistStatsProps = {
    stats?: AL_Stats
    isLoading?: boolean
}

const t = createTranslator("es")

const statusName: Record<string, string> = {
    CURRENT: t("status.current"),
    PLANNING: t("status.planning"),
    COMPLETED: t("status.completed"),
    DROPPED: t("status.dropped"),
    PAUSED: t("status.paused"),
    REPEATING: t("status.repeating"),
}

export function AnilistStats(props: AnilistStatsProps) {

    const {
        stats,
        isLoading,
    } = props

    const anime_formatsStats = React.useMemo(() => {
        if (!stats?.animeStats?.formats) return []

        return stats.animeStats.formats.map((item) => {
            return {
                name: translateFormat(item.format as string),
                count: item.count,
                hoursWatched: Math.round(item.minutesWatched / 60),
                meanScore: Number((item.meanScore / 10).toFixed(1)),
            }
        })
    }, [stats?.animeStats?.formats])

    const anime_statusesStats = React.useMemo(() => {
        if (!stats?.animeStats?.statuses) return []

        return stats.animeStats.statuses.map((item) => {
            return {
                name: statusName[item.status as string],
                count: item.count,
                hoursWatched: Math.round(item.minutesWatched / 60),
                meanScore: Number((item.meanScore / 10).toFixed(1)),
            }
        })
    }, [stats?.animeStats?.statuses])

    const anime_genresStats = React.useMemo(() => {
        if (!stats?.animeStats?.genres) return []

        return stats.animeStats.genres
            .sort((a, b) => b.count - a.count)
            .map((item) => {
                return {
                    name: translateGenre(item.genre ?? ""),
                    [t("anilistStats.count")]: item.count,
                    hoursWatched: Math.round(item.minutesWatched / 60),
                    [t("anilistStats.averageScore")]: Number((item.meanScore / 10).toFixed(1)),
                }
            })
    }, [stats?.animeStats?.genres])

    const [anime_thisYearStats, anime_lastYearStats] = React.useMemo(() => {
        if (!stats?.animeStats?.startYears) return []
        const thisYear = new Date().getFullYear()
        return [
            stats.animeStats.startYears.find((item) => item.startYear === thisYear),
            stats.animeStats.startYears.find((item) => item.startYear === thisYear - 1),
        ]
    }, [stats?.animeStats?.startYears])

    const anime_releaseYearsStats = React.useMemo(() => {
        if (!stats?.animeStats?.releaseYears) return []

        return stats.animeStats.releaseYears.sort((a, b) => a.releaseYear! - b.releaseYear!).map((item) => {
            return {
                name: item.releaseYear,
                [t("anilistStats.count")]: item.count,
                [t("anilistStats.hoursWatched")]: Math.round(item.minutesWatched / 60),
                [t("anilistStats.averageScore")]: Number((item.meanScore / 10).toFixed(1)),
            }
        })
    }, [stats?.animeStats?.releaseYears])

    /////

    const manga_statusesStats = React.useMemo(() => {
        if (!stats?.mangaStats?.statuses) return []

        return stats.mangaStats.statuses.map((item) => {
            return {
                name: statusName[item.status as string],
                count: item.count,
                chaptersRead: item.chaptersRead,
                meanScore: Number((item.meanScore / 10).toFixed(1)),
            }
        })
    }, [stats?.mangaStats?.statuses])

    const manga_genresStats = React.useMemo(() => {
        if (!stats?.mangaStats?.genres) return []

        return stats.mangaStats.genres
            .sort((a, b) => b.count - a.count)
            .map((item) => {
                return {
                    name: translateGenre(item.genre ?? ""),
                    [t("anilistStats.count")]: item.count,
                    chaptersRead: item.chaptersRead,
                    [t("anilistStats.averageScore")]: Number((item.meanScore / 10).toFixed(1)),
                }
            })
    }, [stats?.mangaStats?.genres])

    const [manga_thisYearStats, manga_lastYearStats] = React.useMemo(() => {
        if (!stats?.mangaStats?.startYears) return []
        const thisYear = new Date().getFullYear()
        return [
            stats.mangaStats.startYears.find((item) => item.startYear === thisYear),
            stats.mangaStats.startYears.find((item) => item.startYear === thisYear - 1),
        ]
    }, [stats?.mangaStats?.startYears])

    const manga_releaseYearsStats = React.useMemo(() => {
        if (!stats?.mangaStats?.releaseYears) return []

        return stats.mangaStats.releaseYears.sort((a, b) => a.releaseYear! - b.releaseYear!).map((item) => {
            return {
                name: item.releaseYear,
                [t("anilistStats.count")]: item.count,
                [t("anilistStats.chaptersRead")]: item.chaptersRead,
                [t("anilistStats.averageScore")]: Number((item.meanScore / 10).toFixed(1)),
            }
        })
    }, [stats?.mangaStats?.releaseYears])

    return (
        <AppLayoutStack className="py-4 space-y-10" data-anilist-stats>

            <h1 className="text-center" data-anilist-stats-anime-title>{t("anilistStats.anime")}</h1>

            <div data-anilist-stats-anime-stats>
                <Stats
                    className="w-full"
                    size="lg"
                    items={[
                        {
                            icon: <PiTelevisionSimpleBold />,
                            name: t("anilistStats.totalAnime"),
                            value: stats?.animeStats?.count ?? 0,
                        },
                        {
                            icon: <LuHourglass />,
                            name: t("anilistStats.watchTime"),
                            value: Math.round((stats?.animeStats?.minutesWatched ?? 0) / 60),
                            unit: t("anilistStats.hours"),
                        },
                        {
                            icon: <FaRegStar />,
                            name: t("anilistStats.averageScore"),
                            value: ((stats?.animeStats?.meanScore ?? 0) / 10).toFixed(1),
                        },
                    ]}
                />
                <Separator />
                <Stats
                    className="w-full"
                    size="lg"
                    items={[
                        {
                            icon: <PiTelevisionSimpleBold />,
                            name: t("anilistStats.animeThisYear"),
                            value: anime_thisYearStats?.count ?? 0,
                        },
                        {
                            icon: <TbHistory />,
                            name: t("anilistStats.animeLastYear"),
                            value: anime_lastYearStats?.count ?? 0,
                        },
                        {
                            icon: <FaRegStar />,
                            name: t("anilistStats.averageScoreThisYear"),
                            value: ((anime_thisYearStats?.meanScore ?? 0) / 10).toFixed(1),
                        },
                    ]}
                />
            </div>

            <h3 className="text-center" data-anilist-stats-anime-formats-title>{t("anilistStats.formats")}</h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full" data-anilist-stats-anime-formats-container>
                <ChartContainer legend={t("anilistStats.total")} data-anilist-stats-anime-formats-container-total>
                    <DonutChart
                        data={anime_formatsStats}
                        index="name"
                        category="count"
                        variant="pie"
                    />
                </ChartContainer>
                <ChartContainer legend={t("anilistStats.hoursWatched")} data-anilist-stats-anime-formats-container-hours-watched>
                    <DonutChart
                        data={anime_formatsStats}
                        index="name"
                        category="hoursWatched"
                        variant="pie"
                    />
                </ChartContainer>
                <ChartContainer legend={t("anilistStats.averageScore")} data-anilist-stats-anime-formats-container-average-score>
                    <DonutChart
                        data={anime_formatsStats}
                        index="name"
                        category="meanScore"
                        variant="pie"
                    />
                </ChartContainer>
            </div>

            <Separator />

            <h3 className="text-center" data-anilist-stats-anime-statuses-title>{t("anilistStats.statuses")}</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full" data-anilist-stats-anime-statuses-container>
                <ChartContainer legend={t("anilistStats.total")} data-anilist-stats-anime-statuses-container-total>
                    <DonutChart
                        data={anime_statusesStats}
                        index="name"
                        category="count"
                        variant="pie"
                    />
                </ChartContainer>
                <ChartContainer legend={t("anilistStats.hoursWatched")} data-anilist-stats-anime-statuses-container-hours-watched>
                    <DonutChart
                        data={anime_statusesStats}
                        index="name"
                        category="hoursWatched"
                        variant="pie"
                    />
                </ChartContainer>
            </div>

            <Separator />

            <h3 className="text-center" data-anilist-stats-anime-genres-title>{t("anilistStats.genres")}</h3>

            <div className="grid grid-cols-1 gap-6 w-full" data-anilist-stats-anime-genres-container>
                <ChartContainer legend={t("anilistStats.favoriteGenres")} data-anilist-stats-anime-genres-container-favorite-genres>
                    <BarChart
                        data={anime_genresStats}
                        index="name"
                        categories={[t("anilistStats.count"), t("anilistStats.averageScore")]}
                        colors={["brand", "blue"]}
                    />
                </ChartContainer>
            </div>

            <Separator />

            <h3 className="text-center" data-anilist-stats-anime-years-title>{t("anilistStats.years")}</h3>

            <div className="grid grid-cols-1 gap-6 w-full" data-anilist-stats-anime-years-container>
                <ChartContainer legend={t("anilistStats.animePerReleaseYear")} data-anilist-stats-anime-years-container-anime-watched-per-release-year>
                    <AreaChart
                        data={anime_releaseYearsStats}
                        index="name"
                        categories={[t("anilistStats.count")]}
                        angledLabels
                    />
                </ChartContainer>
            </div>

            {/*////////////////////////////////////////////////////*/}
            {/*////////////////////////////////////////////////////*/}
            {/*////////////////////////////////////////////////////*/}

            <h1 className="text-center pt-20" data-anilist-stats-manga-title>{t("anilistStats.manga")}</h1>

            <div data-anilist-stats-manga-stats>
                <Stats
                    className="w-full"
                    size="lg"
                    items={[
                        {
                            icon: <FiBookOpen />,
                            name: t("anilistStats.totalManga"),
                            value: stats?.mangaStats?.count ?? 0,
                        },
                        {
                            icon: <LuHourglass />,
                            name: t("anilistStats.totalChapters"),
                            value: stats?.mangaStats?.chaptersRead ?? 0,
                        },
                        {
                            icon: <FaRegStar />,
                            name: t("anilistStats.averageScore"),
                            value: ((stats?.mangaStats?.meanScore ?? 0) / 10).toFixed(1),
                        },
                    ]}
                />
                <Separator />
                <Stats
                    className="w-full"
                    size="lg"
                    items={[
                        {
                            icon: <FiBookOpen />,
                            name: t("anilistStats.mangaThisYear"),
                            value: manga_thisYearStats?.count ?? 0,
                        },
                        {
                            icon: <TbHistory />,
                            name: t("anilistStats.mangaLastYear"),
                            value: manga_lastYearStats?.count ?? 0,
                        },
                        {
                            icon: <FaRegStar />,
                            name: t("anilistStats.averageScoreThisYear"),
                            value: ((manga_thisYearStats?.meanScore ?? 0) / 10).toFixed(1),
                        },
                    ]}
                />
            </div>

            <Separator />

            <h3 className="text-center" data-anilist-stats-manga-statuses-title>{t("anilistStats.statuses")}</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full" data-anilist-stats-manga-statuses-container>
                <ChartContainer legend={t("anilistStats.total")} data-anilist-stats-manga-statuses-container-total>
                    <DonutChart
                        data={manga_statusesStats}
                        index="name"
                        category="count"
                        variant="pie"
                    />
                </ChartContainer>
                <ChartContainer legend={t("anilistStats.chaptersRead")} data-anilist-stats-manga-statuses-container-chapters-read>
                    <DonutChart
                        data={manga_statusesStats}
                        index="name"
                        category="chaptersRead"
                        variant="pie"
                    />
                </ChartContainer>
            </div>

            <Separator />

            <h3 className="text-center" data-anilist-stats-manga-genres-title>{t("anilistStats.genres")}</h3>

            <div className="grid grid-cols-1 gap-6 w-full" data-anilist-stats-manga-genres-container>
                <ChartContainer legend={t("anilistStats.favoriteGenres")} data-anilist-stats-manga-genres-container-favorite-genres>
                    <BarChart
                        data={manga_genresStats}
                        index="name"
                        categories={[t("anilistStats.count"), t("anilistStats.averageScore")]}
                        colors={["brand", "blue"]}
                    />
                </ChartContainer>
            </div>

            <Separator />

            <h3 className="text-center" data-anilist-stats-manga-years-title>{t("anilistStats.years")}</h3>

            <div className="grid grid-cols-1 gap-6 w-full" data-anilist-stats-manga-years-container>
                <ChartContainer legend={t("anilistStats.mangaPerReleaseYear")} data-anilist-stats-manga-years-container-manga-read-per-release-year>
                    <AreaChart
                        data={manga_releaseYearsStats}
                        index="name"
                        categories={[t("anilistStats.count")]}
                        angledLabels
                    />
                </ChartContainer>
            </div>

        </AppLayoutStack>
    )
}

function ChartContainer(props: { children: React.ReactNode, legend: string }) {
    return (
        <div className="text-center w-full space-y-4" data-anilist-stats-chart-container>
            {props.children}
            <p className="text-center text-lg font-semibold">{props.legend}</p>
        </div>
    )
}
