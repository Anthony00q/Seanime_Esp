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
