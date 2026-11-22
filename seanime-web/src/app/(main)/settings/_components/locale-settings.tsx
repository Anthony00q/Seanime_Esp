import { SettingsCard } from "@/app/(main)/settings/_components/settings-card"
import { Button, CloseButton } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Select } from "@/components/ui/select"
import { changeLocaleAndRestart } from "@/lib/helpers/locale-change"
import { createTranslator } from "@/locales"
import { getCurrentLocale, isValidLocale, localeNames } from "@/locales/config"
import React from "react"
import { useFormState } from "react-hook-form"
import { LuLanguages } from "react-icons/lu"

const t = createTranslator()
const options = Object.entries(localeNames).map(([value, label]) => ({ value, label }))

export function LocaleSettings({ desktop }: { desktop: boolean }) {
    const { isDirty, isSubmitting } = useFormState()
    const [activeLocale] = React.useState(getCurrentLocale)
    const [selection, setSelection] = React.useState(activeLocale)
    const [targetLocale, setTargetLocale] = React.useState(activeLocale)
    const [open, setOpen] = React.useState(false)
    const [isApplying, setIsApplying] = React.useState(false)
    const [failed, setFailed] = React.useState(false)
    const applying = React.useRef(false)
    const select = React.useRef<HTMLButtonElement>(null)
    const cancel = React.useRef<HTMLButtonElement>(null)
    const id = React.useId()
    const language = localeNames[targetLocale]

    function openConfirmation() {
        setTargetLocale(selection)
        setOpen(true)
    }

    function dismiss() {
        if (applying.current) return
        // Restore the selector without changing the message during the exit animation.
        setSelection(activeLocale)
        setFailed(false)
        setOpen(false)
    }

    async function apply() {
        if (applying.current || targetLocale === activeLocale) return
        applying.current = true
        setIsApplying(true)
        setFailed(false)
        try {
            await changeLocaleAndRestart(targetLocale, desktop)
        } catch (error) {
            console.error("[i18n] Failed to apply locale", error)
            applying.current = false
            setIsApplying(false)
            setFailed(true)
        }
    }

    return (
        <section aria-labelledby={`${id}-label`}>
            <SettingsCard title={t("settings.locale.title")}>
                <div className="[container-type:inline-size]">
                    <div className="grid items-center gap-3 [@container(min-width:42rem)]:grid-cols-[minmax(0,1fr)_18rem]">
                        <div className="min-w-0 space-y-1">
                            <p id={`${id}-label`} className="flex items-center gap-2 text-sm font-semibold">
                                <LuLanguages aria-hidden="true" className="size-4 shrink-0 text-[--muted-highlight]" />
                                {t("settings.locale.fieldLabel")}
                            </p>
                            <p id={`${id}-help`} className="text-[0.83rem] text-[--muted] break-words">
                                {desktop ? t("settings.locale.desktopHelp") : t("settings.locale.webHelp")}
                            </p>
                        </div>
                        <div className="grid min-w-0 items-center gap-2 [@container(min-width:24rem)]:max-w-72 [@container(min-width:24rem)]:grid-cols-2">
                            <Select
                                id={id}
                                ref={select}
                                aria-labelledby={`${id}-label`}
                                aria-describedby={`${id}-help`}
                                fieldClass="min-w-0"
                                contentClass="bg-[--paper-lighter]"
                                options={options}
                                value={selection}
                                onValueChange={value => { if (isValidLocale(value)) setSelection(value) }}
                            />
                            <Button
                                type="button"
                                intent="primary"
                                className="min-h-10 whitespace-normal"
                                disabled={selection === activeLocale || isSubmitting || isApplying}
                                onClick={openConfirmation}
                            >
                                {t("settings.locale.apply")}
                            </Button>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            <Modal
                open={open}
                onOpenChange={next => { if (!next) dismiss() }}
                onOpenAutoFocus={event => {
                    event.preventDefault()
                    cancel.current?.focus()
                }}
                onCloseAutoFocus={event => {
                    event.preventDefault()
                    select.current?.focus()
                }}
                closeButton={<CloseButton aria-label={t("common.buttons.close")} disabled={isApplying} />}
                title={t("settings.locale.confirmTitle")}
                titleClass="px-6"
                descriptionClass="text-[--muted-highlight]"
                description={<>
                    {desktop ? t("settings.locale.restartDescription", { language }) : t("settings.locale.reloadDescription", { language })}
                    {isDirty && <span className="mt-2 block font-medium text-[--amber]">{t("settings.locale.unsavedChanges")}</span>}
                </>}
            >
                {failed && <p role="alert" className="text-sm text-red-400">{t("settings.locale.changeFailed")}</p>}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button ref={cancel} type="button" intent="gray-subtle" disabled={isApplying} onClick={dismiss}>
                        {t("common.buttons.cancel")}
                    </Button>
                    <Button type="button" intent="primary" loading={isApplying} onClick={() => { void apply() }}>
                        {desktop ? t("settings.locale.restartApp") : t("settings.locale.reloadPage")}
                    </Button>
                </div>
                <p role="status" className="sr-only">{isApplying ? t("settings.locale.applying") : ""}</p>
            </Modal>
        </section>
    )
}
