import { AL_BaseAnime, Anime_EntryDownloadInfo } from "@/api/generated/types"
import { EpisodeGridItem } from "@/app/(main)/_features/anime/_components/episode-grid-item"
import { PluginEpisodeGridItemMenuItems } from "@/app/(main)/_features/plugin/actions/plugin-actions"
import { useHasTorrentProvider } from "@/app/(main)/_hooks/use-server-status"
import { EpisodeListGrid } from "@/app/(main)/entry/_components/episode-list-grid"
import {
    __torrentSearch_selectionAtom,
    __torrentSearch_selectionEpisodeAtom,
} from "@/app/(main)/entry/_containers/torrent-search/torrent-search-drawer"
import { useSetAtom } from "jotai"
import { createTranslator } from "@/locales"
import { getDateFnsLocale } from "@/locales/date-locale"
import { format } from "date-fns"
import React, { startTransition } from "react"
import { BiCalendarAlt, BiDownload } from "react-icons/bi"
import { EpisodeItemInfoModalButton } from "./episode-item"

export function UndownloadedEpisodeList({ downloadInfo, media, watchedProgress, maxCol }: {
    downloadInfo: Anime_EntryDownloadInfo | undefined,
    media: AL_BaseAnime
    watchedProgress?: number
    maxCol?: number
}) {

    const t = createTranslator()
    const episodes = downloadInfo?.episodesToDownload

    const setTorrentSearchIsOpen = useSetAtom(__torrentSearch_selectionAtom)
    const setTorrentSearchEpisode = useSetAtom(__torrentSearch_selectionEpisodeAtom)

    const { hasTorrentProvider } = useHasTorrentProvider()

    const text = hasTorrentProvider ? (downloadInfo?.rewatch
            ? t("entry.undownloadedNotDownloaded")
            : t("entry.undownloadedNotWatched")) :
        t("entry.undownloadedNotInLibrary")

    if (!episodes?.length) return null

    return (
        <div className="space-y-4" data-undownloaded-episode-list>
            <p className={""}>
                {text}
            </p>
            <EpisodeListGrid maxCol={maxCol}>
                {episodes?.sort((a, b) => a.episodeNumber - b.episodeNumber).slice(0, 28).map((ep, idx) => {
                    if (!ep.episode) return null
                    const episode = ep.episode
                    return (
                        <EpisodeGridItem
                            key={ep.episode.localFile?.path || idx}
                            media={media}
                            image={episode.episodeMetadata?.image}
                            isInvalid={episode.isInvalid}
                            title={episode.displayTitle}
                            episodeTitle={episode.episodeTitle}
                            episodeNumber={episode.episodeNumber}
                            watchedProgress={watchedProgress}
                            progressNumber={episode.progressNumber}
                            description={episode.episodeMetadata?.summary || episode.episodeMetadata?.overview}
                            action={<>
                                {hasTorrentProvider && <div
                                    data-undownloaded-episode-list-action-download-button
                                    onClick={() => {
                                        setTorrentSearchEpisode(episode.episodeNumber)
                                        startTransition(() => {
                                            setTorrentSearchIsOpen("download")
                                        })
                                    }}
                                    className="inline-block text-orange-200 text-2xl animate-pulse cursor-pointer py-2"
                                >
                                    <BiDownload />
                                </div>}

                                <EpisodeItemInfoModalButton episode={episode} />

                                <PluginEpisodeGridItemMenuItems isDropdownMenu={true} type="undownloaded" episode={episode} />
                            </>}
                        >
                            <div data-undownloaded-episode-list-episode-metadata-container className="mt-1">
                                <p data-undownloaded-episode-list-episode-metadata-text className="flex gap-1 items-center text-sm text-[--muted]">
                                    <BiCalendarAlt /> {episode.episodeMetadata?.airDate
                                        ? `${t("entry.airedOn")} ${format(new Date(episode.episodeMetadata.airDate), "P", { locale: getDateFnsLocale() })}`
                                        : t("entry.aired")}
                                </p>
                            </div>
                        </EpisodeGridItem>
                    )
                })}
            </EpisodeListGrid>
            {episodes.length > 28 && <h3>{t("entry.andMore")}</h3>}
        </div>
    )

}
