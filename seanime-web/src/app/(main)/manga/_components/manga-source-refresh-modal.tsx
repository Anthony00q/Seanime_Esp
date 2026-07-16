import { Manga_MangaSourceRefreshJob, Manga_MangaSourceRefreshMode } from "@/api/generated/types"
import { useListMangaProviderExtensions } from "@/api/hooks/extensions.hooks"
import { useStartMangaSourceRefresh, useStopMangaSourceRefresh } from "@/api/hooks/manga.hooks"
import { __manga_preferencesHydratedAtom } from "@/app/(main)/manga/_lib/handle-manga-selected-provider"
import { SeaLink } from "@/components/shared/sea-link"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Disclosure, DisclosureContent, DisclosureItem, DisclosureTrigger } from "@/components/ui/disclosure"
import { Modal } from "@/components/ui/modal"
import { ProgressBar } from "@/components/ui/progress-bar"
import { RadioGroup } from "@/components/ui/radio-group"
import { createTranslator } from "@/locales"
import { useAtomValue } from "jotai/react"
import React from "react"
import { LuChevronDown, LuRefreshCcw } from "react-icons/lu"

type MangaSourceRefreshModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    job: Manga_MangaSourceRefreshJob | null | undefined
    returnFocusRef: React.RefObject<HTMLButtonElement | null>
}

const discoveryModes: Manga_MangaSourceRefreshMode[] = ["find_missing", "refresh_and_find", "reevaluate_all"]

export function MangaSourceRefreshModal({ open, onOpenChange, job, returnFocusRef }: MangaSourceRefreshModalProps) {
    const t = createTranslator()
    const hydrated = useAtomValue(__manga_preferencesHydratedAtom)
    const { data: providers } = useListMangaProviderExtensions()
    const { mutate: startRefresh, isPending: isStarting } = useStartMangaSourceRefresh()
    const { mutate: stopRefresh, isPending: isStopping } = useStopMangaSourceRefresh()
    const [mode, setMode] = React.useState<Manga_MangaSourceRefreshMode>("refresh_selected")
    const statusHeadingRef = React.useRef<HTMLParagraphElement>(null)

    const terminal = job?.status === "completed" || job?.status === "cancelled" || job?.status === "failed"
    const running = job?.status === "running" || job?.status === "stopping"

    React.useEffect(() => {
        if (open && job) {
            statusHeadingRef.current?.focus()
        }
    }, [job?.id, job?.status, open])

    const providerCount = providers?.length ?? 0
    const discoveryDisabled = providerCount === 0
    const startDisabled = !hydrated || isStarting || discoveryDisabled && discoveryModes.includes(mode)
    const progress = job?.total ? Math.min(100, Math.round(job.current / job.total * 100)) : 0
    const failedMediaIds = [...new Set(job?.result.issues
        ?.filter(issue => issue.kind === "provider_error")
        .map(issue => issue.mediaId) ?? [])]
    const affectedMediaIds = [...new Set(job?.result.issues?.map(issue => issue.mediaId) ?? [])]
    const canFindAlternatives = providerCount > 0 &&
        (job?.mode === "refresh_selected" || job?.mode === "refresh_and_find") &&
        affectedMediaIds.length > 0

    const dismissJob = React.useCallback((runAgain: boolean) => {
        stopRefresh(undefined, {
            onSuccess: () => {
                if (runAgain) {
                    setMode(job?.mode ?? "refresh_selected")
                } else {
                    onOpenChange(false)
                }
            },
        })
    }, [job?.mode, onOpenChange, stopRefresh])

    const retryFailed = React.useCallback(() => {
        if (!job || !failedMediaIds.length) return
        stopRefresh(undefined, {
            onSuccess: () => startRefresh({ mode: job.mode, mediaIds: failedMediaIds }),
        })
    }, [failedMediaIds, job, startRefresh, stopRefresh])

    const findAlternatives = React.useCallback(() => {
        if (!affectedMediaIds.length) return
        stopRefresh(undefined, {
            onSuccess: () => startRefresh({ mode: "reevaluate_all", mediaIds: affectedMediaIds }),
        })
    }, [affectedMediaIds, startRefresh, stopRefresh])

    const formatRefreshSummary = (refreshJob: Manga_MangaSourceRefreshJob) => {
        const parts = [
            t("manga.sourceRefresh.summary.refreshed", { count: refreshJob.result.refreshed }),
            t("manga.sourceRefresh.summary.found", { count: refreshJob.result.found }),
            t("manga.sourceRefresh.summary.changed", { count: refreshJob.result.replaced }),
        ]
        if (refreshJob.result.notFound > 0) parts.push(t("manga.sourceRefresh.summary.notFound", { count: refreshJob.result.notFound }))
        if (refreshJob.result.failed > 0) parts.push(t("manga.sourceRefresh.summary.failed", { count: refreshJob.result.failed }))
        return `${parts.join(", ")}.`
    }
    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={t("manga.refreshSources")}
            contentClass="max-w-xl"
            onCloseAutoFocus={event => {
                event.preventDefault()
                returnFocusRef.current?.focus()
            }}
            footer={running ? (
                <>
                    <Button intent="gray-outline" onClick={() => onOpenChange(false)}>{t("common.buttons.close")}</Button>
                    <Button
                        intent="warning"
                        loading={job?.status === "stopping" || isStopping}
                        disabled={job?.status === "stopping" || isStopping}
                        onClick={() => stopRefresh()}
                    >
                        {job?.status === "stopping" ? t("manga.sourceRefresh.stopping") : t("manga.sourceRefresh.stop")}
                    </Button>
                </>
            ) : terminal ? (
                <>
                    {canFindAlternatives && (
                        <Button intent="gray-outline" loading={isStarting || isStopping} onClick={findAlternatives}>
                            {t("manga.sourceRefresh.findAlternatives")}
                        </Button>
                    )}
                    {!!failedMediaIds.length && (
                        <Button intent="gray-outline" loading={isStarting || isStopping} onClick={retryFailed}>
                            {t("manga.sourceRefresh.retryFailed")}
                        </Button>
                    )}
                    <Button intent="gray-outline" loading={isStopping} onClick={() => dismissJob(true)}>{t("manga.sourceRefresh.runAgain")}</Button>
                    <Button intent="primary" loading={isStopping} onClick={() => dismissJob(false)}>{t("common.buttons.done")}</Button>
                </>
            ) : (
                <>
                    <Button intent="gray-outline" onClick={() => onOpenChange(false)}>{t("common.buttons.cancel")}</Button>
                    <Button
                        intent="primary"
                        leftIcon={<LuRefreshCcw />}
                        loading={isStarting}
                        disabled={startDisabled}
                        onClick={() => startRefresh({ mode })}
                    >{t("manga.sourceRefresh.start")}</Button>
                </>
            )}
        >
            {running && job ? (
                <div className="space-y-5" aria-live="polite">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4 text-sm">
                            <p ref={statusHeadingRef} tabIndex={-1} className="font-medium outline-none">
                                {job.status === "stopping"
                                    ? t("manga.sourceRefresh.stoppingAfterRequest")
                                    : job.stage === "refreshing" ? t("manga.sourceRefresh.refreshingSelected") : t("manga.sourceRefresh.searchingInstalled")}
                            </p>
                            <p className="shrink-0 text-[--muted]">{t("manga.sourceRefresh.progress", { current: job.current, total: job.total })}</p>
                        </div>
                        <ProgressBar value={progress} size="sm" aria-label={t("manga.sourceRefresh.progressLabel")} />
                    </div>
                    <p className="text-sm text-[--muted]">
                        {t("manga.sourceRefresh.continueInBackground")}
                    </p>
                </div>
            ) : terminal && job ? (
                <div className="space-y-5">
                    <div aria-live={job.status === "failed" ? "assertive" : "polite"}>
                        <p ref={statusHeadingRef} tabIndex={-1} className="font-medium outline-none">
                            {job.status === "completed" ? t("manga.sourceRefresh.complete") : job.status === "cancelled"
                                ? t("manga.sourceRefresh.stopped")
                                : t("manga.sourceRefresh.failed")}
                        </p>
                        <p className="mt-1 text-sm text-[--muted]">
                            {formatRefreshSummary(job)}
                        </p>
                    </div>

                    {!!job.error && <Alert intent="alert-basic" description={job.error} />}

                    {!!job.result.issues?.length && (
                        <Disclosure type="single" collapsible>
                            <DisclosureItem value="issues">
                                <DisclosureTrigger>
                                    <Button intent="gray-outline" className="w-full justify-between" rightIcon={<LuChevronDown />}>
                                        {t("manga.sourceRefresh.reviewIssues", { count: job.result.issues.length })}
                                    </Button>
                                </DisclosureTrigger>
                                <DisclosureContent className="pt-3 max-h-56 overflow-y-auto">
                                    <div className="space-y-2">
                                        {job.result.issues.map(issue => (
                                            <div key={`${issue.mediaId}-${issue.kind}`} className="min-w-0 text-sm">
                                                <SeaLink href={`/manga/entry?id=${issue.mediaId}`} className="font-medium break-words">
                                                    {issue.title}
                                                </SeaLink>
                                                <p className="text-[--muted] break-words">
                                                    {issue.kind === "not_found"
                                                        ? job.mode === "refresh_selected"
                                                            ? t("manga.sourceRefresh.savedSourceNoChapters")
                                                            : t("manga.sourceRefresh.noMatchingSource")
                                                        : t("manga.sourceRefresh.providersFailed")}
                                                    {!!issue.providers?.length && ` ${issue.providers.join(", ")}`}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </DisclosureContent>
                            </DisclosureItem>
                        </Disclosure>
                    )}
                </div>
            ) : (
                <div className="space-y-5">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[--muted]">
                        <span>{t("manga.sourceRefresh.installedProviders", { count: providerCount })}</span>
                        <span>{t("manga.sourceRefresh.eligibleMangaOnly")}</span>
                    </div>

                    <RadioGroup
                        value={mode}
                        onValueChange={value => setMode(value as Manga_MangaSourceRefreshMode)}
                        stackClass="space-y-2"
                        itemContainerClass="items-start gap-3 rounded-xl border border-[--border] px-3 py-3 data-[state=checked]:border-brand/60 data-[state=checked]:bg-brand/5"
                        itemClass="mt-0.5 shrink-0"
                        itemLabelClass="min-w-0 flex-1"
                        options={[
                            {
                                value: "refresh_selected",
                                label: <ModeLabel title={t("manga.sourceRefresh.refreshSelected.title")} description={t("manga.sourceRefresh.refreshSelected.description")} />,
                            },
                            {
                                value: "find_missing",
                                disabled: discoveryDisabled,
                                label: <ModeLabel
                                    title={t("manga.sourceRefresh.findMissing.title")}
                                    description={t("manga.sourceRefresh.findMissing.description")}
                                />,
                            },
                            {
                                value: "refresh_and_find",
                                disabled: discoveryDisabled,
                                label: <ModeLabel
                                    title={t("manga.sourceRefresh.refreshAndFind.title")}
                                    description={t("manga.sourceRefresh.refreshAndFind.description")}
                                />,
                            },
                            {
                                value: "reevaluate_all",
                                disabled: discoveryDisabled,
                                label: <ModeLabel
                                    title={t("manga.sourceRefresh.reevaluateAll.title")}
                                    description={t("manga.sourceRefresh.reevaluateAll.description")}
                                />,
                            },
                        ]}
                    />

                    {mode === "reevaluate_all" && (
                        <Alert
                            intent="warning-basic"
                            description={t("manga.sourceRefresh.reevaluateWarning")}
                        />
                    )}
                    {!hydrated && (
                        <Alert intent="info-basic" description={t("manga.sourceRefresh.waitingPreferences")} />
                    )}
                    {discoveryDisabled && (
                        <Alert intent="warning-basic" description={t("manga.sourceRefresh.installProvider")} />
                    )}
                </div>
            )}
        </Modal>
    )
}

function ModeLabel({ title, description }: { title: string, description: string }) {
    return (
        <span className="block min-w-0">
            <span className="block font-medium text-[--foreground] break-words">{title}</span>
            <span className="mt-0.5 block text-sm font-normal text-[--muted] break-words">{description}</span>
        </span>
    )
}
