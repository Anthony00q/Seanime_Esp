import { Anime_Entry } from "@/api/generated/types"
import { AnimeMetaActionButton } from "@/app/(main)/entry/_components/meta-section"
import { useAnimeEntryPageView } from "@/app/(main)/entry/_containers/anime-entry-page"
import { __torrentSearch_selectionAtom } from "@/app/(main)/entry/_containers/torrent-search/torrent-search-drawer"
import { createTranslator } from "@/locales"
import { useSetAtom } from "jotai/react"
import React, { useMemo } from "react"
import { BiDownload } from "react-icons/bi"

const t = createTranslator()

export function TorrentSearchButton({ entry, onClick }: { entry: Anime_Entry, onClick?: () => void }) {

    const setter = useSetAtom(__torrentSearch_selectionAtom)
    const count = entry.downloadInfo?.episodesToDownload?.length
    const isMovie = useMemo(() => entry.media?.format === "MOVIE", [entry.media?.format])
    const {
        isLibraryView,
    } = useAnimeEntryPageView()

    return (
        <div className="contents" data-torrent-search-button-container>
            <AnimeMetaActionButton
                intent={!isLibraryView ? "gray-subtle" : !entry.downloadInfo?.hasInaccurateSchedule
                    ? (!!count ? "white" : "gray-subtle")
                    : "white-subtle"}
                size="md"
                leftIcon={<BiDownload />}
                iconClass="text-2xl"
                onClick={() => {
                    setter("download")
                    if (onClick) onClick()
                }}
                data-torrent-search-button
            >
                {(!entry.downloadInfo?.hasInaccurateSchedule && !!count) ? <>
                    {(!isMovie) && `${t("entry.episodeList.downloadTorrents")} ${entry.downloadInfo?.batchAll ? t("entry.episodeList.downloadBatch") : t("entry.episodeList.downloadNext")} ${count > 1 ? t("entry.episodeList.downloadEpisodes", { count }) : t("entry.episodeList.downloadEpisode")}`}
                    {(isMovie) && t("entry.episodeList.downloadMovie")}
                </> : <>
                    {t("entry.episodeList.downloadTorrents")}
                </>}
            </AnimeMetaActionButton>
        </div>
    )
}
