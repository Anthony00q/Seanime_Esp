import "./setup"
import { describe, expect, it, vi } from "vitest"
import { getCurrentLocale } from "../config"
import { changeLocaleAndRestart, LOCALE_IPC_TIMEOUT_MS, persistLocaleChange } from "@/lib/helpers/locale-change"
import { useMockBrowser } from "./browser"

const browser = useMockBrowser()
const never = () => new Promise<DenshiSettings>(() => {})

describe("fork locale persistence", () => {
    it("persists native first and sends restart only after both stores succeed", async () => {
        browser().set.mockImplementationOnce(async patch => {
            expect(getCurrentLocale()).toBe("es")
            expect(browser().send).not.toHaveBeenCalled()
            return { ...(await browser().get()), ...patch }
        })
        await changeLocaleAndRestart("pt", true)
        expect(getCurrentLocale()).toBe("pt")
        expect(browser().set).toHaveBeenCalledWith({ locale: "pt" })
        expect(browser().send).toHaveBeenCalledExactlyOnceWith("restart-app-completely")
        expect(browser().reload).not.toHaveBeenCalled()
    })

    it("reloads only the browser for a web-only language change", async () => {
        await changeLocaleAndRestart("en", false)
        expect(browser().storage.get("seanime-locale")).toBe("en")
        expect(browser().reload).toHaveBeenCalledOnce()
        expect(browser().get).not.toHaveBeenCalled()
        expect(browser().send).not.toHaveBeenCalled()
    })

    it("does not change or restart the renderer on native persistence failure", async () => {
        browser().set.mockRejectedValueOnce(new Error("disk full"))
        await expect(changeLocaleAndRestart("pt", true)).rejects.toThrow("disk full")
        expect(getCurrentLocale()).toBe("es")
        expect(browser().storage.has("seanime-locale")).toBe(false)
        expect(browser().set).toHaveBeenLastCalledWith({ locale: "es" })
        expect(browser().send).not.toHaveBeenCalled()
    })

    it("restores native/memory state on denied browser writes", async () => {
        browser().localStorage.setItem.mockImplementation(() => { throw new Error("SecurityError") })
        await expect(persistLocaleChange("pt", true)).rejects.toThrow("storage")
        expect(browser().set.mock.calls.map(([patch]) => patch.locale)).toEqual(["pt", "es"])
        expect(getCurrentLocale()).toBe("es")
    })

    it("reports both failures if restoration also fails", async () => {
        browser().localStorage.setItem.mockImplementation(() => { throw new Error("SecurityError") })
        browser().set.mockResolvedValueOnce(await browser().get()).mockRejectedValueOnce(new Error("rollback denied"))
        const error = await persistLocaleChange("pt", true).catch(error => error)
        expect(error).toBeInstanceOf(AggregateError)
        if (!(error instanceof AggregateError)) throw error
        expect(error.errors.map((cause: Error) => cause.message)).toEqual(["Locale storage is unavailable", "rollback denied"])
        expect(getCurrentLocale()).toBe("es")
    })

    it("rejects invalid locales before accessing IPC or storage", async () => {
        await expect(persistLocaleChange("fr" as "es", true)).rejects.toThrow("Invalid locale")
        expect(browser().get).not.toHaveBeenCalled()
        expect(browser().localStorage.setItem).toHaveBeenCalledTimes(1) // setup only
    })

    it("rejects a missing native bridge rather than claiming a desktop save", async () => {
        vi.stubGlobal("window", { localStorage: browser().localStorage, location: { reload: browser().reload } })
        await expect(changeLocaleAndRestart("pt", true)).rejects.toThrow("unavailable")
        expect(browser().reload).not.toHaveBeenCalled()
    })
})

describe("fork explicit locale-change deadlines", () => {
    it("bounds a stalled read without writing or restarting", async () => {
        vi.useFakeTimers()
        browser().get.mockImplementationOnce(never)
        const assertion = expect(changeLocaleAndRestart("pt", true)).rejects.toThrow("timed out")
        await vi.advanceTimersByTimeAsync(LOCALE_IPC_TIMEOUT_MS)
        await assertion
        expect(browser().set).not.toHaveBeenCalled()
        expect(browser().send).not.toHaveBeenCalled()
        expect(getCurrentLocale()).toBe("es")
        expect(vi.getTimerCount()).toBe(0)
    })

    it("restores the previous native preference after an unacknowledged write", async () => {
        vi.useFakeTimers()
        browser().set.mockImplementationOnce(never)
        const assertion = expect(changeLocaleAndRestart("pt", true)).rejects.toThrow("timed out")
        await vi.advanceTimersByTimeAsync(LOCALE_IPC_TIMEOUT_MS)
        await assertion
        expect(browser().set.mock.calls.map(([patch]) => patch.locale)).toEqual(["pt", "es"])
        expect(browser().send).not.toHaveBeenCalled()
        expect(getCurrentLocale()).toBe("es")
        expect(vi.getTimerCount()).toBe(0)
    })

    it("bounds the initial write and the restoration when both IPC acknowledgements stall", async () => {
        vi.useFakeTimers()
        browser().set.mockImplementation(never)
        const assertion = expect(changeLocaleAndRestart("pt", true)).rejects.toThrow("restoration")
        await vi.advanceTimersByTimeAsync(LOCALE_IPC_TIMEOUT_MS * 2)
        await assertion
        expect(getCurrentLocale()).toBe("es")
        expect(browser().send).not.toHaveBeenCalled()
        expect(vi.getTimerCount()).toBe(0)
    })
})
