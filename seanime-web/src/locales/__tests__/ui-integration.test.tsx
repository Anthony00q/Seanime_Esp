// @vitest-environment happy-dom
import "./setup"
import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createTranslator } from "../index"
import { getCurrentLocale, setCurrentLocale } from "../config"
import { getDateFnsLocale } from "../date-locale"
import { Calendar } from "@/components/ui/calendar/calendar"
import { ConfirmationDialog, useConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { ScreenshotDirModal } from "@/app/(main)/_features/media-core/screenshot-dir-modal"
import { changeLocaleAndRestart } from "@/lib/helpers/locale-change"
import { DenshiSettings } from "@/app/(main)/settings/_containers/denshi-settings"

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

function LocaleConfirmation({ cancelled }: { cancelled: () => void }) {
    const t = createTranslator()
    const confirmation = useConfirmationDialog({
        title: t("settings.locale.restartRequired"), description: t("settings.locale.restartDescription"),
        onConfirm: () => { void changeLocaleAndRestart("pt", true) }, onCancel: cancelled,
    })
    return <><button data-open-language onClick={confirmation.open}>Open fixture</button><ConfirmationDialog {...confirmation} /></>
}

it.each(["confirm", "cancel", "close", "escape"])("fork locale confirmation persists only when confirmed (%s)", async action => {
    const confirmed = action === "confirm"
    const get = vi.fn(async () => ({ locale: "es", minimizeToTray: true, openInBackground: false, openAtLaunch: false }))
    const set = vi.fn(async (patch: Partial<DenshiSettings>) => ({ ...(await get()), ...patch }))
    const send = vi.fn()
    const cancelled = vi.fn()
    const previous = window.electron
    window.electron = { denshiSettings: { get, set }, send } as unknown as Window["electron"]
    try {
        await act(async () => root.render(<LocaleConfirmation cancelled={cancelled} />))
        await act(async () => document.querySelector<HTMLButtonElement>("[data-open-language]")!.click())
        expect(getCurrentLocale()).toBe("es")
        expect(set).not.toHaveBeenCalled()
        await act(async () => {
            if (action === "close") document.querySelector<HTMLButtonElement>("button.UI-Modal__close")!.click()
            else if (action === "escape") document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
            else button(confirmed ? "Confirmar" : "Cancelar").click()
        })
        // Dismissal must not run the negative action used by torrent/debrid dialogs.
        expect(cancelled).toHaveBeenCalledTimes(action === "cancel" ? 1 : 0)
        expect(getCurrentLocale()).toBe(confirmed ? "pt" : "es")
        expect(set).toHaveBeenCalledTimes(confirmed ? 1 : 0)
        expect(send.mock.calls).toEqual(confirmed ? [["restart-app-completely"]] : [])
    } finally { window.electron = previous }
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
