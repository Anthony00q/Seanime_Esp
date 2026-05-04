import { getServerBaseUrl } from "@/api/client/server-url"
import { useWebsocketMessageListener } from "@/app/(main)/_hooks/handle-websockets"
import { Button, IconButton } from "@/components/ui/button"
import { cn } from "@/components/ui/core/styling"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Modal } from "@/components/ui/modal"
import { logger } from "@/lib/helpers/debug"
import { WSEvents } from "@/lib/server/ws-events"
import { __CAST_ENABLED__, __isElectronDesktop__ } from "@/types/constants"
import { atom } from "jotai"
import { useAtom, useAtomValue } from "jotai/react"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { BiCast } from "react-icons/bi"
import { toast } from "sonner"
import { createTranslator } from "@/locales"

const t = createTranslator("es")

const log = logger("CAST")

export const vc_isCasting = atom(false)

export const vc_castSession = atom<CastSessionState>({
    connected: false,
    device: null,
    sessionId: null,
})

export const vc_castMediaStatus = atom<CastMediaStatus | null>(null)

export function useCastManager() {
    const [isCasting, setIsCasting] = useAtom(vc_isCasting)
    const [session, setSession] = useAtom(vc_castSession)
    const [mediaStatus, setMediaStatus] = useAtom(vc_castMediaStatus)
    const [devices, setDevices] = useState<CastDevice[]>([])
    const [isDiscovering, setIsDiscovering] = useState(false)
    const statusPollRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // Listen for cast events from main process
    useEffect(() => {
        if (!__isElectronDesktop__ || !window.electron?.on) return

        const cleanups: (() => void)[] = []

        const c1 = window.electron.on("cast:deviceFound", (device: CastDevice) => {
            log.info("Device found:", device.name)
            setDevices(prev => {
                if (prev.some(d => d.id === device.id)) return prev
                return [...prev, device]
            })
        })
        if (c1) cleanups.push(c1)

        const c2 = window.electron.on("cast:sessionUpdate", (state: CastSessionState) => {
            log.info("Session update:", state)
            setSession(state)
            setIsCasting(state.connected)
            if (!state.connected) {
                setMediaStatus(null)
                if (statusPollRef.current) {
                    clearInterval(statusPollRef.current)
                    statusPollRef.current = null
                }
            }
        })
        if (c2) cleanups.push(c2)

        const c3 = window.electron.on("cast:mediaStatus", (status: CastMediaStatus) => {
            setMediaStatus(status)
        })
        if (c3) cleanups.push(c3)

        const c4 = window.electron.on("cast:error", (err: any) => {
            log.error("Cast error:", err)
            toast.error(t("nakama.toast.castError", { error: err?.message || "Unknown error" }))
        })
        if (c4) cleanups.push(c4)

        return () => {
            cleanups.forEach(fn => fn())
        }
    }, [])

    const discover = useCallback(async () => {
        if (!window.electron?.cast) return
        setDevices([])
        setIsDiscovering(true)
        await window.electron.cast.discover()
        // Stop after 10s
        setTimeout(async () => {
            await window.electron?.cast?.stopDiscovery()
            setIsDiscovering(false)
            const devs = await window.electron?.cast?.getDevices()
            if (devs) setDevices(devs)
        }, 10000)
    }, [])

    const connect = useCallback(async (deviceId: string) => {
        if (!window.electron?.cast) return
        try {
            await window.electron.cast.connect(deviceId)
            toast.success(t("nakama.toast.connectedToChromecast"))
            // Poll media status
            statusPollRef.current = setInterval(() => {
                window.electron?.cast?.getStatus().then(s => {
                    if (s?.mediaStatus) setMediaStatus(s.mediaStatus)
                })
            }, 2000)
        }
        catch (err: any) {
            toast.error(t("nakama.toast.failedToConnectChromecast", { error: err?.message || "Unknown error" }))
        }
    }, [])

    const disconnect = useCallback(async () => {
        if (!window.electron?.cast) return
        await window.electron.cast.disconnect()
        setIsCasting(false)
        setMediaStatus(null)
        toast.info(t("nakama.toast.disconnectedFromChromecast"))
    }, [])

    return {
        isCasting,
        session,
        mediaStatus,
        devices,
        isDiscovering,
        discover,
        connect,
        disconnect,
    }
}

// Relays subtitle events from ws to the chromecast
export function useCastSubtitleRelay() {
    const isCasting = useAtomValue(vc_isCasting)

    // Listen for subtitle events from the server
    useWebsocketMessageListener<any>({
        type: WSEvents.NATIVE_PLAYER,
        onMessage: (data) => {
            if (!__CAST_ENABLED__ || !isCasting || !window.electron?.cast) return

            if (data?.type === "subtitle-event") {
                const events = Array.isArray(data.payload) ? data.payload : [data.payload]
                window.electron.cast.sendSubtitleEvents(events)
            }

            if (data?.type === "set-tracks") {
                window.electron.cast.sendSubtitleTracks(data.payload)
            }
        },
    })
}

// Load the current playback onto the Chromecast
export async function castCurrentMedia(playbackInfo: any) {
    if (!window.electron?.cast || !playbackInfo) return

    const serverBaseUrl = getServerBaseUrl()
    const serverPort = parseInt(serverBaseUrl.split(":").pop() || "43211", 10)

    // Build the stream URL
    let streamUrl = playbackInfo.streamUrl || ""
    if (streamUrl.includes("{{SERVER_URL}}")) {
        streamUrl = streamUrl.replace("{{SERVER_URL}}", serverBaseUrl)
    }

    await window.electron.cast.loadMedia({
        streamUrl,
        contentType: playbackInfo.mimeType || "video/mp4",
        title: playbackInfo.media?.title?.english
            || playbackInfo.media?.title?.romaji
            || "Unknown",
        subtitle: playbackInfo.episode?.displayTitle || "",
        imageUrl: playbackInfo.media?.coverImage?.large || "",
        serverPort,
    })

    // Send fonts
    if (playbackInfo.mkvMetadata?.attachments) {
        const fontUrls = playbackInfo.mkvMetadata.attachments
            .filter((a: any) => a.type === "font")
            .map((a: any) => `${serverBaseUrl}/api/v1/directstream/att/${a.filename}`)
        if (fontUrls.length > 0) {
            await window.electron.cast.sendFonts(fontUrls, serverPort)
        }
    }

    // Send subtitle tracks
    if (playbackInfo.mkvMetadata?.subtitleTracks) {
        const tracks = playbackInfo.mkvMetadata.subtitleTracks.map((t: any) => ({
            number: t.number,
            name: t.name || "",
            language: t.language || "",
            languageIETF: t.languageIETF || "",
            codecID: t.codecID || "",
            codecPrivate: t.codecPrivate || "",
            default: t.default || false,
            forced: t.forced || false,
        }))
        await window.electron.cast.sendSubtitleTracks(tracks)
    }
}

// Only visible in Electron when cast dev flag is on
export function VideoCoreCastButton() {
    const [modalOpen, setModalOpen] = useState(false)
    const isCasting = useAtomValue(vc_isCasting)

    if (!__CAST_ENABLED__ || !__isElectronDesktop__ || !window.electron?.cast) return null

    return (
        <>
            <IconButton
                intent={isCasting ? "primary" : "gray-basic"}
                size="sm"
                icon={<BiCast className={cn("text-lg", isCasting && "text-brand-300")} />}
                onClick={() => setModalOpen(true)}
                title={isCasting ? "Casting" : "Cast to device"}
            />
            <CastDeviceModal open={modalOpen} onOpenChange={setModalOpen} />
        </>
    )
}

function CastDeviceModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { devices, isDiscovering, discover, connect, disconnect, isCasting, session } = useCastManager()

    useEffect(() => {
        if (open) {
            discover()
        }
    }, [open])

    return (
        <Modal open={open} onOpenChange={onOpenChange} title="Cast to Device" contentClass="max-w-md">
            <div className="space-y-4">
                {isCasting && session.device && (
                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded-md border border-brand-700">
                        <div>
                            <p className="text-sm font-medium text-brand-300">Connected to</p>
                            <p className="text-base font-semibold">{session.device.name}</p>
                        </div>
                        <Button intent="alert-subtle" size="sm" onClick={disconnect}>
                            Disconnect
                        </Button>
                    </div>
                )}

                {isDiscovering && (
                    <div className="flex items-center gap-2 text-sm text-[--muted]">
                        <LoadingSpinner />
                        <span>Searching for devices...</span>
                    </div>
                )}

                {devices.length === 0 && !isDiscovering && (
                    <div className="text-center py-6">
                        <p className="text-sm text-[--muted]">No devices found</p>
                        <Button intent="gray-subtle" size="sm" className="mt-2" onClick={discover}>
                            Scan again
                        </Button>
                    </div>
                )}

                {devices.length > 0 && (
                    <div className="space-y-2">
                        {devices.map((device) => (
                            <button
                                key={device.id}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-md transition-colors",
                                    "hover:bg-gray-800 text-left",
                                    session.device?.id === device.id && "bg-gray-800 border border-brand-700",
                                )}
                                onClick={() => {
                                    if (session.device?.id === device.id) return
                                    connect(device.id).then(() => onOpenChange(false))
                                }}
                                disabled={session.device?.id === device.id}
                            >
                                <BiCast className="text-xl text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium">{device.name}</p>
                                    <p className="text-xs text-[--muted]">{device.host}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {!isDiscovering && devices.length > 0 && (
                    <Button intent="gray-subtle" size="sm" className="w-full" onClick={discover}>
                        Scan again
                    </Button>
                )}
            </div>
        </Modal>
    )
}

// Shown when casting, replaces local video controls
export function CastPlaybackControls({ onStop }: { onStop?: () => void }) {
    const isCasting = useAtomValue(vc_isCasting)
    const mediaStatus = useAtomValue(vc_castMediaStatus)
    const session = useAtomValue(vc_castSession)

    if (!isCasting || !mediaStatus) return null

    const isPlaying = mediaStatus.playerState === "PLAYING"
    const isBuffering = mediaStatus.playerState === "BUFFERING"
    const currentTime = mediaStatus.currentTime || 0
    const duration = mediaStatus.duration || 0
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <div className="flex flex-col gap-2 p-3 bg-gray-950/80 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-brand-300">
                <BiCast className="text-lg" />
                <span>Casting to {session.device?.name}</span>
                {isBuffering && <LoadingSpinner className="ml-1" />}
            </div>

            <div className="flex items-center gap-2">
                <span className="text-xs tabular-nums">{formatTime(currentTime)}</span>
                <div
                    className="flex-1 h-1 bg-gray-700 rounded-full cursor-pointer"
                    onClick={(e) => {
                        if (!duration) return
                        const rect = e.currentTarget.getBoundingClientRect()
                        const ratio = (e.clientX - rect.left) / rect.width
                        window.electron?.cast?.seek(ratio * duration)
                    }}
                >
                    <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-xs tabular-nums">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-center gap-3">
                <Button
                    intent="gray-subtle"
                    size="sm"
                    onClick={() => window.electron?.cast?.seek(Math.max(0, currentTime - 10))}
                >
                    -10s
                </Button>
                <Button
                    intent="primary-subtle"
                    size="sm"
                    onClick={() => isPlaying ? window.electron?.cast?.pause() : window.electron?.cast?.play()}
                >
                    {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button
                    intent="gray-subtle"
                    size="sm"
                    onClick={() => window.electron?.cast?.seek(currentTime + 30)}
                >
                    +30s
                </Button>
                <Button
                    intent="alert-subtle"
                    size="sm"
                    onClick={() => {
                        window.electron?.cast?.stop()
                        onStop?.()
                    }}
                >
                    Stop
                </Button>
            </div>
        </div>
    )
}




















