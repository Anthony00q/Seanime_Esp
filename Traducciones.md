# Guía para Contribuir Traducciones — Seanime_Esp

¡Gracias por tu interés en traducir Seanime_Esp a tu idioma! 

Actualmente, el proyecto soporta de forma nativa **Español (`es`)**, **Inglés (`en`)** y **Português (código `pt`, locale regional `pt-BR`)**. Si deseas agregar un idioma nuevo (por ejemplo, Francés, Alemán o Ruso), esta guía te explicará cómo hacerlo paso a paso.

---

## Directrices de Diseño y Estilo

Para garantizar la consistencia visual y técnica del proyecto, toda nueva traducción debe cumplir con las siguientes directrices:

1. **Conservación de Terminología Específica**: Evite traducir forzosamente términos técnicos o palabras que la comunidad de consumo de medios y anime ya utiliza como estándares universales (en inglés o japonés). Términos como *Fansubs, Seeding, Offset, Isekai, Shounen, Slice of Life* deben mantenerse en su idioma original para preservar su significado exacto.
2. **Optimización de la Longitud en la Interfaz (UI)**: La traducción no debe alterar el diseño ni romper los componentes visuales. Compare siempre la longitud de sus textos con los de `es/` o `en/`. Si una traducción resulta excesivamente larga, busque una alternativa más compacta.
   - *Ejemplo: En lugar de "Transcodificação / Reprodução Direta", se prefiere la versión concisa "Transcoding / Direct Play" para evitar que el menú de ajustes se desborde.*
3. **Paridad Estricta**: Cada archivo y cada clave ("key") de traducción DEBE existir de forma idéntica a la estructura de la carpeta base en inglés (`en/`). La omisión de una sola clave provocará fallos en la compilación.
4. **Puntuación y Espacios Finales**: Preste especial atención a los espacios en blanco o signos de puntuación al final de las frases originales (ej. `"Tamaño: "`). Si el inglés tiene un espacio al final de la cadena, su traducción también debe conservarlo para evitar que el texto choque visualmente con los números o variables dinámicas en la interfaz.
5. **Sintaxis ICU (Plurales y Condicionales)**: Algunas cadenas contienen mensajes ICU como `{count, plural, one {# item} other {# items}}` o `{value, select, ...}`. Traduzca **solo el texto dentro de las llaves internas**; nunca traduzca los comandos reservados (`plural`, `select`, `one`, `other`, `few`, `many`, `zero`) ni las variables. El símbolo `#` representa el número y puede reposicionarse dentro de la rama. Adapte las ramas disponibles a las reglas de plural de su idioma.
   - En portugués, incluya siempre una rama explícita `=0` con texto plural. Pase los conteos como números, no como cadenas.
6. **Argumentos y plantillas literales**: Una clave como `common.labels.episodeNumber` requiere `{ number }`; para un label sin valor use `common.labels.episodeNumberLabel`. Las plantillas técnicas que muestran llaves literalmente están enumeradas en `seanime-web/scripts/i18n-audit.mjs` y no deben interpolarse.

---

## Cómo agregar un nuevo idioma (Paso a Paso)

Usaremos **Francés (`fr`)** como ejemplo.

### 1. Preparación de Archivos de Traducción

Ve a la carpeta `seanime-web/src/locales/` y copia la carpeta `en/` entera. Renombra la copia con el código de tu idioma (ej. `fr/`).
- Mantén la misma estructura de archivos (incluyendo las subcarpetas `settings/` y `modules/`).
- No agregues comentarios (`//`) dentro de los archivos JSON.
- Traduce los valores, pero **nunca** traduzcas las variables entre llaves (ej. `{address}` se queda como `{address}`).

### 2. Registro del Idioma

Edita `seanime-web/src/locales/config.ts`:

```typescript
// 1. Agrega tu idioma al tipo Locale
export type Locale = "en" | "es" | "pt" | "fr"

// 2. Ponle un nombre nativo para que aparezca automáticamente en el selector de la UI
//    (la validación es automática vía isValidLocale() contra esta tabla,
//    no hay ninguna lista `if (saved === ...)` que actualizar)
export const localeNames: Record<Locale, string> = {
    en: "English",
    es: "Español",
    pt: "Português",
    fr: "Français", // ← nuevo
}
```

### 3. Integración en el Validador Estricto (`index.ts`)

Edita `seanime-web/src/locales/index.ts` para conectar tu carpeta al motor de la aplicación:

```typescript
// 1. Importa todos tus archivos JSON
import frCommon from "./fr/common.json"
import frHome from "./fr/home.json"
import frToasts from "./fr/modules/toasts.json"
// ... (importa todos)

// 2. Agrúpalos en un array
const frModules = [
    frCommon, frHome, frToasts, /* ... resto de archivos */
] as const;

// 3. Genera la validación estricta (¡IMPORTANTÍSIMO!)
// Esto arrojará error TS2344 en compilación si te faltan/sobran keys.
// El motor también detecta en ejecución las keys duplicadas entre archivos.
type FrMessages = UnionToIntersection<typeof frModules[number]>;
type _VerifyFr = AssertParity<CheckParity<Paths<FrMessages>>>;

// 4. Agrégalo al registro de módulos (imports estáticos, con validación estricta)
const languageModules: Record<string, readonly Record<string, any>[]> = {
    en: enModules,
    es: esModules,
    pt: ptModules,
    fr: frModules, // ← nuevo
};
```

### 4. Soporte de Fechas Nativas (Calendarios)

Para que el calendario muestre los meses en tu idioma, añade el locale oficial de `date-fns` en `seanime-web/src/locales/date-locale.ts`:

```typescript
import { fr } from "date-fns/locale"

const DATE_FNS_LOCALES: Record<string, Locale> = {
    es,
    en: enUS,
    pt: ptBR,
    fr,  // ← nuevo
}
```

### 5. Traducciones nativas de Electron (Denshi)

Copia **todo** `seanime-denshi/locales/en.json` a `seanime-denshi/locales/fr.json`: incluye el menú del ícono de la bandeja (`tray`), los errores (`error`), los avisos de registros (`logging`) y el inicio (`startup`). Traduce sus valores y registra el código en `DenshiLocale` e `isDenshiLocale()` de `seanime-denshi/src/main/locale.ts`.

```json
{
  "tray": {
    "toggleVisibility": "Afficher/Masquer",
    "removeFromDock": "Retirer du Dock",
    "quit": "Quitter Seanime"
  },
  "error": {
    "title": "Une erreur est survenue",
    "uncaughtException": "Exception non capturée",
    "checkLogs": "Consultez les journaux pour plus de détails.",
    "mpvCoreStartFailed": "Seanime Denshi n'a pas pu démarrer MpvCore"
  },
  "logging": {
    "restartNow": "Redémarrer maintenant",
    "later": "Plus tard",
    "restartRequired": "Redémarrage nécessaire",
    "restartMessage": "Redémarrez pour appliquer les changements de journaux MpvCore. Redémarrer maintenant ?"
  },
  "startup": {
    "starting": "Seanime démarre"
  }
}
```

---

### 6. Tablas y controles del idioma

- El DataGrid usa su propia tabla en `seanime-web/src/components/ui/datagrid/locales.ts`: añada el idioma allí y su locale de `date-fns`.
- Registre el idioma en el auditor (`languages` en `scripts/i18n-audit.mjs`) y amplíe las pruebas parametrizadas web y nativas.
- Para cifras visibles use `formatNumber()`; para fechas, `formatLocalized()` o `getDateFnsLocale().code` con `Intl`.
- Para probar el idioma, selecciónalo en Ajustes y confirma la recarga o el reinicio. En Denshi, este cambio guarda también el idioma de los menús y avisos nativos; no hay sincronización automática al arrancar.

## Verificación Final antes de enviar tu aporte

Antes de enviar tu aporte, comprueba que no falten claves y que las traducciones se muestren correctamente. Necesitas tener instaladas las dependencias de `seanime-web` y `seanime-denshi`.

Abre la terminal en la raíz del proyecto y ejecuta:
```bash
cd seanime-web
npm run verify:i18n
```

Este comando comprueba los tipos, la estructura y paridad de los catálogos, claves duplicadas, mensajes ICU y las pruebas de traducción web y nativas.

Opcionalmente, ejecuta `npm run i18n:lint` desde `seanime-web` para buscar textos que podrían seguir sin traducir. Sus resultados son orientativos: pueden incluir nombres o valores técnicos que no deben traducirse.

Por último, revisa la aplicación en tu idioma: botones, textos largos, plurales, fechas, calendarios y menús de Denshi. Las pruebas automáticas no sustituyen esta revisión visual. No elimines claves por parecer sin uso: algunas, como géneros y tags de AniList, se consultan dinámicamente.
