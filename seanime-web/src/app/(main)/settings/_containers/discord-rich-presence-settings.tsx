import { SettingsCard } from "@/app/(main)/settings/_components/settings-card"
import { cn } from "@/components/ui/core/styling"
import { Field } from "@/components/ui/form"
import { createTranslator } from "@/locales"
import React from "react"
import { useFormContext } from "react-hook-form"

const t = createTranslator()

type DiscordRichPresenceSettingsProps = {
    children?: React.ReactNode
}

export function DiscordRichPresenceSettings(props: DiscordRichPresenceSettingsProps) {

    const {
        children,
        ...rest
    } = props

    const { watch } = useFormContext()

    const enableRichPresence = watch("enableRichPresence")

    return (
        <>
            <SettingsCard title={t("settings.discord.richPresence")} description={t("settings.discord.richPresenceDescription")}>
                <div className="space-y-3">
                    <Field.Switch
                        side="right"
                        name="enableRichPresence"
                        label={<span className="flex gap-1 items-center">{t("settings.discord.enable")}</span>}
                    />
                    <div
                        className={cn(
                            "flex gap-4 items-center flex-col md:flex-row !mt-3",
                            enableRichPresence ? "opacity-100" : "opacity-50 pointer-events-none",
                        )}
                    >
                        <Field.Checkbox
                            name="enableAnimeRichPresence"
                            label={t("settings.discord.anime")}
                            fieldClass="w-fit"
                        />
                        <Field.Checkbox
                            name="enableMangaRichPresence"
                            label={t("settings.discord.manga")}
                            fieldClass="w-fit"
                        />
                    </div>
                </div>

                <Field.Switch
                    side="right"
                    name="richPresenceHideSeanimeRepositoryButton"
                    label={t("settings.discord.richPresenceHideSeanimeRepositoryButton")}
                />

                {/*<Field.Switch*/}
                {/*    side="right"*/}
                {/*    name="richPresenceShowAniListMediaButton"*/}
                {/*    label="Show AniList Media Button"*/}
                {/*    help="Show a button to open the media page on AniList."*/}
                {/*/>*/}

                <Field.Switch
                    side="right"
                    name="richPresenceShowAniListProfileButton"
                    label={t("settings.discord.richPresenceShowAniListProfileButton")}
                    help={t("settings.discord.showAniListProfileButtonHelp")}
                />

                {/*<Field.Switch*/}
                {/*    side="right"*/}
                {/*    name="richPresenceUseMediaTitleStatus"*/}
                {/*    label={<span className="flex gap-2 items-center">Use Media Title as Status <LuTriangleAlert className="text-[--orange]" /></span>}*/}
                {/*    moreHelp="Does not work with the default Discord Desktop Client."*/}
                {/*    help="Replace 'Seanime' with the media title in the activity status. Only works if you use a discord client that utilizes arRPC."*/}
                {/*/>*/}
            </SettingsCard>
        </>
    )
}
