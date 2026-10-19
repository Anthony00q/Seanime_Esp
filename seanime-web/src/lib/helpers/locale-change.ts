import { getCurrentLocale, isValidLocale, setCurrentLocale, type Locale } from "@/locales/config"

export const LOCALE_IPC_TIMEOUT_MS = 3000

// A deadline bounds the UI wait; it does not cancel an IPC request already sent.
async function nativeOperation<T>(operation: () => Promise<T>): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
        return await Promise.race([
            operation(),
            new Promise<never>((_, reject) => {
                timer = setTimeout(() => reject(new Error("Denshi settings timed out")), LOCALE_IPC_TIMEOUT_MS)
            }),
        ])
    } finally {
        clearTimeout(timer)
    }
}

/** Persist both preferences before the caller reloads/relaunches the application. */
export async function persistLocaleChange(locale: Locale, desktop: boolean): Promise<void> {
    if (!isValidLocale(locale)) throw new Error("Invalid locale")
    const previousLocale = getCurrentLocale()
    const native = desktop ? window.electron?.denshiSettings : undefined
    if (desktop && !native) throw new Error("Denshi settings are unavailable")
    const previousNative = native ? await nativeOperation(() => native.get()) : undefined
    let localAttempted = false
    try {
        if (native) await nativeOperation(() => native.set({ locale }))
        localAttempted = true
        if (!setCurrentLocale(locale)) throw new Error("Locale storage is unavailable")
    } catch (error) {
        if (localAttempted) setCurrentLocale(previousLocale)
        if (native && previousNative) {
            const previous = isValidLocale(previousNative.locale) ? previousNative.locale : previousLocale
            try {
                // Also bounded when the native write failed or its acknowledgement timed out.
                await nativeOperation(() => native.set({ locale: previous }))
            } catch (rollbackError) {
                throw new AggregateError([error, rollbackError], "Locale change failed and native restoration could not be confirmed")
            }
        }
        throw error
    }
}

export async function changeLocaleAndRestart(locale: Locale, desktop: boolean): Promise<void> {
    await persistLocaleChange(locale, desktop)
    if (desktop && window.electron) window.electron.send("restart-app-completely")
    else window.location.reload()
}
