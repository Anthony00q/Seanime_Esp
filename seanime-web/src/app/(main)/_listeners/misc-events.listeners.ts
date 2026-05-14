import { useWebsocketMessageListener } from "@/app/(main)/_hooks/handle-websockets"
import { WSEvents } from "@/lib/server/ws-events"
import { toast } from "sonner"
import { createTranslator } from "@/locales"

const t = createTranslator("es")

const SERVER_TOAST_MAP: Record<string, string> = {
    "Adding chapters to download queue...": "manga.chaptersAddedToDownloadQueue",
    "Download directory does not exist": "toast.torrentstream.downloadDirNotExist",
    "Download directory is not a directory": "toast.torrentstream.downloadDirNotDir",
    "Scan completed": "scanner.status.scanCompleted",
}

function translateServerMessage(msg: string): string {
    const key = SERVER_TOAST_MAP[msg]
    if (key) {
        return t(key)
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
