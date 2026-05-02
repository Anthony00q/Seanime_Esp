import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { SettingsCard, SettingsPageHeader } from "@/app/(main)/settings/_components/settings-card"
import { SettingsSubmitButton } from "@/app/(main)/settings/_components/settings-submit-button"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/components/ui/core/styling"
import { Field } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import React, { useState } from "react"
import { useWatch } from "react-hook-form"
import { MdOutlineConnectWithoutContact } from "react-icons/md"
import { createTranslator } from "@/locales"

const t = createTranslator("es")

type Props = {
    isPending: boolean
    children?: React.ReactNode
}

const tabsRootClass = cn("w-full contents space-y-4")

const tabsTriggerClass = cn(
    "text-base px-6 rounded-[--radius-md] w-fit border-none data-[state=active]:bg-[--subtle] data-[state=active]:text-white dark:hover:text-white",
    "h-10 lg:justify-center px-3 flex-1",
)

const tabsListClass = cn(
    "w-full flex flex-row lg:flex-row flex-wrap h-fit !mt-4",
)

const tabContentClass = cn(
    "space-y-4 animate-in fade-in-0 duration-300",
)

export function NakamaSettings(props: Props) {

    const {
        isPending,
        children,
        ...rest
    } = props

    const serverStatus = useServerStatus()
    const nakamaIsHost = useWatch({ name: "nakamaIsHost" })

    const [tab, setTab] = useState("peer")

    React.useLayoutEffect(() => {
        setTab(serverStatus?.settings?.nakama?.isHost ? "host" : "peer")
    }, [serverStatus?.settings?.nakama?.isHost])


    return (
        <div className="space-y-4">

            <SettingsPageHeader
                title={t("nakama.title")}
                description={t("nakama.description")}
                icon={MdOutlineConnectWithoutContact}
            />

            <SettingsCard>
                <Field.Switch
                    side="right"
                    name="nakamaEnabled"
                    label={t("nakama.enableNakama")}
                />

                <Field.Text
                    label={t("nakama.username")}
                    name="nakamaUsername"
                    placeholder={t("nakama.usernamePlaceholder")}
                    help={t("nakama.usernameHelp")}
                />
            </SettingsCard>

            <Tabs
                value={tab}
                onValueChange={setTab}
                className={tabsRootClass}
                triggerClass={tabsTriggerClass}
                listClass={tabsListClass}
            >
                <TabsList className="flex-wrap max-w-full bg-[--paper] p-2 border rounded-xl">
                    <TabsTrigger value="peer">{t("nakama.connectAsPeer")}</TabsTrigger>
                    <TabsTrigger value="host">{t("nakama.hosting")} {serverStatus?.settings?.nakama?.isHost &&
                        <Badge intent="info" className="ml-3">{t("nakama.currentlyHosting")}</Badge>}</TabsTrigger>
                    {/*<TabsTrigger value="browser-client">Rendering</TabsTrigger>*/}
                </TabsList>

                <TabsContent value="host" className={tabContentClass}>

                    {!serverStatus?.serverHasPassword &&
                        <Alert
                            intent="warning"
                            title={t("nakama.reminder")}
                            description={t("nakama.reminderDescription")}
                        />}

                    <SettingsCard className="!bg-gray-900 text-sm">
                        <div>
                            <p>
                                {t("nakama.hostModeIntended")}
                            </p>
                            <p>
                                {t("nakama.cloudRoomsNote")}
                            </p>
                        </div>
                    </SettingsCard>

                    <SettingsCard>

                        <Field.Switch
                            side="right"
                            name="nakamaIsHost"
                            label={t("nakama.enableHostMode")}
                            // moreHelp="Password must be set in the config file"
                            help={t("nakama.enableHostModeHelp")}
                        />

                        <Field.Text
                            label={t("nakama.passcode")}
                            name="nakamaHostPassword"
                            placeholder={t("nakama.passcodePlaceholder")}
                            type="password"
                            help={t("nakama.passcodeHelp")}
                        />

                        {/*<Field.Switch*/}
                        {/*    side="right"*/}
                        {/*    name="nakamaHostEnablePortForwarding"*/}
                        {/*    label="Enable port forwarding"*/}
                        {/*    moreHelp="This might not work for all networks."*/}
                        {/*    help="If enabled, this server will expose its port to the internet. This might be required for other clients to connect to this server."*/}
                        {/*/>*/}
                    </SettingsCard>

                    {nakamaIsHost && <SettingsCard title={t("nakama.title")}>

                        <Field.Switch
                            side="right"
                            name="nakamaHostShareLocalAnimeLibrary"
                            label={t("nakama.shareLocalAnimeLibrary")}
                            help={t("nakama.shareLocalAnimeLibraryHelp")}
                        />

                        <Field.MediaExclusionSelector
                            name="nakamaHostUnsharedAnimeIds"
                            label={t("nakama.excludeAnimeFromSharing")}
                            help={t("nakama.excludeAnimeFromSharingHelp")}
                        />
                    </SettingsCard>}
                </TabsContent>

                <TabsContent value="peer" className={tabContentClass}>
                    <SettingsCard>
                        {serverStatus?.settings?.nakama?.isHost && <Alert intent="info" description={t("nakama.cannotConnectToHostInHostMode")} />}

                        <div
                            className={cn(
                                "space-y-4",
                                serverStatus?.settings?.nakama?.isHost ? "hidden" : "",
                            )}
                        >

                            <Field.Text
                                label={t("nakama.nakamaServerURL")}
                                name="nakamaRemoteServerURL"
                                placeholder={t("nakama.nakamaServerURLPlaceholder")}
                                help={t("nakama.nakamaServerURLHelp")}
                            />

                            <Field.Text
                                label={t("nakama.nakamaPasscode")}
                                name="nakamaRemoteServerPassword"
                                placeholder={t("nakama.passcodePlaceholder")}
                                help={t("nakama.nakamaPasscodeHelp")}
                                type="password"
                            />
                        </div>
                    </SettingsCard>

                    {!serverStatus?.settings?.nakama?.isHost && <SettingsCard title={t("nakama.title")}>
                        <Field.Switch
                            side="right"
                            name="includeNakamaAnimeLibrary"
                            label={t("nakama.useNakamaAnimeLibrary")}
                            help={t("nakama.useNakamaAnimeLibraryHelp")}
                        />
                    </SettingsCard>}
                </TabsContent>

            </Tabs>

            <SettingsSubmitButton isPending={isPending} />

        </div>
    )
}
