import "./setup"
import { describe, expect, it } from "vitest"
import { createTranslator } from "../index"
import { setCurrentLocale } from "../config"
import { getDateFnsLocale } from "../date-locale"
import { formatLocalized } from "@/lib/helpers/date"
import { formatNumber } from "@/lib/helpers/number"
import { capitalizeFirst } from "@/lib/utils/capitalize-date"
import { translateDisplayTitle } from "@/lib/helpers/display-title"
import { resolveDatagridLocale } from "@/components/ui/datagrid/locales"
import { formatVolumeBoost, VOLUME_BOOST_OPTIONS } from "@/app/(main)/_features/media-core/media-core-volume-boost"
import { useMockBrowser } from "./browser"

useMockBrowser()

describe.each([
    { locale: "en", month: "May", day: "Friday", code: "en-US", off: "Off", boost: "Volume Boost", episode: "Episode 7", more: "Episode 7 & 2 more", special: "Special 2 - Title", limit: "You cannot add more than 200 episodes to a playlist" },
    { locale: "es", month: "Mayo", day: "Viernes", code: "es", off: "Desactivado", boost: "Amplificación de volumen", episode: "Episodio 7", more: "Episodio 7 y 2 más", special: "Especial 2 - Title", limit: "No puedes añadir más de 200 episodios a una lista de reproducción" },
    { locale: "pt", month: "Maio", day: "Sexta-feira", code: "pt-BR", off: "Desligado", boost: "Amplificação de volume", episode: "Episódio 7", more: "Episódio 7 e mais 2", special: "Especial 2 - Title", limit: "Você não pode adicionar mais de 200 episódios a uma playlist" },
] as const)("fork playback/date integration ($locale)", ({ locale, month, day, code, off, boost, episode, more, special, limit }) => {
    it("formats actual month/day names with the configured locale and capitalization", () => {
        setCurrentLocale(locale)
        const date = new Date(2026, 4, 15, 12)
        expect(capitalizeFirst(formatLocalized(date, "MMMM"))).toBe(month)
        expect(capitalizeFirst(formatLocalized(date, "EEEE"))).toBe(day)
        expect(getDateFnsLocale().code).toBe(code)
        expect(resolveDatagridLocale()).toBe(locale)
        expect(resolveDatagridLocale("fr")).toBe("fr")
        expect(formatNumber(12345.6)).toBe(new Intl.NumberFormat(code).format(12345.6))
    })
    it("translates actual backend titles with isolated per-locale caches", () => {
        setCurrentLocale(locale)
        expect(translateDisplayTitle("Episode 07")).toBe(episode)
        expect(translateDisplayTitle("Episode 7 & 2 more")).toBe(more)
        expect(translateDisplayTitle("Special 2 - Title")).toBe(special)
        expect(translateDisplayTitle(null)).toBe("")
        expect(translateDisplayTitle("Movie Title")).toBe("Movie Title")
    })
    it("keeps the fork volume feedback localized without altering upstream options", () => {
        setCurrentLocale(locale)
        expect(formatVolumeBoost(1)).toBe(off)
        expect(formatVolumeBoost(3)).toBe("300%")
        expect(createTranslator()("videoPlayer.settingsMenu.volumeBoostFeedback", { value: off })).toBe(`${boost}: ${off}`)
        expect(VOLUME_BOOST_OPTIONS[0]).toEqual({ label: "Off", value: 1 })
    })
    it("interpolates the numeric playlist limit", () => {
        const value = createTranslator(locale)("playlistEditor.maxEpisodes", { count: 200 })
        expect(value).toBe(limit)
    })
})
