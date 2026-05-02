import { Models_TorrentstreamSettings } from "@/api/generated/types"
import { useSaveTorrentstreamSettings, useTorrentstreamDropTorrent } from "@/api/hooks/torrentstream.hooks"
import { AutoSelectProfileButton } from "@/app/(main)/settings/_components/autoselect-profile-form"
import { SettingsCard } from "@/app/(main)/settings/_components/settings-card"
import { SettingsIsDirty, SettingsSubmitButton } from "@/app/(main)/settings/_components/settings-submit-button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { defineSchema, Field, Form } from "@/components/ui/form"
import { createTranslator } from "@/locales"
import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FcFolder } from "react-icons/fc"
import { SiBittorrent } from "react-icons/si"
import { toast } from "sonner"

const t = createTranslator("es")

const torrentstreamSchema = defineSchema(({ z }) => z.object({
    enabled: z.boolean(),
    downloadDir: z.string(),
    autoSelect: z.boolean(),
    disableIPV6: z.boolean(),
    addToLibrary: z.boolean(),
    // streamingServerPort: z.number(),
    // streamingServerHost: z.string(),
    torrentClientHost: z.string().optional().default(""),
    torrentClientPort: z.number(),
    preferredResolution: z.string(),
    includeInLibrary: z.boolean(),
    streamUrlAddress: z.string().optional().default(""),
    slowSeeding: z.boolean().optional().default(false),
    preloadNextStream: z.boolean().optional().default(false),
}))


type TorrentstreamSettingsProps = {
    children?: React.ReactNode
    settings: Models_TorrentstreamSettings | undefined
}

export function TorrentstreamSettings(props: TorrentstreamSettingsProps) {

    const {
        children,
        settings,
        ...rest
    } = props

    const { mutate, isPending } = useSaveTorrentstreamSettings()

    const { mutate: dropTorrent, isPending: droppingTorrent } = useTorrentstreamDropTorrent()

    const formRef = React.useRef<UseFormReturn<any>>(null)

    if (!settings) return null

    return (
        <>
            <Form
                schema={torrentstreamSchema}
                mRef={formRef}
                onSubmit={data => {
                    if (settings) {
                        mutate({
                                settings: {
                                    ...settings,
                                    ...data,
                                    preferredResolution: data.preferredResolution === "-" ? "" : data.preferredResolution,
                                },
                            },
                            {
                                onSuccess: () => {
                                    formRef.current?.reset(formRef.current.getValues())
                                    toast.success(t("settings.torrentstream.settingsSaved"))
                                },
                            },
                        )
                    }
                }}
                defaultValues={{
                    enabled: settings.enabled,
                    autoSelect: settings.autoSelect,
                    downloadDir: settings.downloadDir || "",
                    disableIPV6: settings.disableIPV6,
                    addToLibrary: settings.addToLibrary,
                    // streamingServerPort: settings.streamingServerPort,
                    // streamingServerHost: settings.streamingServerHost || "",
                    torrentClientHost: settings.torrentClientHost || "",
                    torrentClientPort: settings.torrentClientPort,
                    preferredResolution: settings.preferredResolution || "-",
                    includeInLibrary: settings.includeInLibrary,
                    streamUrlAddress: settings.streamUrlAddress || "",
                    slowSeeding: settings.slowSeeding,
                    preloadNextStream: settings.preloadNextStream,
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
                                label={t("settings.torrentstream.enable")}
                            />
                        </SettingsCard>

                        <SettingsCard title={t("settings.torrentstream.homeScreen")}>
                            <Field.Switch
                                side="right"
                                name="includeInLibrary"
                                label={t("settings.torrentstream.includeInAnimeLibrary")}
                                help={t("settings.torrentstream.includeInAnimeLibraryHelp")}
                            />
                        </SettingsCard>

                        <SettingsCard title={t("settings.torrentstream.autoSelect")}>
                            <Field.Switch
                                side="right"
                                name="autoSelect"
                                label={t("settings.torrentstream.autoSelectEnable")}
                                help={t("settings.torrentstream.autoSelectEnableHelp")}
                            />

                            <Field.Select
                                name="preferredResolution"
                                label={t("settings.torrentstream.preferredResolution")}
                                help={t("settings.torrentstream.preferredResolutionHelp")}
                                options={[
                                    { label: t("settings.torrentstream.highest"), value: "-" },
                                    { label: "480p", value: "480" },
                                    { label: "720p", value: "720" },
                                    { label: "1080p", value: "1080" },
                                ]}
                            />

                            <div className="pt-2">
                                <AutoSelectProfileButton />
                            </div>
                        </SettingsCard>

                        <Accordion
                            type="single"
                            collapsible
                            className="border rounded-[--radius-md]"
                            triggerClass="dark:bg-[--paper]"
                            contentClass="!pt-2 dark:bg-[--paper]"
                        >
                            <AccordionItem value="more">
                                <AccordionTrigger className="bg-gray-900 rounded-[--radius-md]">
                                    {t("settings.torrentstream.torrentClient")}
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4">
                                    <div className="flex items-center gap-3">

                                        <Field.Text
                                            name="torrentClientHost"
                                            label={t("settings.torrentstream.host")}
                                            help={t("settings.torrentstream.hostHelp")}
                                        />

                                        <Field.Number
                                            name="torrentClientPort"
                                            label={t("settings.torrentstream.port")}
                                            formatOptions={{
                                                useGrouping: false,
                                            }}
                                            help={t("settings.torrentstream.portHelp")}
                                        />

                                    </div>

                                    <Field.Switch
                                        side="right"
                                        name="disableIPv6"
                                        label={t("settings.torrentstream.disableIPv6")}
                                    />

                                    <Field.Switch
                                        side="right"
                                        name="slowSeeding"
                                        label={t("settings.torrentstream.slowSeeding")}
                                        moreHelp={t("settings.torrentstream.slowSeedingHelp")}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <Accordion
                            type="single"
                            collapsible
                            className="border rounded-[--radius-md]"
                            triggerClass="dark:bg-[--paper]"
                            contentClass="!pt-2 dark:bg-[--paper]"
                        >
                            <AccordionItem value="more">
                                <AccordionTrigger className="bg-gray-900 rounded-[--radius-md]">
                                    {t("settings.torrentstream.advanced")}
                                </AccordionTrigger>
                                <AccordionContent className="pt-6 space-y-4">
                                    <Field.Text
                                        name="streamUrlAddress"
                                        label={t("settings.torrentstream.streamUrlAddress")}
                                        placeholder={t("settings.torrentstream.streamUrlAddressPlaceholder")}
                                        help={t("settings.torrentstream.streamUrlAddressHelp")}
                                    />

                                    <Field.DirectorySelector
                                        name="downloadDir"
                                        label={t("settings.torrentstream.cacheDirectory")}
                                        leftIcon={<FcFolder />}
                                        help={t("settings.torrentstream.cacheDirectoryHelp")}
                                        shouldExist
                                    />
                                    <Alert
                                        intent="warning"
                                        description={t("settings.torrentstream.chooseEmptyDirectory")}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>


                        <div className="flex w-full items-center">
                            <SettingsSubmitButton isPending={isPending} />
                            <div className="flex flex-1"></div>
                            <Button
                                leftIcon={<SiBittorrent />} intent="alert-subtle" onClick={() => dropTorrent()}
                                disabled={droppingTorrent}
                            >
                                {t("settings.torrentstream.dropTorrent")}
                            </Button>
</div>
                    </>
                )}
            </Form>
        </>
    )
}
