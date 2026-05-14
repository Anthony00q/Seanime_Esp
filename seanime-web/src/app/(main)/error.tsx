import { LuffyError } from "@/components/shared/luffy-error"
import { Button } from "@/components/ui/button"
import { createTranslator } from "@/locales"
import React from "react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const t = createTranslator("es")

    React.useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex justify-center">
            <LuffyError
                title={t("error.clientSideError")}
            >
                <p className="max-w-xl text-sm text-[--muted] mb-4">
                    {error.message || t("error.unexpectedError")}
                </p>
                <Button
                    onClick={
                        () => reset()
                    }
                >
                    {t("error.tryAgain")}
                </Button>
            </LuffyError>
        </div>
    )
}
