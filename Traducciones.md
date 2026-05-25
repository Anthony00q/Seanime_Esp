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
│   ├── changelogTour.json
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

Si una traducción (key) no existe en el idioma activo, la aplicación usará automáticamente el inglés (`en`) como reemplazo.

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

Crea `seanime-web/src/locales/fr/` con **exactamente la misma estructura** que `es/` (18 archivos JSON en total, incluyendo la subcarpeta `settings/`):

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
├── changelogTour.json
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

### Formateo y Variables (ICU)

Los textos que contienen llaves como `{count}` o `{name}` son variables dinámicas inyectadas por el código. **No traduzcas nunca los nombres de las variables** (ej. `{address}` no debe traducirse como `{dirección}`).

> **Soporte Avanzado (ICU)**: El sistema de traducciones (`intl-messageformat`) soporta nativamente la sintaxis avanzada de "ICU Message Format". Si el idioma al que estás traduciendo tiene reglas de pluralización complejas, puedes usar de forma totalmente segura el formato estándar: `{count, plural, one {1 elemento} other {# elementos}}`.

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

#### 1. Crear el archivo de traducciones

Crea `seanime-denshi/locales/fr.json` con la misma estructura que los existentes:

```json
{
  "tray": {
    "toggleVisibility": "Afficher/Masquer",
    "removeFromDock": "Retirer du Dock",
    "quit": "Quitter Seanime"
  }
}
```

#### 2. Cambiar el idioma por defecto del fork

En `seanime-denshi/src/main.js`, busca la función `initLocale()` y cambia el fallback `"es"` al código del nuevo idioma:

```javascript
// Antes
const locale = denshiSettings.locale || "es"

// Después (ejemplo: francés)
const locale = denshiSettings.locale || "fr"
```

Eso es todo. No se requiere ningún otro cambio en el código.

---

## Backend Go

**No se requiere modificar código backend.** Todos los mensajes y notificaciones que vienen del servidor (Go) ya están mapeados dinámicamente en el frontend. Al agregar un nuevo idioma, solo debes preocuparte de traducir los textos en los archivos JSON; las notificaciones del sistema se traducirán automáticamente.

---

## Configuración Adicional

### 1. Soporte de Fechas (date-fns)

Para que las fechas se formateen correctamente en tu idioma (ej: "hace 3 días"), registra el locale de fecha. Edita `seanime-web/src/locales/date-locale.ts` y añade el locale oficial correspondiente:

```typescript
import { fr } from "date-fns/locale"

const DATE_FNS_LOCALES: Record<string, Locale> = {
    es,
    en: enUS,
    fr,  // ← nuevo
}
```

### 2. Diccionario AniList

Los valores crudos de la API de AniList (géneros como "Action", formatos como "MOVIE", etc.) se traducen centralizadamente desde `anilist.json`. Traduce esos valores en tu carpeta de idioma y la aplicación los convertirá automáticamente. Si dejas alguno sin traducir, se mostrará en inglés.

---

## Verificación

```bash
# Validar JSON
node -e "JSON.parse(require('fs').readFileSync('ruta/al/archivo.json', 'utf8')); console.log('JSON válido')"

# Verificar TypeScript (sin errores)
cd seanime-web && npx tsgo --noEmit
```

> `tsgo --noEmit` valida que las keys de tu nuevo idioma coincidan con el tipo `Messages` definido por el idioma inglés. Si hay keys faltantes o rutas incorrectas, TypeScript las detectará.
