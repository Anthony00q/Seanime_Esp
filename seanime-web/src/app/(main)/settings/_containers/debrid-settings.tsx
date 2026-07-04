import { Models_DummyDebridSettings } from "@/api/generated/types"
import { useGetDebridSettings, useGetDummyDebridSettings, useSaveDebridSettings, useSaveDummyDebridSettings } from "@/api/hooks/debrid.hooks"
import { useWebsocketMessageListener } from "@/app/(main)/_hooks/handle-websockets.ts"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { AutoSelectProfileButton } from "@/app/(main)/settings/_components/autoselect-profile-form"
import { SettingsCard, SettingsPageHeader } from "@/app/(main)/settings/_components/settings-card"
import { SettingsIsDirty, SettingsSubmitButton } from "@/app/(main)/settings/_components/settings-submit-button"
import { SeaLink } from "@/components/shared/sea-link"
import { Alert } from "@/components/ui/alert"
import { defineSchema, Field, Form } from "@/components/ui/form"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { WSEvents } from "@/lib/server/ws-events.ts"
import { createTranslator } from "@/locales"
import React from "react"
import { UseFormReturn } from "react-hook-form"
import { HiOutlineServerStack } from "react-icons/hi2"
import { LuCirclePlay } from "react-icons/lu"
import { toast } from "sonner"

const t = createTranslator()

const debridSettingsSchema = defineSchema(({ z }) => z.object({
    enabled: z.boolean().default(false),
    provider: z.string().default(""),
    apiKey: z.string().optional().default(""),
    includeDebridStreamInLibrary: z.boolean().default(false),
    streamAutoSelect: z.boolean().default(false),
    streamPreferredResolution: z.string(),
}))

const dummyDebridSettingsSchema = defineSchema(({ z }) => z.object({
    enabled: z.boolean().default(true),
    profileName: z.string().default(""),
    fallbackFilePath: z.string().default(""),
    filesJson: z.string().superRefine((value, ctx) => {
        try {
            const parsed = JSON.parse(value || "[]")
            if (!Array.isArray(parsed)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Expected a JSON array" })
            }
        }
        catch {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON" })
        }
    }),
    cached: z.boolean().default(true),
    readyDelayMs: z.number().min(0).default(0),
    progressIntervalMs: z.number().min(0).default(0),
    firstByteDelayMs: z.number().min(0).default(0),
    bandwidthBytesPerSecond: z.number().min(0).default(0),
    chunkSize: z.number().min(0).default(0),
    jitterMs: z.number().min(0).default(0),
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
    const { data: settings, isLoading, refetch } = useGetDebridSettings()
    const { mutate, isPending } = useSaveDebridSettings()
    const dummyDebridEnabled = !!serverStatus?.featureFlags?.dummyDebrid
    const [selectedProvider, setSelectedProvider] = React.useState(settings?.provider || "-")
    const providerOptions = React.useMemo(() => [
        { label: t("settings.debridService.none"), value: "-" },
        { label: t("settings.debridService.providerTorBox"), value: "torbox" },
        { label: t("settings.debridService.providerRealDebrid"), value: "realdebrid" },
        { label: t("settings.debridService.providerAllDebrid"), value: "alldebrid" },
        { label: t("settings.debridService.providerPremiumize"), value: "premiumize" },
        ...(dummyDebridEnabled ? [{ label: t("settings.debridService.providerDummy"), value: "dummy" }] : []),
    ], [dummyDebridEnabled])

    useWebsocketMessageListener({
        type: WSEvents.SETTINGS_CHANGED,
        onMessage: () => {
            refetch()
        },
    })

    const formRef = React.useRef<UseFormReturn<any>>(null)

    React.useEffect(() => {
        setSelectedProvider(settings?.provider || "-")
    }, [settings?.provider])

    if (isLoading) return <LoadingSpinner />

    return (
        <div className="space-y-4">

            <SettingsPageHeader
                title={t("settings.debridService.title")}
                description={t("settings.debridService.description")}
                icon={HiOutlineServerStack}
            />

            <Form
                key={settings?.updatedAt ?? "debrid-settings"}
                schema={debridSettingsSchema}
                mRef={formRef}
                onSubmit={data => {
                    if (settings) {
                        mutate({
                                settings: {
                                    ...settings,
                                    ...data,
                                    provider: data.provider === "-" ? "" : data.provider,
                                    apiKey: data.provider === "dummy" ? "" : data.apiKey,
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
                stackClass="space-y-8"
            >
                {(f) => (
                    <>
                        <ProviderWatch provider={f.watch("provider")} onChange={setSelectedProvider} />
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


                        <SettingsCard title={t("settings.debridService.provider")}>
                            <Field.Select
                                options={providerOptions}
                                name="provider"
                                label={t("settings.debridService.provider")}
                            />

                            {f.watch("provider") !== "dummy" && (
                                <Field.Text
                                    name="apiKey"
                                    label={t("settings.debridService.apiKey")}
                                    type="password"
                                />
                            )}
                        </SettingsCard>

                        <SettingsPageHeader
                            title={t("settings.debridService.debridStreaming")}
                            description={t("settings.debridService.debridStreamingDescription")}
                            icon={LuCirclePlay}
                        />

                        <SettingsCard title={t("settings.torrentstream.homeScreen")}>
                            <Field.Switch
                                side="right"
                                name="includeDebridStreamInLibrary"
                                label={t("settings.torrentstream.includeInAnimeLibrary")}
                                help={t("settings.torrentstream.includeInAnimeLibraryHelp")}
                            />
                        </SettingsCard>

                        <SettingsCard title={t("settings.torrentstream.autoSelect")}>
                            <Field.Switch
                                side="right"
                                name="streamAutoSelect"
                                label={t("settings.torrentstream.autoSelectEnable")}
                                help={t("settings.torrentstream.autoSelectEnableHelp")}
                            />

                            <Field.Select
                                name="streamPreferredResolution"
                                label={t("settings.torrentstream.preferredResolution")}
                                help={t("settings.torrentstream.preferredResolutionHelp")}
                                options={[
                                    { label: t("settings.torrentstream.highest"), value: "-" },
                                    { label: t("settings.torrentstream.res480p"), value: "480" },
                                    { label: t("settings.torrentstream.res720p"), value: "720" },
                                    { label: t("settings.torrentstream.res1080p"), value: "1080" },
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

            {dummyDebridEnabled && selectedProvider === "dummy" && <DummyDebridProfileEditor />}

        </div>
    )
}

function ProviderWatch(props: { provider: string, onChange: (provider: string) => void }) {
    React.useEffect(() => {
        props.onChange(props.provider)
    }, [props.provider, props.onChange])

    return null
}

function DummyDebridProfileEditor() {
    const { data: settings, isLoading } = useGetDummyDebridSettings(true)
    const { mutate, isPending } = useSaveDummyDebridSettings()
    const formRef = React.useRef<UseFormReturn<any>>(null)

    if (isLoading) return <LoadingSpinner />
    if (!settings) return null

    return (
        <Form
            key={settings.updatedAt ?? "dummy-debrid-settings"}
            schema={dummyDebridSettingsSchema}
            mRef={formRef}
            onSubmit={data => {
                const { filesJson, ...values } = data
                const nextSettings: Models_DummyDebridSettings = {
                    ...settings,
                    ...values,
                    files: JSON.parse(filesJson || "[]") as Models_DummyDebridSettings["files"],
                }

                mutate({ settings: nextSettings }, {
                    onSuccess: () => {
                        formRef.current?.reset(formRef.current.getValues())
                        toast.success(t("settings.debridService.dummyProfileSaved"))
                    },
                })
            }}
            defaultValues={dummyDebridDefaultValues(settings)}
            stackClass="space-y-4"
        >
            {() => (
                <>
                    <SettingsIsDirty />
                    <SettingsCard title={t("settings.debridService.dummyDebridProfile")}>
                        <Field.Switch
                            side="right"
                            name="enabled"
                            label={t("settings.debridService.enableProfile")}
                        />
                        <Field.Text
                            name="profileName"
                            label={t("settings.debridService.profileName")}
                        />
                        <Field.Text
                            name="fallbackFilePath"
                            label={t("settings.debridService.fallbackMkvPath")}
                        />
                        <Field.Switch
                            side="right"
                            name="cached"
                            label={t("settings.debridService.cacheAvailable")}
                        />
                        <Field.Textarea
                            name="filesJson"
                            label={t("settings.debridService.files")}
                            className="min-h-[220px] font-mono text-sm"
                        />
                    </SettingsCard>

                    <SettingsCard title={t("settings.debridService.dummyNetwork")}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field.Number
                                name="readyDelayMs"
                                label={t("settings.debridService.readyDelayMs")}
                                min={0}
                                step={100}
                            />
                            <Field.Number
                                name="progressIntervalMs"
                                label={t("settings.debridService.progressIntervalMs")}
                                min={0}
                                step={50}
                            />
                            <Field.Number
                                name="firstByteDelayMs"
                                label={t("settings.debridService.firstByteDelayMs")}
                                min={0}
                                step={50}
                            />
                            <Field.Number
                                name="bandwidthBytesPerSecond"
                                label={t("settings.debridService.bandwidthBytesPerSecond")}
                                min={0}
                                step={1024}
                            />
                            <Field.Number
                                name="chunkSize"
                                label={t("settings.debridService.chunkSize")}
                                min={0}
                                step={1024}
                            />
                            <Field.Number
                                name="jitterMs"
                                label={t("settings.debridService.jitterMs")}
                                min={0}
                                step={10}
                            />
                        </div>
                    </SettingsCard>

                    <SettingsSubmitButton isPending={isPending} />
                </>
            )}
        </Form>
    )
}

function dummyDebridDefaultValues(settings: Models_DummyDebridSettings) {
    return {
        enabled: settings.enabled,
        profileName: settings.profileName,
        fallbackFilePath: settings.fallbackFilePath,
        filesJson: JSON.stringify(settings.files ?? [], null, 2),
        cached: settings.cached,
        readyDelayMs: settings.readyDelayMs,
        progressIntervalMs: settings.progressIntervalMs,
        firstByteDelayMs: settings.firstByteDelayMs,
        bandwidthBytesPerSecond: settings.bandwidthBytesPerSecond,
        chunkSize: settings.chunkSize,
        jitterMs: settings.jitterMs,
    }
}
