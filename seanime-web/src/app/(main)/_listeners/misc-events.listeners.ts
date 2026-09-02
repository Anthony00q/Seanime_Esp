import { useWebsocketMessageListener } from "@/app/(main)/_hooks/handle-websockets"
import { WSEvents } from "@/lib/server/ws-events"
import { toast } from "sonner"
import { createTranslator } from "@/locales"

const t = createTranslator()

const SERVER_TOAST_MAP: Record<string, string> = {
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

function translateDynamicServerMessage(msg: string): string | null {
    if (msg.startsWith("anilist: Rate limited")) {
        const seconds = msg.match(/\d+/)?.[0] || ""
        return t("toast.anilist.rateLimited", { seconds } as any)
    }
    if (msg.startsWith("The AniList API is experiencing issues")) {
        const match = msg.match(/(\d+) failures in (.+)\)/)
        const count = match?.[1] || "4"
        const time = match?.[2] || "30s"
        return t("toast.anilist.apiIssues", { count, time } as any)
    }
    if (msg.startsWith("Watch party: Failed to play media:")) {
        const error = msg.replace("Watch party: Failed to play media:", "").trim()
        return t("toast.watchParty.playFailedGeneric", { error } as any)
    }
    if (msg.startsWith("Failed to upload subtitle file:")) {
        const error = msg.replace("Failed to upload subtitle file:", "").trim()
        return t("toast.subtitles.uploadFailed", { error } as any)
    }
    if (msg.startsWith("Failed to convert subtitle file:")) {
        const error = msg.replace("Failed to convert subtitle file:", "").trim()
        return t("toast.subtitles.conversionFailed", { error } as any)
    }
    if (msg.startsWith("debrid:")) {
        const error = msg.replace(/^debrid:\s*/, "").trim()
        return t("toast.debrid.genericError", { error } as any)
    }
    if (msg.startsWith("plugin(")) {
        return t("toast.plugin.genericError", { error: msg } as any)
    }
    return null
}

function translateServerMessage(msg: string): string {
    const dynamicMsg = translateDynamicServerMessage(msg)
    if (dynamicMsg) {
        return dynamicMsg
    }

    const key = SERVER_TOAST_MAP[msg]
    if (typeof key === "string") {
        return t(key as any)
    }
    return msg
}

export function useMiscEventListeners() {

    useWebsocketMessageListener<string>({
        type: WSEvents.INFO_TOAST, onMessage: data => {
            if (!!data) {
                toast.info(translateServerMessage(data))
            }
        },
    })

    useWebsocketMessageListener<string>({
        type: WSEvents.SUCCESS_TOAST, onMessage: data => {
            if (!!data) {
                toast.success(translateServerMessage(data))
            }
        },
    })

    useWebsocketMessageListener<string>({
        type: WSEvents.WARNING_TOAST, onMessage: data => {
            if (!!data) {
                toast.warning(translateServerMessage(data))
            }
        },
    })

    useWebsocketMessageListener<string>({
        type: WSEvents.ERROR_TOAST, onMessage: data => {
            if (!!data) {
                toast.error(translateServerMessage(data))
            }
        },
    })

    useWebsocketMessageListener<string>({
        type: WSEvents.CONSOLE_LOG, onMessage: data => {
            console.log(data)
        },
    })

    useWebsocketMessageListener<string>({
        type: WSEvents.CONSOLE_WARN, onMessage: data => {
            console.warn(data)
        },
    })

}
