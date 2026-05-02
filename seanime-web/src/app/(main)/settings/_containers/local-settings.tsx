import { useLocalSyncSimulatedDataToAnilist } from "@/api/hooks/local.hooks"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { SettingsCard, SettingsPageHeader } from "@/app/(main)/settings/_components/settings-card"
import { SettingsSubmitButton } from "@/app/(main)/settings/_components/settings-submit-button"
import { ConfirmationDialog, useConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/components/ui/core/styling"
import { Field } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { createTranslator } from "@/locales"
import React from "react"
import { LuCloudUpload, LuUserCog } from "react-icons/lu"

const t = createTranslator("es")

type Props = {
    isPending: boolean
    children?: React.ReactNode
}

export function LocalSettings(props: Props) {

    const {
        isPending,
        children,
        ...rest
    } = props

    const serverStatus = useServerStatus()

    const { mutate: upload, isPending: isUploading } = useLocalSyncSimulatedDataToAnilist()

    const confirmDialog = useConfirmationDialog({
        title: t("settings.server.uploadToAnilist"),
        description: t("settings.server.uploadToAnilistDescription"),
        actionText: t("settings.server.upload"),
        actionIntent: "primary",
        onConfirm: async () => {
            upload()
        },
    })

    return (
        <div className="space-y-4">

            <SettingsPageHeader
                title={t("settings.localSettings.title")}
                description={t("settings.localSettings.description")}
                icon={LuUserCog}
            />

            <SettingsCard
                title={t("settings.anilist.title")}
            >
                <div className={cn(serverStatus?.user?.isSimulated && "opacity-50 pointer-events-none")}>
                    <Field.Switch
                        side="right"
                        name="autoSyncToLocalAccount"
                        label={t("settings.localSettings.autoSyncFromAniList")}
                        help={t("settings.localSettings.autoSyncFromAniListHelp")}
                    />
                </div>
                <Separator />
                <Button
                    size="sm"
                    intent="primary-subtle"
                    loading={isUploading}
                    leftIcon={<LuCloudUpload className="size-4" />}
                    onClick={() => {
                        confirmDialog.open()
                    }}
                    disabled={serverStatus?.user?.isSimulated}
                >
                    {t("settings.localSettings.uploadToAniList")}
                </Button>
            </SettingsCard>

            <SettingsSubmitButton isPending={isPending} />

            <ConfirmationDialog {...confirmDialog} />

        </div>
    )
}
