import { usePatchSetting } from "@/api/hooks/settings.hooks"
import { MediaCoreControlButtonIcon } from "@/app/(main)/_features/media-core/media-core-control-bar"
import {
    MediaCoreMenu,
    MediaCoreMenuOption,
    MediaCoreMenuSectionBody,
    MediaCoreMenuSubmenuBody,
    MediaCoreMenuSubOption,
    MediaCoreMenuSubSubmenuBody,
    MediaCoreMenuTitle,
    MediaCoreSettingSelect,
    MediaCoreSettingTextInput,
} from "@/app/(main)/_features/media-core/media-core-menu"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import React from "react"
import { HiFastForward } from "react-icons/hi"
import { ImFileText } from "react-icons/im"
import { IoCaretForwardCircleOutline } from "react-icons/io5"
import { LuChevronUp, LuHeading, LuPaintbrush, LuPalette, LuSettings2, LuSparkles, LuTvMinimalPlay } from "react-icons/lu"
import { MdOutlineAccessTime, MdOutlineSubtitles, MdSpeed } from "react-icons/md"
import { RiShadowLine } from "react-icons/ri"
import { TbArrowForwardUp } from "react-icons/tb"
import { mc_parseCustomMpvConfig, mc_resolveAnime4KProfile } from "./mpv-core"
import type { MpvCoreAnime4KQuality, MpvCoreSettings, MpvCoreShaderMode, MpvCoreShaderSettings } from "./mpv-core.atoms"
import { createTranslator } from "@/locales"

const mpvSubtitleFontSizeOptions = [
    { label: "Small", value: 28 },
    { label: "Medium", value: 38 },
    { label: "Large", value: 48 },
    { label: "Extra Large", value: 58 },
]
const mpvSubtitleColorOptions = [
    { label: "White", value: "#FFFFFF" },
    { label: "Black", value: "#000000" },
    { label: "Gray", value: "#808080" },
    { label: "Yellow", value: "#FFD700" },
    { label: "Cyan", value: "#00FFFF" },
    { label: "Pink", value: "#FF69B4" },
    { label: "Purple", value: "#9370DB" },
    { label: "Lime", value: "#00FF00" },
]
const mpvSubtitleOutlineOptions = [
    { label: "None", value: 0 },
    { label: "Small", value: 2 },
    { label: "Medium", value: 3 },
    { label: "Large", value: 4 },
]
const mpvSubtitleShadowOptions = [
    { label: "None", value: 0 },
    { label: "Small", value: 1 },
    { label: "Medium", value: 2 },
    { label: "Large", value: 3 },
]
const mpvSubtitleOpacityOptions = [
    { label: "100%", value: 1 },
    { label: "80%", value: 0.8 },
    { label: "70%", value: 0.7 },
    { label: "50%", value: 0.5 },
    { label: "25%", value: 0.25 },
    { label: "0%", value: 0 },
]

export interface MpvCoreSettingsMenuProps {
    openMenu: string | null
    openSection: string | null
    openSubSection: string | null
    setOpenMenu: (value: string | null) => void
    setOpenSection: (value: string | null) => void
    setOpenSubSection: (value: string | null) => void
    isFullscreen: boolean
    containerElement: HTMLElement | null
    speed: number
    changeSpeed: (value: number) => Promise<void>
    autoPlay: boolean
    setAutoPlay: (value: boolean) => void
    autoNext: boolean
    setAutoNext: (value: boolean) => void
    autoSkip: boolean
    setAutoSkip: (value: boolean) => void
    subtitleDelay: number
    setSubtitleDelay: (value: number) => void
    showChapterMarkers: boolean
    setChapterMarkers: (value: boolean) => void
    highlightOPEDChapters: boolean
    setHighlightOPEDChapters: (value: boolean) => void
    showStats: boolean
    setShowStats: (value: boolean) => void
    mpvSettings: MpvCoreSettings
    setMpvSettings: (
        update: MpvCoreSettings | ((current: MpvCoreSettings) => MpvCoreSettings)
    ) => void
    shaderSettings: MpvCoreShaderSettings
    setShaderSettings: (
        update: MpvCoreShaderSettings | ((current: MpvCoreShaderSettings) => MpvCoreShaderSettings)
    ) => void
    anime4kDirectory: MpvCoreAnime4KDirectory | null
    anime4kError: string | null
    onRefreshAnime4K: () => void
    onOpenPreferences: () => void
}

export function MpvCoreSettingsMenu(props: MpvCoreSettingsMenuProps) {
    const t = createTranslator()
    
    const subtitleFontSizeOptions = React.useMemo(() => [
        { label: t("videoPlayer.settingsMenu.small"), value: 28 },
        { label: t("videoPlayer.settingsMenu.medium"), value: 38 },
        { label: t("videoPlayer.settingsMenu.large"), value: 48 },
        { label: t("videoPlayer.settingsMenu.extraLarge"), value: 58 },
    ], [t])
    const subtitleColorOptions = React.useMemo(() => [
        { label: t("videoPlayer.colors.white"), value: "#FFFFFF" },
        { label: t("videoPlayer.colors.black"), value: "#000000" },
        { label: t("videoPlayer.colors.gray"), value: "#808080" },
        { label: t("videoPlayer.colors.yellow"), value: "#FFD700" },
        { label: t("videoPlayer.colors.cyan"), value: "#00FFFF" },
        { label: t("videoPlayer.colors.pink"), value: "#FF69B4" },
        { label: t("videoPlayer.colors.purple"), value: "#9370DB" },
        { label: t("videoPlayer.colors.lime"), value: "#00FF00" },
    ], [t])
    const subtitleOutlineOptions = React.useMemo(() => [
        { label: t("videoPlayer.settingsMenu.none"), value: 0 },
        { label: t("videoPlayer.settingsMenu.small"), value: 2 },
        { label: t("videoPlayer.settingsMenu.medium"), value: 3 },
        { label: t("videoPlayer.settingsMenu.large"), value: 4 },
    ], [t])
    const subtitleShadowOptions = React.useMemo(() => [
        { label: t("videoPlayer.settingsMenu.none"), value: 0 },
        { label: t("videoPlayer.settingsMenu.small"), value: 1 },
        { label: t("videoPlayer.settingsMenu.medium"), value: 2 },
        { label: t("videoPlayer.settingsMenu.large"), value: 3 },
    ], [t])

    const {
        openMenu,
        openSection,
        openSubSection,
        setOpenMenu,
        setOpenSection,
        setOpenSubSection,
        isFullscreen,
        containerElement,
        speed,
        changeSpeed,
        autoPlay,
        setAutoPlay,
        autoNext,
        setAutoNext,
        autoSkip,
        setAutoSkip,
        subtitleDelay,
        setSubtitleDelay,
        showChapterMarkers,
        setChapterMarkers,
        highlightOPEDChapters,
        setHighlightOPEDChapters,
        showStats,
        setShowStats,
        mpvSettings,
        setMpvSettings,
        shaderSettings,
        setShaderSettings,
        anime4kDirectory,
        anime4kError,
        onRefreshAnime4K,
        onOpenPreferences,
    } = props
    const serverStatus = useServerStatus()
    const { mutate: patchSetting } = usePatchSetting()

    const { parsed: parsedCustomConfig } = React.useMemo(() => mc_parseCustomMpvConfig(mpvSettings.customMpvConfig), [mpvSettings.customMpvConfig])
    const hasCustomDeband = "deband" in parsedCustomConfig
    const customDebandEnabled = hasCustomDeband
        ? (parsedCustomConfig["deband"] !== "no" && parsedCustomConfig["deband"] !== "false")
        : false
    const debandActive = hasCustomDeband ? customDebandEnabled : mpvSettings.deband

    const [subFontName, setSubFontName] = React.useState(mpvSettings.subtitleCustomization.fontName)

    React.useEffect(() => {
        if (openSection === "Subtitle Styles") {
            setSubFontName(mpvSettings.subtitleCustomization.fontName)
        }
    }, [openSection, mpvSettings.subtitleCustomization.fontName])

    const updateSubtitleStyle = <Key extends keyof MpvCoreSettings["subtitleCustomization"]>(
        key: Key,
        value: MpvCoreSettings["subtitleCustomization"][Key],
    ) => {
        setMpvSettings(current => ({
            ...current,
            subtitleCustomization: {
                ...current.subtitleCustomization,
                [key]: value,
            },
        }))
    }

    return (
        <MediaCoreMenu
            name="settings"
            openMenu={openMenu}
            onOpenMenuChange={setOpenMenu}
            onOpenSectionChange={setOpenSection}
            onOpenSubSectionChange={setOpenSubSection}
            isFullscreen={isFullscreen}
            containerElement={containerElement}
            trigger={
                <MediaCoreControlButtonIcon
                    icons={[["default", LuChevronUp]]}
                    state="default"
                    onClick={() => { }}
                    isMobile={false}
                    isMiniPlayer={false}
                />
            }
        >
            <MediaCoreMenuSectionBody show={!openSection}>
                <MediaCoreMenuTitle>{t("videoPlayer.settingsMenu.title")}</MediaCoreMenuTitle>
                <MediaCoreMenuOption
                    title={t("videoPlayer.settingsMenu.playbackSpeed")}
                    icon={MdSpeed}
                    value={`${speed.toFixed(2)}x`}
                    openSection={openSection}
                    onOpenSectionChange={setOpenSection}
                />
                <MediaCoreMenuOption
                    title={t("videoPlayer.settingsMenu.autoPlay")}
                    icon={IoCaretForwardCircleOutline}
                    value={autoPlay ? t("videoPlayer.settingsMenu.on") : t("videoPlayer.settingsMenu.off")}
                    openSection={openSection}
                    onOpenSectionChange={setOpenSection}
                />
                <MediaCoreMenuOption
                    title={t("videoPlayer.settingsMenu.autoNext")}
                    icon={HiFastForward}
                    value={autoNext ? t("videoPlayer.settingsMenu.on") : t("videoPlayer.settingsMenu.off")}
                    openSection={openSection}
                    onOpenSectionChange={setOpenSection}
                />
                <MediaCoreMenuOption
                    title={t("videoPlayer.settingsMenu.skipOPED")}
                    icon={TbArrowForwardUp}
                    value={autoSkip ? t("videoPlayer.settingsMenu.on") : t("videoPlayer.settingsMenu.off")}
                    openSection={openSection}
                    onOpenSectionChange={setOpenSection}
                />
                <MediaCoreMenuOption
                    title={t("videoPlayer.mpv.shaders")}
                    icon={LuSparkles}
                    value={[
                        debandActive && t("videoPlayer.mpv.debanding"),
                        shaderSettings.mode !== "off" && (
                            shaderSettings.mode === "custom"
                                ? t("videoPlayer.mpv.customShaders")
                                : `${shaderSettings.anime4kMode.replace("mode-", "").toUpperCase()} (${shaderSettings.anime4kQuality.toUpperCase()})`
                        ),
                    ].filter(Boolean).join(", ") || t("videoPlayer.settingsMenu.off")}
                    openSection={openSection}
                    onOpenSectionChange={setOpenSection}
                />
                <MediaCoreMenuOption
                    title={t("videoPlayer.settingsMenu.subtitleDelay")}
                    icon={MdOutlineAccessTime}
                    value={`${subtitleDelay.toFixed(1)}s`}
                    openSection={openSection}
                    onOpenSectionChange={setOpenSection}
                />
                <MediaCoreMenuOption
                    title={t("videoPlayer.settingsMenu.subtitleStyles")}
                    icon={MdOutlineSubtitles}
                    value={mpvSettings.subtitleCustomization.enabled ? `${t("videoPlayer.settingsMenu.on")}${mpvSettings.subtitleCustomization.fontName ? ", Font" : ""}` : t("videoPlayer.settingsMenu.off")}
                    openSection={openSection}
                    onOpenSectionChange={setOpenSection}
                />
                <MediaCoreMenuOption
                    title={t("videoPlayer.settingsMenu.playerAppearance")}
                    icon={LuTvMinimalPlay}
                    openSection={openSection}
                    onOpenSectionChange={setOpenSection}
                />
                <MediaCoreMenuOption
                    title={t("videoPlayer.settingsMenu.preferences")}
                    icon={LuSettings2}
                    openSection={openSection}
                    onOpenSectionChange={setOpenSection}
                    onClick={onOpenPreferences}
                />
            </MediaCoreMenuSectionBody>

            <MediaCoreMenuSubmenuBody show={!!openSection && !openSubSection}>
                <MediaCoreMenuOption
                    title={t("videoPlayer.settingsMenu.subtitleStyles")}
                    icon={MdOutlineSubtitles}
                    openSection={openSection}
                    onOpenSectionChange={setOpenSection}
                >
                    <MediaCoreSettingSelect
                        options={[
                            { label: t("videoPlayer.settingsMenu.on"), value: 1 },
                            { label: t("videoPlayer.settingsMenu.off"), value: 0 },
                        ]}
                        onValueChange={value => updateSubtitleStyle("enabled", value === 1)}
                        value={mpvSettings.subtitleCustomization.enabled ? 1 : 0}
                    />
                    {mpvSettings.subtitleCustomization.enabled && (
                        <>
                            <p className="text-[--muted] text-sm my-2">{t("videoPlayer.settingsMenu.options")}</p>
                            <MediaCoreMenuSubOption
                                title={t("videoPlayer.settingsMenu.font")}
                                icon={LuHeading}
                                parentId="Subtitle Styles"
                                value={!mpvSettings.subtitleCustomization.fontName ? t("videoPlayer.settingsMenu.default") : mpvSettings.subtitleCustomization.fontName?.slice(0,
                                    11) + (!!mpvSettings.subtitleCustomization.fontName?.length && mpvSettings.subtitleCustomization.fontName?.length > 10
                                    ? "..."
                                    : "")}
                                openSection={openSection}
                                openSubSection={openSubSection}
                                onOpenSubSectionChange={setOpenSubSection}
                            />
                            <MediaCoreMenuSubOption
                                title={t("videoPlayer.settingsMenu.fontSize")}
                                icon={LuHeading}
                                parentId="Subtitle Styles"
                                value={`${mpvSettings.subtitleCustomization.fontSize}px`}
                                openSection={openSection}
                                openSubSection={openSubSection}
                                onOpenSubSectionChange={setOpenSubSection}
                            />
                            <MediaCoreMenuSubOption
                                title={t("videoPlayer.settingsMenu.textColor")}
                                icon={LuPalette}
                                parentId="Subtitle Styles"
                                value={subtitleColorOptions.find(option => option.value === mpvSettings.subtitleCustomization.primaryColor)?.label}
                                openSection={openSection}
                                openSubSection={openSubSection}
                                onOpenSubSectionChange={setOpenSubSection}
                            />
                            <MediaCoreMenuSubOption
                                title={t("videoPlayer.settingsMenu.outline")}
                                icon={ImFileText}
                                parentId="Subtitle Styles"
                                value={`${subtitleOutlineOptions.find(option => option.value === mpvSettings.subtitleCustomization.outline)?.label}, ${subtitleColorOptions.find(option => option.value === mpvSettings.subtitleCustomization.outlineColor)?.label}`}
                                openSection={openSection}
                                openSubSection={openSubSection}
                                onOpenSubSectionChange={setOpenSubSection}
                            />
                            <MediaCoreMenuSubOption
                                title={t("videoPlayer.settingsMenu.shadow")}
                                icon={RiShadowLine}
                                parentId="Subtitle Styles"
                                value={`${subtitleShadowOptions.find(option => option.value === mpvSettings.subtitleCustomization.shadow)?.label}, ${subtitleColorOptions.find(option => option.value === mpvSettings.subtitleCustomization.backColor)?.label}`}
                                openSection={openSection}
                                openSubSection={openSubSection}
                                onOpenSubSectionChange={setOpenSubSection}
                            />
                        </>
                    )}
                </MediaCoreMenuOption>
                <MediaCoreMenuOption
                    title={t("videoPlayer.settingsMenu.playbackSpeed")}
                    icon={MdSpeed}
                    openSection={openSection}
                    onOpenSectionChange={setOpenSection}
                >
                    <MediaCoreSettingSelect
                        options={[0.5, 0.9, 1, 1.1, 1.5, 2, 3, 4].map(value => ({
                            label: `${value}x`,
                            value,
                        }))}
                        value={speed}
                        onValueChange={value => changeSpeed(Number(value))}
                        isFullscreen={isFullscreen}
                        containerElement={containerElement}
                    />
                </MediaCoreMenuOption>
                <MediaCoreMenuOption
                    title={t("videoPlayer.settingsMenu.autoPlay")}
                    icon={IoCaretForwardCircleOutline}
                    openSection={openSection}
                    onOpenSectionChange={setOpenSection}
                >
                    <MediaCoreSettingSelect
                        options={[
                            { label: t("videoPlayer.settingsMenu.on"), value: 1 },
                            { label: t("videoPlayer.settingsMenu.off"), value: 0 },
                        ]}
                        value={autoPlay ? 1 : 0}
                        onValueChange={value => setAutoPlay(Boolean(value))}
                    />
                </MediaCoreMenuOption>
                <MediaCoreMenuOption
                    title={t("videoPlayer.settingsMenu.autoNext")}
                    icon={HiFastForward}
                    openSection={openSection}
                    onOpenSectionChange={setOpenSection}
                >
                    <MediaCoreSettingSelect
                        options={[
                            { label: t("videoPlayer.settingsMenu.on"), value: 1 },
                            { label: t("videoPlayer.settingsMenu.off"), value: 0 },
                        ]}
                        value={autoNext ? 1 : 0}
                        onValueChange={value => setAutoNext(Boolean(value))}
                    />
                </MediaCoreMenuOption>
                <MediaCoreMenuOption
                    title={t("videoPlayer.settingsMenu.skipOPED")}
                    icon={TbArrowForwardUp}
                    openSection={openSection}
                    onOpenSectionChange={setOpenSection}
                >
                    <MediaCoreSettingSelect
                        options={[
                            { label: t("videoPlayer.settingsMenu.on"), value: 1 },
                            { label: t("videoPlayer.settingsMenu.off"), value: 0 },
                        ]}
                        value={autoSkip ? 1 : 0}
                        onValueChange={value => setAutoSkip(Boolean(value))}
                    />
                </MediaCoreMenuOption>
                <MediaCoreMenuOption
                    title={t("videoPlayer.settingsMenu.subtitleDelay")}
                    icon={MdOutlineAccessTime}
                    openSection={openSection}
                    onOpenSectionChange={setOpenSection}
                >
                    <p className="text-sm text-[--muted] mb-2">{t("videoPlayer.settingsMenu.subtitleDelayHelp")}</p>
                    <div className="flex gap-1.5 items-center mt-3">
                        {[-0.5, -0.1].map(delta => (
                            <Button
                                key={delta}
                                className="px-1 !text-xs flex-1"
                                intent="gray-subtle"
                                size="sm"
                                onClick={() => setSubtitleDelay(Number((subtitleDelay + delta).toFixed(1)))}
                            >
                                {delta}
                            </Button>
                        ))}
                        <span className="text-sm text-center text-[--muted] px-1 flex-1">
                            {subtitleDelay.toFixed(1)}s
                        </span>
                        {[0.1, 0.5].map(delta => (
                            <Button
                                key={delta}
                                className="px-1 !text-xs flex-1"
                                intent="gray-subtle"
                                size="sm"
                                onClick={() => setSubtitleDelay(Number((subtitleDelay + delta).toFixed(1)))}
                            >
                                +{delta}
                            </Button>
                        ))}
                    </div>
                    <MediaCoreSettingSelect
                        options={[-2, -1, -0.5, 0, 0.5, 1, 2].map(value => ({
                            label: `${value}s`,
                            value,
                        }))}
                        value={[-2, -1, -0.5, 0, 0.5, 1, 2].includes(subtitleDelay) ? subtitleDelay : null}
                        onValueChange={value => setSubtitleDelay(Number(value))}
                    />
                </MediaCoreMenuOption>
                <MediaCoreMenuOption
                    title={t("videoPlayer.mpv.shaders")}
                    icon={LuSparkles}
                    openSection={openSection}
                    onOpenSectionChange={setOpenSection}
                >
                    <div className="border-b border-[--border] pb-3 mb-3">
                        <Switch
                            label={t("videoPlayer.mpv.debanding")}
                            side="right"
                            fieldClass="hover:bg-transparent hover:border-transparent px-0 ml-0 w-full"
                            size="sm"
                            value={debandActive}
                            disabled={hasCustomDeband}
                            help={hasCustomDeband ? t("videoPlayer.mpv.writtenInMpvConfig") : undefined}
                            onValueChange={checked => setMpvSettings(current => ({ ...current, deband: checked }))}
                        />
                    </div>
                    <p className="text-[--muted] text-sm mb-2">
                        {t("videoPlayer.settingsMenu.anime4kDesc")}
                    </p>
                    <MediaCoreSettingSelect
                        options={[
                            { label: t("videoPlayer.settingsMenu.off"), value: "off" },
                            { label: t("videoPlayer.mpv.anime4kPreset"), value: "anime4k", description: t("videoPlayer.mpv.useAnime4kPresets") },
                            { label: t("videoPlayer.mpv.customShaders"), value: "custom", description: t("videoPlayer.mpv.enableCustomShaders") },
                        ]}
                        value={shaderSettings.mode}
                        onValueChange={value => setShaderSettings(current => ({
                            ...current,
                            mode: value as MpvCoreShaderMode,
                        }))}
                        isFullscreen={isFullscreen}
                        containerElement={containerElement}
                    />

                    {shaderSettings.mode === "anime4k" && (
                        <>
                            <p className="text-[--muted] text-sm my-2">{t("videoPlayer.mpv.preset")}</p>
                            <MediaCoreSettingSelect
                                options={[
                                    { label: t("videoPlayer.anime4K.modeA"), value: "mode-a", description: t("videoPlayer.anime4KDesc.modeA") },
                                    { label: t("videoPlayer.anime4K.modeB"), value: "mode-b", description: t("videoPlayer.anime4KDesc.modeB") },
                                    { label: t("videoPlayer.anime4K.modeC"), value: "mode-c", description: t("videoPlayer.anime4KDesc.modeC") },
                                    { label: t("videoPlayer.anime4K.modeAA"), value: "mode-aa", description: t("videoPlayer.anime4KDesc.modeAA") },
                                    { label: t("videoPlayer.anime4K.modeBB"), value: "mode-bb", description: t("videoPlayer.anime4KDesc.modeBB") },
                                    { label: t("videoPlayer.anime4K.modeCA"), value: "mode-ca", description: t("videoPlayer.anime4KDesc.modeCA") },
                                    { label: t("videoPlayer.anime4K.cnn2xMedium"), value: "cnn-2x-medium", description: t("videoPlayer.anime4KDesc.cnn2xMedium") },
                                    { label: t("videoPlayer.anime4K.cnn2xVeryLarge"), value: "cnn-2x-very-large", description: t("videoPlayer.anime4KDesc.cnn2xVeryLarge") },
                                    { label: t("videoPlayer.anime4K.denoiseCnn2xVeryLarge"), value: "denoise-cnn-2x-very-large", description: t("videoPlayer.anime4KDesc.denoiseCnn2xVeryLarge") },
                                    { label: t("videoPlayer.anime4K.cnn2xUltraLarge"), value: "cnn-2x-ultra-large", description: t("videoPlayer.anime4KDesc.cnn2xUltraLarge") },
                                ]}
                                value={shaderSettings.anime4kMode}
                                onValueChange={value => setShaderSettings(current => ({
                                    ...current,
                                    anime4kMode: String(value),
                                }))}
                                isFullscreen={isFullscreen}
                                containerElement={containerElement}
                            />
                            <p className="text-[--muted] text-sm my-2">{t("videoPlayer.resolution.quality")}</p>
                            <MediaCoreSettingSelect
                                options={[
                                    { label: t("videoPlayer.mpv.fastLowerGpu"), value: "fast" },
                                    { label: t("videoPlayer.mpv.hqHeavy"), value: "hq" },
                                ]}
                                value={shaderSettings.anime4kQuality}
                                onValueChange={value => setShaderSettings(current => ({
                                    ...current,
                                    anime4kQuality: value as MpvCoreAnime4KQuality,
                                }))}
                                isFullscreen={isFullscreen}
                                containerElement={containerElement}
                            />
                        </>
                    )}

                    {shaderSettings.mode === "custom" && (
                        <div className="mt-4 border-t border-gray-800 pt-4 max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            <p className="text-[--muted] text-xs font-semibold uppercase tracking-wider mb-2">{t("videoPlayer.mpv.selectShaders")}</p>
                            {anime4kDirectory?.shaders.length ? (
                                anime4kDirectory.shaders.map(shader => {
                                    const isChecked = (shaderSettings.customShaders || []).includes(shader.name)
                                    return (
                                        <div key={shader.name} className="flex items-center justify-between text-sm py-0.5">
                                            <span className="truncate text-gray-300 mr-2" title={shader.name}>
                                                {shader.name.split("/").pop() || shader.name}
                                            </span>
                                            <Switch
                                                size="sm"
                                                value={isChecked}
                                                onValueChange={checked => {
                                                    setShaderSettings(current => {
                                                        const list = current.customShaders || []
                                                        const nextList = checked
                                                            ? [...list, shader.name]
                                                            : list.filter(name => name !== shader.name)
                                                        return { ...current, customShaders: nextList }
                                                    })
                                                }}
                                            />
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-[--muted] text-sm italic">{t("videoPlayer.mpv.noShadersFound")}</p>
                            )}
                        </div>
                    )}

                    {/*<p className="text-[--muted] text-sm my-2 break-all">*/}
                    {/*    {anime4kDirectory?.directory || shaderSettings.directory || "No shader folder selected"}*/}
                    {/*</p>*/}
                    <p className="text-[--muted] text-sm my-2">
                        {t("videoPlayer.mpv.detectedShaderFiles", { count: anime4kDirectory?.shaders.length ?? 0 })}
                    </p>
                    {shaderSettings.mode === "anime4k" && mc_resolveAnime4KProfile(anime4kDirectory, shaderSettings.anime4kMode, shaderSettings.anime4kQuality).missing.length > 0 && (
                        <p className="text-red-300 text-sm mb-2 break-words">
                            {t("videoPlayer.mpv.missing")} {mc_resolveAnime4KProfile(anime4kDirectory, shaderSettings.anime4kMode, shaderSettings.anime4kQuality).missing.join(", ")}
                        </p>
                    )}
                    {anime4kError && <p className="text-red-300 text-sm mb-2 break-words">{anime4kError}</p>}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            intent="gray-subtle"
                            onClick={() => window.electron?.mpvCore.openAnime4KDirectory(
                                anime4kDirectory?.directory || shaderSettings.directory,
                            )}
                        >
                            {t("videoPlayer.mpv.openFolder")}
                        </Button>
                        <Button size="sm" intent="gray-subtle" onClick={onRefreshAnime4K}>
                            {t("videoPlayer.mpv.refresh")}
                        </Button>
                    </div>
                </MediaCoreMenuOption>
                <MediaCoreMenuOption
                    title={t("videoPlayer.settingsMenu.playerAppearance")}
                    icon={LuPaintbrush}
                    openSection={openSection}
                    onOpenSectionChange={setOpenSection}
                >
                    <Switch
                        label={t("videoPlayer.settingsMenu.showChapterMarkers")}
                        side="right"
                        fieldClass="hover:bg-transparent hover:border-transparent px-0 ml-0 w-full"
                        size="sm"
                        value={showChapterMarkers}
                        onValueChange={setChapterMarkers}
                    />
                    <Switch
                        label={t("videoPlayer.settingsMenu.highlightOPEDChapters")}
                        side="right"
                        fieldClass="hover:bg-transparent hover:border-transparent px-0 ml-0 w-full"
                        size="sm"
                        value={highlightOPEDChapters}
                        onValueChange={setHighlightOPEDChapters}
                    />
                </MediaCoreMenuOption>
            </MediaCoreMenuSubmenuBody>
            <MediaCoreMenuSubSubmenuBody show={!!openSubSection}>
                <MediaCoreMenuSubOption
                    title={t("videoPlayer.settingsMenu.font")}
                    icon={LuHeading}
                    parentId="Subtitle Styles"
                    openSection={openSection}
                    openSubSection={openSubSection}
                    onOpenSubSectionChange={setOpenSubSection}
                >
                    <p className="text-sm mb-2">{t("videoPlayer.mpv.fontFamily")}</p>
                    <MediaCoreSettingTextInput
                        label={t("videoPlayer.mpv.fontName")}
                        value={subFontName}
                        onValueChange={setSubFontName}
                        help={t("videoPlayer.mpv.fontNameExample")}
                    />
                    <div className="flex w-full mt-2">
                        <Button size="sm" intent="gray-subtle" onClick={() => updateSubtitleStyle("fontName", subFontName)}>
                            {t("videoPlayer.settingsMenu.save")}
                        </Button>
                    </div>
                </MediaCoreMenuSubOption>
                <MediaCoreMenuSubOption
                    title={t("videoPlayer.settingsMenu.fontSize")}
                    icon={LuHeading}
                    parentId="Subtitle Styles"
                    openSection={openSection}
                    openSubSection={openSubSection}
                    onOpenSubSectionChange={setOpenSubSection}
                >
                    <MediaCoreSettingSelect
                        options={subtitleFontSizeOptions}
                        value={mpvSettings.subtitleCustomization.fontSize}
                        onValueChange={value => updateSubtitleStyle("fontSize", Number(value))}
                    />
                </MediaCoreMenuSubOption>
                <MediaCoreMenuSubOption
                    title={t("videoPlayer.settingsMenu.textColor")}
                    icon={LuPalette}
                    parentId="Subtitle Styles"
                    openSection={openSection}
                    openSubSection={openSubSection}
                    onOpenSubSectionChange={setOpenSubSection}
                >
                    <MediaCoreSettingSelect
                        options={subtitleColorOptions}
                        value={mpvSettings.subtitleCustomization.primaryColor}
                        onValueChange={value => updateSubtitleStyle("primaryColor", String(value))}
                    />
                </MediaCoreMenuSubOption>
                <MediaCoreMenuSubOption
                    title={t("videoPlayer.settingsMenu.outline")}
                    icon={ImFileText}
                    parentId="Subtitle Styles"
                    openSection={openSection}
                    openSubSection={openSubSection}
                    onOpenSubSectionChange={setOpenSubSection}
                >
                    <p className="text-[--muted] text-sm mb-2">{t("videoPlayer.settingsMenu.outlineWidth")}</p>
                    <MediaCoreSettingSelect
                        options={subtitleOutlineOptions}
                        value={mpvSettings.subtitleCustomization.outline}
                        onValueChange={value => updateSubtitleStyle("outline", Number(value))}
                    />
                    <p className="text-[--muted] text-sm my-2">{t("videoPlayer.settingsMenu.outlineColor")}</p>
                    <MediaCoreSettingSelect
                        options={subtitleColorOptions}
                        value={mpvSettings.subtitleCustomization.outlineColor}
                        onValueChange={value => updateSubtitleStyle("outlineColor", String(value))}
                    />
                </MediaCoreMenuSubOption>
                <MediaCoreMenuSubOption
                    title={t("videoPlayer.settingsMenu.shadow")}
                    icon={RiShadowLine}
                    parentId="Subtitle Styles"
                    openSection={openSection}
                    openSubSection={openSubSection}
                    onOpenSubSectionChange={setOpenSubSection}
                >
                    <p className="text-[--muted] text-sm mb-2">{t("videoPlayer.settingsMenu.shadowDepth")}</p>
                    <MediaCoreSettingSelect
                        options={subtitleShadowOptions}
                        value={mpvSettings.subtitleCustomization.shadow}
                        onValueChange={value => updateSubtitleStyle("shadow", Number(value))}
                    />
                    <p className="text-[--muted] text-sm my-2">{t("videoPlayer.settingsMenu.shadowOpacity")}</p>
                    <MediaCoreSettingSelect
                        options={mpvSubtitleOpacityOptions}
                        value={mpvSettings.subtitleCustomization.backColorOpacity}
                        onValueChange={value => updateSubtitleStyle("backColorOpacity", Number(value))}
                    />
                    <p className="text-[--muted] text-sm my-2">{t("videoPlayer.settingsMenu.shadowColor")}</p>
                    <MediaCoreSettingSelect
                        options={subtitleColorOptions}
                        value={mpvSettings.subtitleCustomization.backColor}
                        onValueChange={value => updateSubtitleStyle("backColor", String(value))}
                    />
                </MediaCoreMenuSubOption>
            </MediaCoreMenuSubSubmenuBody>
        </MediaCoreMenu>
    )
}
