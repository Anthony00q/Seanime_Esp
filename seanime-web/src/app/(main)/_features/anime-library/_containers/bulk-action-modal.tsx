import { useLocalFileBulkAction, useRemoveEmptyDirectories } from "@/api/hooks/localfiles.hooks"
import { useSeaCommandInject } from "@/app/(main)/_features/sea-command/use-inject"
import { ConfirmationDialog, useConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { AppLayoutStack } from "@/components/ui/app-layout"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { atom, useAtom } from "jotai"
import { createTranslator } from "@/locales"
import React from "react"
import { BiLockAlt, BiLockOpenAlt } from "react-icons/bi"
import { toast } from "sonner"

export const __bulkAction_modalAtomIsOpen = atom<boolean>(false)

export function BulkActionModal() {

    const t = createTranslator()
    const [isOpen, setIsOpen] = useAtom(__bulkAction_modalAtomIsOpen)

    const { mutate: performBulkAction, isPending } = useLocalFileBulkAction()

    function handleLockFiles() {
        performBulkAction({
            action: "lock",
        }, {
            onSuccess: () => {
                setIsOpen(false)
                toast.success(t("animeLibrary.filesLocked"))
            },
        })
    }

    function handleUnlockFiles() {
        performBulkAction({
            action: "unlock",
        }, {
            onSuccess: () => {
                setIsOpen(false)
                toast.success(t("animeLibrary.filesUnlocked"))
            },
        })
    }

    const { mutate: removeEmptyDirectories, isPending: isRemoving } = useRemoveEmptyDirectories()

    function handleRemoveEmptyDirectories() {
        removeEmptyDirectories(undefined, {
            onSuccess: () => {
                setIsOpen(false)
            },
        })
    }

    const confirmRemoveEmptyDirs = useConfirmationDialog({
        title: t("bulkActions.removeEmptyDirectories"),
        description: t("bulkActions.removeEmptyDirectoriesDesc"),
        onConfirm: () => {
            handleRemoveEmptyDirectories()
        },
    })

    const { inject, remove } = useSeaCommandInject()
    React.useEffect(() => {
        inject("anime-library-bulk-actions", {
            priority: 1,
            items: [
                {
                    id: "lock-files", value: "lock", heading: t("bulkActions.heading"),
                    render: () => (
                        <p>{t("bulkActions.lockFiles")}</p>
                    ),
                    onSelect: ({ ctx }) => {
                        handleLockFiles()
                    },
                },
                {
                    id: "unlock-files", value: "unlock", heading: t("bulkActions.heading"),
                    render: () => (
                        <p>{t("bulkActions.unlockFiles")}</p>
                    ),
                    onSelect: ({ ctx }) => {
                        handleUnlockFiles()
                    },
                },
            ],
            filter: ({ item, input }) => {
                if (!input) return true
                return item.value.toLowerCase().includes(input.toLowerCase())
            },
            shouldShow: ({ ctx }) => ctx.router.pathname === "/",
            showBasedOnInput: "startsWith",
        })

        return () => remove("anime-library-bulk-actions")
    }, [])

    return (
        <Modal
            open={isOpen} onOpenChange={() => setIsOpen(false)} title={t("bulkActions.title")}
            contentClass="space-y-4"
        >
            <AppLayoutStack spacing="sm">
                {/*<p>These actions do not affect ignored files.</p>*/}
                <div className="flex gap-2 flex-col md:flex-row">
                    <Button
                        leftIcon={<BiLockAlt className="text-2xl" />}
                        intent="gray-outline"
                        className="w-full"
                        disabled={isPending || isRemoving}
                        onClick={handleLockFiles}
                    >
                        {t("bulkActions.lockFiles")}
                    </Button>
                    <Button
                        leftIcon={<BiLockOpenAlt className="text-2xl" />}
                        intent="gray-outline"
                        className="w-full"
                        disabled={isPending || isRemoving}
                        onClick={handleUnlockFiles}
                    >
                        {t("bulkActions.unlockFiles")}
                    </Button>
                </div>
                <Button
                    intent="gray-outline"
                    className="w-full"
                    disabled={isPending}
                    loading={isRemoving}
                    onClick={() => confirmRemoveEmptyDirs.open()}
                >
                    {t("bulkActions.removeEmptyDirectories")}
                </Button>
            </AppLayoutStack>
            <ConfirmationDialog {...confirmRemoveEmptyDirs} />
        </Modal>
    )

}
