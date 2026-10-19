import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// Only the fork's versioned translation tests; no upstream tests or ignored local files.
export default defineConfig({
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    test: {
        // Node 25's server-side localStorage otherwise shadows happy-dom's browser storage.
        execArgv: process.allowedNodeEnvironmentFlags.has("--no-experimental-webstorage") ? ["--no-experimental-webstorage"] : [],
        include: ["src/locales/__tests__/**/*.test.{ts,tsx}"],
        restoreMocks: true,
        unstubGlobals: true,
    },
})
