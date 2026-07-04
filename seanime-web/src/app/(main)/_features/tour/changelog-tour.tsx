import { createTranslator } from "@/locales"
import { useSeaCommand } from "@/app/(main)/_features/sea-command/sea-command.tsx"
import { SeaImage } from "@/components/shared/sea-image"
import { useRouter } from "@/lib/navigation"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import React from "react"
import { useWindowSize } from "react-use"
import { useServerStatus } from "../../_hooks/use-server-status"
import { __settings_tabAtom } from "../../settings/_components/settings-page.atoms"
import { __scanner_modalIsOpen } from "../anime-library/_containers/scanner-modal"
import { tourHelpers, useTour } from "./tour"
import { TourStep } from "./tour"

const t = createTranslator()

export const seenChangelogAtom = atomWithStorage<string | null>("sea-seen-changelog", null, undefined, { getOnInit: true })

function useSetupTour(): Record<string, () => TourStep[]> {
    const serverStatus = useServerStatus()
    const router = useRouter()
    const [, openScannerModal] = useAtom(__scanner_modalIsOpen)
    const [, setSettingsTab] = useAtom(__settings_tabAtom)
    const { setSeaCommandOpen, setSeaCommandInput } = useSeaCommand()

    const get3_5_0 = (): TourStep[] => {
        return [
            {
                id: "changelog-1",
                content: (
                    <div>
                        <h4 className="text-xl font-bold text-white">{t("changelogTour.3_5_0.introTitle")}</h4>
                        <p>{t("changelogTour.3_5_0.introDesc")}</p>
                    </div>
                ),
                route: "/",
                nextLabel: t("common.buttons.start"),
                ignoreOutsideClick: true,
            },
            {
                id: "scanner",
                target: "[data-home-toolbar-scan-button]",
                title: t("changelogTour.3_5_0.scanner.title"),
                content: t("changelogTour.3_5_0.scanner.content"),
                route: "/",
                advanceOnTargetClick: true,
                ignoreOutsideClick: true,
                condition: () => !!serverStatus?.settings?.library?.libraryPath?.length,
                conditionFailBehavior: "modal",
            },
            {
                id: "scanner-2",
                target: "[data-scanner-modal-content]",
                title: t("changelogTour.3_5_0.scanner2.title"),
                content: t("changelogTour.3_5_0.scanner2.content"),
                route: "/",
                prepare: () => {
                    openScannerModal(true)
                },
                advanceOnTargetClick: true,
                ignoreOutsideClick: true,
                condition: () => !!serverStatus?.settings?.library?.libraryPath?.length,
                conditionFailBehavior: "skip",
            },
            {
                id: "scanner-3",
                target: "[data-settings-anime-library='advanced-accordion-trigger']",
                title: t("changelogTour.3_5_0.scanner3.title"),
                content: t("changelogTour.3_5_0.scanner3.content"),
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("library")
                    await tourHelpers.waitForSelector("[data-settings-anime-library='advanced-accordion-trigger']")
                    await tourHelpers.click("[data-settings-anime-library='advanced-accordion-trigger']", 200)
                },
                advanceOnTargetClick: false,
                ignoreOutsideClick: true,
            },
            {
                id: "issue-recorder",
                target: "[data-open-issue-recorder-button]",
                title: t("changelogTour.3_5_0.issueRecorder.title"),
                content: <div>
                    <SeaImage
                        src="https://github.com/5rahim/hibike/blob/main/changelog/3_5-issue-recorder.gif?raw=true"
                        alt="Issue Recorder"
                        width="100%"
                        height="auto"
                        className="rounded-md"
                        allowGif
                    />
                    <p className="mt-2">{t("changelogTour.3_5_0.issueRecorder.contentText")}</p>
                </div>,
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("seanime")
                },
                advanceOnTargetClick: false,
                ignoreOutsideClick: true,
                popoverWidth: 500,
            },
            {
                id: "transcode-new-player",
                target: "[data-tab-trigger='mediastream']",
                title: t("changelogTour.3_5_0.transcodeNewPlayer.title"),
                content: t("changelogTour.3_5_0.transcodeNewPlayer.content"),
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("mediastream")
                },
                advanceOnTargetClick: false,
                ignoreOutsideClick: true,
            },
            {
                id: "search",
                target: "[data-vertical-menu-item='Search']",
                title: t("changelogTour.3_5_0.search.title"),
                content: t("changelogTour.3_5_0.search.content"),
                route: "/search",
                advanceOnTargetClick: false,
                ignoreOutsideClick: true,
            },
            {
                id: "entry",
                title: t("changelogTour.3_5_0.entry.title"),
                content: <div>
                    <SeaImage
                        src="https://github.com/5rahim/hibike/blob/main/changelog/3_5-videocore-characters.png?raw=true"
                        alt="Character Lookup"
                        width="100%"
                        height="auto"
                        className="rounded-md"
                    />
                    <p className="mt-2">{t("changelogTour.3_5_0.entry.contentText")}</p>
                </div>,
                route: "/",
                advanceOnTargetClick: false,
                ignoreOutsideClick: false,
                popoverWidth: 500,
            },
        ]
    }

    const get3_7_0 = (): TourStep[] => {
        return [
            {
                id: "changelog-1",
                content: (
                    <div>
                        <h4 className="text-xl font-bold text-white">{t("changelogTour.3_7_0.introTitle")}</h4>
                        <p>{t("changelogTour.3_7_0.introDesc")}</p>
                    </div>
                ),
                route: "/",
                nextLabel: t("common.buttons.start"),
                ignoreOutsideClick: true,
            },
            {
                id: "security",
                title: t("changelogTour.3_7_0.security.title"),
                content: t("changelogTour.3_7_0.security.content"),
                route: "/",
                advanceOnTargetClick: true,
                ignoreOutsideClick: true,
            },
            {
                id: "search",
                target: "[data-advanced-search-options-tags='true']",
                title: t("changelogTour.3_7_0.tags.title"),
                content: t("changelogTour.3_7_0.tags.content"),
                route: "/search",
                advanceOnTargetClick: false,
                ignoreOutsideClick: true,
            },
            {
                id: "search",
                target: ".sea-command-content",
                title: t("changelogTour.3_7_0.adultContent.title"),
                content: t("changelogTour.3_7_0.adultContent.content"),
                route: "/search",
                advanceOnTargetClick: false,
                ignoreOutsideClick: true,
                prepare: async () => {
                    setSeaCommandOpen(true)
                    setTimeout(() => {
                        setSeaCommandInput("/search ")
                    }, 200)
                    // wait 500ms
                    return new Promise(resolve => setTimeout(resolve, 500))
                },
            },
            {
                id: "changelog-2",
                title: t("changelogTour.3_7_0.bugFixes.title"),
                content: t("changelogTour.3_7_0.bugFixes.content"),
                route: "/",
                ignoreOutsideClick: true,
            },
        ]
    }

    const get3_8_0 = (): TourStep[] => {
        return [
            {
                id: "changelog-1",
                content: (
                    <div>
                        <h4 className="text-xl font-bold text-white">{t("changelogTour.3_8_0.introTitle")}</h4>
                        <p>{t("changelogTour.3_8_0.introDesc")}</p>
                    </div>
                ),
                route: "/",
                nextLabel: t("common.buttons.start"),
                ignoreOutsideClick: true,
            },
            {
                id: "torrent-search",
                title: t("changelogTour.3_8_0.torrentSearch.title"),
                content: t("changelogTour.3_8_0.torrentSearch.content"),
                route: "/",
                ignoreOutsideClick: true,
            },
            {
                id: "subtitle-translation",
                title: t("changelogTour.3_8_0.subtitleTranslation.title"),
                content: t("changelogTour.3_8_0.subtitleTranslation.content"),
                route: "/",
                ignoreOutsideClick: true,
            },
            {
                id: "external-player-link",
                target: "[data-settings-external-player-link-scheme]",
                title: t("changelogTour.3_8_0.externalPlayerLink.title"),
                content: t("changelogTour.3_8_0.externalPlayerLink.content"),
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("external-player-link")
                    await tourHelpers.waitForSelector("[data-settings-external-player-link-scheme]")
                },
                ignoreOutsideClick: true,
                popoverWidth: 460,
            },
            {
                id: "spoilers",
                target: "[data-settings-hide-anime-spoilers]",
                title: t("changelogTour.3_8_0.spoilers.title"),
                content: t("changelogTour.3_8_0.spoilers.content"),
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("seanime")
                    await tourHelpers.waitForSelector("[data-settings-hide-anime-spoilers]")
                },
                ignoreOutsideClick: true,
                popoverWidth: 460,
            },
            {
                id: "online-streaming",
                target: "[data-settings-enable-onlinestream]",
                title: t("changelogTour.3_8_0.onlineStreaming.title"),
                content: t("changelogTour.3_8_0.onlineStreaming.content"),
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("onlinestream")
                    await tourHelpers.waitForSelector("[data-settings-enable-onlinestream]")
                },
                ignoreOutsideClick: true,
                popoverWidth: 460,
            },
            {
                id: "default-episode-source",
                target: "[data-settings-default-episode-source]",
                title: t("changelogTour.3_8_0.defaultEpisodeSource.title"),
                content: t("changelogTour.3_8_0.defaultEpisodeSource.content"),
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("seanime")
                    await tourHelpers.waitForSelector("[data-settings-default-episode-source]")
                },
                ignoreOutsideClick: true,
                popoverWidth: 460,
            },
            {
                id: "ui-settings-redesign",
                target: "[data-settings-ui-panel-tabs]",
                title: t("changelogTour.3_8_0.uiSettingsRedesign.title"),
                content: t("changelogTour.3_8_0.uiSettingsRedesign.content"),
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("ui")
                    await tourHelpers.waitForSelector("[data-settings-ui-panel-tabs]")
                },
                ignoreOutsideClick: true,
                popoverWidth: 460,
            },
            {
                id: "ui-settings-redesign2",
                target: ".settings-ui-navigation-preloading",
                title: t("changelogTour.3_8_0.precarga.title"),
                content: t("changelogTour.3_8_0.precarga.content"),
                prepare: async () => {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    await tourHelpers.waitForSelector(".settings-ui-navigation-preloading")
                },
                ignoreOutsideClick: true,
                popoverWidth: 460,
            },
            {
                id: "entry-header-redesign",
                target: "[data-media-page-header]",
                title: t("changelogTour.3_8_0.entryHeader.title"),
                content: t("changelogTour.3_8_0.entryHeader.content"),
                prepare: async () => {
                    router.push("/entry?id=21827")
                    await tourHelpers.waitForSelector("[data-media-page-header]")
                },
                ignoreOutsideClick: true,
                popoverWidth: 460,
            },
            {
                id: "extensions",
                title: t("changelogTour.3_8_0.extensions.title"),
                content: t("changelogTour.3_8_0.extensions.content"),
                route: "/extensions",
                ignoreOutsideClick: true,
            },
            {
                id: "extension-secure-mode",
                target: "[data-settings-enable-extension-secure-mode]",
                title: t("changelogTour.3_8_0.extensionSecureMode.title"),
                content: t("changelogTour.3_8_0.extensionSecureMode.content"),
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("seanime")
                    await tourHelpers.waitForSelector("[data-settings-enable-extension-secure-mode]")
                },
                ignoreOutsideClick: true,
                popoverWidth: 460,
            },
            {
                id: "denshi",
                title: t("changelogTour.3_8_0.denshi.title"),
                content: t("changelogTour.3_8_0.denshi.content"),
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("denshi")
                },
                condition: () => typeof window !== "undefined" && !!window.electron,
                conditionFailBehavior: "skip",
                ignoreOutsideClick: true,
            },
            // {
            //     id: "denshi",
            //     title: "View Transitions",
            //     content: "Seanime Denshi now uses the View Transitions API for native transitions between different screens.",
            //     route: "/schedule",
            //     prepare: async () => {
            //         setSettingsTab("seanime")
            //         await new Promise(resolve => setTimeout(resolve, 650))
            //         router.push("/lists")
            //         await new Promise(resolve => setTimeout(resolve, 650))
            //         router.push("/settings")
            //         await new Promise(resolve => setTimeout(resolve, 650))
            //         // scroll to bottom
            //         window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
            //         await new Promise(resolve => setTimeout(resolve, 650))
            //         router.push("/schedule")
            //         await new Promise(resolve => setTimeout(resolve, 650))
            //         router.push("/lists")
            //         await new Promise(resolve => setTimeout(resolve, 650))
            //         router.push("/settings")
            //         await new Promise(resolve => setTimeout(resolve, 650))
            //         router.push("/")
            //         await new Promise(resolve => setTimeout(resolve, 500))
            //     },
            //     condition: () => typeof window !== "undefined" && !!window.electron,
            //     conditionFailBehavior: "skip",
            //     ignoreOutsideClick: true,
            // },
            {
                id: "changelog-2",
                title: t("changelogTour.3_8_0.bugFixes.title"),
                content: t("changelogTour.3_8_0.bugFixes.content"),
                route: "/",
                ignoreOutsideClick: true,
            },
        ]
    }

    const get3_9_0 = (): TourStep[] => {
        return [
            {
                id: "changelog-1",
                content: (
                    <div>
                        <h4 className="text-xl font-bold text-white">What's New in 3.9.0?</h4>
                        <p>Let's take a look at the biggest additions in this release.</p>
                    </div>
                ),
                route: "/",
                nextLabel: "Start",
                ignoreOutsideClick: true,
            },
            {
                id: "libmpv-player",
                target: "[data-tab-trigger='playback']",
                title: "New Built-in Player (Denshi)",
                content: "Denshi now features a libmpv-based built-in player. It offers hardware-accelerated rendering directly in the app viewport, flawless codec & subtitle support, and supports mpv.conf options and shaders.",
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("playback")
                    await tourHelpers.waitForSelector("[data-tab-trigger='playback']")
                },
                ignoreOutsideClick: true,
                popoverWidth: 460,
                condition: () => typeof window !== "undefined" && !!window.electron,
                conditionFailBehavior: "skip",
            },
            {
                id: "torrent-streaming-perf",
                title: "Faster Torrent Streaming",
                content: "Torrent streaming startup is now up to 20% faster depending on seeding, with more accurate download progress reporting and fixed batch selection.",
                route: "/",
                ignoreOutsideClick: true,
            },
            {
                id: "debrid-streaming-perf",
                title: "Faster Debrid Streaming",
                content: "Debrid streaming launch is now up to 5 seconds faster for cached streams.",
                route: "/",
                ignoreOutsideClick: true,
            },
            {
                id: "changelog-2",
                title: "Bug Fixes",
                content: "Several bugs have been fixed in this release, including progress tracking for MPV/IINA, manga image proxy issues, and Seanime Denshi's Electron has been updated to 42.4.0. Read the full changelog for more details.",
                route: "/",
                ignoreOutsideClick: true,
            },
        ]
    }

    const get3_10_0 = (): TourStep[] => {
        return [
            {
                id: "changelog-1",
                content: (
                    <div>
                        <h4 className="text-xl font-bold text-white">What's New in 3.10.0?</h4>
                        <p>Let's take a look at the biggest additions in this release.</p>
                    </div>
                ),
                route: "/",
                nextLabel: "Start",
                ignoreOutsideClick: true,
            },
            {
                id: "manga-source-refresh",
                title: "Manga Source Refresh",
                content: "Manga source refreshing has been improved. In addition to updating saved sources, you can now assign sources to manga who have none, or re-evaluate all of them.",
                route: "/manga",
                ignoreOutsideClick: true,
            },
            {
                id: "torrent-availability",
                target: "[data-settings-show-torrent-availability]",
                title: "Torrent Availability",
                content: "Enable this to show availability badges on recent episodes missing from your library and in Continue Watching when using torrent or Debrid streaming.",
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("torrent")
                    await tourHelpers.waitForSelector("[data-settings-show-torrent-availability]")
                },
                ignoreOutsideClick: true,
                popoverWidth: 460,
            },
            {
                id: "online-streaming",
                title: "Online Streaming",
                content: "Online streaming can now proxy subtitles, refresh stale source URLs, and keep your provider, server, quality, audio, and subtitle choices more reliably.",
                route: "/",
                ignoreOutsideClick: true,
            },
            {
                id: "plugin-tray-badges",
                title: "Plugin Tray Badges",
                content: "Badge counts from tray plugins are now shown on the main tray icon even when the plugin is not pinned.",
                route: "/",
                ignoreOutsideClick: true,
            },
            {
                id: "mpvcore-logs",
                target: "[data-tab-trigger='playback']",
                title: "Export MpvCore Logs",
                content: "When MpvCore logging is enabled you can now export its logs from the Video Playback settings for faster bug reports.",
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("playback")
                    await tourHelpers.waitForSelector("[data-tab-trigger='playback']")
                },
                condition: () => typeof window !== "undefined" && !!window.electron,
                conditionFailBehavior: "skip",
                ignoreOutsideClick: true,
                popoverWidth: 460,
            },
            {
                id: "changelog-2",
                title: "Bug Fixes",
                content: "This release also fixes lagging or missing subtitles in VideoCore, MPV/IINA watch progress, media container detection, and more. Read the full changelog for details.",
                route: "/",
                ignoreOutsideClick: true,
            },
        ]
    }

    return {
        "3.5.0": get3_5_0,
        "3.7.0": get3_7_0,
        "3.8.0": get3_8_0,
        "3.9.0": get3_9_0,
        "3.10.0": get3_10_0,
    }
}

export function useChangelogTourListener() {
    const serverStatus = useServerStatus()
    const [seenChangelog, setSeenChangelog] = useAtom(seenChangelogAtom)
    const { start } = useTour()
    const tours = useSetupTour()
    const { width } = useWindowSize()
    const isMobile = width < 768

    const toursRef = React.useRef(tours)
    toursRef.current = tours

    const started = React.useRef(false)
    const timeout = React.useRef<NodeJS.Timeout | null>(null)

    React.useEffect(() => {
        if (!serverStatus?.showChangelogTour) return
        if (serverStatus.isOffline) return
        if (isMobile) return
        if (started.current) return

        if (seenChangelog === serverStatus.showChangelogTour) return

        started.current = true

        const tourId = serverStatus.showChangelogTour

        if (timeout.current) clearTimeout(timeout.current)
        timeout.current = setTimeout(() => {
            const getSteps = toursRef.current[tourId]
            if (getSteps) {
                start(getSteps(), tourId, () => {
                    console.log("tour completed")
                    setSeenChangelog(tourId)
                })
            }
        }, 1000)

        return () => {
            if (timeout.current) clearTimeout(timeout.current)
        }
    }, [serverStatus?.showChangelogTour, serverStatus?.isOffline, seenChangelog, start, setSeenChangelog, isMobile])

    return null
}
