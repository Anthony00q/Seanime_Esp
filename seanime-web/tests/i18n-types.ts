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
