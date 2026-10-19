import { createTranslator, type TranslationKeys } from "@/locales"

const t = createTranslator()

const SERVER_TOAST_MAP: Readonly<Record<string, TranslationKeys>> = {
    "Adding chapters to download queue...": "manga.chaptersAddedToDownloadQueue",
    "Download directory does not exist": "toast.torrentstream.downloadDirNotExist",
    "Download directory is not a directory": "toast.torrentstream.downloadDirNotDir",
    "Scan completed": "scanner.status.scanCompleted",
    "The AniList API is back online": "toast.anilist.apiBackOnline",
    "Your AniList session has expired. Please log in again.": "toast.anilist.sessionExpired",
    "Failed to update progress on AniList": "toast.anilist.updateProgressFailed",
    "Failed to parse room URL": "toast.nakama.failedToParseRoomUrl",
    "Failed to connect to room server": "toast.nakama.failedToConnectRoom",
    "Failed to reconnect to room. Please create a new room.": "toast.nakama.failedToReconnect",
    "Failed to connect to Nakama host after multiple attempts.": "toast.nakama.failedToConnectHost",
    "Peer not found in session": "toast.watchParty.peerNotFound",
    "Watch party: Failed to prepare debrid stream": "toast.watchParty.failedPrepareDebrid",
    "Watch party: Failed to play media: Host did not return torrent stream start options": "toast.watchParty.missingTorrentParams",
    "Watch party: Failed to play media: Torrent streaming is not enabled": "toast.watchParty.torrentNotEnabled",
    "Watch party: Failed to play media: Host did not return onlinestream params": "toast.watchParty.missingOnlinestreamParams",
    "Progress tracking will not be available for custom sources.": "toast.watchParty.customNoTracking",
    "Sending stream to media player...": "entry.debridStream.sendingStream",
    "Sending stream to player...": "entry.debridStream.sendingStream",
    "Failed to retrieve playlist info": "toast.playlist.retrieveInfoFailed",
}

export function translateServerMessage(msg: string): string {
    // Exact messages take precedence over generic prefixes (notably Watch Party).
    const key = SERVER_TOAST_MAP[msg]
    if (typeof key === "string") return t(key)

    const rateLimit = msg.match(/^anilist: Rate limited, retrying in (\d+) seconds$/)
    if (rateLimit) return t("toast.anilist.rateLimited", { seconds: Number(rateLimit[1]) })

    const apiIssues = msg.match(/^The AniList API is experiencing issues.*\((\d+) failures in (.+)\)/)
    if (apiIssues) return t("toast.anilist.apiIssues", { count: Number(apiIssues[1]), time: apiIssues[2] })

    for (const [prefix, translationKey] of [
        ["Watch party: Failed to play media:", "toast.watchParty.playFailedGeneric"],
        ["Failed to upload subtitle file:", "toast.subtitles.uploadFailed"],
        ["Failed to convert subtitle file:", "toast.subtitles.conversionFailed"],
        ["debrid:", "toast.debrid.genericError"],
    ] as const) {
        if (msg.startsWith(prefix)) return t(translationKey, { error: msg.slice(prefix.length).trim() })
    }
    if (msg.startsWith("plugin(")) return t("toast.plugin.genericError", { error: msg })
    return msg
}
