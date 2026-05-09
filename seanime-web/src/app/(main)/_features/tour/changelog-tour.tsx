import { createTranslator } from "@/locales"
import { useSeaCommand } from "@/app/(main)/_features/sea-command/sea-command.tsx"
import { SeaImage } from "@/components/shared/sea-image"
import { useRouter } from "@/lib/navigation"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import React from "react"
import { useWindowSize } from "react-use"
import { useServerStatus } from "../../_hooks/use-server-status"
import { __settings_tabAtom } from "../../settings/_components/settings-page.atoms"
import { __scanner_modalIsOpen } from "../anime-library/_containers/scanner-modal"
import { tourHelpers, useTour } from "./tour"
import { TourStep } from "./tour"

const t = createTranslator("es")

export const seenChangelogAtom = atomWithStorage<string | null>("sea-seen-changelog", null, undefined, { getOnInit: true })

function useSetupTour(): Record<string, () => TourStep[]> {
    const serverStatus = useServerStatus()
    const router = useRouter()
    const [, openScannerModal] = useAtom(__scanner_modalIsOpen)
    const [, setSettingsTab] = useAtom(__settings_tabAtom)
    const { setSeaCommandOpen, setSeaCommandInput } = useSeaCommand()

    const get3_5_0 = (): TourStep[] => {
        return [
            {
                id: "changelog-1",
                content: (
                    <div>
                        <h4 className="text-xl font-bold text-white">¿Qué hay de nuevo en 3.5.0?</h4>
                        <p>Veamos algunas de las nuevas funciones.</p>
                    </div>
                ),
                route: "/",
                nextLabel: t("common.buttons.start"),
                ignoreOutsideClick: true,
            },
            {
                id: "scanner",
                target: "[data-home-toolbar-scan-button]",
                title: "Nuevo escáner",
                content: "La lógica interna del escáner ha sido completamente renovada. Ahora usa un algoritmo más contextual y preciso.",
                route: "/",
                advanceOnTargetClick: true,
                ignoreOutsideClick: true,
                condition: () => !!serverStatus?.settings?.library?.libraryPath?.length,
                conditionFailBehavior: "modal",
            },
            {
                id: "scanner-2",
                target: "[data-scanner-modal-content]",
                title: "Nuevo escáner",
                content: "El escáner ahora admite Anime Offline Database para el emparejamiento de datos.",
                route: "/",
                prepare: () => {
                    openScannerModal(true)
                },
                advanceOnTargetClick: true,
                ignoreOutsideClick: true,
                condition: () => !!serverStatus?.settings?.library?.libraryPath?.length,
                conditionFailBehavior: "skip",
            },
            {
                id: "scanner-3",
                target: "[data-settings-anime-library='advanced-accordion-trigger']",
                title: "Configuración del escáner",
                content: "Ahora puedes ajustar con precisión el comportamiento de emparejamiento del escáner. Consulta la documentación para más información.",
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("library")
                    await tourHelpers.waitForSelector("[data-settings-anime-library='advanced-accordion-trigger']")
                    await tourHelpers.click("[data-settings-anime-library='advanced-accordion-trigger']", 200)
                },
                advanceOnTargetClick: false,
                ignoreOutsideClick: true,
            },
            {
                id: "issue-recorder",
                target: "[data-open-issue-recorder-button]",
                title: "Grabador de problemas",
                // content: "The issue recorder has been improved and will now record the UI.",
                content: <div>
                    <SeaImage
                        src="https://github.com/5rahim/hibike/blob/main/changelog/3_5-issue-recorder.gif?raw=true"
                        alt="Issue Recorder"
                        width="100%"
                        height="auto"
                        className="rounded-md"
                        allowGif
                    />
                    <p className="mt-2">El grabador de problemas ha mejorado y ahora puede grabar la UI, haciendo los informes de errores más detallados.</p>
                </div>,
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("seanime")
                },
                advanceOnTargetClick: false,
                ignoreOutsideClick: true,
                popoverWidth: 500,
            },
            {
                id: "transcode-new-player",
                target: "[data-tab-trigger='mediastream']",
                title: "Reproductor de transcodificación",
                content: "La transcodificación/reproducción directa ahora usa el reproductor personalizado de Seanime, también utilizado por Seanime Denshi y el streaming en línea.",
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("mediastream")
                },
                advanceOnTargetClick: false,
                ignoreOutsideClick: true,
            },
            {
                id: "search",
                target: "[data-vertical-menu-item='Search']",
                title: "Búsqueda",
                content: "El elemento de menú Búsqueda ahora abre la página de búsqueda. También puedes buscar rápidamente desde cualquier página pulsando 'S'.",
                route: "/search",
                advanceOnTargetClick: false,
                ignoreOutsideClick: true,
            },
            {
                id: "entry",
                title: "Nuevas funciones del reproductor",
                content: <div>
                    <SeaImage
                        src="https://github.com/5rahim/hibike/blob/main/changelog/3_5-videocore-characters.png?raw=true"
                        alt="Character Lookup"
                        width="100%"
                        height="auto"
                        className="rounded-md"
                    />
                    <p className="mt-2">Pulsa 'H' para buscar personajes rápidamente mientras ves. Pulsa 'Z' para activar las Estadísticas para frikis.</p>
                </div>,
                route: "/",
                advanceOnTargetClick: false,
                ignoreOutsideClick: false,
                popoverWidth: 500,
            },
        ]
    }

    const get3_7_0 = (): TourStep[] => {
        return [
            {
                id: "changelog-1",
                content: (
                    <div>
                        <h4 className="text-xl font-bold text-white">¿Qué hay de nuevo en 3.7.0?</h4>
                        <p>Veamos algunas de las nuevas funciones.</p>
                    </div>
                ),
                route: "/",
                nextLabel: t("common.buttons.start"),
                ignoreOutsideClick: true,
            },
            {
                id: "security",
                title: "Mejoras de seguridad",
                content: "3.7.0 incluye varias mejoras de seguridad, incluyendo modos seguros. Consulta la documentación para más información.",
                route: "/",
                advanceOnTargetClick: true,
                ignoreOutsideClick: true,
            },
            {
                id: "search",
                target: "[data-advanced-search-options-tags='true']",
                title: "Etiquetas",
                content: "La página de búsqueda ahora permite buscar por etiquetas.",
                route: "/search",
                advanceOnTargetClick: false,
                ignoreOutsideClick: true,
            },
            {
                id: "search",
                target: ".sea-command-content",
                title: "Contenido adulto en la búsqueda global",
                content: "La búsqueda global ya no filtra el contenido adulto si lo tienes activado. (Recuerda: pulsa 'S' para abrir la búsqueda global)",
                route: "/search",
                advanceOnTargetClick: false,
                ignoreOutsideClick: true,
                prepare: async () => {
                    setSeaCommandOpen(true)
                    setTimeout(() => {
                        setSeaCommandInput("/search ")
                    }, 200)
                    // wait 500ms
                    return new Promise(resolve => setTimeout(resolve, 500))
                },
            },
            {
                id: "changelog-2",
                title: "Correcciones de errores",
                content: "Se han corregido varios errores en esta versión, incluidos algunos relacionados con Seanime Denshi y los plugins. Lee el changelog completo para más detalles.",
                route: "/",
                ignoreOutsideClick: true,
            },
        ]
    }

    const get3_8_0 = (): TourStep[] => {
        return [
            {
                id: "changelog-1",
                content: (
                    <div>
                        <h4 className="text-xl font-bold text-white">¿Qué hay de nuevo en 3.8.0?</h4>
                        <p>Veamos las mayores incorporaciones de esta versión.</p>
                    </div>
                ),
                route: "/",
                nextLabel: t("common.buttons.start"),
                ignoreOutsideClick: true,
            },
            {
                id: "torrent-search",
                title: "Búsqueda y descargas de torrents",
                content: "La búsqueda de torrents ahora puede expandirse entre múltiples proveedores a la vez. Esta versión también soluciona algunos casos límite en descargas Debrid.",
                route: "/",
                ignoreOutsideClick: true,
            },
            {
                id: "subtitle-translation",
                title: "Traducción de subtítulos",
                content: "El Traductor de subtítulos ahora admite LLMs locales compatibles con OpenAI, por lo que herramientas como LM Studio y Ollama pueden usarse como backends de traducción local.",
                route: "/",
                ignoreOutsideClick: true,
            },
            {
                id: "external-player-link",
                target: "[data-settings-external-player-link-scheme]",
                title: "Archivos de subtítulos locales",
                content: "Los archivos de subtítulos locales ahora se detectan automáticamente desde la carpeta del video, y los enlaces de reproductor externo pueden usar el nuevo marcador '{subtitleUrl}' para esos archivos.",
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("external-player-link")
                    await tourHelpers.waitForSelector("[data-settings-external-player-link-scheme]")
                },
                ignoreOutsideClick: true,
                popoverWidth: 460,
            },
            {
                id: "spoilers",
                target: "[data-settings-hide-anime-spoilers]",
                title: "Ocultar spoilers",
                content: "Ahora puedes ocultar spoilers en toda la app. En las páginas de anime, el nuevo comando '/spoilers' te permite activar u ocultar los spoilers de ese anime específico.",
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("seanime")
                    await tourHelpers.waitForSelector("[data-settings-hide-anime-spoilers]")
                },
                ignoreOutsideClick: true,
                popoverWidth: 460,
            },
            {
                id: "online-streaming",
                target: "[data-settings-enable-onlinestream]",
                title: "Streaming en línea",
                content: "El streaming en línea ahora usa un nuevo proxy basado en HTTP/1 y puede cambiar automáticamente entre proveedores hasta encontrar uno que funcione.",
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("onlinestream")
                    await tourHelpers.waitForSelector("[data-settings-enable-onlinestream]")
                },
                ignoreOutsideClick: true,
                popoverWidth: 460,
            },
            {
                id: "default-episode-source",
                target: "[data-settings-default-episode-source]",
                title: "Fuente de episodio predeterminada",
                content: "Elige qué fuente de episodios debe abrir Seanime de forma predeterminada cuando accedas a la página de un anime.",
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("seanime")
                    await tourHelpers.waitForSelector("[data-settings-default-episode-source]")
                },
                ignoreOutsideClick: true,
                popoverWidth: 460,
            },
            {
                id: "ui-settings-redesign",
                target: "[data-settings-ui-panel-tabs]",
                title: "Ajustes de UI rediseñados",
                content: "El panel de ajustes de la Interfaz de Usuario ha sido rediseñado para facilitar la navegación.",
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("ui")
                    await tourHelpers.waitForSelector("[data-settings-ui-panel-tabs]")
                },
                ignoreOutsideClick: true,
                popoverWidth: 460,
            },
            {
                id: "ui-settings-redesign2",
                target: ".settings-ui-navigation-preloading",
                title: "Precarga de rutas",
                content: "Seanime ahora puede precargar rutas en segundo plano para que la navegación sea instantánea. Puedes ajustar el comportamiento de precarga en el nuevo panel de ajustes de UI.",
                prepare: async () => {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    await tourHelpers.waitForSelector(".settings-ui-navigation-preloading")
                },
                ignoreOutsideClick: true,
                popoverWidth: 460,
            },
            {
                id: "entry-header-redesign",
                target: "[data-media-page-header]",
                title: "Actualizaciones de UI",
                content: "El encabezado de medios ha sido ligeramente rediseñado. También hay nuevas animaciones y transiciones para una experiencia más fluida.",
                prepare: async () => {
                    router.push("/entry?id=21827")
                    await tourHelpers.waitForSelector("[data-media-page-header]")
                },
                ignoreOutsideClick: true,
                popoverWidth: 460,
            },
            {
                id: "extensions",
                title: "Extensiones",
                content: "Las extensiones ahora pueden desactivarse sin desinstalarlas, y los plugins tienen nuevas APIs para ajustes, autenticación y gestión de extensiones.",
                route: "/extensions",
                ignoreOutsideClick: true,
            },
            {
                id: "extension-secure-mode",
                target: "[data-settings-enable-extension-secure-mode]",
                title: "Modo seguro de extensiones",
                content: "Activa el Modo seguro de extensiones para recibir un aviso de confirmación cada vez que una extensión intente realizar una acción sensible.",
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("seanime")
                    await tourHelpers.waitForSelector("[data-settings-enable-extension-secure-mode]")
                },
                ignoreOutsideClick: true,
                popoverWidth: 460,
            },
            {
                id: "denshi",
                title: "Estado de ventana de Denshi",
                content: "Seanime Denshi ahora recuerda la posición y el tamaño de la ventana, por lo que al reabrir la app vuelves al mismo diseño de escritorio.",
                route: "/settings",
                prepare: async () => {
                    setSettingsTab("denshi")
                },
                condition: () => typeof window !== "undefined" && !!window.electron,
                conditionFailBehavior: "skip",
                ignoreOutsideClick: true,
            },
            // {
            //     id: "denshi",
            //     title: "View Transitions",
            //     content: "Seanime Denshi now uses the View Transitions API for native transitions between different screens.",
            //     route: "/schedule",
            //     prepare: async () => {
            //         setSettingsTab("seanime")
            //         await new Promise(resolve => setTimeout(resolve, 650))
            //         router.push("/lists")
            //         await new Promise(resolve => setTimeout(resolve, 650))
            //         router.push("/settings")
            //         await new Promise(resolve => setTimeout(resolve, 650))
            //         // scroll to bottom
            //         window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
            //         await new Promise(resolve => setTimeout(resolve, 650))
            //         router.push("/schedule")
            //         await new Promise(resolve => setTimeout(resolve, 650))
            //         router.push("/lists")
            //         await new Promise(resolve => setTimeout(resolve, 650))
            //         router.push("/settings")
            //         await new Promise(resolve => setTimeout(resolve, 650))
            //         router.push("/")
            //         await new Promise(resolve => setTimeout(resolve, 500))
            //     },
            //     condition: () => typeof window !== "undefined" && !!window.electron,
            //     conditionFailBehavior: "skip",
            //     ignoreOutsideClick: true,
            // },
            {
                id: "changelog-2",
                title: "Correcciones de errores",
                content: "Se han corregido varios errores en esta versión, incluidos algunos relacionados con el reproductor integrado. Lee el changelog completo para más detalles.",
                route: "/",
                ignoreOutsideClick: true,
            },
        ]
    }

    return {
        "3.5.0": get3_5_0,
        "3.7.0": get3_7_0,
        "3.8.0": get3_8_0,
    }
}

export function useChangelogTourListener() {
    const serverStatus = useServerStatus()
    const [seenChangelog, setSeenChangelog] = useAtom(seenChangelogAtom)
    const { start } = useTour()
    const tours = useSetupTour()
    const { width } = useWindowSize()
    const isMobile = width < 768

    const toursRef = React.useRef(tours)
    toursRef.current = tours

    const started = React.useRef(false)
    const timeout = React.useRef<NodeJS.Timeout | null>(null)

    React.useEffect(() => {
        if (!serverStatus?.showChangelogTour) return
        if (serverStatus.isOffline) return
        if (isMobile) return
        if (started.current) return

        if (seenChangelog === serverStatus.showChangelogTour) return

        started.current = true

        const tourId = serverStatus.showChangelogTour

        if (timeout.current) clearTimeout(timeout.current)
        timeout.current = setTimeout(() => {
            const getSteps = toursRef.current[tourId]
            if (getSteps) {
                start(getSteps(), tourId, () => {
                    console.log("tour completed")
                    setSeenChangelog(tourId)
                })
            }
        }, 1000)

        return () => {
            if (timeout.current) clearTimeout(timeout.current)
        }
    }, [serverStatus?.showChangelogTour, serverStatus?.isOffline, seenChangelog, start, setSeenChangelog, isMobile])

    return null
}
