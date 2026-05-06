import { AL_BaseAnime } from "@/api/generated/types"
import { cn } from "@/components/ui/core/styling"
import { createTranslator } from "@/locales"
import { ThemeMediaPageInfoBoxSize, useThemeSettings } from "@/lib/theme/theme-hooks"
import { addSeconds, format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import React from "react"
import { BiCalendarAlt } from "react-icons/bi"
import { capitalizeFirst } from "@/lib/utils/capitalize-date"

export function NextAiringEpisode(props: { media: AL_BaseAnime }) {
    const t = createTranslator("es")
    const distance = formatDistanceToNow(addSeconds(new Date(), props.media.nextAiringEpisode?.timeUntilAiring || 0), { addSuffix: true, locale: es })
    const day = capitalizeFirst(format(addSeconds(new Date(), props.media.nextAiringEpisode?.timeUntilAiring || 0), "EEEE", { locale: es }))
    const ts = useThemeSettings()
    return <>
        {!!props.media.nextAiringEpisode && (
            <div
                className={cn(
                    "flex gap-2 items-center justify-center text-lg",
                    ts.mediaPageBannerInfoBoxSize === ThemeMediaPageInfoBoxSize.Fluid && "justify-start",
                )}
            >
                <span className="font-semibold">{t("entry.episode")} {props.media.nextAiringEpisode?.episode}</span> {distance}
                <BiCalendarAlt className="text-lg text-[--muted]" />
                <span className="text-[--muted]">{day}</span>
            </div>
        )}
    </>
}
