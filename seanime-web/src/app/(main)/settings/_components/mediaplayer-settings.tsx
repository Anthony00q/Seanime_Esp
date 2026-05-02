import { useExternalPlayerLink } from "@/app/(main)/_atoms/playback.atoms"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { SettingsCard, SettingsPageHeader } from "@/app/(main)/settings/_components/settings-card"
import { SettingsSubmitButton } from "@/app/(main)/settings/_components/settings-submit-button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert } from "@/components/ui/alert"
import { Field } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { TextInput } from "@/components/ui/text-input"
import { getDefaultIinaSocket, getDefaultMpvSocket } from "@/lib/server/settings"
import { createTranslator } from "@/locales"
import React from "react"
import { useWatch } from "react-hook-form"
import { FcClapperboard, FcVideoCall, FcVlc } from "react-icons/fc"
import { HiPlay } from "react-icons/hi"
import { IoPlayForwardCircleSharp } from "react-icons/io5"
import { LuCircleArrowOutUpRight, LuMonitorPlay } from "react-icons/lu"
import { RiSettings3Fill } from "react-icons/ri"

const t = createTranslator("es")

type MediaplayerSettingsProps = {
    isPending: boolean
}

export function MediaplayerSettings(props: MediaplayerSettingsProps) {

    const {
        isPending,
    } = props

    const serverStatus = useServerStatus()
    const selectedPlayer = useWatch({ name: "defaultPlayer" })

    return (
        <>
            <SettingsPageHeader
                title={t("settings.mediaPlayer.title")}
                description={t("settings.mediaPlayer.description")}
                icon={LuMonitorPlay}
            />

            <SettingsCard>
                <Field.Select
                    name="defaultPlayer"
                    label={t("settings.mediaPlayer.defaultPlayer")}
                    leftIcon={<FcVideoCall />}
                    options={[
                        { label: "MPV", value: "mpv" },
                        { label: "VLC", value: "vlc" },
                        { label: "MPC-HC (Windows)", value: "mpc-hc" },
                        { label: "IINA (macOS)", value: "iina" },
                    ]}
                    help={t("settings.mediaPlayer.defaultPlayerHelp")}
                />
                {selectedPlayer === "iina" && <Alert
                    intent="info-basic"
                    description={<p>{t("settings.mediaPlayer.iinaSettingsNote")} <strong>{t("settings.mediaPlayer.quitAfterAllWindowsClosed")}</strong> {t("settings.mediaPlayer.areChecked")} <span
                        className="underline"
                    >{t("settings.mediaPlayer.keepWindowOpenAfterPlaybackFinished")}</span> {t("settings.mediaPlayer.isUnchecked")} {t("settings.mediaPlayer.inYourIinaGeneralSettings")}</p>}
                />}
            </SettingsCard>

            <SettingsCard title={t("settings.mediaPlayer.playback")}>
                <Field.Switch
                    side="right"
                    name="autoPlayNextEpisode"
                    label={t("settings.mediaPlayer.automaticallyPlayNextEpisode")}
                    help={t("settings.mediaPlayer.automaticallyPlayNextEpisodeHelp")}
                />
            </SettingsCard>

            <SettingsCard title={t("settings.mediaPlayer.configuration")}>


                <Field.Text
                    name="mediaPlayerHost"
                    label={t("settings.mediaPlayer.host")}
                    help={t("settings.mediaPlayer.vlc")}
                />

                <Accordion
                    type="single"
                    className=""
                    triggerClass="text-[--muted] dark:data-[state=open]:text-white px-0 dark:hover:bg-transparent hover:bg-transparent dark:hover:text-white hover:text-black"
                    itemClass=""
                    contentClass="p-4 border rounded-[--radius-md]"
                    collapsible
                    defaultValue={serverStatus?.settings?.mediaPlayer?.defaultPlayer}
                >
                        <AccordionItem value="vlc">
                            <AccordionTrigger>
                                <h4 className="flex gap-2 items-center"><FcVlc /> {t("settings.mediaPlayer.vlc")}</h4>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <Field.Text
                                        name="vlcUsername"
                                        label={t("settings.mediaPlayer.username")}
                                    />
                                    <Field.Text
                                        name="vlcPassword"
                                        label={t("settings.mediaPlayer.password")}
                                        type="password"
                                    />
                                    <Field.Number
                                        name="vlcPort"
                                        label={t("settings.mediaPlayer.port")}
                                        formatOptions={{
                                            useGrouping: false,
                                        }}
                                        hideControls
                                    />
                                </div>
                                <Field.Text
                                    name="vlcPath"
                                    label={t("settings.mediaPlayer.applicationPath")}
                                />
                            </AccordionContent>
                        </AccordionItem>

                    <AccordionItem value="mpc-hc">
                        <AccordionTrigger>
                            <h4 className="flex gap-2 items-center"><FcClapperboard /> {t("settings.mediaPlayer.mpcHc")}</h4>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col md:flex-row gap-4">
                                <Field.Number
                                    name="mpcPort"
                                    label={t("settings.mediaPlayer.port")}
                                    formatOptions={{
                                        useGrouping: false,
                                    }}
                                    hideControls
                                />
                                <Field.Text
                                    name="mpcPath"
                                    label={t("settings.mediaPlayer.applicationPath")}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="mpv">
                        <AccordionTrigger>
                            <h4 className="flex gap-2 items-center"><HiPlay className="mr-1 text-purple-100" /> {t("settings.mediaPlayer.mpv")}</h4>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex gap-4">
                                <Field.Text
                                    name="mpvSocket"
                                    label={t("settings.mediaPlayer.socket")}
                                    placeholder={t("settings.mediaPlayer.defaultSocket", { default: getDefaultMpvSocket(serverStatus?.os ?? "") })}
                                />
                                <Field.Text
                                    name="mpvPath"
                                    label={t("settings.mediaPlayer.applicationPath")}
                                    placeholder={serverStatus?.os === "windows" ? "e.g. C:/Program Files/mpv/mpv.exe" : serverStatus?.os === "darwin"
                                        ? "e.g. /Applications/mpv.app/Contents/MacOS/mpv"
                                        : "Defaults to CLI"}
                                    help={t("settings.mediaPlayer.mpvHelp")}
                                />
                            </div>
                            <div>
                                <Field.Text
                                    name="mpvArgs"
                                    label={t("settings.mediaPlayer.options")}
                                    placeholder="e.g. --no-config --mute=yes"
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="iina">
                        <AccordionTrigger>
                            <h4 className="flex gap-2 items-center"><IoPlayForwardCircleSharp className="mr-1 text-purple-100" /> {t("settings.mediaPlayer.iina")}</h4>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex gap-4">
                                <Field.Text
                                    name="iinaSocket"
                                    label={t("settings.mediaPlayer.socket")}
                                    placeholder={t("settings.mediaPlayer.defaultSocket", { default: getDefaultIinaSocket(serverStatus?.os ?? "") })}
                                />
                                <Field.Text
                                    name="iinaPath"
                                    label={t("settings.mediaPlayer.cliPath")}
                                    placeholder={"Path to the IINA CLI"}
                                    help={t("settings.mediaPlayer.iinaHelp")}
                                />
                            </div>
                            <div>
                                <Field.Text
                                    name="iinaArgs"
                                    label={t("settings.mediaPlayer.options")}
                                    placeholder="e.g. --mpv-mute=yes"
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </SettingsCard>

            <SettingsSubmitButton isPending={isPending} />

        </>
    )
}

export function ExternalPlayerLinkSettings() {

    const { externalPlayerLink, setExternalPlayerLink, encodePath, setEncodePath } = useExternalPlayerLink()

    return (
        <>
            <SettingsPageHeader
                title={t("settings.mediaPlayer.externalPlayerLink")}
                description={t("settings.mediaPlayer.externalPlayerLinkDescription")}
                icon={LuCircleArrowOutUpRight}
            />

            <Alert
                intent="info" description={<>
                {t("settings.mediaPlayer.onlyAppliesToThisDevice")}
            </>}
            />

            <SettingsCard>
                <TextInput
                    label={t("settings.mediaPlayer.customScheme")}
                    placeholder={t("settings.mediaPlayer.customSchemePlaceholder")}
                    value={externalPlayerLink}
                    onValueChange={setExternalPlayerLink}
                />
            </SettingsCard>

            <SettingsCard>
                <Switch
                    side="right"
                    name="encodePath"
                    label={t("settings.mediaPlayer.encodeFilePathInUrl")}
                    help={t("settings.mediaPlayer.encodeFilePathInUrlHelp")}
                    value={encodePath}
                    onValueChange={setEncodePath}
                />
            </SettingsCard>

            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-200 dark:border-gray-800 border-dashed">
                <RiSettings3Fill className="text-base" />
                <span>{t("settings.mediaPlayer.settingsAutoSaved")}</span>
            </div>
        </>
    )
}
