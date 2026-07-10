import { LibraryExplorer_FileTreeNodeJSON } from "@/api/generated/types"
import {
    libraryExplorer_isSelectingPathsAtom,
    libraryExplorer_selectedPathsAtom,
    libraryExplorer_superUpdateDrawerOpenAtom,
} from "@/app/(main)/_features/library-explorer/library-explorer.atoms"
import { Button } from "@/components/ui/button"
import { useAtom } from "jotai"
import { createTranslator } from "@/locales"
import React from "react"
import { FaRegEdit } from "react-icons/fa"

type LibraryExplorerSuperUpdateProps = {
    fileNodes: LibraryExplorer_FileTreeNodeJSON[]
}

export function LibraryExplorerSuperUpdate(props: LibraryExplorerSuperUpdateProps) {
    const t = createTranslator()
    const {
        fileNodes,
    } = props

    const [isSelectingPaths] = useAtom(libraryExplorer_isSelectingPathsAtom)
    const [selectedPaths] = useAtom(libraryExplorer_selectedPathsAtom)
    const [, setSuperUpdateDrawerOpen] = useAtom(libraryExplorer_superUpdateDrawerOpenAtom)

    const selectedPathFileNodes = fileNodes?.filter(n => selectedPaths.has(n.path) && n.kind === "file")

    const handleOpenSuperUpdate = () => {
        setSuperUpdateDrawerOpen(true)
    }

    return (
        <>
            {isSelectingPaths && !!selectedPathFileNodes?.length && (
                <>
                    <Button
                        leftIcon={<FaRegEdit className="text-xl" />}
                        size="sm"
                        intent={"white-link"}
                        onClick={handleOpenSuperUpdate}
                    >
                        {t("libraryExplorer.superUpdate")}
                    </Button>
                </>
            )}
        </>
    )
}
