import { useGetMediastreamSettings, useSaveMediastreamSettings } from "@/api/hooks/mediastream.hooks"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { useMediastreamActiveOnDevice } from "@/app/(main)/mediastream/_lib/mediastream.atoms"
import { SettingsCard, SettingsPageHeader } from "@/app/(main)/settings/_components/settings-card"
import { SettingsIsDirty, SettingsSubmitButton } from "@/app/(main)/settings/_components/settings-submit-button"
import { defineSchema, Field, Form } from "@/components/ui/form"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { createTranslator } from "@/locales"
import React from "react"
import { UseFormReturn } from "react-hook-form"
import { LuTabletSmartphone } from "react-icons/lu"

const t = createTranslator("es")

const mediastreamSchema = defineSchema(({ z }) => z.object({
    transcodeEnabled: z.boolean(),
    transcodeHwAccel: z.string(),
    transcodePreset: z.string().min(2),
    // transcodeThreads: z.number(),
    // preTranscodeEnabled: z.boolean(),
    // preTranscodeLibraryDir: z.string(),
    disableAutoSwitchToDirectPlay: z.boolean(),
    directPlayOnly: z.boolean(),
    ffmpegPath: z.string().min(0),
    ffprobePath: z.string().min(0),
    transcodeHwAccelCustomSettings: z.string().min(0),
}))

const MEDIASTREAM_HW_ACCEL_OPTIONS = [
    { label: t("settings.mediastream.hwAccelCpu"), value: "cpu" },
    { label: t("settings.mediastream.hwAccelNvidia"), value: "nvidia" },
    { label: t("settings.mediastream.hwAccelIntel"), value: "qsv" },
    { label: t("settings.mediastream.hwAccelVaapi"), value: "vaapi" },
    { label: t("settings.mediastream.hwAccelVideoToolbox"), value: "videotoolbox" },
    { label: t("settings.mediastream.hwAccelCustom"), value: "custom" },
]

const MEDIASTREAM_PRESET_OPTIONS = [
    { label: t("settings.mediastream.presetUltrafast"), value: "ultrafast" },
    { label: t("settings.mediastream.presetSuperfast"), value: "superfast" },
    { label: t("settings.mediastream.presetVeryfast"), value: "veryfast" },
    { label: t("settings.mediastream.presetFast"), value: "fast" },
    { label: t("settings.mediastream.presetMedium"), value: "medium" },
]

type MediastreamSettingsProps = {
    children?: React.ReactNode
}

export function MediastreamSettings(props: MediastreamSettingsProps) {

    const {
        children,
        ...rest
    } = props

    const serverStatus = useServerStatus()

    const { data: settings, isLoading } = useGetMediastreamSettings(true)

    const { mutate, isPending } = useSaveMediastreamSettings()

    const { activeOnDevice, setActiveOnDevice } = useMediastreamActiveOnDevice()

    const formRef = React.useRef<UseFormReturn<any>>(null)

    if (!settings) return <LoadingSpinner />

    return (
        <>
            <SettingsPageHeader
                title={t("settings.mediastream.title")}
                description={t("settings.mediastream.description")}
                icon={LuTabletSmartphone}
            />

            <Form
                schema={mediastreamSchema}
                mRef={formRef}
                onSubmit={data => {
                    if (settings) {
                        mutate({
                                settings: {
                                    ...settings,
                                    ...data,
                                    preTranscodeLibraryDir: "",
                                    preTranscodeEnabled: false,
                                    transcodeThreads: 0,
                                },
                            },
                            {
                                onSuccess: () => {
                                    formRef.current?.reset(formRef.current.getValues())
                                },
                            },
                        )
                    }
                }}
                defaultValues={{
                    transcodeEnabled: settings?.transcodeEnabled ?? false,
                    transcodeHwAccel: settings?.transcodeHwAccel === "none" ? "cpu" : settings?.transcodeHwAccel || "cpu",
                    transcodePreset: settings?.transcodePreset || "fast",
                    disableAutoSwitchToDirectPlay: settings?.disableAutoSwitchToDirectPlay ?? false,
                    directPlayOnly: settings?.directPlayOnly ?? false,
                    ffmpegPath: settings?.ffmpegPath || "",
                    ffprobePath: settings?.ffprobePath || "",
                    transcodeHwAccelCustomSettings: settings?.transcodeHwAccelCustomSettings || "{\n	\"name\": \"\",\n	\"decodeFlags\": [\n		\"-hwaccel\", \"\",\n		\"-hwaccel_output_format\", \"\",\n	],\n	\"encodeFlags\": [\n		\"-c:v\", \"\",\n		\"-preset\", \"\",\n		\"-pix_fmt\", \"yuv420p\",\n	],\n	\"scaleFilter\": \"scale=%d:%d\"\n}",
                }}
                stackClass="space-y-4"
            >
                {(f) => (
                    <>
                        <SettingsIsDirty />
                        <SettingsCard>
                            <Field.Switch
                                side="right"
                                name="transcodeEnabled"
                                label={t("settings.mediastream.enable")}
                            />
                        </SettingsCard>

                        <SettingsCard title={t("settings.mediastream.directPlay")}>

                            <Field.Switch
                                side="right"
                                name="disableAutoSwitchToDirectPlay"
                                label={t("settings.mediastream.preferTranscoding")}
                                help={t("settings.mediastream.preferTranscodingHelp")}
                            />

                            <Field.Switch
                                side="right"
                                name="directPlayOnly"
                                label={t("settings.mediastream.directPlayOnly")}
                                help={t("settings.mediastream.directPlayOnlyHelp")}
                            />

                        </SettingsCard>

                        <SettingsCard title={t("settings.mediastream.transcoding")}>
                            <Field.Select
                                options={MEDIASTREAM_HW_ACCEL_OPTIONS}
                                name="transcodeHwAccel"
                                label={t("settings.mediastream.hardwareAcceleration")}
                                help={t("settings.mediastream.hardwareAccelerationHelp")}
                            />

                            {f.watch("transcodeHwAccel") === "custom" && (
                                <Field.Textarea
                                    name="transcodeHwAccelCustomSettings"
                                    label={t("settings.mediastream.customSettingsJson")}
                                    className="min-h-[400px]"
                                    help={t("settings.mediastream.customSettingsJsonHelp")}
                                />
                            )}

                            <Field.Select
                                options={MEDIASTREAM_PRESET_OPTIONS}
                                name="transcodePreset"
                                label={t("settings.mediastream.transcodePreset")}
                                help={t("settings.mediastream.transcodePresetHelp")}
                            />
                        </SettingsCard>

                        <SettingsCard title={t("settings.mediastream.ffmpeg")}>

                            <div className="flex gap-3 items-center">
                                <Field.Text
                                    name="ffmpegPath"
                                    label={t("settings.mediastream.ffmpegPath")}
                                    help={t("settings.mediastream.ffmpegPathHelp")}
                                />

                                <Field.Text
                                    name="ffprobePath"
                                    label={t("settings.mediastream.ffprobePath")}
                                    help={t("settings.mediastream.ffprobePathHelp")}
                                />
                            </div>
                        </SettingsCard>

                        <SettingsSubmitButton isPending={isPending} />
                    </>
                )}
            </Form>
        </>
    )
}
