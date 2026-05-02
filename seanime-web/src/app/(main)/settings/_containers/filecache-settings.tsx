import { useClearFileCacheMediastreamVideoFiles, useGetFileCacheTotalSize, useRemoveFileCacheBucket } from "@/api/hooks/filecache.hooks"
import { Button } from "@/components/ui/button"
import { createTranslator } from "@/locales"
import React from "react"
import { SettingsCard } from "../_components/settings-card"

const t = createTranslator("es")

type FilecacheSettingsProps = {
    children?: React.ReactNode
}

export function FilecacheSettings(props: FilecacheSettingsProps) {

    const {
        children,
        ...rest
    } = props


    const { data: totalSize, mutate: getTotalSize, isPending: isFetchingSize } = useGetFileCacheTotalSize()

    const { mutate: clearBucket, isPending: _isClearing } = useRemoveFileCacheBucket(() => {
        getTotalSize()
    })

    const { mutate: clearMediastreamCache, isPending: _isClearing2 } = useClearFileCacheMediastreamVideoFiles(() => {
        getTotalSize()
    })

    const isClearing = _isClearing || _isClearing2

    return (
        <div className="space-y-4">
            <div className="flex gap-2 items-center">
                <Button intent="white-subtle" size="sm" onClick={() => getTotalSize()} disabled={isFetchingSize}>
                    {t("settings.cache.showTotalSize")}
                </Button>
                {!!totalSize && (
                    <p>
                        {totalSize}
                    </p>
                )}
            </div>

            <SettingsCard>
                <div className="flex gap-2 flex-wrap items-center">
                    <Button intent="warning-subtle" onClick={() => clearBucket({ bucket: "manga" })} disabled={isClearing}>
                        {t("settings.cache.clearMangaCache")}
                    </Button>
                    <Button intent="warning-subtle" onClick={() => clearMediastreamCache()} disabled={isClearing}>
                        {t("settings.cache.clearMediaStreamingCache")}
                    </Button>
                    <Button intent="warning-subtle" onClick={() => clearBucket({ bucket: "onlinestream" })} disabled={isClearing}>
                        {t("settings.cache.clearOnlineStreamingCache")}
                    </Button>
                </div>
            </SettingsCard>


            {/*<SettingsCard title="TVDB" description="Episode image metadata fetched from TVDB.">*/}
            {/*    <Button intent="alert-subtle" onClick={() => clearBucket({ bucket: "tvdb" })} disabled={isClearing}>*/}
            {/*        Clear metadata*/}
            {/*    </Button>*/}
            {/*</SettingsCard>*/}

        </div>
    )
}
