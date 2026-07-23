import type { Anime_EpisodeTorrentAvailability } from "@/api/generated/types"
import { Badge } from "@/components/ui/badge"
import { LuCircleCheck, LuCircleHelp, LuClock3, LuLoaderCircle } from "react-icons/lu"
import { createTranslator } from "@/locales"

export function EpisodeTorrentAvailabilityBadge({ status }: { status?: Anime_EpisodeTorrentAvailability }) {
    const t = createTranslator()
    if (status === "available") {
        return <Badge size="sm" intent="success-solid" leftIcon={<LuCircleCheck />} title={t("entry.episodeList.torrentAvailableTooltip")}>
            {t("entry.episodeList.torrentAvailable")}
        </Badge>
    }
    if (status === "checking") {
        return <Badge
            size="sm"
            intent="primary-solid"
            leftIcon={<LuLoaderCircle className="animate-spin" />}
            title={t("entry.episodeList.checkingTorrentsTooltip")}
        >
            {t("entry.episodeList.checkingTorrents")}
        </Badge>
    }
    if (status === "waiting") {
        return <Badge size="sm" intent="warning-solid" leftIcon={<LuClock3 />} title={t("entry.episodeList.waitingForTorrentTooltip")}>
            {t("entry.episodeList.waitingForTorrent")}
        </Badge>
    }
    if (status === "unknown") {
        return <Badge size="sm" intent="gray-solid" leftIcon={<LuCircleHelp />} title={t("entry.episodeList.availabilityUnknownTooltip")}>
            {t("entry.episodeList.availabilityUnknown")}
        </Badge>
    }
    return null
}
