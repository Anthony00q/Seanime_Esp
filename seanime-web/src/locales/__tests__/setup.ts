import { afterEach, beforeEach, vi } from "vitest"

// Unexpected i18n warnings/errors fail the fork suite instead of hiding fallback failures.
beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation((...args) => { throw new Error(`Unexpected console.warn: ${args.join(" ")}`) })
    vi.spyOn(console, "error").mockImplementation((...args) => { throw new Error(`Unexpected console.error: ${args.join(" ")}`) })
})

afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
})
