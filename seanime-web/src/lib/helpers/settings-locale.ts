import { settingsSchema } from "@/lib/server/settings"
import { isValidLocale, type Locale } from "@/locales/config"
import equal from "fast-deep-equal"

/** Compare effective form values, not dirty flags or raw optional defaults. */
export function isLocaleOnlySettingsChange(values: unknown, defaults: unknown, currentLocale: Locale): boolean {
    const submitted = settingsSchema.safeParse(values)
    const initial = settingsSchema.safeParse(defaults)
    // If the baseline is unavailable, keep the normal save notification.
    if (!submitted.success || !initial.success) return false

    const { locale, ...settings } = submitted.data
    const { locale: _initialLocale, ...initialSettings } = initial.data
    return isValidLocale(locale) && locale !== currentLocale && equal(settings, initialSettings)
}
