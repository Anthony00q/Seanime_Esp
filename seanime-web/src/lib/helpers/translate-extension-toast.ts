import { createTranslator } from "@/locales"

const t = createTranslator()

export function translateExtensionInstallMessage(msg: string): string {
    if (msg.startsWith("Successfully installed") && msg.includes("extensions from the repository")) {
        const match = msg.match(/(\d+)/)
        const count = match ? parseInt(match[1], 10) : 0
        return t("extensions.toast.extensionsFromRepoInstalled", { count })
    }
    if (msg.startsWith("Successfully installed")) {
        const name = msg.replace("Successfully installed ", "")
        return t("extensions.toast.extensionSuccessfullyInstalled", { name })
    }
    if (msg.startsWith("Successfully updated")) {
        const name = msg.replace("Successfully updated ", "")
        return t("extensions.toast.extensionSuccessfullyUpdated", { name })
    }
    return msg
}
