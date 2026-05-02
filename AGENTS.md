# AGENTS.md — Seanime_Esp

## Contexto del Proyecto

- **Fork**: https://github.com/Anthony00q/Seanime_Esp
- **Upstream (Original)**: https://github.com/5rahim/seanime
- **Objetivo**: Traducir toda la interfaz al español
- **Versión**: v3.8.2-Esp (sincronizado con upstream v3.8.2)
- **Tipo**: Media server para anime y manga con interfaz web (React) + app de escritorio (Electron)
- **Stack**: Go 1.26.2 (backend) + React/Rsbuild/TanStack Router (frontend) + Electron (desktop)

### Ramas

| Rama | Propósito |
|------|-----------|
| `main` | Espejo puro de upstream/main — **NUNCA editar directamente** |
| `traduccion-es` | Rama de trabajo con traducciones — **aquí se hace todo el trabajo** |

- `main` tiene protección `pushRemote skip` para evitar pushes accidentales
- Para actualizar main: `git checkout main && git pull upstream main`

---

## Reglas de Traducción (CRÍTICO)

### Regla de Oro

> **Si el significado es el mismo → reutiliza**
> **Si el contexto cambia → separa**

- ✅ Reutilizar: "Anime" en `settings.discord.anime` y `settings.manga.title` → misma traducción "Anime"
- ❌ No duplicar: NO crear `"anime": "Anime"` en un archivo Y `"title": "Anime"` en otro
- ⚠️ Separar: Si "title" tiene significados diferentes en contextos distintos → keys separadas

### Reglas Adicionales

- **Nombres propios NO se traducen**: MPV, VLC, IINA, FFmpeg, NVIDIA, AniList, TorBox, Real-Debrid, AllDebrid, qBittorrent, Transmission, Discord, Nakama, SubsPlease, Erai-raws, EMBER, Judas, ASW, etc.
- **Valores técnicos NO se traducen**: `cpu`, `nvidia`, `qsv`, `vaapi`, `videotoolbox`, `ultrafast`, `superfast`, `veryfast`, `fast`, `medium`, `480p`, `720p`, `1080p`, `HEVC`, `x265`, `H.265`, `BDRip`, `BluRay`, `Blu-Ray`, `AT-X`, etc.
- **Flags de CLI NO se traducen**: `--no-config --mute=yes`, `--mpv-mute=yes`, etc.
- **Placeholders técnicos se traducen parcialmente**: "ej. C:/Program Files/mpv/mpv.exe" (el "ej." se traduce, la ruta no)
- **JSON sin comentarios**: Los archivos .json no pueden tener comentarios
- **Interpolación**: Usar `{variable}` para valores dinámicos, ej: `t("schedule.episodeNumber", { number: 5 })`

### Upstream Arrays (Regla Vital)

Si un componente requiere traducir opciones provistas por un archivo core del upstream (ej. `ThemeMediaPageBannerTypeOptions` en `theme-hooks.ts`), **NO modificar el array original**. Usar un diccionario local en el componente:

```typescript
const bannerTranslations = { "default": t("settings.ui.bannerType.default") }
```

Esto evita colisiones gigantes en futuros rebases con upstream.

### Verificación de Keys (CRÍTICO)

Después de agregar o modificar una traducción, **verifica que la key usada en el código coincida EXACTAMENTE con la key en el JSON**. Una key mal escrita o con un typo hace que el usuario vea texto crudo sin traducir (ej: `"toast.debrid.torrentDeleted"` en vez de `"Torrent eliminado"`).

- ✅ **Verificar**: Busca las calls a `t("...")` en el código con `grep -r 't("toast\.' --include="*.ts" --include="*.tsx"` y compáralas contra las keys en los archivos JSON
- ✅ **Paridad**: Cada key agregada a `es/` DEBE existir en `en/` con la misma ruta
- ❌ **No asumir**: No asumas que una key existe solo porque suena similar a otra. Verifica siempre

### Backend Go

**NO modificar el backend Go para traducción.** Los toasts del servidor se traducen en el frontend usando el patrón `SERVER_TOAST_MAP` en `misc-events.listeners.ts`. Esto evita conflictos en futuros rebases.

**Patrón SERVER_TOAST_MAP (ejemplo):**
```typescript
// misc-events.listeners.ts
const SERVER_TOAST_MAP: Record<string, string> = {
    "Adding chapters to download queue...": "manga.chaptersAddedToDownloadQueue",
    "Download directory does not exist": "toast.torrentstream.downloadDirNotExist",
}

function translateServerMessage(msg: string): string {
    const key = SERVER_TOAST_MAP[msg]
    if (key) return t(key)
    return msg
}
// Todos los toasts WebSocket (INFO, SUCCESS, WARNING, ERROR) pasan por translateServerMessage()
// Para agregar un nuevo mapeo: 1) Añadir la key en misc.json, 2) Añadir entrada en SERVER_TOAST_MAP
```

### Importante sobre `misc.json`

A diferencia de archivos como `home.json` o `common.json` que envuelven su contenido en una clave principal (`"home": {...}`), **el archivo `misc.json` NO tiene un prefijo raíz `"misc"`**. Sus propiedades se fusionan directamente en el objeto global.
- ✅ Correcto: `t("autoDownloaderFields.profileDesc")`
- ❌ Incorrecto: `t("misc.autoDownloaderFields.profileDesc")`
Además, si agregas una nueva sección en `es/misc.json` (como `toast`, `sync`, `autoplay`, etc.), **debes agregar exactamente la misma estructura raíz a `en/misc.json`** para mantener la paridad.

### Electron Denshi (System Tray)

**Usa sistema de locales JSON, NO `t()`.** El proceso principal de Electron no tiene acceso al sistema i18n del renderer. Los strings se cargan desde `seanime-denshi/locales/{locale}.json` al inicio de `main.js` según `denshiSettings.locale`.

```javascript
// seanime-denshi/locales/es.json
{ "tray": { "toggleVisibility": "Mostrar/Ocultar", "quit": "Salir de Seanime" } }

// seanime-denshi/src/main.js — función createTray()
{ label: trayStrings.toggleVisibility, click: () => toggleWindow() }
{ label: trayStrings.quit, click: () => app.quit() }
```

**Para agregar un idioma**: Crear `seanime-denshi/locales/{locale}.json` con la misma estructura. El usuario agrega `"locale": "{locale}"` en su `denshi-settings.json`.

### Utilidad `capitalizeFirst()` para Fechas

El archivo `lib/utils/capitalize-date.ts` exporta `capitalizeFirst()` para capitalizar la primera letra de strings (necesario porque `date-fns` con locale `es` devuelve meses/días en minúscula).

```typescript
import { capitalizeFirst } from "@/lib/utils/capitalize-date"
import { getDateFnsLocale } from "@/locales/date-locale"

// Uso con date-fns:
format(date, "MMMM", { locale: getDateFnsLocale() })  // → "mayo" (minúscula)
capitalizeFirst(format(date, "MMMM", { locale: getDateFnsLocale() }))  // → "Mayo"
```

**DatePicker**: `date-picker.tsx` pasa `locale={locale || getDateFnsLocale()}` al componente `Calendar` → todos los date pickers usan el locale configurado por defecto.

**Calendar**: El componente `calendar.tsx` sobrescribe `CaptionLabel` con `capitalizeFirst()` → los captions de meses/días en los calendarios ya se muestran capitalizados automáticamente. No es necesario aplicar `capitalizeFirst()` manualmente en los captions del calendario.

---

## Sistema de Traducción

### Estructura

```
seanime-web/src/locales/
├── es/                          # Traducciones al español (IDIOMA POR DEFECTO)
│   ├── common.json              # buttons, labels, messages, placeholders, toasts genéricos
│   ├── home.json                # pantalla de inicio
│   ├── navigation.json          # navegación, diálogos, offline
│   ├── videoPlayer.json         # reproductor de video
│   ├── features.json            # schedule, nakama, seaCommand, discover, sorting, search
│   ├── misc.json                # status, scanner, toasts API, sync, autoDownloader, etc. (archivo "comodín" para secciones misceláneas)
│   ├── entry.json               # página de entrada (anime/manga detail)
│   ├── manga.json               # biblioteca y lector de manga
│   ├── extensions.json          # marketplace y playground de extensiones
│   ├── anilist.json             # diccionario AniList (géneros, formatos, tags, etc.)
│   ├── gettingStarted.json      # asistente de configuración inicial
│   ├── changelogTour.json       # tour de novedades del changelog
│   └── settings/                # configuración por subsección
│       ├── general.json         # tabs, page, app, server
│       ├── library.json         # biblioteca de anime, escáner
│       ├── players.json         # reproductor de escritorio, playback
│       ├── streaming.json       # mediastream, torrentstream, debrid
│       ├── advanced.json        # autoSelectProfile, onlinestream, manga, discord
│       └── ui.json              # interfaz de usuario, logs, cache, data
├── en/                          # Traducciones al inglés (estructura modular espejo de es/)
│   ├── common.json              # mismo contenido que es/ pero en inglés
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
│   └── settings/                # mismo contenido que es/settings/ pero en inglés
│       ├── general.json
│       ├── library.json
│       ├── players.json
│       ├── streaming.json
│       ├── advanced.json
│       └── ui.json
├── index.ts                     # deep-merge de es/ + en/ + createTranslator() + useTranslation()
└── config.ts                    # Locale type, defaultLocale, localeNames
```

### Cómo Funciona

`index.ts` importa todos los archivos de `es/` y `en/` y los fusiona con `deepMerge()`. El objeto `en` se usa como `type Messages` para validación TypeScript de las ~2500+ keys. El objeto `es` se usa para las traducciones reales en la app.

**Importante**: Cada key que existe en `es/` DEBE existir en `en/` con la misma ruta pero valor en inglés. Esto permite que TypeScript detecte typos y keys faltantes.

### Patrones de Uso

```typescript
// Componente React
import { createTranslator } from "@/locales"
const t = createTranslator()  // Usa defaultLocale de config.ts ("es")
t("home.empty.title")                    // → "Tu pantalla de inicio está vacía"
t("home.toolbar.resolve.unmatched", { count: 5 })  // → "Resolver 5 archivos sin coincidencia"

// Hooks/archivos .ts (NO son componentes React)
import { createTranslator } from "@/locales"
const t = createTranslator()  // a nivel de módulo, usa defaultLocale
toast.success(t("toast.settings.settingsSaved"))

// Funciones fuera de componentes: pasar errorMsg como parámetro
const saveLogToDB = async (content: string, errorMsg: string) => {
    toast.error(errorMsg)
}
// Llamada desde componente:
saveLogToDB(result, t("scanLogViewer.failedToSaveLogStorage"))

// Diccionario AniList (géneros, formatos, tags, etc.)
import { translateGenre, translateFormat, translateSeason, translateStatus, translateTag } from "@/lib/anilist-translations"
{translateGenre(genre)}   // → "Acción" en vez de "Action"
{translateFormat(format)} // → "Película" en vez de "MOVIE"
// Fallback automático al inglés si no está traducido
```

### Características

- **Idioma por defecto**: Español (`es`)
- **Fallback automático**: Si una key no existe en español, usa inglés
- **Soporte UTF-8**: Compatible con ñ, acentos, ¿, ¡

---

## Cómo Agregar Nuevas Traducciones

> **Nota**: Para instrucciones completas sobre cómo agregar un nuevo idioma (fr, pt, etc.), consultar `Traducciones.md` en la raíz del proyecto.

1. **Identificar el archivo correcto** en `es/` según la sección
2. **Buscar si ya existe una key con el mismo significado** (Regla de Oro)
3. **Agregar la key** al JSON correspondiente en `es/`
4. **Agregar la misma key** al JSON correspondiente en `en/` con valor en inglés
5. **Usar en código**: `t("sección.key")` donde sea necesario

### Nueva sección completa

1. Crear `seanime-web/src/locales/es/nueva-seccion.json`
2. Crear `seanime-web/src/locales/en/nueva-seccion.json` (mismas keys, valores en inglés)
3. En `index.ts`, añadir: `import esNuevaSeccion from "./es/nueva-seccion.json"`
4. Añadir: `import enNuevaSeccion from "./en/nueva-seccion.json"`
5. Añadir ambos al `deepMerge()` correspondiente (`es` y `en`)

---

## Strings Hardcodeados

- **NO hardcodear traducciones directamente en componentes** — siempre usar `t()`
- **NO hardcodear strings en inglés ni español** en el frontend visible
- **SOLO se permite hardcodear si está justificado**, por ejemplo:
  - Strings técnicos internos no visibles al usuario
  - Casos donde el upstream lo requiere de forma específica
- **Si crees que un hardcodeo está justificado → AVISA ANTES de hacerlo**, explica por qué y espera confirmación del usuario

---

## Commits

- **NO hagas commits automáticos** de cambios locales
- Los commits los hace el usuario manualmente
- **SOLO haz commit si el usuario lo indica explícitamente** ("haz commit", "commitea esto", etc.)

---

## Anti-Patrones (QUÉ NO HACER)

- ❌ NO hardcodear strings visibles (siempre usar `t()`)
- ❌ NO modificar backend Go para traducción (usar SERVER_TOAST_MAP en frontend)
- ❌ NO editar `main` (es espejo de upstream)
- ❌ NO crear duplicados de keys existentes (Regla de Oro)
- ❌ NO modificar arrays del upstream (usar diccionario local)
- ❌ NO agregar comentarios en archivos JSON
- ❌ NO hacer commits automáticos
- ❌ NO crear keys huérfanas que no se usan en ningún componente
- ❌ NO agregar key a `es/` sin agregar la misma key a `en/` (deben estar en paridad)

---

## Comandos de Verificación

| Comando | Propósito |
|---------|-----------|
| `cd seanime-web && npx tsgo --noEmit` | Verificar TypeScript sin errores (usa `tsgo`, NO `tsc`) |
| `node -e "JSON.parse(require('fs').readFileSync('ruta/al/archivo.json', 'utf8')); console.log('JSON válido')"` | Validar JSON de traducción |
| `go build ./...` | Verificar que Go compila sin errores |

---

## Puertos y Desarrollo

| Componente | Puerto | Comando |
|------------|--------|---------|
| Servidor Go (dev) | 43000 | `go run main.go serve --port 43000` |
| Dev Server Web | 43210 | `cd seanime-web && npm run dev` |

**Importante**: En desarrollo, el frontend conecta al servidor Go en puerto `43000`, no el default `43211`.

### Build de Producción

Ejecutar `abrir-proyecto.bat` en la raíz del proyecto. Automatiza:
1. `npm install` → 2. `npm run build` → 3. Copiar `seanime-web/out/` a `web/` → 4. Compilar Go → 5. Generar `seanime.exe`

### Build Manual

```bash
# Web
cd seanime-web && npm install && npm run build

# Copiar web
rm -rf web && cp -r seanime-web/out web

# Go (Windows sin system tray)
go build -o seanime.exe -trimpath -ldflags="-s -w" -tags=nosystray
```

---

## Git Workflow

### Commit de trabajo
```bash
git add .
git commit -m "mensaje descriptivo"
git push origin traduccion-es
```

### Sincronizar con upstream
```bash
git checkout main
git pull upstream main
git checkout traduccion-es
git rebase main
# Resolver conflictos si hay, luego:
git rebase --continue
git push origin traduccion-es
```

### Después de un rebase
1. Revisar si el updater necesita restauración (ver `informacion/guia_mantenimiento_updater.txt`)
2. Revisar nuevos strings traducibles del upstream
3. Agregar keys faltantes al archivo correspondiente en `es/` y la misma key en `en/` con valor en inglés
4. Ejecutar verificaciones: TypeScript, JSON válidos, Go build

> **REGLA DE ORO AL RESOLVER CONFLICTOS**: Siempre prioriza y conserva la lógica/estructura nueva del upstream (ej. nuevas mutaciones, hooks o utilidades). Limítate a "inyectar" nuestras funciones de traducción (`t()`) o nuestro locale dinámico (`getDateFnsLocale()`) sobre ese código nuevo. **Nunca reviertas lógica nueva del upstream solo para salvar una línea antigua traducida.**

---

## Updater del Fork

El sistema de actualizaciones fue redirigido al fork. Consulta `informacion/guia_mantenimiento_updater.txt` y `informacion/copias_updater/` para restaurar tras un rebase.

**Archivos clave (Backend Go)**: `internal/updater/check.go`, `internal/util/version.go`, `internal/handlers/releases.go`
**Archivos clave (Electron Denshi)**: `seanime-denshi/src/main.js`, `seanime-denshi/package.json`


