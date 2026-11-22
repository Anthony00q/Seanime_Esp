// @vitest-environment happy-dom
import "./setup"
import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createTranslator } from "../index"
import { getCurrentLocale, setCurrentLocale, supportedLocales } from "../config"
import { format } from "date-fns"
import { capitalizeFirst } from "@/lib/utils/capitalize-date"
import { getDateFnsLocale } from "../date-locale"
import { Calendar } from "@/components/ui/calendar/calendar"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { ScreenshotDirModal } from "@/app/(main)/_features/media-core/screenshot-dir-modal"
import { DenshiSettings } from "@/app/(main)/settings/_containers/denshi-settings"
import { LocaleSettings } from "@/app/(main)/settings/_components/locale-settings"
import { Form } from "@/components/ui/form"
import { settingsSchema } from "@/lib/server/settings"
import type { UseFormReturn } from "react-hook-form"

// Only the filesystem picker is replaced: keep real React, buttons, Radix dialog and portals.
vi.mock("@/components/shared/directory-selector", () => ({
    DirectorySelector: ({ label, error, onSelect }: { label: string; error: string; onSelect: (path: string) => void }) => <div>
        <span>{label}</span><span role="alert">{error}</span>
        <button data-choose-directory onClick={() => onSelect("C:/Captures")}>Choose fixture</button>
        <button data-choose-relative onClick={() => onSelect("relative")}>Relative fixture</button>
    </div>,
}))

let root: Root
let container: HTMLDivElement
beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
    window.localStorage.clear()
    setCurrentLocale("es")
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
})
afterEach(async () => {
    if (root) await act(async () => root.unmount())
    container?.remove()
    window.localStorage.clear()
    setCurrentLocale("es")
})

const button = (label: string) => {
    const element = [...document.querySelectorAll("button")].find(element => element.textContent?.trim() === label)
    expect(element, `Expected translated button ${label}`).toBeDefined()
    return element!
}

it.each(supportedLocales)("renders calendar captions for every registered locale (%s)", async locale => {
    setCurrentLocale(locale)
    const date = new Date(2026, 4, 15)
    await act(async () => root.render(<Calendar locale={getDateFnsLocale()} defaultMonth={date} />))
    expect(container.querySelector(".UI-Calendar__captionLabel")?.textContent)
        .toBe(capitalizeFirst(format(date, "LLLL y", { locale: getDateFnsLocale() })))
})

describe.each([
    { locale: "en", caption: "May 2026", title: "Screenshot Directory", save: "Save", cancel: "Cancel", error: "Must be an absolute path" },
    { locale: "es", caption: "Mayo 2026", title: "Directorio de Capturas de Pantalla", save: "Guardar", cancel: "Cancelar", error: "Debe ser una ruta absoluta" },
    { locale: "pt", caption: "Maio 2026", title: "Diretório de Capturas de Tela", save: "Salvar", cancel: "Cancelar", error: "Deve ser um caminho absoluto" },
] as const)("fork rendered translations ($locale)", ({ locale, caption, title, save, cancel, error }) => {
    it("renders the actual capitalized calendar caption", async () => {
        setCurrentLocale(locale)
        await act(async () => root.render(<Calendar locale={getDateFnsLocale()} defaultMonth={new Date(2026, 4, 15)} />))
        expect(container.querySelector(".UI-Calendar__captionLabel")?.textContent).toBe(caption)
    })

    it("renders a real localized capture dialog and preserves its validation/save callbacks", async () => {
        setCurrentLocale(locale)
        const onSave = vi.fn(async () => true)
        const onClose = vi.fn()
        await act(async () => root.render(<ScreenshotDirModal open onClose={onClose} onSave={onSave} />))
        const dialog = document.querySelector('[role="dialog"]')!
        expect(document.getElementById(dialog.getAttribute("aria-labelledby")!)?.textContent).toBe(title)
        expect(document.getElementById(dialog.getAttribute("aria-describedby")!)?.textContent).toBe(createTranslator()("videoPlayer.preferences.screenshotDirectoryHelp"))
        expect(button(save).disabled).toBe(true)
        await act(async () => document.querySelector<HTMLButtonElement>("[data-choose-relative]")!.click())
        expect(document.querySelector('[role="alert"]')?.textContent).toBe(error)
        expect(button(save).disabled).toBe(true)
        await act(async () => document.querySelector<HTMLButtonElement>("[data-choose-directory]")!.click())
        await act(async () => button(save).click())
        expect(onSave).toHaveBeenCalledExactlyOnceWith("C:/Captures")
        expect(onClose).toHaveBeenCalledOnce()
        expect(button(cancel)).toBeDefined()
    })
})

async function renderLocaleSettings(desktop: boolean) {
    const onSubmit = vi.fn()
    const formRef = React.createRef<UseFormReturn<any>>()
    await act(async () => root.render(<Form
        schema={settingsSchema}
        mRef={formRef}
        defaultValues={{ defaultPlayer: "mpv", mediaPlayerHost: "localhost", vlcPort: 8080, mpcPort: 13579, qbittorrentPort: 8080 }}
        onSubmit={onSubmit}
    >
        <LocaleSettings desktop={desktop} />
        <button type="submit">Save fixture</button>
    </Form>))
    const select = container.querySelector<HTMLButtonElement>('[role="combobox"]')!
    return { formRef, onSubmit, select }
}

async function chooseLanguage(select: HTMLButtonElement, language = "Português") {
    await act(async () => {
        select.focus()
        select.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
    })
    const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(el => el.textContent === language)!
    expect(option).toBeDefined()
    await act(async () => option.click())
    expect(select.textContent).toBe(language)
}

it("does not open the language menu when clicking its visible label", async () => {
    const { select } = await renderLocaleSettings(false)
    const label = document.getElementById(select.getAttribute("aria-labelledby")!)!
    expect(label.tagName).not.toBe("LABEL")
    await act(async () => label.click())
    expect(select.getAttribute("aria-expanded")).toBe("false")
    expect(document.querySelector('[role="listbox"]')).toBeNull()
    await chooseLanguage(select)
})

it.each(["confirm", "cancel", "close", "escape"])("the real language control applies only when confirmed (%s)", async action => {
    const confirmed = action === "confirm"
    const get = vi.fn(async () => ({ locale: "es", minimizeToTray: true, openInBackground: false, openAtLaunch: false }))
    const set = vi.fn(async (patch: Partial<DenshiSettings>) => ({ ...(await get()), ...patch }))
    const send = vi.fn()
    const previous = window.electron
    window.electron = { denshiSettings: { get, set }, send } as unknown as Window["electron"]
    try {
        const { onSubmit, select } = await renderLocaleSettings(true)
        expect(document.getElementById(select.getAttribute("aria-labelledby")!)?.textContent).toBe("Idioma de la aplicación")
        expect(document.getElementById(select.getAttribute("aria-describedby")!)?.textContent).toContain("reiniciar")
        expect(button("Aplicar idioma").disabled).toBe(true)
        await chooseLanguage(select)
        expect(button("Aplicar idioma").disabled).toBe(false)
        await act(async () => button("Aplicar idioma").click())
        expect(document.querySelector('[role="dialog"]')?.textContent).toContain('"Português"')
        expect(document.activeElement).toBe(button("Cancelar"))
        expect(getCurrentLocale()).toBe("es")
        expect(set).not.toHaveBeenCalled()
        await act(async () => {
            if (action === "close") document.querySelector<HTMLButtonElement>("button.UI-Modal__close")!.click()
            else if (action === "escape") document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
            else button(confirmed ? "Reiniciar Seanime" : "Cancelar").click()
        })
        expect(onSubmit).not.toHaveBeenCalled()
        expect(getCurrentLocale()).toBe(confirmed ? "pt" : "es")
        expect(set.mock.calls).toEqual(confirmed ? [[{ locale: "pt" }]] : [])
        expect(send.mock.calls).toEqual(confirmed ? [["restart-app-completely"]] : [])
        if (!confirmed) {
            expect(document.querySelector('[role="dialog"]')).toBeNull()
            expect(select.textContent).toBe("Español")
            expect(button("Aplicar idioma").disabled).toBe(true)
        }
    } finally { window.electron = previous }
})

it.each(supportedLocales)("uses double quotes around the target language in web and desktop (%s)", locale => {
    const t = createTranslator(locale)
    const language = "English"
    expect(t("settings.locale.reloadDescription", { language })).toContain('"English"')
    expect(t("settings.locale.restartDescription", { language })).toContain('"English"')
})

it.each(["cancel", "close", "escape"])("keeps the target language visible during the dialog exit (%s)", async action => {
    const style = document.createElement("style")
    style.textContent = '.UI-Modal__overlay[data-state="closed"], .UI-Modal__content[data-state="closed"] { animation-name: locale-test-exit; }'
    document.head.append(style)
    try {
        const { select } = await renderLocaleSettings(false)
        await chooseLanguage(select, "English")
        await act(async () => button("Aplicar idioma").click())
        const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!
        const overlay = dialog.closest<HTMLElement>(".UI-Modal__overlay")!
        const description = document.getElementById(dialog.getAttribute("aria-describedby")!)!
        const message = description.textContent
        expect(message).toContain('"English"')

        await act(async () => {
            if (action === "close") dialog.querySelector<HTMLButtonElement>("button.UI-Modal__close")!.click()
            else if (action === "escape") document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
            else button("Cancelar").click()
        })
        expect(dialog.isConnected).toBe(true)
        expect(dialog.dataset.state).toBe("closed")
        expect(description.textContent).toBe(message)
        expect(select.textContent).toBe("Español")

        await act(async () => {
            for (const node of [dialog, overlay]) {
                node.dispatchEvent(Object.assign(new Event("animationend"), { animationName: "locale-test-exit" }))
            }
        })
        expect(dialog.isConnected).toBe(false)
        await chooseLanguage(select)
        await act(async () => button("Aplicar idioma").click())
        expect(document.querySelector('[role="dialog"]')?.textContent).toContain('"Português"')
    } finally {
        style.remove()
    }
})

it("shows web copy and warns about dirty settings without saving or resetting them", async () => {
    const { formRef, onSubmit, select } = await renderLocaleSettings(false)
    expect(document.getElementById(select.getAttribute("aria-describedby")!)?.textContent).toContain("recargar la página")
    await act(async () => formRef.current!.setValue("hideAnimeSpoilers", true, { shouldDirty: true }))
    await chooseLanguage(select)
    await act(async () => button("Aplicar idioma").click())
    const dialog = document.querySelector('[role="dialog"]')!
    const description = document.getElementById(dialog.getAttribute("aria-describedby")!)
    expect(description?.textContent).toContain("La página se recargará")
    expect(description?.textContent).toContain("Se perderán los demás cambios sin guardar.")
    expect(button("Recargar página")).toBeDefined()
    await act(async () => button("Cancelar").click())
    expect(formRef.current!.getValues("hideAnimeSpoilers")).toBe(true)
    expect(onSubmit).not.toHaveBeenCalled()
    expect(getCurrentLocale()).toBe("es")
})

it("the general save button does not apply a selected language", async () => {
    const { formRef, onSubmit, select } = await renderLocaleSettings(false)
    await act(async () => formRef.current!.setValue("hideAnimeSpoilers", true, { shouldDirty: true }))
    await chooseLanguage(select)
    await act(async () => button("Save fixture").click())
    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ hideAnimeSpoilers: true })
    expect(onSubmit.mock.calls[0]?.[0]).not.toHaveProperty("locale")
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(getCurrentLocale()).toBe("es")
})

it("leaves the language confirmation open and retryable if native storage fails", async () => {
    const get = vi.fn(async () => ({ locale: "es" }))
    const set = vi.fn(async (patch: Partial<DenshiSettings>) => {
        if (patch.locale === "pt") throw new Error("disk full")
        return patch
    })
    const send = vi.fn()
    const previous = window.electron
    window.electron = { denshiSettings: { get, set }, send } as unknown as Window["electron"]
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
        const { onSubmit, select } = await renderLocaleSettings(true)
        await chooseLanguage(select)
        await act(async () => button("Aplicar idioma").click())
        await act(async () => button("Reiniciar Seanime").click())
        expect(document.querySelector('[role="alert"]')?.textContent).toContain("No se pudo aplicar")
        expect(button("Reiniciar Seanime").disabled).toBe(false)
        expect(getCurrentLocale()).toBe("es")
        expect(send).not.toHaveBeenCalled()
        expect(onSubmit).not.toHaveBeenCalled()
    } finally {
        log.mockRestore()
        window.electron = previous
    }
})

it("keeps rich confirmation content valid and accessible in its original body layout", async () => {
    const close = vi.fn()
    await act(async () => root.render(<ConfirmationDialog
        isOpen close={close} open={() => {}} toggle={() => {}}
        title="Manga fixture" onConfirm={() => {}}
        description={<div data-rich-preview><p>Chapter preview</p><div>12 chapters</div></div>}
    />))
    const dialog = document.querySelector('[role="dialog"]')!
    const description = document.getElementById(dialog.getAttribute("aria-describedby")!)!
    expect(description.tagName).toBe("DIV")
    expect(description.querySelector("[data-rich-preview] p")?.textContent).toBe("Chapter preview")
    expect(description.closest(".space-y-4")).not.toBeNull()
    expect(description.closest("p")).toBeNull()
})

it.each(["win32", "linux"])("preserves optimistic Denshi switches without overwriting locale (%s)", async platform => {
    const initial: DenshiSettings = { locale: "pt", minimizeToTray: true, openInBackground: false, openAtLaunch: false }
    const get = vi.fn(async () => initial)
    // An unanswered write must not freeze unrelated controls or revert their immediate state.
    const set = vi.fn(() => new Promise<DenshiSettings>(() => {}))
    const previous = window.electron
    window.electron = { platform, denshiSettings: { get, set } } as unknown as Window["electron"]
    try {
        await act(async () => root.render(<DenshiSettings />))
        const switches = [...container.querySelectorAll<HTMLButtonElement>('[role="switch"]')]
        expect(switches).toHaveLength(3)
        expect(switches[0].getAttribute("aria-checked")).toBe("true")
        await act(async () => switches[0].click())
        expect(switches[0].getAttribute("aria-checked")).toBe("false")
        expect(switches[0].disabled).toBe(false)
        expect(switches[1].disabled).toBe(false)
        expect(switches[2].disabled).toBe(platform === "linux")
        await act(async () => switches[1].click())
        expect(switches[1].getAttribute("aria-checked")).toBe("true")
        expect(set.mock.calls).toEqual([[{ minimizeToTray: false }], [{ openInBackground: true }]])
        expect(getCurrentLocale()).toBe("es")
        expect(initial.locale).toBe("pt")
    } finally { window.electron = previous }
})
