# Guía de Traducciones — Seanime_Esp

Este documento explica cómo funciona el sistema de internacionalización (i18n) de este fork y cómo agregar un nuevo idioma.

---

## Arquitectura

El proyecto tiene **3 capas** de traducción:

| Capa | Ubicación | Sistema |
|------|-----------|---------|
| **Frontend Web** | `seanime-web/src/locales/` | React + JSON modular + `createTranslator()` |
| **Electron Denshi** | `seanime-denshi/locales/` | JSON simple cargado en el main process |
| **Backend Go** | No se modifica | Mensajes traducidos en el frontend vía `SERVER_TOAST_MAP` |

---

## Frontend Web

### Estructura de archivos

```
seanime-web/src/locales/
├── index.ts                    # deepMerge + createTranslator() + useTranslation()
├── config.ts                   # Locale type, defaultLocale, localeNames
├── es/                         # Traducciones al español (idioma por defecto)
│   ├── common.json
│   ├── home.json
│   ├── navigation.json
│   ├── videoPlayer.json
│   ├── features.json
│   ├── misc.json
│   ├── entry.json
│   ├── manga.json
│   ├── extensions.json
│   ├── anilist.json
│   ├── gettingStarted.json
│   └── settings/
│       ├── general.json
│       ├── library.json
│       ├── players.json
│       ├── streaming.json
│       ├── advanced.json
│       └── ui.json
└── en/                         # Traducciones al inglés (fallback)
    └── (misma estructura que es/)
```

### Cómo funciona `createTranslator()`

```typescript
// En cualquier componente o archivo .ts/.tsx:
import { createTranslator } from "@/locales"
const t = createTranslator()  // Usa el defaultLocale definido en config.ts

t("home.empty.title")  // → "Tu pantalla de inicio está vacía"
t("common.buttons.save")  // → "Guardar"
t("entry.episode", { number: 5 })  // → "Episodio 5" (con interpolación)
```

Si una key no existe en el locale activo, se usa el fallback (`en`).

### Cómo cambiar el idioma por defecto

Edita **un solo archivo**: `seanime-web/src/locales/config.ts`

```typescript
export const defaultLocale: Locale = "es"  // Cambiar a "en", "fr", "pt", etc.
```

### Cómo agregar un nuevo idioma (ejemplo: francés)

#### 1. Agregar el código al tipo `Locale`

Edita `seanime-web/src/locales/config.ts`:

```typescript
export type Locale = "en" | "es" | "fr"

export const localeNames: Record<Locale, string> = {
    en: "English",
    es: "Español",
    fr: "Français",
}

export function isValidLocale(value: string): value is Locale {
    return value === "en" || value === "es" || value === "fr"
}
```

#### 2. Crear la carpeta de traducciones

Crea `seanime-web/src/locales/fr/` con **exactamente la misma estructura** que `es/` (17 archivos JSON en total, incluyendo la subcarpeta `settings/`):

```
fr/
├── common.json
├── home.json
├── navigation.json
├── videoPlayer.json
├── features.json
├── misc.json
├── entry.json
├── manga.json
├── extensions.json
├── anilist.json
├── gettingStarted.json
└── settings/
    ├── general.json
    ├── library.json
    ├── players.json
    ├── streaming.json
    ├── advanced.json
    └── ui.json
```

> **Nota**: Cada archivo JSON debe tener las **mismas keys** que su equivalente en `en/`. Los valores pueden ser traducciones directas o dejar el inglés como fallback.

#### 3. Importar y merge en `index.ts`

Edita `seanime-web/src/locales/index.ts`:

```typescript
// Agregar imports
import frCommon from "./fr/common.json"
import frHome from "./fr/home.json"
import frNavigation from "./fr/navigation.json"
// ... (todos los archivos de fr/)

// Agregar al deepMerge
const fr = deepMerge(
    {},
    frCommon,
    frHome,
    frNavigation,
    // ... (todos los archivos de fr/)
) as Messages

// Agregar al registro de traducciones
const translations: Record<string, Messages> = {
    en,
    es,
    fr,  // ← nuevo
}
```

#### 4. (Opcional) Cambiar el idioma por defecto

En `config.ts`:

```typescript
export const defaultLocale: Locale = "fr"
```

---

## Electron Denshi (System Tray)

### Estructura

```
seanime-denshi/
├── locales/
│   ├── es.json   { "tray": { "toggleVisibility": "Mostrar/Ocultar", ... } }
│   └── en.json   { "tray": { "toggleVisibility": "Show/Hide", ... } }
└── src/
    └── main.js   // Carga el locale según denshiSettings.locale
```

### Cómo funciona

Al iniciar, `main.js` lee `denshiSettings.locale` (por defecto `"es"`) y carga el archivo JSON correspondiente. Los strings del system tray se resuelven desde ese objeto.

### Cómo agregar un nuevo idioma

Crea `seanime-denshi/locales/fr.json`:

```json
{
  "tray": {
    "toggleVisibility": "Afficher/Masquer",
    "removeFromDock": "Retirer du Dock",
    "quit": "Quitter Seanime"
  }
}
```

Luego, en la app, el usuario debe agregar `"locale": "fr"` en su archivo `denshi-settings.json`:

```json
{
  "locale": "fr",
  "minimizeToTray": true,
  "openInBackground": false
}
```

---

## Backend Go

**No se modifica.** Los toasts del servidor se traducen en el frontend usando el patrón `SERVER_TOAST_MAP` en `misc-events.listeners.ts`:

```typescript
const SERVER_TOAST_MAP: Record<string, string> = {
    "Adding chapters to download queue...": "manga.chaptersAddedToDownloadQueue",
    "Download directory does not exist": "toast.torrentstream.downloadDirNotExist",
}
```

Para agregar un nuevo mensaje del servidor:
1. Añadir la key de traducción en el JSON correspondiente (`es/` y `en/`)
2. Añadir la entrada en `SERVER_TOAST_MAP`

---

## Helpers de Traducción

Además de `t()`, el proyecto exporta helpers para traducir valores específicos:

### `getDateFnsLocale()` — Locale de fechas dinámico

Devuelve el locale de `date-fns` según el `defaultLocale` configurado en `config.ts`. Todos los componentes que formatean fechas usan este helper:

```typescript
import { format, formatDistanceToNow } from "date-fns"
import { getDateFnsLocale } from "@/locales/date-locale"

// Formato de fecha dinámico según el idioma configurado
format(date, "MMMM yyyy", { locale: getDateFnsLocale() })  // → "Mayo 2026" en español
formatDistanceToNow(date, { addSuffix: true, locale: getDateFnsLocale() })  // → "en 3 días"
```

El archivo `locales/date-locale.ts` centraliza esto. Para agregar soporte de fecha a un nuevo idioma, solo agregar el locale al mapa en ese archivo.

### `capitalizeFirst()` — Capitalizar fechas

`date-fns` con locale `es` devuelve meses y días en minúscula. Para capitalizar:

```typescript
import { capitalizeFirst } from "@/lib/utils/capitalize-date"
import { getDateFnsLocale } from "@/locales/date-locale"

capitalizeFirst(format(date, "MMMM", { locale: getDateFnsLocale() }))  // → "Mayo" en vez de "mayo"
```

> **Nota**: El componente `Calendar` ya sobrescribe `CaptionLabel` con `capitalizeFirst()` internamente. Los captions de meses en los date pickers se capitalizan automáticamente — no es necesario aplicarlo manualmente.

### `translateGenre()`, `translateFormat()`, `translateSeason()`, etc. — Valores de AniList

Traducen los valores crudos de la API de AniList con fallback automático al inglés:

```typescript
import { translateGenre, translateFormat, translateSeason, translateStatus, translateTag } from "@/lib/anilist-translations"

{translateGenre(genre)}   // → "Acción" en vez de "Action"
{translateFormat(format)} // → "Película" en vez de "MOVIE"
{translateSeason(season)} // → "Invierno" en vez de "Winter"
```

---

## Reglas de Traducción

1. **Nombres propios NO se traducen**: MPV, VLC, FFmpeg, AniList, Discord, etc.
2. **Valores técnicos NO se traducen**: `cpu`, `nvidia`, `480p`, `HEVC`, `BluRay`, etc.
3. **Flags de CLI NO se traducen**: `--no-config --mute=yes`, etc.
4. **Placeholders**: Usar `{variable}` para interpolación, ej: `t("key", { count: 5 })`
5. **JSON sin comentarios**: Los archivos `.json` no pueden tener comentarios
6. **Paridad es/en**: Cada key en `es/` debe existir en `en/` con la misma ruta (TypeScript lo valida)
7. **No hardcodear strings visibles**: Siempre usar `t()` en el frontend visible

---

## Verificación

```bash
# Validar JSON
node -e "JSON.parse(require('fs').readFileSync('ruta/al/archivo.json', 'utf8')); console.log('JSON válido')"

# Verificar TypeScript (sin errores)
cd seanime-web && npx tsgo --noEmit
```
