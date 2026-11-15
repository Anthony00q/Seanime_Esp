// @vitest-environment happy-dom
import "./setup"
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"
import { useServerMutation } from "@/api/client/requests"
import { useSaveSettings } from "@/api/hooks/settings.hooks"
import { API_ENDPOINTS } from "@/api/generated/endpoints"
import { toast } from "sonner"
import { createTranslator } from "../index"

vi.mock("@/api/client/requests", () => ({ useServerMutation: vi.fn(() => ({})), useServerQuery: vi.fn() }))
vi.mock("@/app/(main)/_atoms/server-status.atoms", () => ({ isLoginModalOpenAtom: {} }))
vi.mock("@/app/(main)/_hooks/use-server-status", () => ({ useSetServerStatus: vi.fn() }))
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }))

describe("settings save success notification opt-out", () => {
    it.each([undefined, true, false])("preserves cache invalidation with showSuccessToast=%s", async showSuccessToast => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
        vi.mocked(useServerMutation).mockClear()
        vi.mocked(toast.success).mockClear()
        const client = new QueryClient()
        const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue()
        const container = document.createElement("div")
        const root = createRoot(container)
        function Fixture() {
            useSaveSettings(showSuccessToast === undefined ? undefined : { showSuccessToast })
            return null
        }
        try {
            await act(async () => root.render(<QueryClientProvider client={client}><Fixture /></QueryClientProvider>))
            const options = vi.mocked(useServerMutation).mock.calls[0][0]
            // Invoke the hook's real success handler; only the network hook is replaced.
            await (options.onSuccess as () => Promise<void>)()
            expect(invalidate.mock.calls).toEqual([
                [{ queryKey: [API_ENDPOINTS.SETTINGS.GetSettings.key] }],
                [{ queryKey: [API_ENDPOINTS.STATUS.GetStatus.key] }],
                [{ queryKey: [API_ENDPOINTS.ANIME_COLLECTION.GetLibraryCollection.key] }],
                [{ queryKey: [API_ENDPOINTS.ANIME_ENTRIES.GetMissingEpisodes.key] }],
            ])
            expect(toast.success).toHaveBeenCalledTimes(showSuccessToast === false ? 0 : 1)
            if (showSuccessToast !== false) expect(toast.success).toHaveBeenCalledWith(createTranslator()("toast.settings.settingsSaved"))
        } finally {
            await act(async () => root.unmount())
            client.clear()
            container.remove()
        }
    })
})
