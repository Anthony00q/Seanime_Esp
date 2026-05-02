import { CustomLibraryBanner } from "@/app/(main)/_features/anime-library/_containers/custom-library-banner"
import { AutoDownloaderPage } from "@/app/(main)/auto-downloader/_containers/autodownloader-page"
import { PageWrapper } from "@/components/shared/page-wrapper"
import React from "react"
import { createTranslator } from "@/locales"

const t = createTranslator("es")


export default function Page() {

    return (
        <>
            <CustomLibraryBanner discrete />
            <PageWrapper className="p-4 sm:p-8 space-y-4">
                <div className="flex justify-between items-center w-full relative">
                    <div>
                        <h2>{t("autoDownloader.title")}</h2>
                        <p className="text-[--muted]">
                            {t("autoDownloader.description")}
                        </p>
                    </div>
                </div>
                <AutoDownloaderPage />
            </PageWrapper>
        </>
    )

}
