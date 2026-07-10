import { __unknownMedia_drawerIsOpen } from "@/app/(main)/_features/anime-library/_containers/unknown-media-manager"
import { __unmatchedFileManagerIsOpen } from "@/app/(main)/_features/anime-library/_containers/unmatched-file-manager"
import { LibraryExplorer } from "@/app/(main)/_features/library-explorer/library-explorer"
import { libraryExplorer_drawerOpenAtom } from "@/app/(main)/_features/library-explorer/library-explorer.atoms"
import { cn } from "@/components/ui/core/styling"
import { Vaul, VaulContent } from "@/components/vaul"
import { useThemeSettings } from "@/lib/theme/theme-hooks"
import { ScopeProvider } from "jotai-scope"
import { useAtom } from "jotai/react"
import { createTranslator } from "@/locales"
import React from "react"

export function LibraryExplorerDrawer(props: {}) {
    const t = createTranslator()
    const ts = useThemeSettings()
    const [open, setOpen] = useAtom(libraryExplorer_drawerOpenAtom)

    return (
        <Vaul
            open={open}
            onOpenChange={v => setOpen(v)}
        >

            <VaulContent
                className={cn(
                    "bg-gray-950 h-[90%] lg:h-[80%] bg-opacity-100 lg:mx-[2rem] overflow-hidden",
                )}
                // overlayClass="bg-gray-900/80"
            >
                <ScopeProvider atoms={[__unmatchedFileManagerIsOpen, __unknownMedia_drawerIsOpen]}>
                    <LibraryExplorer />
                </ScopeProvider>
                <div className="block lg:hidden">
                    <p className="text-center text-white text-lg font-semibold py-4">
                        {t("libraryExplorer.largerScreensOnly")}
                    </p>
                </div>
            </VaulContent>
        </Vaul>
    )

}
