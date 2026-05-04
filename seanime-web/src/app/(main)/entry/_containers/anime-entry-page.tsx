import { Anime_Entry } from "@/api/generated/types"
import { useGetAnilistAnimeDetails } from "@/api/hooks/anilist.hooks"
import { useGetAnimeEntry } from "@/api/hooks/anime_entries.hooks"
import { MediaEntryCharactersSection } from "@/app/(main)/_features/media/_components/media-entry-characters-section"
import { MediaEntryPageLoadingDisplay } from "@/app/(main)/_features/media/_components/media-entry-page-loading-display"
import { usePluginAnimeEntryEpisodeTabs } from "@/app/(main)/_features/plugin/plugin-entry-episode-tabs"
import {
    PluginAnimeEntryEpisodeTab,
    PluginAnimeEntryEpisodeTabContent,
    PluginAnimeEntryTabIcon,
} from "@/app/(main)/_features/plugin/plugin-entry-episode-tabs"
import { PluginWebviewSlot } from "@/app/(main)/_features/plugin/webview/plugin-webviews"
import { useSeaCommandInject } from "@/app/(main)/_features/sea-command/use-inject"

import { vc_isFullscreen } from "@/app/(main)/_features/video-core/video-core-atoms"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { MetaSection } from "@/app/(main)/entry/_components/meta-section"
import { RelationsRecommendationsSection } from "@/app/(main)/entry/_components/relations-recommendations-section"
import { DebridStreamPage } from "@/app/(main)/entry/_containers/debrid-stream/debrid-stream-page"
import { EpisodeSection } from "@/app/(main)/entry/_containers/episode-list/episode-section"
import { __torrentSearch_selectionAtom, TorrentSearchDrawer } from "@/app/(main)/entry/_containers/torrent-search/torrent-search-drawer"
import { TorrentStreamPage } from "@/app/(main)/entry/_containers/torrent-stream/torrent-stream-page"
import { OnlinestreamPage } from "@/app/(main)/onlinestream/_containers/onlinestream-page"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { cn } from "@/components/ui/core/styling"
import { StaticTabs } from "@/components/ui/tabs"
import { createTranslator } from "@/locales"
import { usePathname, useRouter, useSearchParams } from "@/lib/navigation"
import { useThemeSettings } from "@/lib/theme/theme-hooks"
import { atom, useAtomValue } from "jotai"
import { useAtom, useSetAtom } from "jotai/react"
import { AnimatePresence } from "motion/react"
import React from "react"
import { FiGlobe } from "react-icons/fi"
import { HiOutlineServerStack } from "react-icons/hi2"
import { IoLibraryOutline } from "react-icons/io5"
import { PiMonitorPlayDuotone } from "react-icons/pi"
import { useUnmount } from "react-use"

export const __anime_entryPageViewAtom = atom<string>("library")

export function useAnimeEntryPageView() {
    const [currentView, setView] = useAtom(__anime_entryPageViewAtom)

    const isLibraryView = currentView === "library"
    const isTorrentStreamingView = currentView === "torrentstream"
    const isDebridStreamingView = currentView === "debridstream"
    const isOnlineStreamingView = currentView === "onlinestream"
    const isPluginEpisodeTabView = currentView.startsWith("episodeTab:")

    function toggleTorrentStreamingView() {
        setView(p => p === "torrentstream" ? "library" : "torrentstream")
    }

    function toggleDebridStreamingView() {
        setView(p => p === "debridstream" ? "library" : "debridstream")
    }

    function toggleOnlineStreamingView() {
        setView(p => p === "onlinestream" ? "library" : "onlinestream")
    }

    return {
        currentView,
        setView,
        isLibraryView,
        isTorrentStreamingView,
        isDebridStreamingView,
        isOnlineStreamingView,
        isPluginEpisodeTabView,
        toggleTorrentStreamingView,
        toggleDebridStreamingView,
        toggleOnlineStreamingView,
    }
}

export function AnimeEntryPage() {

    const t = createTranslator("es")
    const serverStatus = useServerStatus()
    const router = useRouter()
    const searchParams = useSearchParams()
    const mediaId = searchParams.get("id")
    const tab = searchParams.get("tab")
    const { data: animeEntry, isLoading: animeEntryLoading } = useGetAnimeEntry(mediaId)
    const { data: animeDetails, isLoading: animeDetailsLoading } = useGetAnilistAnimeDetails(mediaId)
    const ts = useThemeSettings()

    const vc_fullscreen = useAtomValue(vc_isFullscreen)

    const { currentView, isLibraryView, setView } = useAnimeEntryPageView()
    const switchedView = React.useRef(false)

    const pluginEpisodeTabs = usePluginAnimeEntryEpisodeTabs({
        mediaId: Number(mediaId),
        setView,
        currentView,
    })

    React.useLayoutEffect(() => {
        if (!animeEntry) return
        try {
            if (animeEntry?.media?.title?.userPreferred) {
                document.title = `${animeEntry?.media?.title?.userPreferred} | Seanime`
            }
            // switchedView.current = false
        }
        catch {
        }
    }, [animeEntry])

    const mediaIdRef = React.useRef(mediaId)

    React.useEffect(() => {
        if (mediaIdRef.current !== mediaId) {
            switchedView.current = false
            mediaIdRef.current = mediaId
        }

        if (animeEntryLoading || !mediaId) {
            switchedView.current = false
            return
        }

        if (
            !animeEntryLoading &&
            animeEntry &&
            animeEntry?.media?.status === "NOT_YET_RELEASED"
        ) {
            switchedView.current = true
            setView("library")
            return
        }

        if (
            !animeEntryLoading &&
            !!tab &&
            tab !== "library" && // Tab is not library
            !switchedView.current // View has not been switched yet
        ) {
            switchedView.current = true
            if (serverStatus?.debridSettings?.enabled && tab === "debridstream") {
                setView("debridstream")
            } else if (serverStatus?.torrentstreamSettings?.enabled && tab === "torrentstream") {
                setView("torrentstream")
            } else if (serverStatus?.settings?.library?.enableOnlinestream && tab === "onlinestream") {
                setView("onlinestream")
            }
        }

        if (
            !animeEntryLoading &&
            !animeEntry?.libraryData && // Anime is not in library
            isLibraryView && // Current view is library
            (
                // If any of the fallbacks are enabled and the view has not been switched yet
                (serverStatus?.torrentstreamSettings?.enabled && serverStatus?.torrentstreamSettings?.includeInLibrary) ||
                (serverStatus?.debridSettings?.enabled && serverStatus?.debridSettings?.includeDebridStreamInLibrary) ||
                (serverStatus?.settings?.library?.enableOnlinestream && serverStatus?.settings?.library?.includeOnlineStreamingInLibrary)
            ) &&
            !switchedView.current // View has not been switched yet
        ) {
            switchedView.current = true
            if (serverStatus?.debridSettings?.enabled && serverStatus?.debridSettings?.includeDebridStreamInLibrary) {
                setView("debridstream")
            } else if (serverStatus?.torrentstreamSettings?.enabled && serverStatus?.torrentstreamSettings?.includeInLibrary) {
                setView("torrentstream")
            } else if (serverStatus?.settings?.library?.enableOnlinestream && serverStatus?.settings?.library?.includeOnlineStreamingInLibrary) {
                setView("onlinestream")
            }
        }

        // return () => {
        //     switchedView.current = false
        // }

    }, [animeEntry, animeEntryLoading, mediaId, searchParams, serverStatus, currentView, tab])

    const pathname = usePathname()

    React.useEffect(() => {
        if (!pathname.startsWith("/entry")) return

        if (!mediaId || (!animeEntryLoading && !animeEntry)) {
            router.push("/")
        }
    }, [animeEntry, animeEntryLoading, pathname, mediaId])

    // Reset view when unmounting
    useUnmount(() => {
        setView("library")
    })

    const setTorrentSearchDrawer = useSetAtom(__torrentSearch_selectionAtom)

    const { inject, remove } = useSeaCommandInject()
    React.useEffect(() => {
        inject("anime-entry-navigation", {
            items: [
                ...[{
                    id: "library",
                    description: t("entry.downloadedEpisodes"),
                    show: currentView !== "library",
                },
                    {
                        id: "torrentstream",
                        description: t("entry.torrentStreaming"),
                        show: serverStatus?.torrentstreamSettings?.enabled && currentView !== "torrentstream",
                    },
                    {
                        id: "debridstream",
                        description: t("entry.debridStreaming"),
                        show: serverStatus?.debridSettings?.enabled && currentView !== "debridstream",
                    },
                    {
                        id: "onlinestream",
                        description: t("entry.onlineStreaming"),
                        show: serverStatus?.settings?.library?.enableOnlinestream && currentView !== "onlinestream",
                    },
                ].map(item => ({
                    id: item.id,
                    value: item.id,
                    heading: t("entry.views"),
                    data: item,
                    render: () => <div>{item.description}</div>,
                    onSelect: () => setView(item.id as any),
                    shouldShow: () => !!item.show,
                })),
                {
                    id: "download",
                    value: "download",
                    render: () => <div>{t("entry.downloadTorrents")}</div>,
                    heading: t("entry.views"),
                    data: "download torrents",
                    onSelect: () => setTorrentSearchDrawer("download"),
                    shouldShow: () => currentView === "library",
                },
                ...pluginEpisodeTabs.tabs.map(tab => ({
                    id: tab.viewId,
                    value: tab.viewId,
                    heading: t("entry.views"),
                    data: { description: tab.name },
                    render: () => <div>{tab.name}</div>,
                    onSelect: () => setView(tab.viewId),
                    shouldShow: () => currentView !== tab.viewId,
                })),
            ],
            filter: ({ item, input }) => {
                if (!input) return true
                return item.data?.description?.toLowerCase().startsWith(input.toLowerCase())
            },
            priority: -1,
        })

        return () => remove("anime-entry-navigation")
    }, [currentView, pluginEpisodeTabs.tabs, serverStatus])

    if (animeEntryLoading || animeDetailsLoading) return <MediaEntryPageLoadingDisplay />
    if (!animeEntry) return null

    const bottomSection = <>
        <PluginWebviewSlot slot="after-anime-entry-episode-list" />
        <MediaEntryCharactersSection details={animeDetails} />
        <RelationsRecommendationsSection entry={animeEntry} details={animeDetails} />
    </>

    return (
        <div data-anime-entry-page data-media={JSON.stringify(animeEntry.media)} data-anime-entry-list-data={JSON.stringify(animeEntry.listData)}>
            <MetaSection entry={animeEntry} details={animeDetails} />

            <div
                data-anime-entry-page-content-container
                className={cn(
                    "px-4 md:px-8 relative z-[8]",
                    (currentView === "onlinestream" && vc_fullscreen) && "z-[100]",
                )}
            >
                <PageWrapper
                    data-anime-entry-page-content
                    className={cn(
                        "relative 2xl:order-first pb-10 lg:min-h-[calc(100vh-10rem)]",
                        (currentView === "onlinestream" && vc_fullscreen) && "z-[100]",
                    )}
                    {...{
                        initial: { opacity: 0, y: 20 },
                        animate: { opacity: 1, y: 0 },
                        exit: { opacity: 0, y: 20 },
                        transition: {
                            type: "spring",
                            damping: 12,
                            stiffness: 80,
                            delay: 0.5,
                        },
                    }}
                >
                    <PluginWebviewSlot slot="before-anime-entry-episode-list" />

                    <AnimatePresence mode="wait" initial={false}>

                        {(currentView === "library") && <PageWrapper
                            data-anime-entry-page-episode-list-view
                            key="episode-list"
                            className="relative 2xl:order-first pb-10"
                            {...{
                                initial: { opacity: 0, y: 60 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, scale: 0.99 },
                                transition: {
                                    duration: 0.35,
                                },
                            }}
                        >
                            <div className="h-10" />
                            <EpisodeSection
                                entry={animeEntry}
                                details={animeDetails}
                                bottomSection={bottomSection}
                            />
                        </PageWrapper>}

                        {currentView === "torrentstream" &&
                            <TorrentStreamPage
                                entry={animeEntry}
                                bottomSection={bottomSection}
                            />}

                        {currentView === "debridstream" &&
                            <DebridStreamPage
                                entry={animeEntry}
                                bottomSection={bottomSection}
                            />}

                        {pluginEpisodeTabs.selectedTab && currentView === pluginEpisodeTabs.selectedTab.viewId && <PageWrapper
                            data-anime-entry-page-plugin-episode-tab-view
                            key={pluginEpisodeTabs.selectedTab.viewId}
                            className="relative 2xl:order-first pb-10"
                            {...{
                                initial: { opacity: 0, y: 60 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, scale: 0.99 },
                                transition: {
                                    duration: 0.35,
                                },
                            }}
                        >
                            <PluginAnimeEntryEpisodeTabContent
                                entry={animeEntry}
                                tab={pluginEpisodeTabs.selectedTab}
                                episodeCollection={pluginEpisodeTabs.selectedEpisodeCollection}
                                bottomSection={bottomSection}
                                onSelectEpisode={pluginEpisodeTabs.selectEpisode}
                            />
                        </PageWrapper>}

                        {currentView === "onlinestream" && <PageWrapper
                            data-anime-entry-page-online-streaming-view
                            key="online-streaming-episodes"
                            className={cn(
                                "relative 2xl:order-first pb-10 lg:pt-0",
                                (currentView === "onlinestream" && vc_fullscreen) && "z-[100]",
                            )}
                            {...{
                                initial: { opacity: 0, y: 60 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, scale: 0.99 },
                                transition: {
                                    duration: 0.35,
                                },
                            }}
                        >
                            <div className="h-10 lg:h-0" />
                            <div className="space-y-4" data-anime-entry-page-online-streaming-view-content>
                                {/*<div*/}
                                {/*    className="absolute right-0 top-[-0.5rem] lg:top-[-3rem]"*/}
                                {/*    data-anime-entry-page-online-streaming-view-content-title-container*/}
                                {/*>*/}
                                {/*    <h2 className="text-xl lg:text-3xl flex items-center gap-3">Online streaming</h2>*/}
                                {/*</div>*/}
                                <OnlinestreamPage
                                    animeEntry={animeEntry}
                                    animeEntryLoading={animeEntryLoading}
                                    hideBackButton
                                />
                                {bottomSection}
                            </div>
                        </PageWrapper>}

                    </AnimatePresence>

                    <PluginWebviewSlot slot="anime-screen-bottom" />
                </PageWrapper>
            </div>

            <TorrentSearchDrawer entry={animeEntry} />
        </div>
    )
}

type EntrySectionTabs = {
    children?: React.ReactNode
    entry: Anime_Entry
    pluginTabs?: PluginAnimeEntryEpisodeTab[]
}

export function EntrySectionTabs(props: EntrySectionTabs) {

    const t = createTranslator("es")
    const {
        children,
        entry,
        pluginTabs = [],
        ...rest
    } = props

    const serverStatus = useServerStatus()

    const {
        currentView,
        isLibraryView,
        setView,
        isTorrentStreamingView,
        toggleTorrentStreamingView,
        isDebridStreamingView,
        toggleDebridStreamingView,
        isOnlineStreamingView,
        toggleOnlineStreamingView,
    } = useAnimeEntryPageView()

    if (
        !entry ||
        entry.media?.status === "NOT_YET_RELEASED") return null

    if (
        !serverStatus?.torrentstreamSettings?.enabled &&
        !serverStatus?.debridSettings?.enabled &&
        !serverStatus?.settings?.library?.enableOnlinestream &&
        pluginTabs.length === 0
    ) return null

    return (
        <>
            <div
                className="w-full max-w-fit rounded-md lg:rounded-full border border-transparent mx-auto lg:mx-0 overflow-hidden"
                data-anime-entry-page-tabs-container
            >
                <StaticTabs
                    className="lg:h-10 flex-wrap lg:flex-nowrap overflow-hidden justify-center lg:justify-start"
                    triggerClass="px-4 py-1 text-[1.1rem] border border-transparent opacity-80 data-[current=true]:border-[--subtle] data-[current=true]:opacity-100 rounded-full data-[current=false]:scale-95 lg:scale-100 "
                    iconClass="size-5 hidden data-[current=true]:block"
                    items={[
                        { name: t("entry.localLibrary"), iconType: IoLibraryOutline, isCurrent: isLibraryView, onClick: () => setView("library") },
                        ...(serverStatus?.torrentstreamSettings?.enabled ? [{
                            name: t("entry.torrentStreaming"),
                            iconType: PiMonitorPlayDuotone,
                            isCurrent: isTorrentStreamingView,
                            onClick: () => setView("torrentstream"),
                        }] : []),
                        ...(serverStatus?.debridSettings?.enabled ? [{
                            name: t("entry.debridStreaming"),
                            iconType: HiOutlineServerStack,
                            isCurrent: isDebridStreamingView,
                            onClick: () => setView("debridstream"),
                        }] : []),
                        ...(serverStatus?.settings?.library?.enableOnlinestream ? [{
                            name: t("entry.onlineStreaming"),
                            iconType: FiGlobe,
                            isCurrent: isOnlineStreamingView,
                            onClick: () => setView("onlinestream"),
                        }] : []),
                        ...pluginTabs.map(tab => ({
                            name: tab.name,
                            icon: <PluginAnimeEntryTabIcon
                                icon={tab.icon}
                                className="mr-2 hidden group-data-[current=true]/staticTabs__trigger:block"
                            />,
                            isCurrent: currentView === tab.viewId,
                            onClick: () => setView(tab.viewId),
                        })),
                    ]}
                />
            </div>
        </>
    )
}
