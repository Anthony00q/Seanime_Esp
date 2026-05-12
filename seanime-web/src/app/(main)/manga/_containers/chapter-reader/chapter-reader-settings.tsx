import { useMangaPageZoomControls } from "@/app/(main)/manga/_lib/handle-chapter-reader"
import {
    __manga_doublePageOffsetAtom,
    __manga_entryReaderSettings,
    __manga_hiddenBarAtom,
    __manga_kbsChapterLeft,
    __manga_kbsChapterRight,
    __manga_kbsPageLeft,
    __manga_kbsPageRight,
    __manga_pageFitAtom,
    __manga_pageGapAtom,
    __manga_pageGapShadowAtom,
    __manga_pageOverflowContainerWidthAtom,
    __manga_pageStretchAtom,
    __manga_readerProgressBarAtom,
    __manga_readingDirectionAtom,
    __manga_readingModeAtom,
    MANGA_DEFAULT_KBS,
    MANGA_KBS_ATOM_KEYS,
    MANGA_PAGE_ZOOM_DEFAULT,
    MANGA_PAGE_ZOOM_MAX,
    MANGA_PAGE_ZOOM_MIN,
    MANGA_PAGE_ZOOM_STEP,
    MANGA_SETTINGS_ATOM_KEYS,
    MangaPageFit,
    MangaPageStretch,
    MangaReadingDirection,
    MangaReadingMode,
} from "@/app/(main)/manga/_lib/manga-chapter-reader.atoms"
import { Button, IconButton } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/components/ui/core/styling"
import { Drawer } from "@/components/ui/drawer"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { NumberInput } from "@/components/ui/number-input"
import { RadioGroup } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { atom } from "jotai"
import { useAtom } from "jotai/react"
import React, { useState } from "react"
import { AiOutlineColumnHeight, AiOutlineColumnWidth } from "react-icons/ai"
import { BiCog } from "react-icons/bi"
import { FaRedo, FaRegImage } from "react-icons/fa"
import { GiResize } from "react-icons/gi"
import { LuSettings } from "react-icons/lu"
import { MdMenuBook, MdOutlinePhotoSizeSelectLarge } from "react-icons/md"
import { PiArrowCircleLeftDuotone, PiArrowCircleRightDuotone, PiReadCvLogoLight, PiScrollDuotone } from "react-icons/pi"
import { TbArrowAutofitHeight } from "react-icons/tb"
import { createTranslator } from "@/locales"
import { useWindowSize } from "react-use"
import { toast } from "sonner"

const t = createTranslator("es")

export type ChapterReaderSettingsProps = {
    mediaId: number
}

const radioGroupClasses = {
    itemClass: cn(
        "border-transparent absolute top-2 right-2 bg-transparent dark:bg-transparent dark:data-[state=unchecked]:bg-transparent",
        "data-[state=unchecked]:bg-transparent data-[state=unchecked]:hover:bg-transparent dark:data-[state=unchecked]:hover:bg-transparent",
        "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent",
    ),
    stackClass: "space-y-0 flex flex-wrap lg:flex-nowrap lg:flex-row gap-2",
    itemIndicatorClass: "hidden",
    itemLabelClass: "font-normal tracking-wide line-clamp-1 truncate flex flex-col items-center data-[state=checked]:text-[--gray] cursor-pointer",
    itemContainerClass: cn(
        "items-start cursor-pointer transition border-transparent rounded-[--radius] py-1.5 px-3 w-full",
        "hover:bg-[--subtle] dark:bg-gray-900",
        "data-[state=checked]:bg-white dark:data-[state=unchecked]:hover:bg-gray-800 dark:data-[state=checked]:bg-gray-900",
        "focus:ring-2 ring-transparent dark:ring-transparent outline-none ring-offset-1 ring-offset-[--background] focus-within:ring-2 transition",
        "border border-transparent data-[state=checked]:border-gray-500 data-[state=checked]:ring-offset-0",
    ),
}

export const MANGA_READING_MODE_ICONS = {
    [MangaReadingMode.LONG_STRIP]: <PiScrollDuotone className="text-xl" />,
    [MangaReadingMode.PAGED]: <PiReadCvLogoLight className="text-xl" />,
    [MangaReadingMode.DOUBLE_PAGE]: <MdMenuBook className="text-xl" />,
}

export const MANGA_READING_MODE_OPTIONS = [
    {
        value: MangaReadingMode.LONG_STRIP,
        label: <span className="flex gap-2 items-center"><PiScrollDuotone className="text-xl" /> <span>{t("manga.readingModes.longStrip")}</span></span>,
    },
    {
        value: MangaReadingMode.PAGED,
        label: <span className="flex gap-2 items-center"><PiReadCvLogoLight className="text-xl" /> <span>{t("manga.readingModes.singlePage")}</span></span>,
    },
    {
        value: MangaReadingMode.DOUBLE_PAGE,
        label: <span className="flex gap-2 items-center"><MdMenuBook className="text-xl" /> <span>{t("manga.readingModes.doublePage")}</span></span>,
    },
]

export const MANGA_READING_DIRECTION_ICONS = {
    [MangaReadingDirection.LTR]: <PiArrowCircleRightDuotone className="text-2xl" />,
    [MangaReadingDirection.RTL]: <PiArrowCircleLeftDuotone className="text-2xl" />,
}

export const MANGA_READING_DIRECTION_OPTIONS = [
    {
        value: MangaReadingDirection.LTR,
        label: <span className="flex gap-2 items-center"><span>{t("manga.readingDirections.leftToRight")}</span> <PiArrowCircleRightDuotone className="text-2xl" /></span>,
    },
    {
        value: MangaReadingDirection.RTL,
        label: <span className="flex gap-2 items-center"><PiArrowCircleLeftDuotone className="text-2xl" /> <span>{t("manga.readingDirections.rightToLeft")}</span></span>,
    },
]

export const MANGA_PAGE_FIT_ICONS = {
    [MangaPageFit.CONTAIN]: <AiOutlineColumnHeight className="text-xl" />,
    [MangaPageFit.LARGER]: <TbArrowAutofitHeight className="text-xl" />,
    [MangaPageFit.COVER]: <AiOutlineColumnWidth className="text-xl" />,
    [MangaPageFit.TRUE_SIZE]: <FaRegImage className="text-xl" />,
}

export const MANGA_PAGE_FIT_OPTIONS = [
    {
        value: MangaPageFit.CONTAIN,
        label: <span className="flex gap-2 items-center"><AiOutlineColumnHeight className="text-xl" /> <span>{t("manga.pageFit.contain")}</span></span>,
    },
    {
        value: MangaPageFit.LARGER,
        label: <span className="flex gap-2 items-center"><TbArrowAutofitHeight className="text-xl" /> <span>{t("manga.pageFit.overflow")}</span></span>,
    },
    {
        value: MangaPageFit.COVER,
        label: <span className="flex gap-2 items-center"><AiOutlineColumnWidth className="text-xl" /> <span>{t("manga.pageFit.cover")}</span></span>,
    },
    {
        value: MangaPageFit.TRUE_SIZE,
        label: <span className="flex gap-2 items-center"><FaRegImage className="text-xl" /> <span>{t("manga.pageFit.trueSize")}</span></span>,
    },
]

export const MANGA_PAGE_STRETCH_ICONS = {
    [MangaPageStretch.NONE]: <MdOutlinePhotoSizeSelectLarge className="text-xl" />,
    [MangaPageStretch.STRETCH]: <GiResize className="text-xl" />,
}

export const MANGA_PAGE_STRETCH_OPTIONS = [
    {
        value: MangaPageStretch.NONE,
        label: <span className="flex gap-2 items-center"><MdOutlinePhotoSizeSelectLarge className="text-xl" /> <span>{t("manga.pageStretch.none")}</span></span>,
    },
    {
        value: MangaPageStretch.STRETCH,
        label: <span className="flex gap-2 items-center"><GiResize className="text-xl" /> <span>{t("manga.pageStretch.stretch")}</span></span>,
    },
]


export const __manga__readerSettingsDrawerOpen = atom(false)

export function ChapterReaderSettings(props: ChapterReaderSettingsProps) {

    const {
        mediaId,
        ...rest
    } = props

    const [readingDirection, setReadingDirection] = useAtom(__manga_readingDirectionAtom)
    const [readingMode, setReadingMode] = useAtom(__manga_readingModeAtom)
    const [pageFit, setPageFit] = useAtom(__manga_pageFitAtom)
    const [pageStretch, setPageStretch] = useAtom(__manga_pageStretchAtom)
    const [pageGap, setPageGap] = useAtom(__manga_pageGapAtom)
    const [pageGapShadow, setPageGapShadow] = useAtom(__manga_pageGapShadowAtom)
    const [doublePageOffset, setDoublePageOffset] = useAtom(__manga_doublePageOffsetAtom)
    const [pageOverflowContainerWidth, setPageOverflowContainerWidth] = useAtom(__manga_pageOverflowContainerWidthAtom)
    const { pageZoom, setZoom, resetZoom } = useMangaPageZoomControls()
    //---
    const [readerProgressBar, setReaderProgressBar] = useAtom(__manga_readerProgressBarAtom)
    const [hiddenBar, setHideBar] = useAtom(__manga_hiddenBarAtom)

    const { width } = useWindowSize()
    const isMobile = width < 950

    const defaultSettings = React.useMemo(() => {
        if (isMobile) {
            return {
                [MangaReadingMode.LONG_STRIP]: {
                    pageFit: MangaPageFit.COVER,
                    pageStretch: MangaPageStretch.NONE,
                },
                [MangaReadingMode.PAGED]: {
                    pageFit: MangaPageFit.CONTAIN,
                    pageStretch: MangaPageStretch.NONE,
                },
                [MangaReadingMode.DOUBLE_PAGE]: {
                    pageFit: MangaPageFit.CONTAIN,
                    pageStretch: MangaPageStretch.NONE,
                },
            }
        } else {
            return {
                [MangaReadingMode.LONG_STRIP]: {
                    pageFit: MangaPageFit.LARGER,
                    pageStretch: MangaPageStretch.NONE,
                },
                [MangaReadingMode.PAGED]: {
                    pageFit: MangaPageFit.CONTAIN,
                    pageStretch: MangaPageStretch.NONE,
                },
                [MangaReadingMode.DOUBLE_PAGE]: {
                    pageFit: MangaPageFit.CONTAIN,
                    pageStretch: MangaPageStretch.NONE,
                },
            }
        }
    }, [isMobile])

    /**
     * Remember settings for current media
     */
    const [entrySettings, setEntrySettings] = useAtom(__manga_entryReaderSettings)

    const mounted = React.useRef(false)
    React.useEffect(() => {
        if (!mounted.current) {
            if (entrySettings[mediaId]) {
                const settings = entrySettings[mediaId]
                setReadingDirection(settings[MANGA_SETTINGS_ATOM_KEYS.readingDirection])
                setReadingMode(settings[MANGA_SETTINGS_ATOM_KEYS.readingMode])
                setPageFit(settings[MANGA_SETTINGS_ATOM_KEYS.pageFit])
                setPageStretch(settings[MANGA_SETTINGS_ATOM_KEYS.pageStretch])
                setPageGap(settings[MANGA_SETTINGS_ATOM_KEYS.pageGap])
                setPageGapShadow(settings[MANGA_SETTINGS_ATOM_KEYS.pageGapShadow])
                setDoublePageOffset(settings[MANGA_SETTINGS_ATOM_KEYS.doublePageOffset])
                setPageOverflowContainerWidth(settings[MANGA_SETTINGS_ATOM_KEYS.overflowPageContainerWidth])
            }
        }
        mounted.current = true
    }, [entrySettings[mediaId]])

    React.useEffect(() => {
        setEntrySettings(prev => ({
            ...prev,
            [mediaId]: {
                [MANGA_SETTINGS_ATOM_KEYS.readingDirection]: readingDirection,
                [MANGA_SETTINGS_ATOM_KEYS.readingMode]: readingMode,
                [MANGA_SETTINGS_ATOM_KEYS.pageFit]: pageFit,
                [MANGA_SETTINGS_ATOM_KEYS.pageStretch]: pageStretch,
                [MANGA_SETTINGS_ATOM_KEYS.pageGap]: pageGap,
                [MANGA_SETTINGS_ATOM_KEYS.pageGapShadow]: pageGapShadow,
                [MANGA_SETTINGS_ATOM_KEYS.doublePageOffset]: doublePageOffset,
                [MANGA_SETTINGS_ATOM_KEYS.overflowPageContainerWidth]: pageOverflowContainerWidth,
            },
        }))
    }, [readingDirection, readingMode, pageFit, pageStretch, pageGap, pageGapShadow, doublePageOffset, pageOverflowContainerWidth])

    const [kbsChapterLeft, setKbsChapterLeft] = useAtom(__manga_kbsChapterLeft)
    const [kbsChapterRight, setKbsChapterRight] = useAtom(__manga_kbsChapterRight)
    const [kbsPageLeft, setKbsPageLeft] = useAtom(__manga_kbsPageLeft)
    const [kbsPageRight, setKbsPageRight] = useAtom(__manga_kbsPageRight)

    const isDefaultSettings =
        pageFit === defaultSettings[readingMode].pageFit &&
        pageStretch === defaultSettings[readingMode].pageStretch

    const resetKeyDefault = React.useCallback((key: string) => {
        switch (key) {
            case MANGA_KBS_ATOM_KEYS.kbsChapterLeft:
                setKbsChapterLeft(MANGA_DEFAULT_KBS[key])
                break
            case MANGA_KBS_ATOM_KEYS.kbsChapterRight:
                setKbsChapterRight(MANGA_DEFAULT_KBS[key])
                break
            case MANGA_KBS_ATOM_KEYS.kbsPageLeft:
                setKbsPageLeft(MANGA_DEFAULT_KBS[key])
                break
            case MANGA_KBS_ATOM_KEYS.kbsPageRight:
                setKbsPageRight(MANGA_DEFAULT_KBS[key])
                break
        }
    }, [])

    const resetKbsDefaultIfConflict = (currentKey: string, value: string) => {
        for (const key of Object.values(MANGA_KBS_ATOM_KEYS)) {
            if (key !== currentKey) {
                const otherValue = {
                    [MANGA_KBS_ATOM_KEYS.kbsChapterLeft]: kbsChapterLeft,
                    [MANGA_KBS_ATOM_KEYS.kbsChapterRight]: kbsChapterRight,
                    [MANGA_KBS_ATOM_KEYS.kbsPageLeft]: kbsPageLeft,
                    [MANGA_KBS_ATOM_KEYS.kbsPageRight]: kbsPageRight,
                }[key]
                if (otherValue === value) {
                    resetKeyDefault(key)
                }
            }
        }
    }

    const setKbs = (e: React.KeyboardEvent, kbs: string) => {
        e.preventDefault()
        e.stopPropagation()

        const specialKeys = ["Control", "Shift", "Meta", "Command", "Alt", "Option"]
        if (!specialKeys.includes(e.key)) {
            const keyStr = `${e.metaKey ? "meta+" : ""}${e.ctrlKey ? "ctrl+" : ""}${e.altKey ? "alt+" : ""}${e.shiftKey
                ? "shift+"
                : ""}${e.key.toLowerCase()
                .replace("arrow", "")
                .replace("insert", "ins")
                .replace("delete", "del")
                .replace(" ", "space")
                .replace("+", "plus")}`

            const kbsSetter = {
                [MANGA_KBS_ATOM_KEYS.kbsChapterLeft]: setKbsChapterLeft,
                [MANGA_KBS_ATOM_KEYS.kbsChapterRight]: setKbsChapterRight,
                [MANGA_KBS_ATOM_KEYS.kbsPageLeft]: setKbsPageLeft,
                [MANGA_KBS_ATOM_KEYS.kbsPageRight]: setKbsPageRight,
            }

            kbsSetter[kbs]?.(keyStr)
            resetKbsDefaultIfConflict(kbs, keyStr)
        }
    }

    /**
     * Disabled double page on small screens
     */
    React.useEffect(() => {
        if (readingMode === MangaReadingMode.DOUBLE_PAGE && width < 950) {
            setReadingMode(prev => {
                toast.error(t("manga.doublePageModeNotSupported"))
                return MangaReadingMode.LONG_STRIP
            })
        }
    }, [width, readingMode])

    function handleSetReadingMode(mode: string) {
        if (mode === MangaReadingMode.DOUBLE_PAGE && width < 950) {
            toast.error(t("manga.doublePageModeNotSupported"))
            return
        }
        setReadingMode(mode)
    }

    const [open, setOpen] = useAtom(__manga__readerSettingsDrawerOpen)
    const [fullscreen, setFullscreen] = useState(false)

    function handleFullscreen() {
        const el = document.documentElement
        if (fullscreen && document.exitFullscreen) {
            document.exitFullscreen()
            setFullscreen(false)
        } else if (!fullscreen) {
            if (el.requestFullscreen) {
                el.requestFullscreen()
            } else if ((el as any).webkitRequestFullscreen) {
                (el as any).webkitRequestFullscreen()
            } else if ((el as any).msRequestFullscreen) {
                (el as any).msRequestFullscreen()
            }
            setFullscreen(true)
        }
    }

    return (
        <>
            <DropdownMenu
                trigger={<IconButton
                    data-chapter-reader-settings-dropdown-menu-trigger
                    icon={<LuSettings />}
                    intent="gray-basic"
                    className="flex lg:hidden"
                    tabIndex={-1}
                />}
                className="block lg:hidden"
                data-chapter-reader-settings-dropdown-menu
            >
                <DropdownMenuItem
                    onClick={() => setOpen(true)}
                >{t("manga.chapterReader.openSettings")}</DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleFullscreen}
                >{t("manga.chapterReader.toggleFullscreen")}</DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setHideBar((prev) => !prev)}
                >{hiddenBar ? t("manga.chapterReader.showBar") : t("manga.chapterReader.hideBar")}</DropdownMenuItem>
            </DropdownMenu>

            <Drawer
                trigger={
                    <IconButton
                        icon={<BiCog />}
                        intent="gray-basic"
                        className="hidden lg:flex"
                    />
                }
                title={t("manga.chapterReader.settings")}
                allowOutsideInteraction={false}
                open={open}
                onOpenChange={setOpen}
                size="lg"
                contentClass="z-[51] bg-gray-950/80 firefox:bg-opacity-100 firefox:backdrop-blur-none"
                data-chapter-reader-settings-drawer
            >
                <div className="space-y-4 py-4" data-chapter-reader-settings-drawer-content>

                    <Card className="p-4 space-y-4">
                        <RadioGroup
                            {...radioGroupClasses}
                            label={t("manga.chapterReader.readingMode")}
                            options={MANGA_READING_MODE_OPTIONS}
                            value={readingMode}
                            onValueChange={(value) => handleSetReadingMode(value)}
                        />

                        <div
                            className={cn(
                                readingMode !== MangaReadingMode.DOUBLE_PAGE && "hidden",
                            )}
                        >
                            <NumberInput
                                label={t("manga.chapterReader.offset")}
                                value={doublePageOffset}
                                onValueChange={(value) => setDoublePageOffset(value)}
                            />
                        </div>

                        <RadioGroup
                            {...radioGroupClasses}
                            label={t("manga.chapterReader.pageFit")}
                            options={MANGA_PAGE_FIT_OPTIONS}
                            value={pageFit}
                            onValueChange={(value) => setPageFit(value)}
                            // help={<>
                            //     <p>'Contain': Fit Height</p>
                            //     <p>'Overflow': Height overflow</p>
                            //     <p>'Cover': Fit Width</p>
                            //     <p>'True Size': No scaling, raw sizes</p>
                            // </>}
                        />

                        <div className="flex gap-2 items-end">
                            <NumberInput
                                label="Zoom"
                                max={MANGA_PAGE_ZOOM_MAX * 100}
                                min={MANGA_PAGE_ZOOM_MIN * 100}
                                step={MANGA_PAGE_ZOOM_STEP * 100}
                                rightAddon="%"
                                value={Math.round(pageZoom * 100)}
                                onValueChange={(value) => setZoom(value / 100)}
                                allowMouseWheel={false}
                            />
                            <Button
                                size="sm"
                                className="rounded-full mb-1"
                                intent="gray-outline"
                                disabled={pageZoom === MANGA_PAGE_ZOOM_DEFAULT}
                                onClick={resetZoom}
                            >
                                Reset
                            </Button>
                        </div>

                        {
                            pageFit === MangaPageFit.LARGER && (
                                <NumberInput
                                    label={t("manga.chapterReader.pageContainerWidth")}
                                    max={100}
                                    min={0}
                                    rightAddon="%"
                                    value={pageOverflowContainerWidth}
                                    onValueChange={(value) => setPageOverflowContainerWidth(value)}
                                    disabled={readingMode === MangaReadingMode.DOUBLE_PAGE}
                                />
                            )
                        }

                        <div
                            className={cn(
                                (readingMode !== MangaReadingMode.LONG_STRIP || (pageFit !== MangaPageFit.LARGER && pageFit !== MangaPageFit.CONTAIN)) && "opacity-50 pointer-events-none",
                            )}
                        >
                            <RadioGroup
                                {...radioGroupClasses}
                                label={t("manga.chapterReader.pageStretch")}
                                options={MANGA_PAGE_STRETCH_OPTIONS}
                                value={pageStretch}
                                onValueChange={(value) => setPageStretch(value)}
                                help={t("manga.chapterReader.stretchHelp")}
                            />
                        </div>

                        <Button
                            size="sm" className="rounded-full w-full" intent="white-subtle"
                            disabled={isDefaultSettings}
                            onClick={() => {
                                setPageFit(defaultSettings[readingMode].pageFit)
                                setPageStretch(defaultSettings[readingMode].pageStretch)
                            }}
                        >
                            <span className="flex flex-none items-center">
                                {t("manga.chapterReader.resetDefaults")}
                                for <span className="w-2"></span> {readingMode === MangaReadingMode.LONG_STRIP ? t("manga.readingModes.longStrip") : readingMode === MangaReadingMode.PAGED ? t("manga.readingModes.singlePage") : t("manga.readingModes.doublePage")}
                            </span>
                        </Button>
                    </Card>


                    <Card className="p-4 space-y-4">
                        <div className="flex gap-4 flex-wrap items-center">
                            <Switch
                                label={t("manga.chapterReader.pageGap")}
                                value={pageGap}
                                onValueChange={setPageGap}
                                fieldClass="w-fit"
                                size="sm"
                            />
                            <Switch
                                label={t("manga.chapterReader.pageGapShadow")}
                                value={pageGapShadow}
                                onValueChange={setPageGapShadow}
                                fieldClass="w-fit"
                                disabled={!pageGap}
                                size="sm"
                            />
                        </div>
                        <div
                            className={cn(
                                readingMode === MangaReadingMode.LONG_STRIP && "opacity-30 pointer-events-none",
                            )}
                        >
                            <RadioGroup
                                {...radioGroupClasses}
                                label={t("manga.chapterReader.readingDirection")}
                                options={MANGA_READING_DIRECTION_OPTIONS}
                                value={readingDirection}
                                onValueChange={(value) => setReadingDirection(value)}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Switch
                                label={t("manga.chapterReader.progressBar")}
                                value={readerProgressBar}
                                onValueChange={setReaderProgressBar}
                                fieldClass="w-fit"
                                size="sm"
                            />
                        </div>
                    </Card>


                    {!isMobile && (<Card className="p-4 space-y-4">

                        <>
                            <div>
                                <h4>{t("manga.chapterReader.editableKeybinds")}</h4>
                                <p className="text-[--muted] text-xs">{t("manga.chapterReader.clickToEdit")}</p>
                            </div>

                            {[
                                {
                                    key: MANGA_KBS_ATOM_KEYS.kbsChapterLeft,
                                    label: readingDirection === MangaReadingDirection.LTR ? t("manga.chapterReader.previousChapter") : t("manga.chapterReader.nextChapter"),
                                    value: kbsChapterLeft,
                                },
                                {
                                    key: MANGA_KBS_ATOM_KEYS.kbsChapterRight,
                                    label: readingDirection === MangaReadingDirection.LTR ? t("manga.chapterReader.nextChapter") : t("manga.chapterReader.previousChapter"),
                                    value: kbsChapterRight,
                                },
                                {
                                    key: MANGA_KBS_ATOM_KEYS.kbsPageLeft,
                                    label: readingDirection === MangaReadingDirection.LTR ? t("manga.chapterReader.previousPage") : t("manga.chapterReader.nextPage"),
                                    value: kbsPageLeft,
                                },
                                {
                                    key: MANGA_KBS_ATOM_KEYS.kbsPageRight,
                                    label: readingDirection === MangaReadingDirection.LTR ? t("manga.chapterReader.nextPage") : t("manga.chapterReader.previousPage"),
                                    value: kbsPageRight,
                                },
                            ].map(item => {
                                return (
                                    <div className="flex gap-2 items-center" key={item.key}>
                                        <div className="">
                                            <Button
                                                onKeyDownCapture={(e) => setKbs(e, item.key)}
                                                className="focus:ring-2 focus:ring-[--brand] focus:ring-offset-1 focus-visible:ring-2 focus-visible:ring-[--brand] focus-visible:ring-offset-1"
                                                size="sm"
                                                intent="primary-subtle"
                                                id={`chapter-reader-settings-kbs-${item.key}`}
                                                onClick={() => {
                                                    const el = document.getElementById(`chapter-reader-settings-kbs-${item.key}`)
                                                    if (el) {
                                                        el.focus()
                                                    }
                                                }}
                                            >
                                                {item.value}
                                            </Button>
                                        </div>
                                        <label className="text-[--gray]">
                                            <span className="font-semibold">{item.label}</span>
                                            {/*{!!item.help && <span className="ml-2 text-[--muted]">({item.help})</span>}*/}
                                        </label>
                                        {
                                            item.value !== (MANGA_DEFAULT_KBS as any)[item.key] && (
                                                <Button
                                                    onClick={() => {
                                                        resetKeyDefault(item.key)
                                                    }}
                                                    className="rounded-full"
                                                    size="sm"
                                                    intent="warning-subtle"
                                                    leftIcon={<FaRedo />}
                                                >
                                                    {t("manga.chapterReader.reset")}
                                                </Button>
                                            )
                                        }
                                    </div>
                                )
                            })}

                            <Separator />

                            <h4>{t("manga.chapterReader.keyboardShortcuts")}</h4>

                            {[{
                                key: "u",
                                label: t("manga.chapterReader.updateProgressNextChapter"),
                            }, {
                                key: "b",
                                label: t("manga.chapterReader.toggleBottomBar"),
                            }, {
                                key: "m",
                                label: t("manga.chapterReader.switchReadingMode"),
                            }, {
                                key: "d",
                                label: t("manga.chapterReader.switchReadingDirection"),
                            }, {
                                key: "f",
                                label: t("manga.chapterReader.switchPageFit"),
                            }, {
                                key: "s",
                                label: t("manga.chapterReader.switchPageStretch"),
                            }, {
                                key: "shift+right",
                                label: t("manga.chapterReader.incrementOffset"),
                            }, {
                                key: "shift+left",
                                label: t("manga.chapterReader.decrementOffset"),
                            }].map(item => {
                                return (
                                    <div className="flex gap-2 items-center" key={item.key}>
                                        <div>
                                            <Button
                                                size="sm"
                                                intent="gray-outline"
                                                className="pointer-events-none"
                                            >
                                                {item.key}
                                            </Button>
                                        </div>
                                        <p>{item.label}</p>
                                    </div>
                                )
                            })}
                        </>

                    </Card>)}

                </div>
            </Drawer>
        </>
    )
}
