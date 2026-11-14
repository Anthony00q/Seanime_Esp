import { createTranslator, type TranslationKeyWithoutParams } from "@/locales"

// Display-only mapping: never change chapter identifiers, patterns or seek times.
const CHAPTER_LABELS = {
    opening: "videoPlayer.chapters.opening",
    ending: "videoPlayer.chapters.ending",
    prologue: "videoPlayer.chapters.prologue",
    episode: "videoPlayer.chapters.episode",
    movie: "videoPlayer.chapters.movie",
    preview: "videoPlayer.chapters.preview",
    intro: "videoPlayer.chapters.intro",
    outro: "videoPlayer.chapters.outro",
    chapter: "videoPlayer.chapters.chapter",
} as const satisfies Record<string, TranslationKeyWithoutParams>

export function translateChapterLabel(label: string): string {
    const key = Object.hasOwn(CHAPTER_LABELS, label.toLowerCase())
        ? CHAPTER_LABELS[label.toLowerCase() as keyof typeof CHAPTER_LABELS] : undefined
    return key ? createTranslator()(key) : label
}
