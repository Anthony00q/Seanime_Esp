import { HibikeManga_ChapterDetails } from "@/api/generated/types"
import { Button } from "@/components/ui/button"
import { createTranslator } from "@/locales"
import React from "react"
import { FaDownload } from "react-icons/fa"

type ChapterListBulkActionsProps = {
    rowSelectedChapters: HibikeManga_ChapterDetails[] | undefined
    onDownloadSelected: (chapters: HibikeManga_ChapterDetails[]) => void
}

export function ChapterListBulkActions(props: ChapterListBulkActionsProps) {
    const t = createTranslator()

    const {
        rowSelectedChapters,
        onDownloadSelected,
        ...rest
    } = props

    const handleDownloadSelected = React.useCallback(() => {
        onDownloadSelected(rowSelectedChapters || [])
    }, [onDownloadSelected, rowSelectedChapters])

    if (!rowSelectedChapters?.length) return null

    return (
        <>
            <Button
                onClick={handleDownloadSelected}
                intent="white"
                size="sm"
                leftIcon={<FaDownload />}
                className="animate-pulse"
                data-download-selected-chapters-button
            >
                {t("manga.downloadSelectedChapters", { count: rowSelectedChapters.length })}
            </Button>
        </>
    )
}
