import { LuffyError } from "@/components/shared/luffy-error"
import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"
import { createTranslator } from "@/locales"
import React from "react"

const t = createTranslator("es")

export function NotFound() {
    return (
        <div className="p-4 flex flex-col items-center justify-center h-full">
            <LuffyError title={t("shared.pageNotFoundTitle")}>
                <p className="text-[--muted] mb-4">
                    {t("shared.pageNotFound")}
                </p>
                <Link to="/">
                    <Button>{t("shared.goHome")}</Button>
                </Link>
            </LuffyError>
        </div>
    )
}
