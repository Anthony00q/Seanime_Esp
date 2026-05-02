import { SettingsCard } from "@/app/(main)/settings/_components/settings-card"
import { SettingsSubmitButton } from "@/app/(main)/settings/_components/settings-submit-button"
import { DataSettings } from "@/app/(main)/settings/_containers/data-settings"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Field } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { javascript } from "@codemirror/lang-javascript"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import CodeMirror from "@uiw/react-codemirror"
import { createTranslator } from "@/locales"
import React from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { FcFolder } from "react-icons/fc"

const t = createTranslator("es")

type LibrarySettingsProps = {
    isPending: boolean
}

export function AnimeLibrarySettings(props: LibrarySettingsProps) {

    const {
        isPending,
        ...rest
    } = props

    const { watch } = useFormContext()

    const useLegacyMatching = useWatch({ name: "scannerUseLegacyMatching" })


    return (
        <div className="space-y-4">

            <SettingsCard>
                <Field.DirectorySelector
                    name="libraryPath"
                    label={t("settings.library.libraryPath")}
                    leftIcon={<FcFolder />}
                    help={t("settings.library.libraryPathHelp")}
                    shouldExist
                />

                <Field.MultiDirectorySelector
                    name="libraryPaths"
                    label={t("settings.library.additionalDirectories")}
                    leftIcon={<FcFolder />}
                    help={t("settings.library.additionalDirectoriesHelp")}
                    shouldExist
                />
            </SettingsCard>

            <SettingsCard>

                <Field.Switch
                    side="right"
                    name="autoScan"
                    label={t("settings.library.autoScan")}
                    moreHelp={<p>
                        {t("settings.library.autoScanMoreHelp")}
                    </p>}
                />

                <Field.Switch
                    side="right"
                    name="refreshLibraryOnStart"
                    label={t("settings.library.refreshOnStartup")}
                />
            </SettingsCard>

            {/*<SettingsCard title="Advanced">*/}

            <Accordion
                type="single"
                collapsible
                className="border rounded-[--radius-md]"
                triggerClass="dark:bg-[--paper]"
                contentClass="!pt-2 dark:bg-[--paper]"
                defaultValue={(useLegacyMatching) ? "more" : undefined}
            >
                <AccordionItem value="more">
                    <AccordionTrigger className="bg-gray-900 rounded-[--radius-md]" data-settings-anime-library="advanced-accordion-trigger">
                        {t("settings.ui.advanced")}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        {!useLegacyMatching && <div className="space-y-4">
                            <div>
                                <p className="font-semibold text-lg mb-2">{t("settings.library.scannerConfig")}</p>
                                <p className="text-sm text-[--muted] mb-4">
                                    {t("settings.library.scannerConfigHelp")}
                                </p>
                            </div>
                            <ScannerConfigEditor />
                        </div>}

                        <>
                            <Field.Switch
                                name="scannerUseLegacyMatching"
                                label={t("settings.library.scannerUseLegacyMatching")}
                                help={t("settings.library.scannerUseLegacyMatchingHelp")}
                                moreHelp={t("settings.library.scannerUseLegacyMatchingMoreHelp")}
                            />
                        </>

                        {useLegacyMatching && <div className="flex flex-col md:flex-row gap-3">
                            <Field.Select
                                options={[
                                    { value: "-", label: t("settings.library.levenshteinSorensen") },
                                    { value: "sorensen-dice", label: t("settings.library.sorensenDice") },
                                    { value: "jaccard", label: t("settings.library.jaccard") },
                                ]}
                                name="scannerMatchingAlgorithm"
                                label={t("settings.library.scannerMatchingAlgorithm")}
                                help={t("settings.library.scannerMatchingAlgorithmHelp")}
                            />
                            <Field.Number
                                name="scannerMatchingThreshold"
                                label={t("settings.library.scannerMatchingThreshold")}
                                placeholder="0.5"
                                help={t("settings.library.scannerMatchingThresholdHelp")}
                                formatOptions={{
                                    minimumFractionDigits: 1,
                                    maximumFractionDigits: 1,
                                }}
                                max={1.0}
                                step={0.1}
                            />
                        </div>}

                        <Separator />

                        <DataSettings />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/*</SettingsCard>*/}

            <SettingsSubmitButton isPending={isPending} />

        </div>
    )
}

function ScannerConfigEditor() {
    const { setValue } = useFormContext()
    const scannerConfig = useWatch({ name: "scannerConfig" })

    const [value, setLocalValue] = React.useState(scannerConfig || "")

    React.useEffect(() => {
        setLocalValue(scannerConfig || "")
    }, [scannerConfig])

    const handleChange = React.useCallback((val: string) => {
        setLocalValue(val)
        setValue("scannerConfig", val, { shouldDirty: true })
    }, [setValue])

    return (
        <div className="overflow-hidden rounded-[--radius-md] border">
            <CodeMirror
                value={value}
                height="400px"
                theme={vscodeDark}
                extensions={[javascript()]}
                onChange={handleChange}
                basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    bracketMatching: true,
                    syntaxHighlighting: true,
                    highlightActiveLine: true,
                }}
                placeholder={`{
  "matching": {
    "rules": []
  },
  "hydration": {
    "rules": []
  },
  "logs": {
    "verbose": false
  }
}`}
            />
        </div>
    )
}

