<p align="center">
<a href="https://github.com/Anthony00q/Seanime_Esp">
<img src="docs/images/seanime-logo.png" alt="preview" width="70px"/>
</a>
</p>

<h1 align="center"><b>Seanime Esp</b></h1>

<p align="center">
<img src="docs/images/hero_mockup.png" alt="preview" width="100%"/>
  <b>Fork Multilingüe de Seanime (con foco principal en Español)</b> — Media server con interfaz web y app de escritorio para anime y manga
</p>

<p align="center">
  <a href="https://github.com/5rahim/seanime">Proyecto Original</a> |
  <a href="https://seanime.app/docs">Documentación</a> |
  <a href="https://github.com/Anthony00q/Seanime_Esp/releases">Última release</a> |
  <a href="https://seanime.app/docs/policies">Copyright</a> |
  <a href="https://discord.gg/Sbr7Phzt6m">Discord</a>
</p>

<div align="center">
  <a href="https://github.com/Anthony00q/Seanime_Esp/releases">
    <img src="https://img.shields.io/github/v/release/Anthony00q/Seanime_Esp?style=flat-square&color=blue" alt="versión" />
  </a>
  <a href="https://github.com/Anthony00q/Seanime_Esp">
    <img src="https://img.shields.io/badge/Idiomas-ES%20%7C%20PT%20%7C%20EN-blue?style=flat-square" alt="idiomas soportados" />
  </a>
  <a href="https://discord.gg/Aruz7wdAaf">
    <img src="https://img.shields.io/discord/1224767201551192224?style=flat-square&logo=Discord&color=blue&label=Discord" alt="discord" />
  </a>
</div>

<h5 align="center">
Si te gusta el proyecto, ¡deja una estrella en este y en el <a href="https://github.com/5rahim/seanime">repositorio original</a>! ⭐️
</h5>

---

## ¿Qué es este fork?

Este es un **fork multilingüe** del proyecto [Seanime](https://github.com/5rahim/seanime) creado por [5rahim](https://github.com/5rahim).

**Misión:** Transformar Seanime en una plataforma accesible globalmente mediante una arquitectura robusta de internacionalización (i18n), característica ausente en el proyecto base. Nuestro enfoque principal es la comunidad hispanohablante y luso-parlante, asegurando paridad total e inmediata con las actualizaciones del proyecto original.

**Estructura de ramas:**
- `main` → espejo puro del upstream (sin modificaciones)
- `traducciones` → rama de trabajo con las traducciones

> [!IMPORTANT]
> Seanime no proporciona, aloja ni distribuye contenido multimedia. Los usuarios son responsables de obtener contenido por medios legales y cumplir con las leyes locales. Las extensiones listadas en la app no están afiliadas con Seanime y pueden ser eliminadas si violan leyes de derechos de autor.

---

## Características

- **Multiplataforma**: Interfaz web y aplicación de escritorio para Windows, Linux y macOS, accesible desde dispositivos iOS y Android.
- **Seanime Denshi**: Cliente de escritorio con reproductor de video integrado basado en libmpv (soporte para subtítulos SSA/ASS, shaders y más).
- **Integración con AniList**: Explora y gestiona tus listas, descubre anime y manga.
- **Fuentes Personalizadas**: Soporte para añadir anime y manga que no están en AniList.
- **Gestión de Biblioteca**: Escaneo rápido e inteligente de archivos locales sin convenciones de nomenclatura estrictas ni estructuras de carpetas obligatorias.
- **Integración de Torrents**: Motor de búsqueda de torrents integrado a través de extensiones y soporte de descarga con qBittorrent, Transmission, TorBox, Real-Debrid, AllDebrid y Premiumize.
- **Streaming de Torrents**: Transmite torrents directamente al reproductor de video sin esperar a que se descarguen (soporta BitTorrent, TorBox, Real-Debrid, AllDebrid y Premiumize).
- **Streaming en Línea**: Ve anime desde fuentes en línea directamente en la aplicación a través de extensiones.
- **Descargas Automáticas**: Rastrea y descarga automáticamente nuevos episodios con filtros personalizables y funciones avanzadas (priorización, puntuación, retraso, etc.).
- **Catálogo de Extensiones**: Repositorio en la aplicación para instalar y gestionar extensiones para streaming en línea, fuentes de manga y proveedores de torrents.
- **Lector de Manga**: Lee capítulos desde tu biblioteca local o a través de extensiones con una interfaz unificada.
- **Transcoding y Direct Play**: Transmite tu biblioteca al navegador web de cualquier dispositivo con transcodificación al vuelo o reproducción directa.
- **Soporte para Reproductores Externos**: Integración perfecta con MPV, VLC y MPC-HC en el escritorio.
- **Integración con Reproductores Móviles**: Abre archivos y transmisiones en reproductores móviles (Outplayer, VLC, etc.) a través de intents o enlaces profundos.
- **Listas de Reproducción**: Crea y gestiona listas de reproducción para una experiencia continua de visualización.
- **Interfaz Personalizable**: Personaliza la interfaz con temas de color, imágenes de fondo y opciones de diseño.
- **Discord Rich Presence**: Muestra tu actividad de visualización automáticamente.
- **Modo sin Conexión**: Accede a tu biblioteca de anime y manga sin conexión a internet.
- **Calendario**: Rastrea los próximos lanzamientos y episodios perdidos.

---

## 📥 Cómo Empezar (Instalación)

1. Dirígete a la sección de [Releases](https://github.com/Anthony00q/Seanime_Esp/releases).
2. Descarga el archivo comprimido correspondiente a tu sistema operativo (Windows, Linux o macOS).
3. Descomprime el archivo en una carpeta de tu preferencia y ejecuta la aplicación.

> [!CAUTION]
> **⚠️ Migración desde la versión original:** Si vienes de usar la versión original de Seanime (en inglés), es **estrictamente necesario** que realices una instalación limpia. Debes eliminar por completo la carpeta y los datos de la versión anterior antes de ejecutar este fork. Esto es vital para prevenir incompatibilidades con la base de datos y evitar que configuraciones previas corrompan el nuevo sistema de traducción.

---

## Arquitectura y Progreso de Traducción

El proyecto original no tiene soporte nativo para múltiples idiomas (i18n), por lo que se implementó desde cero una robusta arquitectura de traducción basada en JSON.

### 🌍 Estado Actual (Traducción Completa)

El ecosistema actual cubre el **100% de la interfaz de forma nativa en Español, Inglés y Portugués (pt)**. La mayor novedad es que el idioma es totalmente dinámico: los usuarios pueden alternar libremente entre los tres idiomas desde los Ajustes, aplicando los cambios en tiempo real a toda la interfaz. Además, la arquitectura modular diseñada permite escalar a cualquier idioma adicional sin fricciones. Se realiza un mantenimiento constante para pulir el contexto, asegurar la naturalidad del lenguaje y garantizar que cada actualización del proyecto original sea adaptada inmediatamente al lanzarse.

**Detalles Técnicos del Sistema:**
- **Miles de keys** de traducción en 25 archivos JSON modulares, con validación de tipo estricta para evitar errores.
- **Backend Go intacto** — Los mensajes nativos del servidor se interceptan y traducen en el frontend (`SERVER_TOAST_MAP`).
- **Fechas y Calendarios** — Adaptación dinámica total del formato de fechas usando `date-fns` y parches de capitalización idiomática.
- **Cero Hardcoding** — Ni un solo string visible "quemado" directamente en el código de React.
- **Soporte Escalable** — Arquitectura modular que permite a cualquier contribuidor agregar nuevos idiomas fácilmente siguiendo la guía `Traducciones.md`.

**Áreas y Componentes Traducidos:**
Se han adaptado más de **300 componentes React** y **cientos de notificaciones** del servidor, cubriendo absolutamente toda la experiencia:
- **Core Visual:** Navegación, Paleta de Comandos (Sea Command), Pantalla de Inicio, Descubrimiento y Asistente de Configuración.
- **Consumo:** Reproductor de Video integral (Subtítulos, Chromecast, Anime4K), Lector de Manga interactivo y Watch Parties (Nakama).
- **Gestión:** Configuraciones Avanzadas, Escáner de Biblioteca local, Explorador, Descargador Automático y Tienda de Extensiones.
- **AniList y Metadatos:** Diccionario completo integrado (cientos de keys para géneros, formatos, estados, temporadas y tags), Seguimiento de Progreso y Listas offline.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Servidor** | [Go](https://go.dev/) |
| **Frontend** | [React](https://reactjs.org/), [Rsbuild/Rspack](https://rsbuild.rs/), [TanStack Router](https://tanstack.com/router) |
| **Escritorio** | [Electron](https://www.electronjs.org/) |

---

## Desarrollo y Build

Consulta la guía completa en [DEVELOPMENT_AND_BUILD.md](DEVELOPMENT_AND_BUILD.md).

---

## Créditos

Este proyecto es un fork de [Seanime](https://github.com/5rahim/seanime), creado por [5rahim](https://github.com/5rahim).

Si te gusta este proyecto, considera **sponsorizar al creador original**:

<p align="center">
  <a href="https://github.com/sponsors/5rahim">
    <img src="https://img.shields.io/static/v1?label=Sponsor&style=for-the-badge&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86" alt="Sponsor" />
  </a>
</p>


---

> [!NOTE]
> Para consultas relacionadas con los derechos de autor, póngase en contacto con el responsable del mantenimiento utilizando la información de contacto que aparece en [EL SITIO WEB](https://seanime.app/docs/policies).
