import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { createTranslator } from "@/locales"
import React from "react"

export function ElectronCrashScreenError() {
    const t = createTranslator()
    const [msg, setMsg] = React.useState("")
    const [isRendererCrash, setIsRendererCrash] = React.useState(false)

    React.useEffect(() => {
        if (window.electron) {
            const u = window.electron.on("crash", (msg: string, info?: { isRendererCrash?: boolean }) => {
                console.log("Received crash event", msg, info)
                setMsg(msg)
                if (info?.isRendererCrash) {
                    setIsRendererCrash(true)
                }
            })
            return () => {
                u?.()
            }
        }
    }, [])

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (window.electron) {
                    window.electron.send("quit-app")
                }
            } else if (e.key === "Enter") {
                if (window.electron) {
                    if (isRendererCrash) {
                        window.electron.send("restart-app")
                    } else {
                        window.electron.send("quit-app")
                    }
                }
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [isRendererCrash])

    return (
        <div className="px-4 space-y-4 px-10">
            <p>
                {msg || t("error.anErrorOccurred")}
            </p>

            <Alert
                intent="warning"
                description={isRendererCrash 
                    ? t("error.rendererCrashHelp") 
                    : t("error.anotherInstance")
                }
            />

            <div className="flex justify-center gap-3 pt-2">
                {isRendererCrash && (
                    <Button
                        intent="primary"
                        onClick={() => {
                            if (window.electron) {
                                window.electron.send("restart-app")
                            }
                        }}
                    >
                        {t("error.reload")}
                    </Button>
                )}
                <Button
                    intent="gray-outline"
                    onClick={() => {
                        if (window.electron) {
                            window.electron.send("quit-app")
                        }
                    }}
                >
                    {t("common.close" as any)}
                </Button>
            </div>
        </div>
    )
}
