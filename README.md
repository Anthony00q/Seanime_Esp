<p align="center">
<a href="https://github.com/5rahim/seanime">
<img src="docs/images/seanime-logo.png" alt="preview" width="70px"/>
</a>
</p>

<h1 align="center"><b>Seanime Esp</b></h1>

<p align="center">
  <b>Fork en Español de Seanime</b> — Media server con interfaz web y app de escritorio para anime y manga
</p>

<p align="center">
  <a href="https://github.com/5rahim/seanime">Proyecto Original</a> |
  <a href="https://seanime.app/docs">Documentación</a> |
  <a href="https://github.com/Anthony00q/Seanime_Esp/releases">Última release</a> |
  <a href="https://discord.gg/Sbr7Phzt6m">Discord</a>
</p>

<div align="center">
  <a href="https://github.com/Anthony00q/Seanime_Esp/releases">
    <img src="https://img.shields.io/github/v/release/Anthony00q/Seanime_Esp?style=flat-square&color=blue" alt="versión" />
  </a>
  <a href="https://github.com/Anthony00q/Seanime_Esp">
    <img src="https://img.shields.io/badge/Traducción-en_progreso-orange?style=flat-square" alt="progreso traducción" />
  </a>
  <a href="https://discord.gg/Aruz7wdAaf">
    <img src="https://img.shields.io/discord/1224767201551192224?style=flat-square&logo=Discord&color=blue&label=Discord" alt="discord" />
  </a>
  <a href="https://github.com/sponsors/5rahim">
    <img src="https://img.shields.io/static/v1?label=Sponsor&style=flat-square&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86" alt="sponsor" />
  </a>
</div>

<h5 align="center">
Si te gusta el proyecto, ¡deja una estrella en este y en el <a href="https://github.com/5rahim/seanime">repositorio original</a>! ⭐️
</h5>

---

## ¿Qué es este fork?

Este es un **fork en español** del proyecto [Seanime](https://github.com/5rahim/seanime) creado por [5rahim](https://github.com/5rahim).

**Objetivo:** Traducir toda la interfaz de usuario al español, manteniendo el proyecto original intacto y actualizado.

**Estructura de ramas:**
- `main` → espejo puro del upstream (sin modificaciones)
- `traduccion-es` → rama de trabajo con las traducciones al español

> [!IMPORTANT]
> Seanime no proporciona, aloja ni distribuye contenido multimedia. Los usuarios son responsables de obtener contenido por medios legales y cumplir con las leyes locales. Las extensiones listadas en la app no están afiliadas con Seanime y pueden ser eliminadas si violan leyes de derechos de autor.

---

## Características

- **Multiplataforma**: Interfaz web y app de escritorio para Windows, Linux y macOS
- **Seanime Denshi**: Cliente de escritorio con reproductor de video integrado (soporte para subtítulos SSA/ASS, Anime4K, traducción automática y más)
- **Integración con AniList**: Gestiona tus listas, descubre anime y manga
- **Fuentes Personalizadas**: Soporte para añadir series de anime y manga fuera de AniList
- **Gestión de Biblioteca**: Escaneo rápido e inteligente de archivos locales sin convenciones de nombres estrictas
- **Integración con Torrents**: Buscador de torrents integrado vía extensiones y descarga con qBittorrent, Transmission, TorBox y Real-Debrid
- **Streaming de Torrents**: Reproduce torrents directamente sin esperar la descarga completa
- **Streaming en Línea**: Mira anime desde fuentes en línea directamente en la app vía extensiones
- **Descargador Automático**: Rastrea y descarga nuevos episodios automáticamente con filtros personalizables
- **Tienda de Extensiones**: Repositorio integrado para instalar y gestionar extensiones
- **Lector de Manga**: Lee capítulos desde tu biblioteca local o vía extensiones
- **Transcoding y Direct Play**: Transmite tu biblioteca a cualquier navegador con transcoding en tiempo real
- **Reproductores Externos**: Integración con MPV, VLC y MPC-HC
- **Listas de Reproducción**: Crea y gestiona listas para maratones
- **UI Personalizable**: Temas de color, imágenes de fondo y opciones de diseño
- **Discord Rich Presence**: Muestra tu actividad automáticamente
- **Modo Sin Conexión**: Accede a tu biblioteca sin internet
- **Horario**: Rastrea próximos estrenos y episodios perdidos

---

## Progreso de Traducción

El proyecto original no tiene i18n integrado, por lo que se implementó un sistema de traducción personalizado con archivos JSON.

### ✅ Traducido

- Pantalla de inicio
- Horario y descubrimiento
- Navegación y barra lateral
- Reproductor de video (video-core completo, subtítulos, HLS, Chromecast)
- Configuración completa
- Watch parties (Nakama)
- Paleta de comandos
- Componentes compartidos
- Página de entrada (anime/manga detail completo)
- Escáner de biblioteca (modal, resúmenes, logs, archivos no coincidentes)
- Seguimiento de progreso y listas de reproducción
- Biblioteca y listas (AniList stats, colección, sincronización)
- Extensiones (marketplace, tarjetas, playground)
- Manga (biblioteca, lector de capítulos, descargas)
- Streaming en línea y lista de torrents
- Servicio Debrid
- Descargador automático
- Electron (modal de actualización, reinicio de servidor)
- Reporte de problemas (issue report)
- Autoplay y Library Explorer
- Biblioteca de anime (media desconocida, archivos ignorados, acciones masivas)
- **Todos los toasts/notificaciones** (~207 toasts en componentes UI, hooks de API y archivos .ts)
- Mediastream, MediaLinks, Sync, callback de autenticación

### ⏳ Pendiente

- Búsqueda
- Sincronización (componentes restantes)
- Fuentes personalizadas
- Páginas de listas, autenticación, MAL
- Webview
- qBittorrent

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
> Para consultas relacionadas con los derechos de autor, póngase en contacto con el responsable del mantenimiento utilizando la información de contacto que aparece en [el sitio web](https://seanime.app/docs/policies).
