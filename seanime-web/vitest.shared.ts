import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// Versioned configuration; the optional vitest.config.ts remains local.
export default defineConfig({
    test: {
        execArgv: process.allowedNodeEnvironmentFlags.has("--no-experimental-webstorage") ? ["--no-experimental-webstorage"] : [],
    },
    resolve: {
        alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
})
