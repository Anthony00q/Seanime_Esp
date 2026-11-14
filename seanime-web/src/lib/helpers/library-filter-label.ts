import type { LibraryExplorer_Filter } from "@/app/(main)/_features/library-explorer/library-explorer.atoms"
import { createTranslator, type TranslationKeyWithoutParams } from "@/locales"

const FILTER_LABELS = {
    UNLOCKED: "libraryExplorer.unlockedFiles",
    UNMATCHED: "libraryExplorer.unmatchedFiles",
    IGNORED: "libraryExplorer.ignoredFiles",
    UNKNOWN_MEDIA: "libraryExplorer.unknownMedia",
} as const satisfies Record<Exclude<LibraryExplorer_Filter, undefined>, TranslationKeyWithoutParams>

export function translateLibraryFilter(filter: LibraryExplorer_Filter): string {
    return filter ? createTranslator()(FILTER_LABELS[filter]) : ""
}
