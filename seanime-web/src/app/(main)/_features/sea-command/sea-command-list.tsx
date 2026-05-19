import { CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command"
import { createTranslator } from "@/locales"
import { usePathname, useSearchParams } from "@/lib/navigation"
import { useSeaCommandContext } from "./sea-command"

const t = createTranslator()

// renders when "/" is typed
export function SeaCommandList() {

    const pathname = usePathname()
    const searchParams = useSearchParams()
    const mediaId = Number(searchParams.get("id"))
    const isAnimePage = (pathname === "/entry" || pathname === "/offline/entry/anime") && Number.isFinite(mediaId) && mediaId > 0

    const { input, setInput, select, command: { isCommand, command, args }, scrollToTop } = useSeaCommandContext()

    const commands = [
        {
            command: "anime",
            description: t("features.seaCommand.findInCollection"),
            show: true,
        },
        {
            command: "manga",
            description: t("features.seaCommand.findInCollection"),
            show: true,
        },
        {
            command: "library",
            description: t("features.seaCommand.findInLibrary"),
            show: true,
        },
        {
            command: "search",
            description: t("features.seaCommand.searchOnAnilist"),
            show: true,
        },
        {
            command: "magnet",
            description: t("features.seaCommand.magnetLink"),
            show: true,
        },
        {
            command: "logs",
            description: t("features.seaCommand.copyLogs"),
            show: true,
        },
        {
            command: "issue",
            description: t("features.seaCommand.recordIssue"),
            show: true,
        },
        {
            command: "droptorrent",
            description: "Drop current torrentstream torrent",
            show: input.startsWith("/d"),
        },
        {
            command: "reload",
            description: "Reload the page",
            show: input.startsWith("/r"),
        },
        {
            command: "spoilers",
            description: t("features.seaCommand.toggleSpoilers"),
            show: isAnimePage,
        },
    ]

    const filtered = commands.filter(n => n.show && n.command.startsWith(command) && n.command != command)

    if (!filtered?.length) return null

    return (
        <>
            <CommandGroup heading={t("features.seaCommand.autocomplete")}>
                {filtered.map(command => (
                    <CommandItem
                        key={command.command}
                        onSelect={() => {
                            setInput(`/${command.command}`)
                        }}
                    >
                        <span className="tracking-widest text-sm">/{command.command}</span>
                        <CommandShortcut className="text-[--muted]">{command.description}</CommandShortcut>
                    </CommandItem>
                ))}
            </CommandGroup>
        </>
    )
}
