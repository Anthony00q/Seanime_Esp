# Guía para Contribuir Traducciones — Seanime_Esp

¡Gracias por tu interés en traducir Seanime_Esp a tu idioma! 

Actualmente, el proyecto soporta de forma nativa **Español (`es`)**, **Inglés (`en`)** y **Português (`pt-BR`)**. Si deseas agregar un idioma nuevo (por ejemplo, Francés, Alemán o Ruso), esta guía te explicará cómo hacerlo paso a paso sin romper la aplicación.

---

## Directrices de Diseño y Estilo

Para garantizar la consistencia visual y técnica del proyecto, toda nueva traducción debe cumplir con las siguientes directrices:

1. **Conservación de Terminología Específica**: Evite traducir forzosamente términos técnicos o palabras que la comunidad de consumo de medios y anime ya utiliza como estándares universales (en inglés o japonés). Términos como *Fansubs, Seeding, Offset, Isekai, Shounen, Slice of Life* deben mantenerse en su idioma original para preservar su significado exacto.
2. **Optimización de la Longitud en la Interfaz (UI)**: La traducción no debe alterar el diseño ni romper los componentes visuales. Compare siempre la longitud de sus textos con los de `es/` o `en/`. Si una traducción resulta excesivamente larga, busque una alternativa más compacta.
   - *Ejemplo: En lugar de "Transcodificação / Reprodução Direta", se prefiere la versión concisa "Transcoding / Direct Play" para evitar que el menú de ajustes se desborde.*
3. **Paridad Estricta**: Cada archivo y cada clave ("key") de traducción DEBE existir de forma idéntica a la estructura de la carpeta base en inglés (`en/`). La omisión de una sola clave provocará fallos en la compilación.
4. **Puntuación y Espacios Finales**: Preste especial atención a los espacios en blanco o signos de puntuación al final de las frases originales (ej. `"Tamaño: "`). Si el inglés tiene un espacio al final de la cadena, su traducción también debe conservarlo para evitar que el texto choque visualmente con los números o variables dinámicas en la interfaz.

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

// 2. IMPORTANTE: Agrega tu idioma a la validación de defaultLocale para que la app permita cargarlo
export const defaultLocale: Locale = (() => {
    if (typeof window !== "undefined") {
        const saved = window.localStorage.getItem("seanime-locale")
        if (saved === "en" || saved === "es" || saved === "pt" || saved === "fr") return saved as Locale // ← Agrega tu idioma aquí
    }
    return "es"
})()

// 3. Ponle un nombre nativo para que aparezca automáticamente en el selector de la UI
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
    frCommon, frHome, /* ... */
] as const;

// 3. Genera la validación estricta (¡IMPORTANTÍSIMO!)
// Esto arrojará error TS2344 en compilación si te faltan/sobran keys, 
// y lanzará un Error Crítico en ejecución si duplicas la misma key en dos archivos.
type FrMessages = UnionToIntersection<typeof frModules[number]>;
type _VerifyFr = AssertParity<CheckParity<Paths<FrMessages>>>;

// 4. Agrégalo al registro de módulos lazy-loaded
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

### 5. Traducir el System Tray (Electron)

Seanime tiene un ícono minimizado en la barra de tareas de Windows. Crea un archivo JSON para tu idioma en `seanime-denshi/locales/fr.json` usando como plantilla `es.json` o `en.json`.

```json
{
  "tray": {
    "toggleVisibility": "Afficher/Masquer",
    "removeFromDock": "Retirer du Dock",
    "quit": "Quitter Seanime"
  }
}
```

---

## Verificación Final antes de enviar tu aporte

Antes de solicitar que añadamos tu idioma, **debes asegurarte de que no hayas cometido ningún error tipográfico ni te falten claves**.

Abre la terminal en la raíz del proyecto y ejecuta:
```bash
cd seanime-web
npm run typecheck
```

Si el comando termina sin mostrar ningún error, ¡Felicidades! Tu traducción está en paridad perfecta y lista para ser integrada a Seanime_Esp.
