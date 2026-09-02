import { enUS, fr, es, ptBR } from "date-fns/locale"
import { getCurrentLocale } from "@/locales/config"

export const dateFnsLocales = {
    "es": es,
    "fr": fr,
    "en": enUS,
    "pt": ptBR,
} as {
    [key: string]: any,
}

// Idiomas soportados por esta tabla (fr es legacy del upstream, se conserva)
const SUPPORTED_DATAGRID_LOCALES = ["en", "es", "pt", "fr"]

/**
 * Resuelve el idioma del datagrid: respeta `lng` explícito si es soportado,
 * si no usa el locale global de la app, con fallback a inglés.
 * Así el datagrid sigue al idioma configurado sin que cada consumidor pase `lng`.
 */
export function resolveDatagridLocale(explicit?: string): string {
    if (explicit && SUPPORTED_DATAGRID_LOCALES.includes(explicit)) return explicit
    try {
        const current = getCurrentLocale()
        if (SUPPORTED_DATAGRID_LOCALES.includes(current)) return current
    } catch {
        /* SSR o localStorage no disponible */
    }
    return "en"
}

export default {
    "filters": {
        "fr": "Filtres",
        "en": "Filters",
        "es": "Filtros",
        "pt": "Filtros",
    },
    "no-matching-result": {
        "fr": "Aucun résultat ne correspond aux filtres",
        "en": "No results matching filters",
        "es": "Sin resultados coincidentes",
        "pt": "Sem resultados para os filtros",
    },
    "remove-filters": {
        "fr": "Retirer les filtres",
        "en": "Remove all filters",
        "es": "Eliminar todos los filtros",
        "pt": "Remover filtros",
    },
    "page": {
        "fr": "Page",
        "en": "Page",
        "es": "Página",
        "pt": "Página",
    },
    "rows-selected": {
        "fr": "lignes sélectionnées",
        "en": "rows selected",
        "es": "filas seleccionadas",
        "pt": "linhas selecionadas",
    },
    "row-selected": {
        "fr": "ligne sélectionnée",
        "en": "row selected",
        "es": "fila seleccionada",
        "pt": "linha selecionada",
    },
    "save": {
        "fr": "Enregistrer",
        "en": "Save",
        "es": "Guardar",
        "pt": "Salvar",
    },
    "cancel": {
        "fr": "Annuler",
        "en": "Cancel",
        "es": "Cancelar",
        "pt": "Cancelar",
    },
    "updating": {
        "fr": "Modification",
        "en": "Updating",
        "es": "Actualizando",
        "pt": "Atualizando",
    },
    "true": {
        "fr": "Vrai",
        "en": "True",
        "es": "Verdadero",
        "pt": "Verdadeiro",
    },
    "false": {
        "fr": "Faux",
        "en": "False",
        "es": "Falso",
        "pt": "Falso",
    },
    "date-range-placeholder": {
        "fr": "Sélectionnez une période",
        "en": "Select a range",
        "es": "Selecciona un rango",
        "pt": "Selecione um intervalo",
    },
} as {
    [key: string]: { [key: string]: string },
}
