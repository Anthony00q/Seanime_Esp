import { __issueReport_overlayOpenAtom, __issueReport_recordingAtom } from "@/app/(main)/_features/issue-report/issue-report"
import { useHandleCopyLatestLogs } from "@/app/(main)/_hooks/logs"
import { CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command"
import { createTranslator } from "@/locales"
import { useSetAtom } from "jotai/react"
import React from "react"
import { useSeaCommandContext } from "./sea-command"

const t = createTranslator()

export function SeaCommandActions() {

    const { input, select, command: { isCommand, command, args }, scrollToTop, close } = useSeaCommandContext()

    const setIssueRecorderOpen = useSetAtom(__issueReport_overlayOpenAtom)
    const setIssueRecorderIsRecording = useSetAtom(__issueReport_recordingAtom)

    const { handleCopyLatestLogs } = useHandleCopyLatestLogs()

    return (
        <>
            {command === "logs" && (
                <CommandGroup heading={t("features.seaCommand.actions")}>
                    <CommandItem
                        value="Logs"
                        onSelect={() => {
                            select(() => {
                                handleCopyLatestLogs()
                            })
                        }}
                    >
                        {t("features.seaCommand.copyServerLogs")}
                        <CommandShortcut>Enter</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
            )}
            {command === "issue" && (
                <CommandGroup heading={t("features.seaCommand.actions")}>
                    <CommandItem
                        value="Issue"
                        onSelect={() => {
                            select(() => {
                                close()
                                React.startTransition(() => {
                                    setIssueRecorderOpen(true)
                                    setTimeout(() => {
                                        setIssueRecorderIsRecording(true)
                                    }, 500)
                                })
                            })
                        }}
                    >
                        {t("features.seaCommand.recordIssue")}
                        <CommandShortcut>Enter</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
            )}
        </>
    )
}
