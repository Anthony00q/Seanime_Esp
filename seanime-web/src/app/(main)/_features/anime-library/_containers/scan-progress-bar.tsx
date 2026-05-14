import { __scanner_isScanningAtom } from "@/app/(main)/_features/anime-library/_containers/scanner-modal"

import { useWebsocketMessageListener } from "@/app/(main)/_hooks/handle-websockets"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { Card, CardDescription, CardHeader } from "@/components/ui/card"
import { Spinner } from "@/components/ui/loading-spinner"
import { ProgressBar } from "@/components/ui/progress-bar"
import { WSEvents } from "@/lib/server/ws-events"
import { useAtom } from "jotai/react"
import React, { useState } from "react"
import { createTranslator } from "@/locales"

const SCAN_STATUS_MAP: Record<string, string> = {
    "Retrieving local files...": "scanner.status.retrievingLocalFiles",
    "Verifying shelved files...": "scanner.status.verifyingShelvedFiles",
    "Scanning local files...": "scanner.status.scanningLocalFiles",
    "Verifying file integrity...": "scanner.status.verifyingFileIntegrity",
    "Scan completed": "scanner.status.scanCompleted",
    "Fetching additional matching data...": "scanner.status.fetchingMatchingData",
    "Fetching media...": "scanner.status.fetchingMedia",
    "Matching local files...": "scanner.status.matchingLocalFiles",
    "Hydrating metadata...": "scanner.status.hydratingMetadata",
    "Adding missing media to AniList...": "scanner.status.addingMissingMedia",
}

function translateScanStatus(status: string, t: ReturnType<typeof createTranslator>): string {
    const key = SCAN_STATUS_MAP[status]
    if (key) return t(key)
    return status
}

export function ScanProgressBar() {

    const [isScanning] = useAtom(__scanner_isScanningAtom)

    const t = createTranslator("es")

    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState(t("scanner.scanning"))

    React.useEffect(() => {
        if (!isScanning) {
            setProgress(0)
            setStatus(t("scanner.scanning"))
        }
    }, [isScanning])

    useWebsocketMessageListener<number>({
        type: WSEvents.SCAN_PROGRESS,
        onMessage: data => {
            setProgress(data)
        },
    })

    useWebsocketMessageListener<string>({
        type: WSEvents.SCAN_STATUS,
        onMessage: data => {
            setStatus(translateScanStatus(data, t))
        },
    })

    if (!isScanning) return null

    return (
        <>
            <div className="w-full bg-gray-950 fixed top-0 left-0 z-[100]" data-scan-progress-bar-container>
                <ProgressBar size="xs" value={progress} />
            </div>
            <div className="z-50 fixed bottom-4 right-4" data-scan-progress-bar-card-container>
                <PageWrapper>
                    <Card className="w-fit max-w-[400px] relative" data-scan-progress-bar-card>
                        <CardHeader>
                            <CardDescription className="flex items-center gap-2 text-base text-[--foregorund]">
                                <Spinner className="size-6" /> {progress}% - {status}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </PageWrapper>
            </div>
        </>
    )

}
