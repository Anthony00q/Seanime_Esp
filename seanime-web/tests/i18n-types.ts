import { createTranslator, type TranslationKeys } from "../src/locales"
import { setCurrentLocale } from "../src/locales/config"

// Compile-only tests: @ts-expect-error must itself fail if these invalid inputs become accepted.
const leaf: TranslationKeys = "common.buttons.save"
void leaf
// @ts-expect-error Object namespaces are not translatable string leaves.
const parent: TranslationKeys = "common.buttons"
void parent
// @ts-expect-error Unknown paths must not compile.
createTranslator()("common.buttons.notARealButton")
// @ts-expect-error Unsupported explicit locales must not compile.
createTranslator("fr")
// @ts-expect-error Locale preference accepts supported languages only.
setCurrentLocale("pt-BR")

const t = createTranslator()
t("manga.sourceRefresh.installedProviders", { count: 2 })
t("extensions.prompt.request", { extension: "Example", hasResource: false, resource: "" })
// @ts-expect-error ICU counts are required.
t("manga.sourceRefresh.installedProviders")
// @ts-expect-error ICU counts must be numbers even when the variable is not a literal.
t("manga.sourceRefresh.installedProviders", { count: String(2) })
// @ts-expect-error A text API cannot return arbitrary objects.
t("toast.client.error", { error: new Error("EACCES") })
// @ts-expect-error Parameters are not fallback options.
t("common.buttons.save", { defaultValue: "Save" })
// @ts-expect-error Wrong parameter names must not be accepted.
t("videoPlayer.skipChapter", { name: "Opening" })
