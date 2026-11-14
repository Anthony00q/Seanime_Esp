// @vitest-environment happy-dom
import "./setup"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { createTranslator } from "../index"
import { setCurrentLocale } from "../config"
import { translateChapterLabel } from "@/lib/helpers/chapter-label"
import { translateLibraryFilter } from "@/lib/helpers/library-filter-label"
import { getSkipChapters, getSkipLabel } from "@/app/(main)/_features/media-core/media-core-chapters"
import { TorrentSeedersBadge } from "@/app/(main)/entry/_containers/torrent-search/_components/torrent-item-badges"
import { useMockBrowser } from "./browser"

useMockBrowser()

describe.each(["en", "es", "pt"] as const)("display-only adapters (%s)", locale => {
    it("translates every real filter without constructing keys from identifiers", () => {
        setCurrentLocale(locale)
        const t = createTranslator()
        for (const [filter, key] of [["UNLOCKED", "libraryExplorer.unlockedFiles"], ["UNMATCHED", "libraryExplorer.unmatchedFiles"],
            ["IGNORED", "libraryExplorer.ignoredFiles"], ["UNKNOWN_MEDIA", "libraryExplorer.unknownMedia"]] as const) {
            expect(translateLibraryFilter(filter)).toBe(t(key))
        }
        expect(translateLibraryFilter(undefined)).toBe("")
    })

    it("preserves custom names and the actual chapter intervals and matching", () => {
        setCurrentLocale(locale)
        const chapters = [{ label: "Opening", start: 10, end: 90 }, { label: "Intro", start: 0, end: 10 }, { label: "Custom Recap", start: 100, end: 120 }]
        const original = structuredClone(chapters)
        const skipped = getSkipChapters(chapters, "^Intro$,^Custom Recap$")
        for (const chapter of skipped) {
            const name = getSkipLabel(chapter.label)
            const label = translateChapterLabel(name)
            expect(createTranslator()("videoPlayer.skipChapter", { chapter: label })).not.toMatch(/videoPlayer\.|\{/)
            expect(chapters).toContain(chapter)
        }
        expect(translateChapterLabel("Intro")).toBe("Intro")
        expect(translateChapterLabel("Custom Recap")).toBe("Custom Recap")
        expect(translateChapterLabel("constructor")).toBe("constructor")
        expect(chapters).toEqual(original)
    })

    it.each([0, 1, 2])("renders the real seeder badge with ICU for %i", count => {
        setCurrentLocale(locale)
        const html = renderToStaticMarkup(<TorrentSeedersBadge seeders={count} />)
        expect(html).toContain(createTranslator()("entry.torrentSearch.seedersCount", { count }))
        expect(html).not.toContain("{count")
    })

    it("keeps the unknown seed count hidden", () => {
        expect(renderToStaticMarkup(<TorrentSeedersBadge seeders={-1} />)).toBe("")
    })
})
