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
4. **Puntuación y Espacios Finales**: En los fragmentos existentes que se insertan junto a otros textos (ej. `"Tamaño: "`), conserve los espacios y signos necesarios para evitar que el contenido quede pegado. Esta compatibilidad no es un patrón para mensajes nuevos: use frases completas parametrizadas (ej. `"Tamaño: {size}"`), sin depender de espacios finales ni concatenaciones en JSX.
5. **Sintaxis ICU (Plurales y Condicionales)**: Algunas cadenas contienen mensajes ICU como `{count, plural, one {# item} other {# items}}` o `{value, select, ...}`. Traduzca **solo el texto dentro de las llaves internas**; nunca traduzca los comandos reservados (`plural`, `select`, `one`, `other`, `few`, `many`, `zero`) ni las variables. El símbolo `#` representa el número y puede reposicionarse dentro de la rama. Adapte las ramas disponibles a las reglas de plural de su idioma.
   - En portugués, incluya siempre una rama explícita `=0` con texto plural. Pase los conteos como números, no como cadenas.
6. **Argumentos y plantillas literales**: Una clave como `common.labels.episodeNumber` requiere `{ number }`; para un label sin valor use `common.labels.episodeNumberLabel`. Las plantillas técnicas que muestran llaves literalmente están enumeradas en `seanime-web/src/locales/message-policy.json` y no deben interpolarse. Esa política es compartida por el motor, el auditor y el generador.

---

## Cómo agregar un nuevo idioma (Paso a Paso)

Usaremos **Francés (`fr`)** como ejemplo.

### 1. Preparación de Archivos de Traducción

Ve a la carpeta `seanime-web/src/locales/` y copia la carpeta `en/` entera. Renombra la copia con el código de tu idioma (ej. `fr/`).
- Mantén la misma estructura de archivos (incluyendo las subcarpetas `settings/` y `modules/`).
- No agregues comentarios (`//`) dentro de los archivos JSON.
- Traduce los valores, pero **nunca** traduzcas las variables entre llaves (ej. `{address}` se queda como `{address}`).

### 2. Registro del Idioma

Añade una entrada a `seanime-web/src/locales/registry.json`. Este registro es la fuente de los códigos admitidos, nombres nativos, etiquetas regionales y atributos HTML:

```json
{
    "en": { "name": "English", "intlLocale": "en-US", "htmlLang": "en" },
    "es": { "name": "Español", "intlLocale": "es", "htmlLang": "es" },
    "pt": { "name": "Português", "intlLocale": "pt-BR", "htmlLang": "pt-BR" },
    "fr": { "name": "Français", "intlLocale": "fr", "htmlLang": "fr" }
}
```

- `config.ts` deriva automáticamente `Locale`, `supportedLocales`, `localeNames` y la validación. El selector de Ajustes usa estos nombres.
- `intlLocale` debe coincidir con el `.code` del locale de `date-fns`; ICU lo usa también para sus reglas regionales. `htmlLang` conserva la etiqueta de accesibilidad (por compatibilidad, inglés sigue siendo `en`).
- Los códigos y etiquetas deben ser BCP 47 canónicos, sin rutas, espacios ni truncamientos. Se admiten códigos regionales como `fr-CA` si se completan todas las integraciones. No renombre `pt` a `pt-BR`: rompería preferencias guardadas.
- Se conservan `en` y `es`, necesarios para los fallbacks existentes. No agregue claves de traducción a este JSON.

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

// 3. Agrégalo al registro de módulos (conserva imports estáticos y tipos inferidos)
const languageModules = {
    en: enModules,
    es: esModules,
    pt: ptModules,
    fr: frModules, // ← nuevo
} satisfies Record<Locale, readonly Record<string, unknown>[]>;
```

La validación `_VerifyLanguages` recorre automáticamente todos los idiomas de `languageModules`: no añada un `_VerifyFr` manual ni debilite los tipos. `satisfies` exige que el registro coincida con `Locale`; el auditor comprueba además cada archivo importado, su uso único y su idioma de origen. La detección de colisiones en ejecución se conserva.

### 4. Soporte de Fechas Nativas (Calendarios)

Para que el calendario muestre los meses en tu idioma, añade el locale oficial de `date-fns` en `seanime-web/src/locales/date-locale.ts`:

```typescript
import { fr, type Locale as DateFnsLocale } from "date-fns/locale"
import type { Locale } from "./config"

export const DATE_FNS_LOCALES = {
    es,
    en: enUS,
    pt: ptBR,
    fr,  // ← nuevo
} satisfies Record<Locale, DateFnsLocale>
```

### 5. Traducciones nativas de Electron (Denshi)

Copia **todo** `seanime-denshi/locales/en.json` a `seanime-denshi/locales/fr.json`: incluye el menú del ícono de la bandeja (`tray`), los errores (`error`), los avisos de registros (`logging`) y el inicio (`startup`). Traduce sus valores.

Desde la raíz ejecuta `npm --prefix seanime-web run i18n:generate`. Esto genera `seanime-denshi/src/main/locale-registry.generated.ts` a partir del registro común y actualiza los contratos ICU. Revisa e incluye los archivos generados en el mismo cambio; no edites manualmente `DenshiLocale` ni añadas otra lista a `isDenshiLocale()`.

El registro nativo generado se compila dentro de `dist/main/`: Denshi instalado no importa código web, no necesita el checkout y sigue cargando sus JSON propios. No muevas el registro a una ruta fuera de `src/main` ni cambies `rootDir` para importar el frontend.

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

- El DataGrid usa sus propias etiquetas y su tabla de fechas en `seanime-web/src/components/ui/datagrid/locales.ts`. El francés (`fr`) ya existe en ambas por compatibilidad, aunque todavía no es un idioma de la app: si añades `fr`, revisa y reutiliza esas entradas sin duplicarlas. Para un idioma que el DataGrid aún no admite, añade sus etiquetas y su locale de `date-fns`. Conserva el comportamiento de `lng` explícito; no hay una segunda lista de idiomas admitidos que editar.
- El auditor y las suites generales web/nativas recorren el registro automáticamente. No añada listas manuales de idiomas. Los ejemplos lingüísticos independientes de es/en/pt se conservan como regresiones; añada casos específicos del nuevo idioma para plurales, fechas y títulos.
- Para cifras visibles use `formatNumber()`; para fechas, `formatLocalized()` o `getDateFnsLocale().code` con `Intl`.
- Para probar el idioma, ve a **Ajustes → App → Idioma**, selecciónalo y pulsa **Aplicar idioma**. Confirma la recarga de la página en web o el reinicio en Denshi. Comprueba que la interfaz cambia de idioma y que la preferencia se conserva al volver a abrirla. En Denshi, comprueba también el menú de la bandeja si está disponible.

## Verificación Final antes de enviar tu aporte

Antes de enviar tu aporte, comprueba que no falten claves y que las traducciones se muestren correctamente. Necesitas tener instaladas las dependencias de `seanime-web` y `seanime-denshi`.

Si modificaste el registro de idiomas, los argumentos ICU o añadiste mensajes parametrizados, ejecuta primero `npm --prefix seanime-web run i18n:generate` desde la raíz y revisa `seanime-denshi/src/main/locale-registry.generated.ts` y `seanime-web/src/locales/message-params.generated.ts`. No edites esos archivos manualmente. La verificación comprueba que estén actualizados, pero no los regenera.

Abre la terminal en la raíz del proyecto y ejecuta:
```bash
cd seanime-web
npm run verify:i18n
```

Este comando comprueba los tipos, el registro y su salida nativa generada, la estructura y paridad de todos los catálogos registrados, claves duplicadas, mensajes ICU y las pruebas de traducción web y nativas. También exige cobertura de fechas y DataGrid, rechaza directorios/catálogos no registrados y comprueba que no falten archivos nativos.

Las pruebas usan un cuarto idioma y un código regional en fixtures aislados para comprobar que la expansión no salte validaciones. No habilitan ningún idioma nuevo en la aplicación.

Copiar inglés no significa haber traducido: pasar el auditor certifica estructura y formato, no calidad o cobertura lingüística. Revise valores, plurales y textos largos con hablantes del idioma. Las coincidencias con inglés pueden ser legítimas (nombres propios y jerga técnica).

- **Si solo corriges textos:** ejecuta `verify:i18n` y revisa en la app las pantallas afectadas.
- **Si incorporas un idioma:** además, ejecuta la suite general (`npm test`), compila la interfaz web y la de Denshi (`npm run build` y `npm run build:denshi`) y prueba el cambio de idioma como se indica en el paso 6.
- **Antes de publicar una versión:** comprueba el workflow `Translation checks` en Windows/Linux y verifica los catálogos y el cambio de idioma con un paquete real de Denshi. La prueba del layout empaquetado no sustituye esa comprobación.

### Contratos de parámetros y recuperación

`createTranslator()` conserva su API y su singleton dinámico, pero sus parámetros se comprueban también por clave. Los contratos se extraen del AST ICU del catálogo inglés; no se mantienen manualmente ni se deducen mediante regex.

- Después de modificar los argumentos ICU o añadir mensajes parametrizados, ejecute `npm run i18n:generate` desde `seanime-web` y revise `src/locales/message-params.generated.ts`.
- `typecheck`, los builds y `i18n:check` comprueban que los archivos generados estén actualizados; **no los sobrescriben**. La paridad de todos los idiomas registrados y la detección de colisiones siguen siendo obligatorias.
- Los plurales/números ICU exigen `number`; los selectores admiten texto o booleanos; las interpolaciones de texto admiten texto o números. El tipado exige conservadoramente los argumentos de todas las ramas, como el auditor; en ejecución solo se validan las ramas seleccionadas.
- `t()` devuelve texto, no JSX ni arrays. No utilice `defaultValue` como parámetro: no es una opción de fallback.
- Para diccionarios externos como AniList, use `translateOptional(key, original)`: conserva el valor original si la entrada no existe, sin producir avisos de claves rotas. Para conjuntos cerrados, prefiera mapas tipados de identificadores a claves; `TranslationKeyWithoutParams` limita los mapas de etiquetas sin argumentos.
- Ante un error de formato, el motor intenta el mensaje inglés y, si los datos tampoco permiten formatearlo, devuelve una etiqueta localizada de texto no disponible. No inventa conteos ni ejecuta acciones. Los diagnósticos no incluyen valores de parámetros.
- En desarrollo, compruebe tanto `window.__seanime_i18n_missingKeys` como `window.__seanime_i18n_formatErrors` tras recorrer el flujo. La ausencia de entradas no demuestra cobertura de pantallas no visitadas.

### Revisión de una actualización upstream (mantenedores)

Guarde **antes** de actualizar tres referencias: el commit del fork previo a la actualización y los commits upstream anterior/nuevo. No utilice `main...traducciones` como inventario de novedades upstream.

Desde `seanime-web`, el comando versionado es:

```bash
npm run i18n:upstream -- --baseline <SHA-fork-anterior> --from <SHA-upstream-anterior> --to <SHA-upstream-nuevo>
```

También acepta solo `--baseline <SHA>` para revisar pérdidas de llamadas respecto al código web actual. El análisis es de solo lectura: no hace fetch, checkout, rebase, traducciones ni aprobaciones automáticas. Usa los snapshots Git indicados y los archivos actuales del checkout; ejecute sobre un checkout completo y revise también archivos nuevos no versionados.

El inventario AST detecta disminuciones de llamadas traducidas (incluidas claves dinámicas), cambios de texto JSX/atributos/expresiones y formateadores. Los cambios nativos y Go del intervalo upstream se señalan para revisión manual: el inventario JSX **no certifica** sus mensajes dinámicos. Una traducción movida a un helper o una pantalla eliminada legítimamente también necesita revisión; no se restaura código antiguo para silenciar el informe.

- Salida **0**: no hay hallazgos pendientes dentro de lo analizado; no garantiza equivalencia funcional ni cobertura total.
- Salida **1**: hay hallazgos que requieren revisión.
- Salida **2**: referencias, argumentos o análisis inválidos; no debe tratarse como comprobación superada.
- `--json` entrega el informe estructurado. Para aprobar hallazgos ya revisados, proporcione `--review <archivo.json>` con un array de objetos `{ "id": "<id-del-informe>", "reason": "<justificación concreta>" }`. No se genera ni acepta un motivo vacío. Las aprobaciones están vinculadas a las referencias y al contenido actual del archivo; si cambia, deben revisarse nuevamente.

`scripts/i18n-reviewed-changes.json` documenta los movimientos intencionales a helpers de la mejora inicial. No se carga automáticamente ni es una lista global de excepciones: sus identificadores solo sirven para los snapshots y contenidos que se revisaron.

El workflow `Translation checks` permite introducir esas referencias y un archivo de revisión versionado mediante `workflow_dispatch`. En pushes/PR ordinarios siguen ejecutándose tipos, auditor, contratos y suites; **el análisis de actualización no se activa sin referencias explícitas**. Los commits deben estar disponibles en el checkout; la herramienta no los descarga.

Después del informe, ejecute `verify:i18n`, la suite general y los builds pertinentes, y pruebe visualmente los flujos afectados en es/en/pt. La revisión AST no verifica que callbacks, permisos, tiempos de salto o valores técnicos conserven su comportamiento.

Para conservar este refuerzo tras un rebase:

- Mantenga `registry.json`, la derivación de `Locale` y la paridad automática de todos los módulos; no restaure listas fijas de tres idiomas.
- No regenere archivos para ocultar un conflicto: fusione primero el registro/catálogos y después ejecute `i18n:generate`, revisando el resultado.
- Conserve los JSON nativos y `dist/main/**/*` en el empaquetado de Denshi. El registro generado debe seguir compilándose sin importar archivos web.
- Si upstream reorganiza DataGrid u otros controles, adapte sus tablas y las comprobaciones AST a la estructura nueva; no restaure componentes antiguos ni reduzca cobertura para silenciar errores.
- La carga sigue siendo estática: la caché difiere el aplanado, no la descarga. Evalúe carga por idioma únicamente tras medir el bundle y el arranque, incluyendo funcionamiento offline.

Opcionalmente, ejecuta `npm run i18n:lint` desde `seanime-web` para buscar textos que podrían seguir sin traducir. Sus resultados son orientativos: pueden incluir nombres o valores técnicos que no deben traducirse.

Por último, revisa la aplicación en tu idioma: botones, textos largos, plurales, fechas, calendarios y menús de Denshi. Las pruebas automáticas no sustituyen esta revisión visual. No elimines claves por parecer sin uso: algunas, como géneros y tags de AniList, se consultan dinámicamente.
