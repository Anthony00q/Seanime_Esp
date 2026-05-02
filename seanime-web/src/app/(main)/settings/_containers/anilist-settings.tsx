import { useLocalSyncSimulatedDataToAnilist } from "@/api/hooks/local.hooks"
import { SettingsPageHeader } from "@/app/(main)/settings/_components/settings-card"
import { SettingsSubmitButton } from "@/app/(main)/settings/_components/settings-submit-button"
import { ConfirmationDialog, useConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { createTranslator } from "@/locales"
import React from "react"
import { SiAnilist } from "react-icons/si"

const t = createTranslator("es")

type Props = {
    isPending: boolean
    children?: React.ReactNode
}

export function AnilistSettings(props: Props) {

    const {
        isPending,
        children,
        ...rest
    } = props

    const { mutate: upload, isPending: isUploading } = useLocalSyncSimulatedDataToAnilist()

    const confirmDialog = useConfirmationDialog({
        title: t("settings.server.uploadToAnilist"),
        description: t("settings.server.uploadToAnilistDescription"),
        actionText: t("settings.server.upload"),
        actionIntent: "primary",
        onConfirm: async () => {
            if (isUploading) return
            upload()
        },
    })

    return (
        <div className="space-y-4">

            <SettingsPageHeader
                title={t("settings.anilist.title")}
                description={t("settings.anilist.description")}
                icon={SiAnilist}
            />


            <SettingsSubmitButton isPending={isPending} />

            <ConfirmationDialog {...confirmDialog} />

        </div>
    )
}
