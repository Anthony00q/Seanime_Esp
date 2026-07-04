import { useGetAnimeCollection } from "@/api/hooks/anilist.hooks"
import { useGetUpcomingEpisodes } from "@/api/hooks/anime_entries.hooks.ts"
import { EpisodeCard } from "@/app/(main)/_features/anime/_components/episode-card"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { AppLayoutStack } from "@/components/ui/app-layout"
import { Carousel, CarouselContent, CarouselDotButtons, CarouselItem } from "@/components/ui/carousel"
import { useRouter } from "@/lib/navigation"
import { useMissingEpisodeSpoilers } from "@/lib/theme/anime-spoilers"
import { useThemeSettings } from "@/lib/theme/theme-hooks"
import { addSeconds, formatDistanceToNow } from "date-fns"
import { getDateFnsLocale } from "@/locales/date-locale"
import React from "react"
import { createTranslator } from "@/locales"

const t = createTranslator()

/**
 * @description
 * Displays a carousel of upcoming episodes based on the user's anime list.
 */
export function UpcomingEpisodes() {
    const serverStatus = useServerStatus()
    const router = useRouter()
    const ts = useThemeSettings()
    const spoilerActive = useMissingEpisodeSpoilers(ts)

    const { data: animeCollection } = useGetAnimeCollection()

    const { data } = useGetUpcomingEpisodes()

    if (!data?.episodes?.length) return null

    return (
        <AppLayoutStack>
            {data?.episodes.length > 0 && (
                <>
                    <div>
                        <h2>{t("schedule.upcomingEpisodes")}</h2>
                        <p className="text-[--muted]">{t("schedule.subtitle")}</p>
                    </div>

                    <Carousel
                        className="w-full max-w-full"
                        gap="md"
                        opts={{
                            align: "start",
                        }}
                        autoScroll
                    >
                        <CarouselDotButtons />
                        <CarouselContent>
                            {data?.episodes.map(item => {
                                return (
                                    <CarouselItem
                                        key={item.mediaId}
                                        className="md:basis-1/2 lg:basis-1/3 2xl:basis-1/4 min-[2000px]:basis-1/5"
                                    >
                                        <EpisodeCard
                                            key={item.mediaId}
                                            image={item.episodeMetadata?.image || item.baseAnime?.bannerImage || item.baseAnime?.coverImage?.large}
                                            spoilerSafeImage={item.baseAnime?.bannerImage || item.baseAnime?.coverImage?.extraLarge || item.baseAnime?.coverImage?.large}
                                            topTitle={item?.baseAnime?.title?.userPreferred}
                                            isAdult={item.baseAnime?.isAdult}
                                            spoilerMode="replace"
                                            spoilerActive={spoilerActive}
                                            title={`Episode ${item.episodeNumber}`}
                                            meta={formatDistanceToNow(addSeconds(new Date(), item.timeUntilAiring!),
                                                { addSuffix: true, locale: getDateFnsLocale() })}
                                            imageClass="opacity-50"
                                            actionIcon={null}
                                            onClick={() => {
                                                router.push(`/entry?id=${item.mediaId}`)
                                            }}
                                            anime={{
                                                id: item.mediaId,
                                                image: item.baseAnime?.coverImage?.large,
                                                title: item?.baseAnime?.title?.userPreferred,
                                            }}
                                        />
                                    </CarouselItem>
                                )
                            })}
                        </CarouselContent>
                    </Carousel>
                </>
            )}
        </AppLayoutStack>
    )
}
