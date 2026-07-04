import { Anime_AutoDownloaderProfile, Anime_AutoDownloaderProfileRuleFormatAction } from "@/api/generated/types"
import { useCreateAutoDownloaderProfile, useUpdateAutoDownloaderProfile } from "@/api/hooks/auto_downloader.hooks"
import { useAnimeListTorrentProviderExtensions } from "@/api/hooks/extensions.hooks"
import { Button, IconButton } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Combobox } from "@/components/ui/combobox"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { NumberInput } from "@/components/ui/number-input"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { TextInput } from "@/components/ui/text-input"
import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { atomWithImmer } from "jotai-immer"
import { useAtom } from "jotai/react"
import React from "react"
import { BiMenu, BiPlus, BiTrash } from "react-icons/bi"
import { createTranslator } from "@/locales"

const t = createTranslator()

type ConditionType = {
    id: string
    term: string
    isRegex: boolean
    action: string
    score: number
}

type ResolutionType = {
    id: string
    value: string
}

type ReleaseGroupType = {
    id: string
    value: string
}

type FormData = {
    name: string
    global: boolean
    releaseGroups: ReleaseGroupType[]
    resolutions: ResolutionType[]
    conditions: ConditionType[]
    minimumScore: number
    minSeeders: number
    minSize: string
    maxSize: string
    providers: string[]
    delayMinutes: number
    skipDelayScore: number
}

const formDataAtom = atomWithImmer<FormData>({
    name: "",
    global: false,
    releaseGroups: [],
    resolutions: [],
    conditions: [],
    minimumScore: 0,
    minSeeders: 0,
    minSize: "",
    maxSize: "",
    providers: [],
    delayMinutes: 0,
    skipDelayScore: 0,
})

type AutoDownloaderProfileFormProps = {
    profile?: Anime_AutoDownloaderProfile
    onSuccess?: () => void
}

export function AutoDownloaderProfileForm(props: AutoDownloaderProfileFormProps) {
    const { profile, onSuccess } = props

    const { mutate: createProfile, isPending: creating } = useCreateAutoDownloaderProfile()
    const { mutate: updateProfile, isPending: updating } = useUpdateAutoDownloaderProfile()

    const [formData, setFormData] = useAtom(formDataAtom)
    const [shouldRender, setShouldRender] = React.useState(false)

    React.useEffect(() => {
        setFormData(draft => {
            draft.name = profile?.name ?? ""
            draft.global = profile?.global ?? false
            draft.releaseGroups = profile?.releaseGroups?.map(rg => ({
                id: `releaseGroup-${Date.now()}-${Math.random()}`,
                value: rg,
            })) ?? []
            draft.resolutions = profile?.resolutions?.map(res => ({
                id: `resolution-${Date.now()}-${Math.random()}`,
                value: res,
            })) ?? []
            draft.conditions = profile?.conditions?.map(c => ({
                ...c,
                id: c.id || `condition-${Date.now()}-${Math.random()}`,
            })) ?? []
            draft.minimumScore = profile?.minimumScore ?? 0
            draft.minSeeders = profile?.minSeeders ?? 0
            draft.minSize = profile?.minSize ?? ""
            draft.maxSize = profile?.maxSize ?? ""
            draft.providers = profile?.providers ?? []
            draft.delayMinutes = profile?.delayMinutes ?? 0
            draft.skipDelayScore = profile?.skipDelayScore ?? 0
            return
        })
        React.startTransition(() => {
            setShouldRender(true)
        })
    }, [profile])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name) {
            return
        }

        // Filter out empty values
        const filterEmptyReleaseGroups = formData.releaseGroups.filter(rg => rg.value.trim() !== "").map(rg => rg.value)
        const filterEmptyResolutions = formData.resolutions.filter(r => r.value.trim() !== "").map(r => r.value)

        const data = {
            ...formData,
            releaseGroups: filterEmptyReleaseGroups,
            resolutions: filterEmptyResolutions,
            conditions: formData.conditions.map(c => ({
                ...c,
                action: c.action as Anime_AutoDownloaderProfileRuleFormatAction,
            })),
        }

        if (profile) {
            updateProfile({
                ...profile,
                ...data,
            }, {
                onSuccess: () => onSuccess?.(),
            })
        } else {
            createProfile({
                dbId: 0,
                ...data,
            }, {
                onSuccess: () => onSuccess?.(),
            })
        }
    }

    if (!shouldRender) return <LoadingSpinner />

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">{t("autoDownloader.profileForm.profileName")}</label>
                <TextInput
                    value={formData.name}
                    onValueChange={(v) => setFormData(draft => {
                        draft.name = v
                        return
                    })}
                    placeholder={t("autoDownloader.profileName")}
                    required
                />
            </div>

            <div className="flex items-center gap-2">
                <Switch
                    value={formData.global}
                    onValueChange={(value) => setFormData(draft => {
                        draft.global = value
                        return
                    })}
                />
                <label className="text-sm">
                    {t("autoDownloader.profileForm.global")}
                    <span className="text-[--muted] block text-xs">{t("autoDownloader.profileForm.globalHelp")}</span>
                </label>
            </div>

            <Separator />

            <ReleaseGroupsSortableField />

            <ResolutionsSortableField />

            <ConditionsSortableField />

            <div className="border rounded-[--radius] p-4 relative !mt-8 space-y-3">
                <div className="absolute -top-2.5 tracking-wide font-semibold uppercase text-sm left-4 bg-gray-950 px-2">{t("autoDownloader.profileForm.thresholds")}</div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">{t("autoDownloader.profileForm.minimumScore")}</label>
                    <TextInput
                        type="number"
                        value={formData.minimumScore}
                        onChange={(e) => setFormData(draft => {
                            draft.minimumScore = parseInt(e.target.value) || 0
                            return
                        })}
                        placeholder="0"
                    />
                    <p className="text-sm text-[--muted]">{t("autoDownloader.profileForm.minimumScoreHelp")}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t("autoDownloader.profileForm.minSeeders")}</label>
                        <TextInput
                            type="number"
                            value={formData.minSeeders}
                            onChange={(e) => setFormData(draft => {
                                draft.minSeeders = parseInt(e.target.value) || 0
                                return
                            })}
                            placeholder="0"
                            min={0}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t("autoDownloader.profileForm.minSize")}</label>
                        <TextInput
                            value={formData.minSize}
                            onChange={(e) => setFormData(draft => {
                                draft.minSize = e.target.value
                                return
                            })}
                            placeholder="ej. 100MB"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t("autoDownloader.profileForm.maxSize")}</label>
                        <TextInput
                            value={formData.maxSize}
                            onChange={(e) => setFormData(draft => {
                                draft.maxSize = e.target.value
                                return
                            })}
                            placeholder="ej. 2GB o 10GiB"
                        />
                    </div>
                </div>
            </div>

            <ProvidersFieldControlled />

            <div className="border rounded-[--radius] p-4 relative !mt-8 space-y-3">
                <div className="absolute -top-2.5 tracking-wide font-semibold uppercase text-sm left-4 bg-gray-950 px-2">{t("autoDownloader.profileForm.delay")}</div>
                <p className="text-sm text-[--muted]">
                    {t("autoDownloader.profileForm.delayHelp")}
                </p>
                <div className="space-y-2">
                    <label className="text-sm font-medium">{t("autoDownloader.profileForm.delayMinutes")}</label>
                    <NumberInput
                        value={formData.delayMinutes}
                        onValueChange={(v) => setFormData(draft => {
                            draft.delayMinutes = v || 0
                            return
                        })}
                        placeholder="0"
                        min={0}
                        formatOptions={{ useGrouping: false }}
                        rightAddon={t("autoDownloader.settings.minutes")}
                        help={t("autoDownloader.profileForm.delayMinutesHelp")}
                    />
                </div>
                {formData.delayMinutes > 0 && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t("autoDownloader.profileForm.skipDelayScore")}</label>
                        <NumberInput
                            value={formData.skipDelayScore}
                            onValueChange={(v) => setFormData(draft => {
                                draft.skipDelayScore = v || 0
                                return
                            })}
                            placeholder="0"
                            formatOptions={{ useGrouping: false }}
                            help={t("autoDownloader.profileForm.skipDelayScoreHelp")}
                        />
                        <p className="text-sm text-[--muted]"></p>
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    intent={profile ? "primary" : "success"}
                    loading={creating || updating}
                >
                    {profile ? t("autoDownloader.profileForm.update") : t("autoDownloader.profileForm.create")}
                </Button>
            </div>
        </form>
    )
}

function ReleaseGroupsSortableField() {
    const [formData, setFormData] = useAtom(formDataAtom)
    const releaseGroups = formData.releaseGroups

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (active.id !== over?.id) {
            const oldIndex = releaseGroups.findIndex(item => item.id === active.id)
            const newIndex = releaseGroups.findIndex(item => item.id === over?.id)

            setFormData(draft => {
                const [movedItem] = draft.releaseGroups.splice(oldIndex, 1)
                draft.releaseGroups.splice(newIndex, 0, movedItem)
                return
            })
        }
    }

    const handleAdd = (value: string) => {
        setFormData(draft => {
            draft.releaseGroups.push({
                id: `releaseGroup-${Date.now()}-${Math.random()}`,
                value,
            })
            return
        })
    }

    const handleRemove = (id: string) => {
        setFormData(draft => {
            const index = draft.releaseGroups.findIndex(rg => rg.id === id)
            if (index !== -1) {
                draft.releaseGroups.splice(index, 1)
            }
            return
        })
    }

    const handleUpdate = (id: string, value: string) => {
        setFormData(draft => {
            const index = draft.releaseGroups.findIndex(rg => rg.id === id)
            if (index !== -1) {
                draft.releaseGroups[index].value = value
            }
            return
        })
    }

    const suggestions = [
        "SubsPlease",
        "Erai-raws",
        "VARYG",
        "EMBER",
        "Judas",
        "ASW",
        "Tsundere-Raws",
    ]

    return (
        <div className="border rounded-[--radius] p-4 relative !mt-8 space-y-3">
            <div className="absolute -top-2.5 tracking-wide font-semibold uppercase text-sm left-4 bg-gray-950 px-2">{t("autoDownloader.profileForm.releaseGroups")}</div>
            <p className="text-sm text-[--muted]">
                {t("autoDownloader.profileForm.releaseGroupsHelp")}
            </p>

            <div className="flex flex-wrap gap-2 mb-2">
                {suggestions.map((suggestion) => (
                    <Button
                        key={suggestion}
                        intent="gray-subtle"
                        size="sm"
                        className="rounded-full"
                        onClick={() => handleAdd(suggestion)}
                        disabled={releaseGroups.some(rg => rg.value === suggestion)}
                        type="button"
                    >
                        {suggestion}
                    </Button>
                ))}
            </div>

            <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
                <SortableContext strategy={verticalListSortingStrategy} items={releaseGroups.map(rg => rg.id)}>
                    <div className="space-y-2">
                        {releaseGroups.map((item) => (
                            <SortableItem key={item.id} id={item.id}>
                                <div className="flex gap-2 items-center w-full">
                                    <TextInput
                                        value={item.value}
                                        onChange={(e) => handleUpdate(item.id, e.target.value)}
                                        className="flex-1"
                                    />
                                    <IconButton
                                        icon={<BiTrash />}
                                        intent="alert-basic"
                                        size="sm"
                                        onClick={() => handleRemove(item.id)}
                                        type="button"
                                    />
                                </div>
                            </SortableItem>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        <Button
            intent="success-subtle"
            leftIcon={<BiPlus />}
            onClick={() => handleAdd("")}
            size="sm"
            type="button"
        >
            {t("autoDownloader.profileForm.addReleaseGroup")}
        </Button>
    </div>
)
}

function ResolutionsSortableField() {
    const [formData, setFormData] = useAtom(formDataAtom)
    const resolutions = formData.resolutions

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (active.id !== over?.id) {
            const oldIndex = resolutions.findIndex(item => item.id === active.id)
            const newIndex = resolutions.findIndex(item => item.id === over?.id)

            setFormData(draft => {
                const [movedItem] = draft.resolutions.splice(oldIndex, 1)
                draft.resolutions.splice(newIndex, 0, movedItem)
                return
            })
        }
    }

    const handleAdd = (value: string) => {
        setFormData(draft => {
            draft.resolutions.push({
                id: `resolution-${Date.now()}-${Math.random()}`,
                value,
            })
            return
        })
    }

    const handleRemove = (id: string) => {
        setFormData(draft => {
            const index = draft.resolutions.findIndex(r => r.id === id)
            if (index !== -1) {
                draft.resolutions.splice(index, 1)
            }
            return
        })
    }

    const handleUpdate = (id: string, value: string) => {
        setFormData(draft => {
            const index = draft.resolutions.findIndex(r => r.id === id)
            if (index !== -1) {
                draft.resolutions[index].value = value
            }
            return
        })
    }

    const suggestions = ["2160p", "1080p", "720p", "540p", "480p"]

    return (
        <div className="border rounded-[--radius] p-4 relative !mt-8 space-y-3">
            <div className="absolute -top-2.5 tracking-wide font-semibold uppercase text-sm left-4 bg-gray-950 px-2">{t("autoDownloader.profileForm.resolutions")}</div>
            <p className="text-sm text-[--muted]">
                {t("autoDownloader.profileForm.resolutionsHelp")}
            </p>

            <div className="flex flex-wrap gap-2 mb-2">
                {suggestions.map((suggestion) => (
                    <Button
                        key={suggestion}
                        intent="gray-subtle"
                        size="sm"
                        className="rounded-full"
                        onClick={() => handleAdd(suggestion)}
                        disabled={resolutions.some(r => r.value === suggestion)}
                        type="button"
                    >
                        {suggestion}
                    </Button>
                ))}
            </div>

            <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
                <SortableContext strategy={verticalListSortingStrategy} items={resolutions.map(r => r.id)}>
                    <div className="space-y-2">
                        {resolutions.map((item) => (
                            <SortableItem key={item.id} id={item.id}>
                                <div className="flex gap-2 items-center w-full">
                                    <TextInput
                                        value={item.value}
                                        onChange={(e) => handleUpdate(item.id, e.target.value)}
                                        className="flex-1"
                                    />
                                    <IconButton
                                        icon={<BiTrash />}
                                        intent="alert-basic"
                                        onClick={() => handleRemove(item.id)}
                                        type="button"
                                        size="sm"
                                    />
                                </div>
                            </SortableItem>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        <Button
            intent="success-subtle"
            leftIcon={<BiPlus />}
            onClick={() => handleAdd("")}
            size="sm"
            type="button"
        >
            {t("autoDownloader.profileForm.addResolution")}
        </Button>
    </div>
)
}

function ConditionsSortableField() {
    const [formData, setFormData] = useAtom(formDataAtom)
    const conditions = formData.conditions

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (active.id !== over?.id) {
            const oldIndex = conditions.findIndex((item) => item.id === active.id)
            const newIndex = conditions.findIndex((item) => item.id === over?.id)

            setFormData(draft => {
                const [movedItem] = draft.conditions.splice(oldIndex, 1)
                draft.conditions.splice(newIndex, 0, movedItem)
                return
            })
        }
    }

    const handleAppend = () => {
        const newCondition: ConditionType = {
            id: `condition-${Date.now()}-${Math.random()}`,
            term: "",
            isRegex: false,
            action: "score",
            score: 0,
        }
        setFormData(draft => {
            draft.conditions.push(newCondition)
            return
        })
    }

    const handleRemove = (id: string) => {
        setFormData(draft => {
            const index = draft.conditions.findIndex(c => c.id === id)
            if (index !== -1) {
                draft.conditions.splice(index, 1)
            }
            return
        })
    }

    const handleUpdateField = <K extends keyof ConditionType>(id: string, fieldName: K, value: ConditionType[K]) => {
        setFormData(draft => {
            const condition = draft.conditions.find(c => c.id === id)
            if (condition) {
                condition[fieldName] = value
            }
            return
        })
    }

    return (
        <div className="border rounded-[--radius] p-4 relative !mt-8 space-y-3">
            <div className="absolute -top-2.5 tracking-wide font-semibold uppercase text-sm left-4 bg-gray-950 px-2">{t("autoDownloader.profileForm.conditions")}</div>
            <p className="text-sm text-[--muted]">
                {t("autoDownloader.profileForm.conditionsHelp")}
            </p>

            <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
                <SortableContext strategy={verticalListSortingStrategy} items={conditions.map((c) => c.id)}>
                    <div className="space-y-2">
                        {conditions.map((field) => (
                            <ConditionItem
                                key={field.id}
                                field={field}
                                onUpdateField={handleUpdateField}
                                onRemove={() => handleRemove(field.id)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        <Button
            intent="success-subtle"
            leftIcon={<BiPlus />}
            onClick={handleAppend}
            size="sm"
            type="button"
        >
            {t("autoDownloader.profileForm.addCondition")}
        </Button>
    </div>
)
}

type ConditionItemProps = {
    field: ConditionType
    onUpdateField: <K extends keyof ConditionType>(id: string, fieldName: K, value: ConditionType[K]) => void
    onRemove: () => void
}

function ConditionItem(props: ConditionItemProps) {
    const { field, onUpdateField, onRemove } = props

    return (
        <SortableItem id={field.id}>
            <div className="space-y-2 w-full">
                <TextInput
                    value={field.term}
                    onChange={(e) => onUpdateField(field.id, "term", e.target.value)}
                    placeholder="ej. Blu-Ray, BluRay o \b(grupo)\i"
                    className="w-full"
                    help={t("autoDownloader.profileForm.regexHelp")}
                />
                <div className="space-y-2">
                    <div className="flex items-center gap-6 flex-wrap">
                        <Select
                            value={field.action}
                            onValueChange={(value) => onUpdateField(field.id, "action", value)}
                            options={[
                                { label: t("autoDownloader.profileForm.score"), value: "score" },
                                { label: t("autoDownloader.profileForm.block"), value: "block" },
                                { label: t("autoDownloader.profileForm.require"), value: "require" },
                            ]}
                            label={`${t("autoDownloader.profileForm.action")}`}
                            fieldClass="!flex !items-center gap-2 w-fit"
                            labelProps={{ className: "items-center text-sm font-semibold pt-1" }}
                            className="w-32"
                        />
                        {field.action === "score" && (
                            <NumberInput
                                value={field.score}
                                onValueChange={(v) => onUpdateField(field.id, "score", v || 0)}
                                placeholder={t("autoDownloader.scoreValue")}
                                label={`${t("autoDownloader.scoreValue")}:`}
                                fieldClass="!flex !items-center gap-2 w-fit"
                                labelProps={{ className: "items-center text-sm font-semibold pt-1" }}
                                className="w-32"
                                formatOptions={{ useGrouping: false }}
                                min={-999999}
                                max={999999}
                            />
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <Checkbox
                            value={field.isRegex}
                            onValueChange={(value) => onUpdateField(field.id, "isRegex", !!value)}
                            label={t("autoDownloader.profileForm.regex")}
                        />
                        <IconButton
                            icon={<BiTrash />}
                            intent="alert-basic"
                            onClick={onRemove}
                            size="sm"
                            type="button"
                        />
                    </div>
                </div>
            </div>
        </SortableItem>
    )
}

function SortableItem({ id, children }: { id: string, children: React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 bg-gray-900 p-2 rounded-lg">
            <IconButton
                {...attributes}
                {...listeners}
                icon={<BiMenu />}
                size="sm"
                intent="gray-basic"
                className="cursor-grab active:cursor-grabbing"
            />
            {children}
        </div>
    )
}

function ProvidersFieldControlled() {
    const [formData, setFormData] = useAtom(formDataAtom)
    const { data: extensions } = useAnimeListTorrentProviderExtensions()

    return (
        <div className="border rounded-[--radius] p-4 relative !mt-8 space-y-3">
            <div className="absolute -top-2.5 tracking-wide font-semibold uppercase text-sm left-4 bg-gray-950 px-2">{t("autoDownloader.profileForm.providers")}</div>
            <p className="text-sm text-[--muted]">
                {t("autoDownloader.profileForm.providersHelp")}
            </p>
            <Combobox
                value={formData.providers}
                onValueChange={(value) => setFormData(draft => {
                    draft.providers = value
                    return
                })}
                options={extensions?.map(ext => ({
                    label: ext.name,
                    textValue: ext.name,
                    value: ext.id,
                })) ?? []}
                multiple
                label={t("autoDownloader.profileForm.selectProviders")}
                emptyMessage={t("autoDownloader.profileForm.noProvidersFound")}
            />
        </div>
    )
}

