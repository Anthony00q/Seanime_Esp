import { ExtensionRepo_OnlinestreamProviderExtensionItem, Onlinestream_EpisodeListResponse, Onlinestream_EpisodeSource } from "@/api/generated/types"
import { logger, useLatestFunction } from "@/lib/helpers/debug"
import React from "react"
import { toast } from "sonner"
import { createTranslator } from "@/locales"

const t = createTranslator()

type TrialState = {
    providers: string[]
    providerIndex: number
    serverIndex: number
}

type UseOnlinestreamAutoProviderCyclerProps = {
    mediaId: number
    provider: string | null
    server: string | undefined
    url: string | null
    providerExtensions: ExtensionRepo_OnlinestreamProviderExtensionItem[]
    dubbed: boolean
    currentEpisodeNumber: number | null
    episodeListResponse?: Onlinestream_EpisodeListResponse
    episodeListLoading: boolean
    isEpisodeListFetched: boolean
    isEpisodeListError: boolean
    episodeSource?: Onlinestream_EpisodeSource
    episodeSourceLoading: boolean
    isEpisodeSourceError: boolean
    playbackError: string | null
    setProvider: (provider: string | null) => void
    setServer: (server: string | undefined) => void
    setQuality: (quality: string | undefined) => void
    setSelectedEpisodeNumber: (episodeNumber: number) => void
    setUrl: (url: string | null) => void
    setPlaybackError: (error: string | null) => void
}

const log = logger("ONLINESTREAM")
const PROVIDER_TIMEOUT_MS = 15_000
const PLAYBACK_TIMEOUT_MS = 20_000

function getServers(episodeSource: Onlinestream_EpisodeSource | undefined) {
    return Array.from(new Set(
        (episodeSource?.videoSources ?? [])
            .map(source => source.server)
            .filter((server): server is string => !!server),
    ))
}

function orderProviders(providers: ExtensionRepo_OnlinestreamProviderExtensionItem[], currentProvider: string | null) {
    const ids = providers.map(provider => provider.id)
    if (!currentProvider || !ids.includes(currentProvider)) return ids
    return [currentProvider, ...ids.filter(id => id !== currentProvider)]
}

export function useOnlinestreamAutoProviderCycler(props: UseOnlinestreamAutoProviderCyclerProps) {
    const {
        mediaId,
        provider,
        server,
        url,
        providerExtensions,
        dubbed,
        currentEpisodeNumber,
        episodeListResponse,
        episodeListLoading,
        isEpisodeListFetched,
        isEpisodeListError,
        episodeSource,
        episodeSourceLoading,
        isEpisodeSourceError,
        playbackError,
        setProvider,
        setServer,
        setQuality,
        setSelectedEpisodeNumber,
        setUrl,
        setPlaybackError,
    } = props

    const [trial, setTrial] = React.useState<TrialState | null>(null)
    const [detectedFailure, setDetectedFailure] = React.useState<string | null>(null)
    const trialRef = React.useRef<TrialState | null>(null)
    const playbackProgressRef = React.useRef(0)

    const availableProviders = React.useMemo(() => {
        return providerExtensions
            .filter(provider => !dubbed || provider.supportsDub)
            .sort((a, b) => a.name.localeCompare(b.name))
    }, [providerExtensions, dubbed])

    const setTrialState = React.useCallback((nextTrial: TrialState | null) => {
        trialRef.current = nextTrial
        setTrial(nextTrial)
    }, [])

    const stopWithFailure = useLatestFunction((reason: string) => {
        log.warning("No working provider found", reason)
        setTrialState(null)
        setUrl(null)
        setPlaybackError("No working providers found")
        toast.error(t("onlinestream.noWorkingProviders"))
    })

    const advanceProvider = useLatestFunction((reason: string) => {
        const currentTrial = trialRef.current
        if (!currentTrial) return

        const nextProviderIndex = currentTrial.providerIndex + 1
        if (nextProviderIndex >= currentTrial.providers.length) {
            stopWithFailure(reason)
            return
        }

        log.warning("Trying next provider", reason)
        setTrialState({
            ...currentTrial,
            providerIndex: nextProviderIndex,
            serverIndex: 0,
        })
    })

    const tryAllProviders = useLatestFunction(() => {
        if (!mediaId) return
        if (!availableProviders.length) {
            toast.warning(dubbed ? "No dubbed providers available" : "No providers available")
            return
        }

        const providers = orderProviders(availableProviders, provider)
        let providerIndex = 0
        let serverIndex = 0

        if (detectedFailure && provider && providers[0] === provider) {
            const servers = getServers(episodeSource)
            const currentServerIndex = servers.findIndex(s => s === server)
            if (detectedFailure.includes("playback") && currentServerIndex >= 0 && currentServerIndex + 1 < servers.length) {
                serverIndex = currentServerIndex + 1
            } else if (providers.length > 1) {
                providerIndex = 1
            }
        }

        const nextTrial = { providers, providerIndex, serverIndex }
        log.info("Trying providers", { providers, dubbed })
        setDetectedFailure(null)
        setTrialState(nextTrial)
        setUrl(null)
        setPlaybackError(null)
        setServer(undefined)
        setQuality(undefined)
        setProvider(providers[providerIndex])
    })

    const onPlaybackError = useLatestFunction((reason: string) => {
        const currentTrial = trialRef.current
        if (!currentTrial) {
            setDetectedFailure("playback error")
            setPlaybackError(reason)
            return
        }

        setUrl(null)
        setPlaybackError(null)

        const servers = getServers(episodeSource)
        const nextServerIndex = currentTrial.serverIndex + 1
        if (nextServerIndex < servers.length) {
            log.warning("Trying next server", { reason, server: servers[nextServerIndex] })
            setTrialState({ ...currentTrial, serverIndex: nextServerIndex })
            return
        }

        advanceProvider(reason)
    })

    const onPlaybackStalled = useLatestFunction((reason: string) => {
        if (!trialRef.current) {
            setDetectedFailure(reason)
            return
        }
        onPlaybackError(reason)
    })

    const onLoadedMetadata = useLatestFunction(() => {
        setPlaybackError(null)
    })

    const onTimeUpdate = useLatestFunction((e: React.SyntheticEvent<HTMLVideoElement>) => {
        playbackProgressRef.current = Date.now()
        if (detectedFailure) {
            setDetectedFailure(null)
        }

        if (!trialRef.current) return
        if (e.currentTarget.currentTime < 1) return

        log.success("Found working provider", { provider, server })
        setTrialState(null)
        setPlaybackError(null)
    })

    const cancel = useLatestFunction(() => {
        if (!trialRef.current) return
        setTrialState(null)
        setDetectedFailure(null)
        toast.info(t("onlinestream.stoppedTryingProviders"))
    })

    React.useEffect(() => {
        playbackProgressRef.current = 0
        setDetectedFailure(null)
    }, [provider, server, currentEpisodeNumber, url])

    React.useEffect(() => {
        if (!trial) return

        const targetProvider = trial.providers[trial.providerIndex]
        if (!targetProvider) return

        if (provider !== targetProvider) {
            setUrl(null)
            setPlaybackError(null)
            setServer(undefined)
            setQuality(undefined)
            setProvider(targetProvider)
        }
    }, [trial, provider, setProvider, setQuality, setServer, setUrl, setPlaybackError])

    React.useEffect(() => {
        if (!trial) return
        if (provider !== trial.providers[trial.providerIndex]) return
        if (episodeListLoading) return

        if (isEpisodeListError) {
            advanceProvider("episode list error")
            return
        }

        const episodes = episodeListResponse?.episodes ?? []
        if (isEpisodeListFetched && !episodes.length) {
            advanceProvider("no episodes")
            return
        }

        if (isEpisodeListFetched && episodes.length && currentEpisodeNumber === null) {
            setSelectedEpisodeNumber(episodes[0].number)
            return
        }

        if (isEpisodeListFetched && currentEpisodeNumber !== null && !episodes.some(episode => episode.number === currentEpisodeNumber)) {
            advanceProvider("episode not found")
        }
    }, [
        trial,
        provider,
        episodeListResponse,
        episodeListLoading,
        isEpisodeListFetched,
        isEpisodeListError,
        currentEpisodeNumber,
        setSelectedEpisodeNumber,
        advanceProvider,
    ])

    React.useEffect(() => {
        if (trial || detectedFailure || !episodeListLoading) return

        const timeout = window.setTimeout(() => {
            setDetectedFailure("episode list timeout")
        }, PROVIDER_TIMEOUT_MS)

        return () => window.clearTimeout(timeout)
    }, [trial, detectedFailure, provider, dubbed, episodeListLoading])

    React.useEffect(() => {
        if (!trial) return
        if (provider !== trial.providers[trial.providerIndex]) return
        if (!episodeListLoading) return

        const timeout = window.setTimeout(() => {
            advanceProvider("episode list timeout")
        }, PROVIDER_TIMEOUT_MS)

        return () => window.clearTimeout(timeout)
    }, [trial, provider, episodeListLoading, advanceProvider])

    React.useEffect(() => {
        if (!trial) return
        if (provider !== trial.providers[trial.providerIndex]) return
        if (!isEpisodeListFetched || episodeListLoading || currentEpisodeNumber === null) return
        if (episodeSourceLoading) return

        if (isEpisodeSourceError) {
            advanceProvider("episode source error")
            return
        }

        if (!episodeSource) return

        const servers = getServers(episodeSource)
        if (!servers.length) {
            advanceProvider("no video sources")
            return
        }

        const server = servers[trial.serverIndex]
        if (!server) {
            advanceProvider("servers exhausted")
            return
        }

        setUrl(null)
        setPlaybackError(null)
        setServer(server)
    }, [
        trial,
        provider,
        episodeSource,
        episodeSourceLoading,
        isEpisodeSourceError,
        isEpisodeListFetched,
        episodeListLoading,
        currentEpisodeNumber,
        setServer,
        setUrl,
        setPlaybackError,
        advanceProvider,
    ])

    React.useEffect(() => {
        if (trial || detectedFailure) return
        if (!isEpisodeListFetched || episodeListLoading || currentEpisodeNumber === null) return
        if (!episodeSourceLoading) return

        const timeout = window.setTimeout(() => {
            setDetectedFailure("episode source timeout")
        }, PROVIDER_TIMEOUT_MS)

        return () => window.clearTimeout(timeout)
    }, [
        trial,
        detectedFailure,
        provider,
        isEpisodeListFetched,
        episodeListLoading,
        currentEpisodeNumber,
        episodeSourceLoading,
    ])

    React.useEffect(() => {
        if (!trial) return
        if (provider !== trial.providers[trial.providerIndex]) return
        if (!isEpisodeListFetched || episodeListLoading || currentEpisodeNumber === null) return
        if (!episodeSourceLoading) return

        const timeout = window.setTimeout(() => {
            advanceProvider("episode source timeout")
        }, PROVIDER_TIMEOUT_MS)

        return () => window.clearTimeout(timeout)
    }, [
        trial,
        provider,
        isEpisodeListFetched,
        episodeListLoading,
        currentEpisodeNumber,
        episodeSourceLoading,
        advanceProvider,
    ])

    React.useEffect(() => {
        if (!trial) return
        if (provider !== trial.providers[trial.providerIndex]) return
        if (!episodeSource || episodeSourceLoading || isEpisodeSourceError) return

        const targetServer = getServers(episodeSource)[trial.serverIndex]
        if (!targetServer || server !== targetServer) return

        const timeout = window.setTimeout(() => {
            onPlaybackError("playback timeout")
        }, PLAYBACK_TIMEOUT_MS)

        return () => window.clearTimeout(timeout)
    }, [
        trial,
        provider,
        server,
        episodeSource,
        episodeSourceLoading,
        isEpisodeSourceError,
        onPlaybackError,
    ])

    React.useEffect(() => {
        if (trial || detectedFailure || !url) return
        if (episodeSourceLoading || isEpisodeSourceError) return

        const startedAt = Date.now()
        const timeout = window.setTimeout(() => {
            if (playbackProgressRef.current < startedAt) {
                setDetectedFailure("playback timeout")
            }
        }, PLAYBACK_TIMEOUT_MS)

        return () => window.clearTimeout(timeout)
    }, [trial, detectedFailure, url, episodeSourceLoading, isEpisodeSourceError])

    const hasEpisodeListFailure = isEpisodeListError || (isEpisodeListFetched && !episodeListLoading && !(episodeListResponse?.episodes ?? []).length)
    const hasEpisodeSourceFailure = isEpisodeSourceError || (!!episodeSource && !episodeSourceLoading && !(episodeSource.videoSources ?? []).length)
    const hasFailure = hasEpisodeListFailure || hasEpisodeSourceFailure || !!playbackError || !!detectedFailure
    const canTry = !!mediaId && !!availableProviders.length

    return {
        isTrying: !!trial,
        showButton: canTry && (!!trial || hasFailure),
        tryAllProviders,
        cancel,
        onPlaybackError,
        onPlaybackStalled,
        onLoadedMetadata,
        onTimeUpdate,
    }
}
