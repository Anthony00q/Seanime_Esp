import { LuffyError } from "@/components/shared/luffy-error"
import { createTranslator } from "@/locales"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter as useTanStackRouter } from "@tanstack/react-router"
import React from "react"

const t = createTranslator()

interface AppErrorBoundaryProps {
    error: any
    reset?: () => void
    resetErrorBoundary?: () => void
}

export function AppErrorBoundary({ error, reset, resetErrorBoundary }: AppErrorBoundaryProps) {
    const router = useTanStackRouter({ warn: false }) as { invalidate?: () => void } | null
    const queryClient = useQueryClient()
    const pathname = typeof window !== "undefined" ? window.location.pathname : "/"

    const pathnameRef = React.useRef(pathname)

    React.useEffect(() => {
        if (pathname !== pathnameRef.current) {
            pathnameRef.current = pathname
            if (resetErrorBoundary) {
                resetErrorBoundary()
            }
            if (reset) {
                reset()
            }
        }
    }, [pathname, reset, resetErrorBoundary])

    const handleReset = () => {
        if (resetErrorBoundary) {
            resetErrorBoundary()
        }
        if (reset) {
            reset()
        }
        router?.invalidate?.()
        queryClient.invalidateQueries()
    }

    return (
        <LuffyError
            title={t("misc.error.clientSideError")}
            reset={handleReset}
        >
            <p className="text-[--muted]">
                {(error as Error)?.message || t("misc.error.unexpectedError")}
            </p>
        </LuffyError>
    )
}
