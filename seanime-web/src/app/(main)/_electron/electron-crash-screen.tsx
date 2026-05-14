import { Alert } from "@/components/ui/alert"
import { createTranslator } from "@/locales"
import React from "react"

export function ElectronCrashScreenError() {
    const t = createTranslator()
    const [msg, setMsg] = React.useState("")

    React.useEffect(() => {

        if (window.electron) {
            const u = window.electron.on("crash", (msg: string) => {
                console.log("Received crash event", msg)
                setMsg(msg)
            })
            return () => {
                u?.()
            }
        }
    }, [])

    return (
        <div className="px-4 space-y-4">
            <p>
                {msg || t("error.anErrorOccurred")}
            </p>

            <Alert
                intent="warning"
                description={t("error.anotherInstance")}
            />
        </div>
    )
}
