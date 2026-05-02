import { useGetAnilistCacheLayerStatus, useToggleAnilistCacheLayerStatus } from "@/api/hooks/anilist.hooks"
import { useLocalSyncSimulatedDataToAnilist } from "@/api/hooks/local.hooks"
import { __seaCommand_shortcuts } from "@/app/(main)/_features/sea-command/sea-command"
import { SettingsCard } from "@/app/(main)/settings/_components/settings-card"
import { SettingsSubmitButton } from "@/app/(main)/settings/_components/settings-submit-button"
import { ConfirmationDialog, useConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/components/ui/core/styling"
import { Field } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { __isElectronDesktop__ } from "@/types/constants"
import { createTranslator } from "@/locales"
import { useAtom } from "jotai/react"
import React from "react"
import { useFormContext } from "react-hook-form"
import { FaRedo } from "react-icons/fa"
import { LuCircleAlert, LuCloudUpload } from "react-icons/lu"
import { useServerStatus } from "../../_hooks/use-server-status"

const t = createTranslator("es")

type ServerSettingsProps = {
    isPending: boolean
}

export function ServerSettings(props: ServerSettingsProps) {

    const {
        isPending,
        ...rest
    } = props

    const serverStatus = useServerStatus()

    const [shortcuts, setShortcuts] = useAtom(__seaCommand_shortcuts)
    const f = useFormContext()

    const { mutate: upload, isPending: isUploading } = useLocalSyncSimulatedDataToAnilist()

    const { data: isApiWorking, isLoading: isFetchingApiStatus } = useGetAnilistCacheLayerStatus()
    const { mutate: toggleCacheLayer, isPending: isTogglingCacheLayer } = useToggleAnilistCacheLayerStatus()

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

            {(!isApiWorking && !isFetchingApiStatus) && (
                <Alert
                    intent="warning-basic"
                    description={<div className="space-y-1">
                        <p>{t("settings.server.anilistApiNotWorking")}</p>
                        <p>{t("settings.server.anilistApiNotWorkingHelp")}</p>
                    </div>}
                    className="fixed top-4 right-4 z-[50] hidden lg:block"
                />
            )}

            <SettingsCard>
                {/*<p className="text-[--muted]">*/}
                {/*    Only applies to desktop and integrated players.*/}
                {/*</p>*/}

                <Field.Switch
                    side="right"
                    name="autoUpdateProgress"
                    label={t("settings.server.autoUpdateProgress")}
                    help={t("settings.server.autoUpdateProgressHelp")}
                    moreHelp={t("settings.server.autoUpdateProgressMoreHelp")}
                />
                {/*<Separator />*/}
                <Field.Switch
                    side="right"
                    name="enableWatchContinuity"
                    label={t("settings.server.enableWatchHistory")}
                    help={t("settings.server.enableWatchHistoryHelp")}
                    moreHelp={t("settings.server.enableWatchHistoryMoreHelp")}
                />

                <Field.Switch
                    side="right"
                    name="disableAnimeCardTrailers"
                    label={t("settings.server.disableAnimeCardTrailers")}
                    help={t("settings.server.disableAnimeCardTrailersHelp")}
                />

                <Separator />

                <Field.Switch
                    side="right"
                    name="hideAudienceScore"
                    label={t("settings.server.hideAudienceScore")}
                    help={t("settings.server.hideAudienceScoreHelp")}
                />

                <Field.Switch
                    side="right"
                    name="enableAdultContent"
                    label={t("settings.server.enableAdultContent")}
                    help={t("settings.server.enableAdultContentHelp")}
                />
                <Field.Switch
                    side="right"
                    name="blurAdultContent"
                    label={t("settings.server.blurAdultContent")}
                    help={t("settings.server.blurAdultContentHelp")}
                    fieldClass={cn(
                        !f.watch("enableAdultContent") && "opacity-50",
                    )}
                />

            </SettingsCard>

            <SettingsCard
                title={t("settings.server.localData")}
                description={t("settings.server.localDataDescription")}
            >
                <div className={cn(serverStatus?.user?.isSimulated && "opacity-50 pointer-events-none")}>
                    <Field.Switch
                        side="right"
                        name="autoSyncToLocalAccount"
                        label={t("settings.server.autoBackupListsFromAnilist")}
                        help={t("settings.server.autoBackupListsFromAnilistHelp")}
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
                    {t("settings.server.uploadLocalListsToAnilist")}
                </Button>
            </SettingsCard>

            <ConfirmationDialog {...confirmDialog} />

            <SettingsCard title={t("settings.server.offlineMode")} description={t("settings.server.offlineModeDescription")}>

                <Field.Switch
                    side="right"
                    name="autoSyncOfflineLocalData"
                    label={t("settings.server.downloadMetadataAutomatically")}
                    help={t("settings.server.downloadMetadataAutomaticallyHelp")}
                    moreHelp={t("settings.server.downloadMetadataAutomaticallyMoreHelp")}
                />

                <Field.Switch
                    side="right"
                    name="autoSaveCurrentMediaOffline"
                    label={t("settings.server.saveAllCurrentlyWatchedMedia")}
                    help={t("settings.server.saveAllCurrentlyWatchedMediaHelp")}
                />

            </SettingsCard>

            <SettingsCard title={t("settings.server.keyboardShortcuts")}>
                <div className="space-y-4">
                    {[
                        {
                            label: t("settings.server.openCommandPalette"),
                            value: "meta+j",
                            altValue: "q",
                        },
                    ].map(item => {
                        return (
                            <div className="flex gap-2 items-center" key={item.label}>
                                <label className="text-[--gray]">
                                    <span className="font-semibold">{item.label}</span>
                                </label>
                                <div className="flex gap-2 items-center">
                                    <Button
                                        onKeyDownCapture={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()

                                            const specialKeys = ["Control", "Shift", "Meta", "Command", "Alt", "Option"]
                                            if (!specialKeys.includes(e.key)) {
                                                const keyStr = `${e.metaKey ? "meta+" : ""}${e.ctrlKey ? "ctrl+" : ""}${e.altKey
                                                    ? "alt+"
                                                    : ""}${e.shiftKey ? "shift+" : ""}${e.key.toLowerCase()
                                                    .replace("arrow", "")
                                                    .replace("insert", "ins")
                                                    .replace("delete", "del")
                                                    .replace(" ", "space")
                                                    .replace("+", "plus")}`

                                                setShortcuts(prev => [keyStr, prev[1]])
                                            }
                                        }}
                                        className="focus:ring-2 focus:ring-[--brand] focus:ring-offset-1"
                                        size="sm"
                                        intent="white-subtle"
                                    >
                                        {shortcuts[0]}
                                    </Button>
                                    <span className="text-[--muted]">{t("settings.server.or")}</span>
                                    <Button
                                        onKeyDownCapture={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()

                                            const specialKeys = ["Control", "Shift", "Meta", "Command", "Alt", "Option"]
                                            if (!specialKeys.includes(e.key)) {
                                                const keyStr = `${e.metaKey ? "meta+" : ""}${e.ctrlKey ? "ctrl+" : ""}${e.altKey
                                                    ? "alt+"
                                                    : ""}${e.shiftKey ? "shift+" : ""}${e.key.toLowerCase()
                                                    .replace("arrow", "")
                                                    .replace("insert", "ins")
                                                    .replace("delete", "del")
                                                    .replace(" ", "space")
                                                    .replace("+", "plus")}`

                                                setShortcuts(prev => [prev[0], keyStr])
                                            }
                                        }}
                                        className="focus:ring-2 focus:ring-[--brand] focus:ring-offset-1"
                                        size="sm"
                                        intent="white-subtle"
                                    >
                                        {shortcuts[1]}
                                    </Button>
                                </div>
                                {(shortcuts[0] !== "meta+j" || shortcuts[1] !== "q") && (
                                    <Button
                                        onClick={() => {
                                            setShortcuts(["meta+j", "q"])
                                        }}
                                        className="rounded-full"
                                        size="sm"
                                        intent="white-basic"
                                        leftIcon={<FaRedo />}
                                    >
                                        {t("settings.server.reset")}
                                    </Button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </SettingsCard>

            <SettingsCard title={t("settings.server.appSettings")}>
                {/*<Separator />*/}
                <Field.Switch
                    side="right"
                    name="openWebURLOnStart"
                    label={t("settings.server.openLocalhostWebURLOnStartup")}
                />
                <Field.Switch
                    side="right"
                    name="disableNotifications"
                    label={t("settings.server.disableSystemNotifications")}
                    moreHelp={t("settings.server.disableSystemNotificationsMoreHelp")}
                />
                <Field.Switch
                    side="right"
                    name="disableCacheLayer"
                    label={t("settings.server.disableAnilistCaching")}
                    help={t("settings.server.disableAnilistCachingHelp")}
                    moreHelp={t("settings.server.disableAnilistCachingMoreHelp")}
                />
                {!f.watch("disableCacheLayer") && (
                    <div>
                        <Switch
                            value={!isApiWorking}
                            onValueChange={v => toggleCacheLayer()}
                            disabled={isTogglingCacheLayer}
                            label={t("settings.server.useCacheOnlyMode")}
                            moreHelp={t("settings.server.useCacheOnlyModeHelp")}
                        />
                    </div>
                )}
                <Field.Switch
                    side="right"
                    name="useFallbackMetadataProvider"
                    label={t("settings.server.useFallbackMetadataProvider")}
                    help={t("settings.server.useFallbackMetadataProviderHelp")}
                />
                {/*<Separator />*/}
                {/*<Field.Switch*/}
                {/*    side="right"*/}
                {/*    name="disableAutoDownloaderNotifications"*/}
                {/*    label="Disable Auto Downloader system notifications"*/}
                {/*/>*/}
                {/*/!*<Separator />*!/*/}
                {/*<Field.Switch*/}
                {/*    side="right"*/}
                {/*    name="disableAutoScannerNotifications"*/}
                {/*    label="Disable Auto Scanner system notifications"*/}
                {/*/>*/}
                <Separator />
                <Field.Switch
                    side="right"
                    name="disableUpdateCheck"
                    label={__isElectronDesktop__ ? t("settings.server.doNotFetchUpdateNotes") : t("settings.server.doNotCheckForUpdates")}
                    help={__isElectronDesktop__ ? (<span className="flex gap-2 items-center">
                        <LuCircleAlert className="size-4 text-[--blue]" />
                        <span>{t("settings.server.doNotFetchUpdateNotesHelp")}</span>
                    </span>) : t("settings.server.doNotCheckForUpdatesHelp")}
                    moreHelp={__isElectronDesktop__ ? t("settings.server.cannotDisableAutoUpdatesDenshi") : undefined}
                />
                <Field.Select
                    label={t("settings.server.updateChannel")}
                    name="updateChannel"
                    help={__isElectronDesktop__ ? t("settings.server.updateChannelHelpDenshi") : ""}
                    options={[
                        { label: t("settings.server.githubDefault"), value: "github" },
                        { label: t("settings.server.seanime"), value: "seanime" },
                        { label: t("settings.server.seanimeCanary"), value: "seanime_nightly" },
                    ]}
                />
                {serverStatus?.settings?.library?.updateChannel === "seanime" && (
                    <Alert intent="info" description={t("settings.server.usingSeanimeReleaseChannel")} />
                )}
                {serverStatus?.settings?.library?.updateChannel === "seanime_nightly" && (
                    <Alert
                        intent="warning"
                        description={t("settings.server.usingSeanimeCanaryReleaseChannel")}
                    />
                )}
            </SettingsCard>

            {/*<Accordion*/}
            {/*    type="single"*/}
            {/*    collapsible*/}
            {/*    className="border rounded-[--radius-md]"*/}
            {/*    triggerClass="dark:bg-[--paper]"*/}
            {/*    contentClass="!pt-2 dark:bg-[--paper]"*/}
            {/*>*/}
            {/*    <AccordionItem value="more">*/}
            {/*        <AccordionTrigger className="bg-gray-900 rounded-[--radius-md]">*/}
            {/*            Advanced*/}
            {/*        </AccordionTrigger>*/}
            {/*        <AccordionContent className="pt-6 flex flex-col md:flex-row gap-3">*/}
            {/*            */}
            {/*        </AccordionContent>*/}
            {/*    </AccordionItem>*/}
            {/*</Accordion>*/}


            <SettingsSubmitButton isPending={isPending} />

        </div>
    )
}

const cardCheckboxStyles = {
    itemContainerClass: cn(
        "block border border-[--border] cursor-pointer transition overflow-hidden w-full",
        "bg-gray-50 hover:bg-[--subtle] dark:bg-gray-950 border-dashed",
        "data-[checked=false]:opacity-30",
        "data-[checked=true]:bg-white dark:data-[checked=true]:bg-gray-950",
        "focus:ring-2 ring-brand-100 dark:ring-brand-900 ring-offset-1 ring-offset-[--background] focus-within:ring-2 transition",
        "data-[checked=true]:border data-[checked=true]:ring-offset-0",
    ),
    itemClass: cn(
        "hidden",
    ),
    // itemLabelClass: cn(
    //     "border-transparent border data-[checked=true]:border-brand dark:bg-transparent dark:data-[state=unchecked]:bg-transparent",
    //     "data-[state=unchecked]:bg-transparent data-[state=unchecked]:hover:bg-transparent dark:data-[state=unchecked]:hover:bg-transparent",
    //     "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent",
    // ),
    // itemLabelClass: "font-medium flex flex-col items-center data-[state=checked]:text-[--brand] cursor-pointer",
    stackClass: "flex md:flex-row flex-col space-y-0 gap-4",
}
