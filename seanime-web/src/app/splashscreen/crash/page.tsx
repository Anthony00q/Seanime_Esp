import { ElectronCrashScreenError } from "@/app/(main)/_electron/electron-crash-screen"
import { LuffyError } from "@/components/shared/luffy-error"
import { LoadingOverlay } from "@/components/ui/loading-spinner"
import { createTranslator } from "@/locales"
import { __isElectronDesktop__ } from "@/types/constants"
import React from "react"

export default function Page() {
    const t = createTranslator("es")

    return (
        <LoadingOverlay showSpinner={false}>
            <LuffyError title={t("error.somethingWentWrong")}>
                {__isElectronDesktop__ && <ElectronCrashScreenError />}
            </LuffyError>
        </LoadingOverlay>
    )

}
