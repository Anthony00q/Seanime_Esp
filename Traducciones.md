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

Si modificaste los argumentos ICU o añadiste mensajes parametrizados, ejecuta primero `npm --prefix seanime-web run i18n:generate` desde la raíz y revisa los cambios de `seanime-web/src/locales/message-params.generated.ts`. No edites ese archivo manualmente. La verificación comprueba que esté actualizado, pero no lo regenera.

Abre la terminal en la raíz del proyecto y ejecuta:
```bash
cd seanime-web
npm run verify:i18n
```

Este comando comprueba los tipos, la estructura y paridad de los catálogos, claves duplicadas, mensajes ICU y las pruebas de traducción web y nativas.

### Contratos de parámetros y recuperación

`createTranslator()` conserva su API y su singleton dinámico, pero sus parámetros se comprueban también por clave. Los contratos se extraen del AST ICU del catálogo inglés; no se mantienen manualmente ni se deducen mediante regex.

- Después de modificar los argumentos ICU o añadir mensajes parametrizados, ejecute `npm run i18n:generate` desde `seanime-web` y revise `src/locales/message-params.generated.ts`.
- `typecheck`, los builds y `i18n:check` comprueban que ese archivo esté actualizado; **no lo sobrescriben**. La paridad es/en/pt y la detección de colisiones siguen siendo obligatorias.
- Los plurales/números ICU exigen `number`; los selectores admiten texto o booleanos; las interpolaciones de texto admiten texto o números. El tipado exige conservadoramente los argumentos de todas las ramas, como el auditor; en ejecución solo se validan las ramas seleccionadas.
- `t()` devuelve texto, no JSX ni arrays. No utilice `defaultValue` como parámetro: no es una opción de fallback.
- Para diccionarios externos como AniList, use `translateOptional(key, original)`: conserva el valor original si la entrada no existe, sin producir avisos de claves rotas. Para conjuntos cerrados, prefiera mapas tipados de identificadores a claves; `TranslationKeyWithoutParams` limita los mapas de etiquetas sin argumentos.
- Ante un error de formato, el motor intenta el mensaje inglés y, si los datos tampoco permiten formatearlo, devuelve una etiqueta localizada de texto no disponible. No inventa conteos ni ejecuta acciones. Los diagnósticos no incluyen valores de parámetros.
- En desarrollo, compruebe tanto `window.__seanime_i18n_missingKeys` como `window.__seanime_i18n_formatErrors` tras recorrer el flujo. La ausencia de entradas no demuestra cobertura de pantallas no visitadas.

### Revisión de una actualización upstream

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

Opcionalmente, ejecuta `npm run i18n:lint` desde `seanime-web` para buscar textos que podrían seguir sin traducir. Sus resultados son orientativos: pueden incluir nombres o valores técnicos que no deben traducirse.

Por último, revisa la aplicación en tu idioma: botones, textos largos, plurales, fechas, calendarios y menús de Denshi. Las pruebas automáticas no sustituyen esta revisión visual. No elimines claves por parecer sin uso: algunas, como géneros y tags de AniList, se consultan dinámicamente.
