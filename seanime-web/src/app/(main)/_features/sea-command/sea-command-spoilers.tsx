import { CommandHelperText } from "@/app/(main)/_features/sea-command/_components/command-utils"
import { useSeaCommandContext } from "@/app/(main)/_features/sea-command/sea-command"
import { CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command"
import { createTranslator } from "@/locales"
import { usePathname, useSearchParams } from "@/lib/navigation"
import { useAnimeSpoilerActions, useAnimeSpoilerOverride } from "@/lib/theme/anime-spoilers"
import React from "react"

function isAnimePage(pathname: string) {
    return pathname === "/entry" || pathname === "/offline/entry/anime"
}

function getCurrentMediaId(value: string | null) {
    const mediaId = Number(value)

    if (!Number.isFinite(mediaId) || mediaId <= 0) {
        return null
    }

    return mediaId
}

export function SeaCommandSpoilers() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { close, select, command: { args } } = useSeaCommandContext()

    const mediaId = getCurrentMediaId(searchParams.get("id"))
    const currentValue = useAnimeSpoilerOverride(mediaId) ? "off" : "on"
    const { setSpoilersForMedia } = useAnimeSpoilerActions()

    if (!isAnimePage(pathname) || mediaId == null) {
        return null
    }

    const t = createTranslator("es")

    const query = args[0]?.toLowerCase() || ""
    const items = [
        {
            value: "on",
            description: t("seaCommand.rehideSpoilers"),
            enabled: true,
        },
        {
            value: "off",
            description: t("seaCommand.unhideSpoilers"),
            enabled: false,
        },
    ]

    const filteredItems = query === ""
        ? items
        : items.filter(item => item.value.startsWith(query))

    const renderItems = filteredItems.length > 0 ? filteredItems : items

    return (
        <>
            <CommandHelperText
                command="/spoilers off"
                description={t("seaCommand.unhideSpoilers")}
                show={query === ""}
            />
            <CommandHelperText
                command="/spoilers on"
                description={t("seaCommand.rehideSpoilers")}
                show={query === ""}
            />

            <CommandGroup heading={t("seaCommand.headingSpoilers")}>
                {renderItems.map(item => (
                    <CommandItem
                        key={item.value}
                        value={`spoilers-${item.value}`}
                        onSelect={() => {
                            select(() => {
                                setSpoilersForMedia(mediaId, item.enabled)
                                close()
                            })
                        }}
                    >
                        <span className="tracking-widest text-sm">/spoilers {item.value}</span>
                        <CommandShortcut className="text-[--muted]">{currentValue === item.value ? t("seaCommand.current") : item.description}</CommandShortcut>
                    </CommandItem>
                ))}
            </CommandGroup>
        </>
    )
}
