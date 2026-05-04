import { GradientBackground } from "@/components/shared/gradient-background"
import { TextGenerateEffect } from "@/components/shared/text-generate-effect"
import { Button } from "@/components/ui/button"
import { cn } from "@/components/ui/core/styling"
import { LoadingOverlay } from "@/components/ui/loading-spinner"
import { __isDesktop__ } from "@/types/constants"
import { SeaImage } from "@/components/shared/sea-image"
import { stagger, useAnimate } from "motion/react"
import React from "react"
import { createTranslator } from "@/locales"

const t = createTranslator("es")

type LoadingOverlayWithLogoProps = {
    refetch?: () => void
    title?: string
    compactBrandSpacing?: boolean
}

export function LoadingOverlayWithLogo({ refetch, title, compactBrandSpacing }: LoadingOverlayWithLogoProps) {
    const hasCustomTitle = typeof title === "string" && title.length > 0

    return <LoadingOverlay showSpinner={false}>
        <SeaImage
            src="/seanime-logo.png"
            alt="Loading..."
            priority
            width={100}
            height={100}
            className="animate-pulse z-[1]"
        />
        <GradientBackground />
        {/*<div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] opacity-10"></div>*/}
        {hasCustomTitle ? (
            <TextGenerateEffect className="text-lg mt-2 text-[--muted] animate-pulse z-[1] text-center" words={title} />
        ) : (
            <SplashBrandLockup compactSpacing={compactBrandSpacing} />
        )}

        {(__isDesktop__ && !!refetch) && (
            <Button
                onClick={() => window.location.reload()}
                className="mt-4 z-[1]"
                intent="gray-outline"
                size="sm"
            >{t("shared.reload")}</Button>
        )}
    </LoadingOverlay>
}

const splashBrandLetters = "Seanime".split("")
const splashSubBrandLetters = "ESP".split("")

function SplashBrandLockup({ compactSpacing }: { compactSpacing?: boolean }) {
    const [scope, animate] = useAnimate()

    React.useEffect(() => {
        const runAnimation = async () => {
            await animate(
                "[data-splash-brand-main-letter]",
                {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                },
                {
                    duration: 0.45,
                    delay: stagger(0.08),
                    ease: "easeOut",
                },
            )

            await animate(
                "[data-splash-brand-sub-letter]",
                {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                },
                {
                    duration: 0.35,
                    delay: stagger(0.06),
                    ease: "easeOut",
                },
            )
        }

        void runAnimation()
    }, [animate])

    return (
        <div
            ref={scope}
            className={cn(
                "mt-3 z-[1] flex w-fit flex-col items-center justify-center text-center text-[--muted]",
                compactSpacing ? "gap-2" : "gap-3",
            )}
        >
            <div
                data-splash-brand-main
                className="flex items-center justify-center gap-1.5 text-lg font-bold leading-none"
            >
                {splashBrandLetters.map((letter, idx) => (
                    <span
                        key={`${letter}-${idx}`}
                        data-splash-brand-main-letter
                        className="inline-block"
                        style={{ opacity: 0, transform: "translateY(6px)", filter: "blur(6px)" }}
                    >
                        {letter}
                    </span>
                ))}
            </div>

            <div
                data-splash-brand-sub
                className="flex items-center justify-center gap-1 text-xs font-semibold uppercase leading-none tracking-[0.28em] text-[--muted] opacity-80"
            >
                {splashSubBrandLetters.map((letter, idx) => (
                    <span
                        key={`${letter}-${idx}`}
                        data-splash-brand-sub-letter
                        className="inline-block"
                        style={{ opacity: 0, transform: "translateY(4px)", filter: "blur(5px)" }}
                    >
                        {letter}
                    </span>
                ))}
            </div>
        </div>
    )
}
