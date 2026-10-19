import { DirectorySelector } from "@/components/shared/directory-selector"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { upath } from "@/lib/helpers/upath"
import { createTranslator } from "@/locales"
import React from "react"
import { BiFolder } from "react-icons/bi"

export interface ScreenshotDirModalProps {
    open: boolean
    onClose: () => void
    onSave: (path: string) => Promise<boolean> | void | boolean
    portalContainer?: HTMLElement | null
}

export function ScreenshotDirModal({ open, onClose, onSave, portalContainer }: ScreenshotDirModalProps) {
    const t = createTranslator()
    const [path, setPath] = React.useState("")
    const [saving, setSaving] = React.useState(false)

    const isAbsolute = React.useMemo(() => {
        if (!path) return true
        return upath.isAbsolute(path)
    }, [path])

    const handleSave = async () => {
        if (path && isAbsolute) {
            setSaving(true)
            try {
                const success = await onSave(path)
                if (success !== false) {
                    onClose()
                }
            }
            catch (e) {
            }
            finally {
                setSaving(false)
            }
        }
    }

    return (
        <Modal
            open={open}
            onOpenChange={v => {
                if (!v && !saving) onClose()
            }}
            title={t("videoPlayer.preferences.screenshotDirectory")}
            description={t("videoPlayer.preferences.screenshotDirectoryHelp")}
            contentClass="max-w-md space-y-4"
            portalContainer={portalContainer || undefined}
        >

            <DirectorySelector
                value={path}
                onSelect={setPath}
                label={t("videoPlayer.preferences.screenshotDirectory")}
                leftIcon={<BiFolder className="text-[--indigo]" />}
                error={!isAbsolute ? t("videoPlayer.preferences.mustBeAbsolutePath") : ""}
            />

            <div className="flex justify-end gap-2 mt-4">
                <Button intent="gray-basic" onClick={onClose} disabled={saving}>
                    {t("common.buttons.cancel")}
                </Button>
                <Button intent="white" onClick={handleSave} disabled={!path || !isAbsolute} loading={saving}>
                    {t("common.buttons.save")}
                </Button>
            </div>
        </Modal>
    )
}
