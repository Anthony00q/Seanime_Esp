import { afterEach, beforeEach, vi } from "vitest"
import { setCurrentLocale } from "../config"

export function mockBrowser() {
    const storage = new Map<string, string>()
    const get = vi.fn(async (): Promise<DenshiSettings> => ({ locale: "es", minimizeToTray: true, openInBackground: false, openAtLaunch: false }))
    const set = vi.fn(async (patch: Partial<DenshiSettings>): Promise<DenshiSettings> => ({ ...(await get()), ...patch }))
    const send = vi.fn()
    const reload = vi.fn()
    const localStorage = {
        getItem: vi.fn((key: string) => storage.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => { storage.set(key, value) }),
    }
    vi.stubGlobal("window", { localStorage, electron: { denshiSettings: { get, set }, send }, location: { reload } })
    setCurrentLocale("es")
    storage.clear()
    return { storage, get, set, send, reload, localStorage }
}

export function useMockBrowser() {
    let browser: ReturnType<typeof mockBrowser>
    beforeEach(() => { browser = mockBrowser() })
    afterEach(() => {
        // Clear even the memory-only fallback before another test gets a new browser.
        window.localStorage.setItem = (key, value) => { browser.storage.set(key, value) }
        setCurrentLocale("es")
    })
    return () => browser
}
