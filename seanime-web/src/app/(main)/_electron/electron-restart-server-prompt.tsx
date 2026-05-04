import { getServerBaseUrl } from "@/api/client/server-url"
import { serverAuthTokenAtom } from "@/app/(main)/_atoms/server-status.atoms"
import { isUpdateInstalledAtom, isUpdatingAtom } from "@/app/(main)/_electron/electron-update-modal"
import { websocketConnectedAtom, websocketConnectionErrorCountAtom } from "@/app/websocket-provider"
import { LuffyError } from "@/components/shared/luffy-error"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { createTranslator } from "@/locales"
import { useAtomValue } from "jotai/react"
import React from "react"
import { toast } from "sonner"

export function ElectronRestartServerPrompt() {
    const t = createTranslator("es")

    type ServerReachability = "unknown" | "reachable" | "unreachable"

    const [hasRendered, setHasRendered] = React.useState(false)

    const isConnected = useAtomValue(websocketConnectedAtom)
    const connectionErrorCount = useAtomValue(websocketConnectionErrorCountAtom)
    const [hasClickedRestarted, setHasClickedRestarted] = React.useState(false)
    const isUpdatedInstalled = useAtomValue(isUpdateInstalledAtom)
    const isUpdating = useAtomValue(isUpdatingAtom)

    // Check if the server requires a password (no router dependency)
    const [serverHasPassword, setServerHasPassword] = React.useState(false)
    const [serverReachability, setServerReachability] = React.useState<ServerReachability>("unknown")
    const serverAuthToken = useAtomValue(serverAuthTokenAtom)

    const probeServerHealth = React.useCallback(async () => {
        try {
            const headers: Record<string, string> = {}
            if (serverAuthToken) {
                headers["X-Seanime-Token"] = serverAuthToken
            }

            const res = await fetch(`${getServerBaseUrl()}/api/v1/status`, {
                headers,
                cache: "no-store",
            })

            if (!res.ok) {
                setServerReachability("unreachable")
                return false
            }

            const json = await res.json() as { data?: { serverHasPassword?: boolean } }
            setServerHasPassword(!!json?.data?.serverHasPassword)
            setServerReachability("reachable")
            return true
        }
        catch {
            setServerReachability("unreachable")
            return false
        }
    }, [serverAuthToken])

    React.useEffect(() => {
        probeServerHealth()
    }, [probeServerHealth])

    const threshold = 8

    React.useEffect(() => {
        (async () => {
            if (window.electron) {
                // await window.electron.window.getCurrentWindow() // TODO: Isn't called
                setHasRendered(true)
            }
        })()
    }, [])

    React.useEffect(() => {
        if (isConnected || !hasRendered) {
            if (isConnected) {
                setServerReachability("reachable")
            }
            return
        }

        probeServerHealth()

        const interval = setInterval(() => {
            probeServerHealth()
        }, 2000)

        return () => {
            clearInterval(interval)
        }
    }, [hasRendered, isConnected, probeServerHealth])

    const handleRestart = async () => {
        if (import.meta.env.MODE === "development") return toast.warning(t("electron.devModeNotRestarting"))

        setHasClickedRestarted(true)
        toast.info(t("electron.restartingServer"))
        if (window.electron) {
            window.electron.emit("restart-server")
            React.startTransition(() => {
                setTimeout(() => {
                    setHasClickedRestarted(false)
                }, 5000)
            })
        }
    }

    // Server is reachable but user hasn't logged in yet
    const isUnauthenticated = (serverHasPassword && !serverAuthToken) || import.meta.env.MODE === "development"
    const isServerUnavailable = serverReachability === "unreachable"

    // Try to reconnect automatically
    const tryAutoReconnectRef = React.useRef(true)
    React.useEffect(() => {
        if (
            !isConnected
            && isServerUnavailable
            && connectionErrorCount >= threshold
            && tryAutoReconnectRef.current
            && !isUpdatedInstalled
            && !isUnauthenticated
        ) {
            tryAutoReconnectRef.current = false
            console.log("Connection error count reached 10, restarting server automatically")
            handleRestart()
        }
    }, [connectionErrorCount, isConnected, isServerUnavailable, isUnauthenticated, isUpdatedInstalled])

    React.useEffect(() => {
        if (isConnected) {
            setHasClickedRestarted(false)
            tryAutoReconnectRef.current = true
        }
    }, [isConnected])

    if (!hasRendered || isUnauthenticated) return null

    // Not connected for 10 seconds
    return (
        <>
            {(!isConnected && connectionErrorCount > 2 && connectionErrorCount < threshold && !isUpdating && !isUpdatedInstalled) && (
                <div className="fixed top-4 left-1/2 z-[9999] -translate-x-1/2 rounded-full border bg-orange-950/85 px-4 py-2 text-sm text-gray-200 shadow-lg backdrop-blur-sm">
                    {isServerUnavailable
                        ? "The background server is not responding. Trying to recover..."
                        : "Reconnecting to the background server..."}
                </div>
            )}

            <Modal
                open={!isConnected && isServerUnavailable && connectionErrorCount >= threshold && !isUpdatedInstalled}
                onOpenChange={() => {}}
                hideCloseButton
                contentClass="max-w-2xl"
            >
                <LuffyError>
                    <div className="space-y-4 flex flex-col items-center">
                        <p className="text-lg max-w-sm">
                            The background server process has stopped responding. Please restart it to continue.
                        </p>

                        <Button
                            onClick={handleRestart}
                            loading={hasClickedRestarted}
                            intent="white-outline"
                            size="lg"
                            className="rounded-full"
                        >
                            Restart server
                        </Button>
                        <p className="text-[--muted] text-sm max-w-xl">
                            If this message persists after multiple tries, please relaunch the application.
                        </p>
                    </div>
                </LuffyError>
            </Modal>
        </>
    )
}
