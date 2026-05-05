import { useGetDebridSettings, useSaveDebridSettings } from "@/api/hooks/debrid.hooks"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { AutoSelectProfileButton } from "@/app/(main)/settings/_components/autoselect-profile-form"
import { SettingsCard, SettingsPageHeader } from "@/app/(main)/settings/_components/settings-card"
import { SettingsIsDirty, SettingsSubmitButton } from "@/app/(main)/settings/_components/settings-submit-button"
import { SeaLink } from "@/components/shared/sea-link"
import { Alert } from "@/components/ui/alert"
import { defineSchema, Field, Form } from "@/components/ui/form"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { createTranslator } from "@/locales"
import React from "react"
import { UseFormReturn } from "react-hook-form"
import { HiOutlineServerStack } from "react-icons/hi2"
import { LuCirclePlay } from "react-icons/lu"
import { toast } from "sonner"

const t = createTranslator("es")

const debridSettingsSchema = defineSchema(({ z }) => z.object({
    enabled: z.boolean().default(false),
    provider: z.string().default(""),
    apiKey: z.string().optional().default(""),
    includeDebridStreamInLibrary: z.boolean().default(false),
    streamAutoSelect: z.boolean().default(false),
    streamPreferredResolution: z.string(),
}))

type DebridSettingsProps = {
    children?: React.ReactNode
}

export function DebridSettings(props: DebridSettingsProps) {

    const {
        children,
        ...rest
    } = props

    const serverStatus = useServerStatus()
    const { data: settings, isLoading } = useGetDebridSettings()
    const { mutate, isPending } = useSaveDebridSettings()

    const formRef = React.useRef<UseFormReturn<any>>(null)

    if (isLoading) return <LoadingSpinner />

    return (
        <div className="space-y-4">

            <SettingsPageHeader
                title={t("settings.debridService.title")}
                description={t("settings.debridService.description")}
                icon={HiOutlineServerStack}
            />

            <Form
                schema={debridSettingsSchema}
                mRef={formRef}
                onSubmit={data => {
                    if (settings) {
                        mutate({
                                settings: {
                                    ...settings,
                                    ...data,
                                    provider: data.provider === "-" ? "" : data.provider,
                                    streamPreferredResolution: data.streamPreferredResolution === "-" ? "" : data.streamPreferredResolution,
                                },
                            },
                            {
                                onSuccess: () => {
                                    formRef.current?.reset(formRef.current.getValues())
                                    toast.success(t("toast.settings.settingsSaved"))
                                },
                            },
                        )
                    }
                }}
                defaultValues={{
                    enabled: settings?.enabled,
                    provider: settings?.provider || "-",
                    apiKey: settings?.apiKey,
                    includeDebridStreamInLibrary: settings?.includeDebridStreamInLibrary,
                    streamAutoSelect: settings?.streamAutoSelect ?? false,
                    streamPreferredResolution: settings?.streamPreferredResolution || "-",
                }}
                stackClass="space-y-4"
            >
                {(f) => (
                    <>
                        <SettingsIsDirty />
                        <SettingsCard>
                            <Field.Switch
                                side="right"
                                name="enabled"
                                label={t("settings.debridService.enable")}
                            />
                            {(f.watch("enabled") && serverStatus?.settings?.autoDownloader?.enabled && !serverStatus?.settings?.autoDownloader?.useDebrid) && (
                                <Alert
                                    intent="info"
                                    title={t("settings.debridService.autoDownloaderNotUsingDebrid")}
                                    description={<p>
                                        {t("settings.debridService.autoDownloaderNotUsingDebridDescription")} <SeaLink
                                        href="/auto-downloader"
                                        className="underline"
                                    >{t("settings.debridService.autoDownloaderSettings")}</SeaLink> {t("settings.debridService.toUseYourDebridService")}
                                    </p>}
                                />
                            )}
                        </SettingsCard>


                        <SettingsCard>
                            <Field.Select
                                options={[
                                    { label: t("settings.debridService.none"), value: "-" },
                                    { label: t("settings.debridService.providerTorBox"), value: "torbox" },
                                    { label: t("settings.debridService.providerRealDebrid"), value: "realdebrid" },
                                    { label: t("settings.debridService.providerAllDebrid"), value: "alldebrid" },
                                ]}
                                name="provider"
                                label={t("settings.debridService.provider")}
                            />

                            <Field.Text
                                name="apiKey"
                                label={t("settings.debridService.apiKey")}
                                type="password"
                            />
                        </SettingsCard>

                        <SettingsPageHeader
                            title={t("settings.debridService.debridStreaming")}
                            description={t("settings.debridService.debridStreamingDescription")}
                            icon={LuCirclePlay}
                        />

                        <SettingsCard title={t("settings.debridService.homeScreen")}>
                            <Field.Switch
                                side="right"
                                name="includeDebridStreamInLibrary"
                                label={t("settings.debridService.includeInAnimeLibrary")}
                                help={t("settings.debridService.includeInAnimeLibraryHelp")}
                            />
                        </SettingsCard>

                        <SettingsCard title={t("settings.debridService.autoSelect")}>
                            <Field.Switch
                                side="right"
                                name="streamAutoSelect"
                                label={t("settings.debridService.autoSelectEnable")}
                                help={t("settings.debridService.autoSelectEnableHelp")}
                            />

                            <Field.Select
                                name="streamPreferredResolution"
                                label={t("settings.debridService.preferredResolution")}
                                help={t("settings.debridService.preferredResolutionHelp")}
                                options={[
                                    { label: t("settings.debridService.highest"), value: "-" },
                                    { label: t("settings.debridService.res480p"), value: "480" },
                                    { label: t("settings.debridService.res720p"), value: "720" },
                                    { label: t("settings.debridService.res1080p"), value: "1080" },
                                ]}
                            />

                            <div className="pt-2">
                                <AutoSelectProfileButton />
                            </div>
                        </SettingsCard>


                        <SettingsSubmitButton isPending={isPending} />
                    </>
                )}
            </Form>

        </div>
    )
}
