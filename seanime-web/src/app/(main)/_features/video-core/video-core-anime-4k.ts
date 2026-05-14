import { vc_anime4kManager } from "@/app/(main)/_features/video-core/video-core"
import type { Anime4KOption } from "@/app/(main)/_features/video-core/video-core-anime-4k-manager"
import { vc_realVideoSize } from "@/app/(main)/_features/video-core/video-core-atoms"
import { vc_seeking } from "@/app/(main)/_features/video-core/video-core-atoms"
import { vc_paused } from "@/app/(main)/_features/video-core/video-core-atoms"
import { vc_miniPlayer } from "@/app/(main)/_features/video-core/video-core-atoms"
import { vc_videoElement } from "@/app/(main)/_features/video-core/video-core-atoms"
import { vc_pip } from "@/app/(main)/_features/video-core/video-core-pip"
import { logger } from "@/lib/helpers/debug"
import { useAtomValue } from "jotai"
import { useAtom } from "jotai/react"
import { atomWithStorage } from "jotai/utils"
import React from "react"
import { createTranslator } from "@/locales"

const t = createTranslator()

const log = logger("VIDEO CORE ANIME 4K")

export const vc_anime4kOption = atomWithStorage<Anime4KOption>("sea-video-core-anime4k", "off", undefined, { getOnInit: true })

export const VideoCoreAnime4K = () => {
    const realVideoSize = useAtomValue(vc_realVideoSize)
    const seeking = useAtomValue(vc_seeking)
    const isMiniPlayer = useAtomValue(vc_miniPlayer)
    const isPip = useAtomValue(vc_pip)
    const video = useAtomValue(vc_videoElement)
    const paused = useAtomValue(vc_paused)

    const manager = useAtomValue(vc_anime4kManager)
    const [selectedOption] = useAtom(vc_anime4kOption)

    const resizeCanvas = React.useEffectEvent(() => {
        if (!video || !manager) return

        const rect = video.getBoundingClientRect()
        if (!rect.width || !rect.height) return

        manager.resize(rect.width, rect.height)
    })

    // Update manager with real video size
    React.useEffect(() => {
        resizeCanvas()
    }, [manager, video])

    // Handle option changes
    React.useEffect(() => {
        if (video && manager) {
            // log.info("Setting Anime4K option", selectedOption)
            manager.setOption(selectedOption, {
                isMiniPlayer,
                isPip,
                seeking,
            })
        }
    }, [video, manager, selectedOption, isMiniPlayer, isPip, seeking])

    // Handle option changes
    // React.useLayoutEffect(() => {
    //     resizeCanvas()
    // }, [realVideoSize.width, realVideoSize.height])

    React.useEffect(() => {
        if (!video || !manager) return

        let resizeFrame = 0

        const handleResize = () => {
            if (resizeFrame) {
                cancelAnimationFrame(resizeFrame)
            }

            resizeFrame = requestAnimationFrame(() => {
                resizeFrame = 0
                resizeCanvas()
            })
        }

        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
            if (resizeFrame) {
                cancelAnimationFrame(resizeFrame)
            }
        }
    }, [manager, video])

    return null
}

export const anime4kOptions: { value: Anime4KOption; label: string; description: string; performance: "light" | "medium" | "heavy" }[] = [
    { value: "off", label: t("videoPlayer.anime4K.off"), description: t("videoPlayer.anime4KDesc.off"), performance: "light" },
    { value: "mode-a", label: t("videoPlayer.anime4K.modeA"), description: t("videoPlayer.anime4KDesc.modeA"), performance: "light" },
    { value: "mode-b", label: t("videoPlayer.anime4K.modeB"), description: t("videoPlayer.anime4KDesc.modeB"), performance: "light" },
    { value: "mode-c", label: t("videoPlayer.anime4K.modeC"), description: t("videoPlayer.anime4KDesc.modeC"), performance: "light" },
    { value: "mode-aa", label: t("videoPlayer.anime4K.modeAA"), description: t("videoPlayer.anime4KDesc.modeAA"), performance: "medium" },
    { value: "mode-bb", label: t("videoPlayer.anime4K.modeBB"), description: t("videoPlayer.anime4KDesc.modeBB"), performance: "medium" },
    { value: "mode-ca", label: t("videoPlayer.anime4K.modeCA"), description: t("videoPlayer.anime4KDesc.modeCA"), performance: "medium" },
    { value: "cnn-2x-medium", label: t("videoPlayer.anime4K.cnn2xMedium"), description: t("videoPlayer.anime4KDesc.cnn2xMedium"), performance: "medium" },
    { value: "cnn-2x-very-large", label: t("videoPlayer.anime4K.cnn2xVeryLarge"), description: t("videoPlayer.anime4KDesc.cnn2xVeryLarge"), performance: "heavy" },
    { value: "denoise-cnn-2x-very-large", label: t("videoPlayer.anime4K.denoiseCnn2xVeryLarge"), description: t("videoPlayer.anime4KDesc.denoiseCnn2xVeryLarge"), performance: "heavy" },
    { value: "cnn-2x-ultra-large", label: t("videoPlayer.anime4K.cnn2xUltraLarge"), description: t("videoPlayer.anime4KDesc.cnn2xUltraLarge"), performance: "heavy" },
    { value: "gan-3x-large", label: t("videoPlayer.anime4K.gan3xLarge"), description: t("videoPlayer.anime4KDesc.gan3xLarge"), performance: "heavy" },
    { value: "gan-4x-ultra-large", label: t("videoPlayer.anime4K.gan4xUltraLarge"), description: t("videoPlayer.anime4KDesc.gan4xUltraLarge"), performance: "heavy" },
]

export const getAnime4KOptionByValue = (value: Anime4KOption) => {
    return anime4kOptions.find(option => option.value === value)
}

export const getRecommendedAnime4KOptions = (videoResolution: { width: number; height: number }) => {
    const is720pOrLower = videoResolution.height <= 720
    const is1080pOrLower = videoResolution.height <= 1080

    if (is720pOrLower) {
        return anime4kOptions.filter(option =>
            ["mode-a", "mode-b", "mode-aa", "mode-bb", "cnn-2x-medium", "cnn-2x-very-large"].includes(option.value),
        )
    } else if (is1080pOrLower) {
        return anime4kOptions.filter(option =>
            ["mode-a", "mode-b", "mode-c", "cnn-2x-medium"].includes(option.value),
        )
    } else {
        return anime4kOptions.filter(option =>
            ["mode-a", "mode-b", "mode-c"].includes(option.value),
        )
    }
}

export const getPerformanceRecommendation = (gpu?: string) => {
    const isHighEnd = gpu && (
        gpu.includes("RTX 40") ||
        gpu.includes("RTX 3080") ||
        gpu.includes("RTX 3090") ||
        gpu.includes("RX 6800") ||
        gpu.includes("RX 6900") ||
        gpu.includes("M1 Pro") ||
        gpu.includes("M1 Max") ||
        gpu.includes("M2") ||
        gpu.includes("M3")
    )

    const isMidRange = gpu && (
        gpu.includes("RTX 30") ||
        gpu.includes("RTX 20") ||
        gpu.includes("GTX 16") ||
        gpu.includes("RX 6600") ||
        gpu.includes("RX 5") ||
        gpu.includes("M1")
    )

    if (isHighEnd) {
        return {
            maxPerformance: "heavy" as const,
            recommendedOptions: anime4kOptions.filter(opt => opt.performance !== "heavy").slice(0, 8),
        }
    } else if (isMidRange) {
        return {
            maxPerformance: "medium" as const,
            recommendedOptions: anime4kOptions.filter(opt => opt.performance === "light" || opt.performance === "medium"),
        }
    } else {
        return {
            maxPerformance: "light" as const,
            recommendedOptions: anime4kOptions.filter(opt => opt.performance === "light"),
        }
    }
}

export const isWebGPUAvailable = async (): Promise<boolean> => {
    if (!navigator.gpu) {
        return false
    }

    try {
        const adapter = await navigator.gpu.requestAdapter()
        if (!adapter) return false

        const device = await adapter.requestDevice()
        return !!device
    }
    catch {
        return false
    }
}

export const getOptimalAnime4KSettings = async (videoResolution: { width: number; height: number }) => {
    const webGPUAvailable = await isWebGPUAvailable()

    if (!webGPUAvailable) {
        return {
            supported: false,
            recommendation: "off" as Anime4KOption,
            reason: t("videoPlayer.anime4KWebgpuNotSupported"),
        }
    }

    const gpuInfo = await getGPUInfo()
    const recommendation = getPerformanceRecommendation(gpuInfo?.gpu)
    const videoRecommendations = getRecommendedAnime4KOptions(videoResolution)

    const optimalOption = anime4kOptions.find(option =>
        videoRecommendations.some(vr => vr.value === option.value) &&
        recommendation.recommendedOptions.some(pr => pr.value === option.value),
    )

    return {
        supported: true,
        recommendation: optimalOption?.value || "mode-a" as Anime4KOption,
        reason: t("videoPlayer.anime4KRecommendedFor", { resolution: videoResolution.height, gpu: gpuInfo?.gpu || "current GPU" }),
        alternatives: recommendation.recommendedOptions.slice(0, 3),
    }
}

const getGPUInfo = async () => {
    if (!navigator.gpu) return null

    try {
        const adapter = await navigator.gpu.requestAdapter()
        if (!adapter) return null

        const info = (adapter as any).info || {}

        return {
            gpu: info.vendor || info.architecture || "Unknown GPU",
            vendor: info.vendor || "Unknown",
        }
    }
    catch {
        return null
    }
}

