import { Anime_Episode, HibikeTorrent_AnimeTorrent } from "@/api/generated/types"
import { useGetAnimeCollection } from "@/api/hooks/anilist.hooks"
import { useGetAnimeEpisodeCollection } from "@/api/hooks/anime.hooks"
import { useGetAnimeEntry } from "@/api/hooks/anime_entries.hooks"
import { useTorrentClientDownload } from "@/api/hooks/torrent_client.hooks"
import { useAutoPlaySelectedTorrent, useDebridstreamAutoplay, useTorrentstreamAutoplay } from "@/app/(main)/_features/autoplay/autoplay"
import { seaCommand_compareMediaTitles } from "@/app/(main)/_features/sea-command/utils.ts"
import { useHasDebridService, useHasTorrentStreaming, useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { useHandleStartDebridStream } from "@/app/(main)/entry/_containers/debrid-stream/_lib/handle-debrid-stream"
import { __debridStream_autoSelectFileAtom } from "@/app/(main)/entry/_containers/debrid-stream/debrid-stream-page"
import { useTorrentSearchSelectedStreamEpisode } from "@/app/(main)/entry/_containers/torrent-search/_lib/handle-torrent-selection"
import { getDefaultDestination } from "@/app/(main)/entry/_containers/torrent-search/torrent-download-file-selection"
import {
    __torrentSearch_selectionAtom,
    __torrentSearch_selectionEpisodeAtom,
} from "@/app/(main)/entry/_containers/torrent-search/torrent-search-drawer"
import { useHandleStartTorrentStream } from "@/app/(main)/entry/_containers/torrent-stream/_lib/handle-torrent-stream"
import { __torrentSearch_fileSelectionTorrentAtom } from "@/app/(main)/entry/_containers/torrent-stream/torrent-stream-file-selection-modal"
import { __torrentStream_autoSelectFileAtom } from "@/app/(main)/entry/_containers/torrent-stream/torrent-stream-page"
import { CommandGroup, CommandItem } from "@/components/ui/command"
import { useDebounce } from "@/hooks/use-debounce"
import { createTranslator } from "@/locales"
import { useRouter } from "@/lib/navigation"
import { TORRENT_CLIENT } from "@/lib/server/settings.ts"
import { atom } from "jotai"
import { useAtom, useAtomValue, useSetAtom } from "jotai/react"
import React from "react"
import { CommandHelperText, CommandItemMedia } from "./_components/command-utils"
import { __seaCommand_isOpen } from "./sea-command"
import { useSeaCommandContext } from "./sea-command"

const steps = ["magnet", "select-anime", "episode", "action"] as const
export const __seaCommand_torrentMagnetStepAtom = atom<typeof steps[number]>("magnet")
export const __seaCommand_torrentMagnetLinkAtom = atom<string | null>(null)
export const __seaCommand_torrentMagnetMediaIdAtom = atom<number | null>(null)
export const __seaCommand_torrentMagnetEpisodeNumberAtom = atom<number | null>(null)

export function isMagnetLink(value: string) {
    return value.trim().toLowerCase().startsWith("magnet:?")
}

function parseMagnetMetadata(magnetLink: string) {
    try {
        const url = new URL(magnetLink)
        const xt = url.searchParams.get("xt") || ""
        return {
            name: url.searchParams.get("dn") || "Magnet link",
            infoHash: xt.replace(/^urn:btih:/i, "") || undefined,
        }
    }
    catch {
        const match = magnetLink.match(/xt=urn:btih:([^&]+)/i)
        return {
            name: "Magnet link",
            infoHash: match?.[1],
        }
    }
}

function createManualMagnetTorrent(magnetLink: string): HibikeTorrent_AnimeTorrent {
    const metadata = parseMagnetMetadata(magnetLink)

    return {
        provider: "",
        name: metadata.name,
        date: "",
        size: 0,
        formattedSize: "",
        seeders: 0,
        leechers: 0,
        downloadCount: 0,
        link: magnetLink,
        downloadUrl: "",
        magnetLink,
        infoHash: metadata.infoHash,
        isBestRelease: false,
        confirmed: true,
    }
}

function matchesEpisodeSearch(episode: Anime_Episode, query: string) {
    if (!query) return true

    const normalizedQuery = query.toLowerCase()
    return [
        episode.displayTitle,
        episode.episodeTitle,
        String(episode.episodeNumber),
        episode.aniDBEpisode,
    ].some(value => value?.toLowerCase().includes(normalizedQuery))
}

// Allows pasting magnet links
// paste -> choose anime -> choose streaming mode / download
export function SeaCommandTorrentMagnet() {

    const [open, setOpen] = useAtom(__seaCommand_isOpen)

    const serverStatus = useServerStatus()

    const { data: animeCollection, isLoading: isAnimeLoading } = useGetAnimeCollection() // should be available instantly
    const anime = animeCollection?.MediaListCollection?.lists?.flatMap(n => n?.entries)?.filter(Boolean)?.map(n => n.media)?.filter(Boolean) ?? []

    const [step, setStep] = useAtom(__seaCommand_torrentMagnetStepAtom)
    const [magnet, setMagnet] = useAtom(__seaCommand_torrentMagnetLinkAtom)
    const [selectedMediaId, setSelectedMediaId] = useAtom(__seaCommand_torrentMagnetMediaIdAtom)
    const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useAtom(__seaCommand_torrentMagnetEpisodeNumberAtom)

    const { setInput, command: { command, args } } = useSeaCommandContext()

    const { hasDebridService } = useHasDebridService()
    const { hasTorrentStreaming } = useHasTorrentStreaming()
    const torrentStreamAutoSelectFile = useAtomValue(__torrentStream_autoSelectFileAtom)
    const debridStreamAutoSelectFile = useAtomValue(__debridStream_autoSelectFileAtom)

    const { data: entry, isLoading: isEntryLoading } = useGetAnimeEntry(selectedMediaId)
    const { data: episodeCollection, isLoading: isEpisodeLoading } = useGetAnimeEpisodeCollection(selectedMediaId)

    const router = useRouter()

    const { setAutoPlayTorrent } = useAutoPlaySelectedTorrent()
    const { setTorrentstreamAutoplayInfo } = useTorrentstreamAutoplay()
    const { setDebridstreamAutoplayInfo } = useDebridstreamAutoplay()
    const { handleStreamSelection: startTorrentStream } = useHandleStartTorrentStream()
    const { handleStreamSelection: startDebridStream } = useHandleStartDebridStream()
    const { mutate: downloadTorrent } = useTorrentClientDownload(() => {
        router.push("/torrent-list")
    })

    const setTorrentSearchSelection = useSetAtom(__torrentSearch_selectionAtom)
    const setTorrentSearchSelectionEpisode = useSetAtom(__torrentSearch_selectionEpisodeAtom)
    const setTorrentSearchFileSelectionTorrent = useSetAtom(__torrentSearch_fileSelectionTorrentAtom)
    const { setTorrentSearchStreamEpisode } = useTorrentSearchSelectedStreamEpisode()


    const t = createTranslator("es")

    const searchInput = args.join(" ").trim()
    const debouncedSearch = useDebounce(searchInput, 500)
    const filteredAnime = (command === "magnet" && step === "select-anime" && debouncedSearch.length > 0)
        ? anime.filter(n => seaCommand_compareMediaTitles(n.title,
            debouncedSearch))
        : anime
    const episodes = React.useMemo(() => {
        return [...(episodeCollection?.episodes ?? [])].sort((a, b) => a.episodeNumber - b.episodeNumber)
    }, [episodeCollection?.episodes])
    const filteredEpisodes = React.useMemo(() => {
        return episodes.filter(episode => matchesEpisodeSearch(episode, searchInput))
    }, [episodes, searchInput])
    const selectedEpisode = React.useMemo(() => {
        return episodes.find(episode => episode.episodeNumber === selectedEpisodeNumber) ?? null
    }, [episodes, selectedEpisodeNumber])
    const selectedTorrent = React.useMemo(() => {
        return magnet ? createManualMagnetTorrent(magnet) : null
    }, [magnet])
    const defaultDestination = React.useMemo(() => {
        return entry ? getDefaultDestination(entry, serverStatus?.settings?.library?.libraryPath) : ""
    }, [entry, serverStatus?.settings?.library?.libraryPath])
    const canDownload = !!entry?.media
        && !!defaultDestination
        && serverStatus?.settings?.torrent?.defaultTorrentClient !== TORRENT_CLIENT.NONE
    const canStreamSelectedEpisode = !!selectedEpisode?.aniDBEpisode
    const isValidMagnet = isMagnetLink(searchInput)

    function reset() {
        setStep("magnet")
        setMagnet(null)
        setSelectedMediaId(null)
        setSelectedEpisodeNumber(null)
    }

    function finish() {
        reset()
        setInput("")
        setOpen(false)
    }

    function syncStreamingEpisode(type: "torrentstream" | "debridstream") {
        if (!entry || !selectedEpisode) return

        setTorrentSearchStreamEpisode(selectedEpisode)
        setTorrentSearchSelectionEpisode(selectedEpisode.episodeNumber)

        const nextEpisode = episodes.find(episode => episode.episodeNumber === selectedEpisode.episodeNumber + 1)
        const autoplayInfo = nextEpisode?.aniDBEpisode ? {
            allEpisodes: episodes,
            entry,
            episodeNumber: nextEpisode.episodeNumber,
            aniDBEpisode: nextEpisode.aniDBEpisode,
            type,
        } : null

        if (type === "torrentstream") {
            setTorrentstreamAutoplayInfo(autoplayInfo)
        } else {
            setDebridstreamAutoplayInfo(autoplayInfo)
        }
    }

    function openManualFileSelection(type: "torrentstream-select-file" | "debridstream-select-file", tab: "torrentstream" | "debridstream") {
        if (!entry || !selectedEpisode || !selectedTorrent) return

        syncStreamingEpisode(tab)
        setTorrentSearchSelection(type)
        setTorrentSearchFileSelectionTorrent(selectedTorrent)

        finish()
        router.push(`/entry?id=${entry.mediaId}&tab=${tab}`)
    }

    function handleStartTorrentStreaming() {
        if (!entry || !selectedEpisode?.aniDBEpisode || !selectedTorrent) return

        if (!torrentStreamAutoSelectFile) {
            openManualFileSelection("torrentstream-select-file", "torrentstream")
            return
        }

        syncStreamingEpisode("torrentstream")
        setAutoPlayTorrent(selectedTorrent, entry)
        finish()
        startTorrentStream({
            torrent: selectedTorrent,
            mediaId: entry.mediaId,
            episodeNumber: selectedEpisode.episodeNumber,
            aniDBEpisode: selectedEpisode.aniDBEpisode,
            chosenFileIndex: undefined,
            batchEpisodeFiles: undefined,
        })
    }

    function handleStartDebridStreaming() {
        if (!entry || !selectedEpisode?.aniDBEpisode || !selectedTorrent) return

        if (!debridStreamAutoSelectFile) {
            openManualFileSelection("debridstream-select-file", "debridstream")
            return
        }

        syncStreamingEpisode("debridstream")
        setAutoPlayTorrent(selectedTorrent, entry)
        finish()
        startDebridStream({
            torrent: selectedTorrent,
            mediaId: entry.mediaId,
            episodeNumber: selectedEpisode.episodeNumber,
            aniDBEpisode: selectedEpisode.aniDBEpisode,
            chosenFileId: "",
            batchEpisodeFiles: undefined,
        })
    }

    function handleDownload() {
        if (!entry?.media || !selectedTorrent || !canDownload) return

        finish()
        downloadTorrent({
            torrents: [selectedTorrent],
            destination: defaultDestination,
            smartSelect: {
                enabled: false,
                missingEpisodeNumbers: [],
            },
            media: entry.media,
        })
    }

    React.useEffect(() => {
        if (!open) {
            reset()
        }
    }, [open])


    return (
        <>
            {(searchInput === "" && step === "magnet") ? (
                <>
                    <CommandHelperText
                        command="/magnet [magnet link]"
                        description={t("seaCommand.pasteMagnetDesc")}
                        show={true}
                    />
                </>
            ) : (
                <>

                    {step === "magnet" && (
                        <CommandGroup heading={t("seaCommand.pasteMagnetHeading")}>
                            {isValidMagnet ? <CommandItem
                                onSelect={() => {
                                    setStep("select-anime")
                                    setMagnet(searchInput)
                                    setInput("/magnet ")
                                }}
                            >
                                {t("seaCommand.continue")}
                            </CommandItem> : <p className="px-2 pb-2 text-sm text-[--muted]">
                                {t("seaCommand.pasteValidMagnet")}
                            </p>}
                            <CommandItem
                                onSelect={() => {
                                    reset()
                                    setInput("/magnet ")
                                }}
                            >
                                {t("seaCommand.cancel")}
                            </CommandItem>
                        </CommandGroup>
                    )}

                    {step === "select-anime" && (
                        <CommandGroup heading={t("seaCommand.selectAnime")}>
                            <div className="px-2 pb-2 space-y-1">
                                {magnet && (
                                    <div className="flex items-center gap-2 line-clamp-2">
                                        <span className="text-sm text-[--muted] flex-none">
                                            {t("seaCommand.magnetLink")}
                                        </span>
                                        <span className="text-sm text-[--foreground]">
                                            {magnet}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <CommandItem
                                onSelect={() => {
                                    reset()
                                    setInput(`/magnet ${magnet ?? ""}`)
                                }}
                            >
                                {t("seaCommand.back")}
                            </CommandItem>
                            {isAnimeLoading && <p className="px-2 pb-2 text-sm text-[--muted]">{t("seaCommand.loadingAnime")}</p>}
                            {filteredAnime.map(n => (
                                <CommandItem
                                    key={n.id}
                                    onSelect={() => {
                                        setSelectedMediaId(n.id)
                                        setSelectedEpisodeNumber(null)
                                        setStep("episode")
                                        setInput("/magnet ")
                                    }}
                                >
                                    <CommandItemMedia media={n} type="anime" />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {step === "episode" && (
                        <CommandGroup heading={t("seaCommand.selectEpisode")}>
                            <div className="px-2 pb-2 space-y-1">
                                {magnet && (
                                    <div className="flex items-center gap-2 line-clamp-2">
                                        <span className="text-sm text-[--muted] flex-none">
                                            {t("seaCommand.magnetLink")}
                                        </span>
                                        <span className="text-sm text-[--foreground]">
                                            {magnet}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <CommandItem
                                onSelect={() => {
                                    setStep("select-anime")
                                    setSelectedMediaId(null)
                                    setSelectedEpisodeNumber(null)
                                    setInput("/magnet ")
                                }}
                            >
                                {t("seaCommand.back")}
                            </CommandItem>

                            {/*{entry?.media && (*/}
                            {/*    <CommandItem*/}
                            {/*        onSelect={() => {*/}
                            {/*            finish()*/}
                            {/*            router.push(`/entry?id=${entry.mediaId}`)*/}
                            {/*        }}*/}
                            {/*    >*/}
                            {/*        Open {entry.media.title?.userPreferred || entry.media.title?.romaji || "entry"}*/}
                            {/*    </CommandItem>*/}
                            {/*)}*/}

                            {(isEntryLoading || isEpisodeLoading) && <p className="px-2 pb-2 text-sm text-[--muted]">
                                {t("seaCommand.loadingEpisodes")}
                            </p>}

                            {!isEntryLoading && !isEpisodeLoading && filteredEpisodes.length === 0 && (
                                <p className="px-2 pb-2 text-sm text-[--muted]">{t("seaCommand.noEpisodesFound")}</p>
                            )}

                            {filteredEpisodes.map(episode => (
                                <CommandItem
                                    key={`episode-${episode.episodeNumber}`}
                                    onSelect={() => {
                                        setSelectedEpisodeNumber(episode.episodeNumber)
                                        setStep("action")
                                        setInput("/magnet ")
                                    }}
                                >
                                    <div className="flex gap-1 items-center w-full">
                                        <p className="max-w-[70%] truncate">{episode.displayTitle}</p>
                                        {!!episode.episodeTitle && (
                                            <p className="text-[--muted] flex-1 truncate">- {episode.episodeTitle}</p>
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {step === "action" && (
                        <CommandGroup heading={t("seaCommand.chooseAction")}>
                            <div className="px-2 pb-2 space-y-1">
                                {magnet && (
                                    <div className="flex items-center gap-2 line-clamp-2">
                                        <span className="text-sm text-[--muted] flex-none">
                                            {t("seaCommand.magnetLink")}
                                        </span>
                                        <span className="text-sm text-[--foreground]">
                                            {magnet}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="px-2 pb-2 space-y-1 text-sm">
                                {entry?.media && (
                                    <div className="text-[--foreground]">{entry.media.title?.userPreferred || entry.media.title?.romaji}</div>
                                )}
                                {selectedEpisode && (
                                    <div className="text-[--muted]">{selectedEpisode.displayTitle}</div>
                                )}
                                {!canStreamSelectedEpisode && (
                                    <div className="text-[--muted]">{t("seaCommand.streamingUnavailableNoAnidb")}</div>
                                )}
                                {!canDownload && serverStatus?.settings?.torrent?.defaultTorrentClient !== TORRENT_CLIENT.NONE && (
                                    <div className="text-[--muted]">{t("seaCommand.downloadUnavailableNoDest")}</div>
                                )}
                            </div>
                            <CommandItem
                                onSelect={() => {
                                    setStep("episode")
                                    setInput("/magnet ")
                                }}
                            >
                                {t("seaCommand.back")}
                            </CommandItem>
                            {hasTorrentStreaming && <CommandItem
                                onSelect={handleStartTorrentStreaming}
                                disabled={!canStreamSelectedEpisode}
                            >
                                {torrentStreamAutoSelectFile ? t("seaCommand.stream") : t("seaCommand.streamPickFile")}
                            </CommandItem>}
                            {hasDebridService && <CommandItem
                                onSelect={handleStartDebridStreaming}
                                disabled={!canStreamSelectedEpisode}
                            >
                                {debridStreamAutoSelectFile ? t("seaCommand.streamWithDebrid") : t("seaCommand.streamWithDebridPickFile")}
                            </CommandItem>}
                            {serverStatus?.settings?.torrent?.defaultTorrentClient !== TORRENT_CLIENT.NONE && <CommandItem
                                onSelect={handleDownload}
                                disabled={!canDownload}
                            >
                                {t("seaCommand.download")}
                            </CommandItem>}
                        </CommandGroup>
                    )}

                </>
            )}
        </>
    )
}
