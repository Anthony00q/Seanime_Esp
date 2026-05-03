import { useListMangaProviderExtensions } from "@/api/hooks/extensions.hooks"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { useStoredMangaProviders } from "@/app/(main)/manga/_lib/handle-manga-selected-provider"
import { SettingsCard, SettingsPageHeader } from "@/app/(main)/settings/_components/settings-card"
import { SettingsSubmitButton } from "@/app/(main)/settings/_components/settings-submit-button"
import { ConfirmationDialog, useConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/form"
import { createTranslator } from "@/locales"
import { atom } from "jotai"
import { useAtom } from "jotai/react"
import React from "react"
import { useFormContext } from "react-hook-form"
import { LuBookOpen } from "react-icons/lu"
import { toast } from "sonner"

const t = createTranslator("es")

type MangaSettingsProps = {
    isPending: boolean
}

const __manga_storedProvidersHistoryAtom = atom<Record<string, string> | null>(null)

export function MangaSettings(props: MangaSettingsProps) {

    const {
        isPending,
        ...rest
    } = props

    const serverStatus = useServerStatus()
    const f = useFormContext()

    const { data: extensions } = useListMangaProviderExtensions()

    const { storedProviders, overwriteStoredProviders, overwriteStoredProvidersWith } = useStoredMangaProviders(extensions)
    const [storedProvidersHistory, setStoredProvidersHistory] = useAtom(__manga_storedProvidersHistoryAtom)

    const options = React.useMemo(() => {
        return [
            { label: t("settings.manga.autoOption"), value: "-" },
            ...(extensions?.map(provider => ({
                label: provider.name,
                value: provider.id,
            })) ?? []).sort((a, b) => a.label.localeCompare(b.label)),
        ]
    }, [extensions])

    const defaultProviderExt = extensions?.find(e => e.id === serverStatus?.settings?.manga?.defaultMangaProvider)

    const confirmDialog = useConfirmationDialog({
        title: t("settings.manga.overwriteAllSourcesDialogTitle"),
        description: t("settings.manga.overwriteAllSourcesDialogDescription"),
        actionText: t("settings.manga.overwrite"),
        actionIntent: "warning",
        onConfirm: async () => {
            if (!defaultProviderExt) return
            const oldProviders = structuredClone(storedProviders)
            overwriteStoredProvidersWith(defaultProviderExt.id)
            toast.success(t("settings.manga.allSourceSelectionsOverwritten"))
            setTimeout(() => {
                setStoredProvidersHistory(oldProviders)
            }, 500)
        },
    })

    return (
        <>
            <SettingsPageHeader
                title={t("settings.manga.title")}
                description={t("settings.manga.description")}
                icon={LuBookOpen}
            />

            <SettingsCard>
                <Field.Switch
                    side="right"
                    name="enableManga"
                    label={<span className="flex gap-1 items-center">{t("settings.manga.enable")}</span>}
                    help={t("settings.manga.enableHelp")}
                />
            </SettingsCard>

            <SettingsCard>
                <Field.Select
                    name="defaultMangaProvider"
                    label={t("settings.manga.defaultProvider")}
                    help={t("settings.manga.defaultProviderHelp")}
                    options={options}
                />
                {(!!defaultProviderExt && f.watch("defaultMangaProvider") === serverStatus?.settings?.manga?.defaultMangaProvider) && (
                    <div className="flex w-full space-x-4 flex-wrap">
                        <Button className="px-0 py-1" intent="warning-link" onClick={() => confirmDialog.open()}>
                            {t("settings.manga.overwriteAllSources", { provider: defaultProviderExt.name })}
                        </Button>
                        {!!storedProvidersHistory && (
                            <Button
                                className="px-0 py-1" intent="gray-link" onClick={() => {
                                overwriteStoredProviders(storedProvidersHistory)
                                toast.success(t("settings.manga.previousSourceSelectionsRestored"))
                                setStoredProvidersHistory(null)
                            }}
                            >
                                {t("settings.manga.undo")}
                            </Button>
                        )}
                    </div>
                )}
                <Field.Switch
                    side="right"
                    name="mangaAutoUpdateProgress"
                    label={t("settings.manga.autoUpdateProgress")}
                    help={t("settings.manga.autoUpdateProgressHelp")}
                />
            </SettingsCard>

            <SettingsCard title={t("settings.manga.localProvider")} description={t("settings.manga.localProviderDescription")}>

                <Field.DirectorySelector
                    name="mangaLocalSourceDirectory"
                    label={t("settings.manga.localSourceDirectory")}
                    help={t("settings.manga.localSourceDirectoryHelp")}
                />
            </SettingsCard>

            <ConfirmationDialog {...confirmDialog} />

            <SettingsSubmitButton isPending={isPending} />
        </>
    )
}
