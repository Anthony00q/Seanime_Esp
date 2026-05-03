<p align="center">
<a href="https://github.com/5rahim/seanime">
<img src="docs/images/seanime-logo.png" alt="preview" width="70px"/>
</a>
</p>

<h1 align="center"><b>Seanime_Esp</b></h1>

<p align="center">
  <b>Fork en Español de Seanime</b> — Media server con interfaz web y app de escritorio para anime y manga
</p>

<p align="center">
  <a href="https://github.com/5rahim/seanime">Proyecto Original</a> |
  <a href="https://seanime.app/docs">Documentación</a> |
  <a href="https://github.com/5rahim/seanime/releases">Última release</a> |
  <a href="https://discord.gg/Sbr7Phzt6m">Discord</a>
</p>

<div align="center">
  <a href="https://github.com/5rahim/seanime/releases">
    <img src="https://img.shields.io/github/v/release/5rahim/seanime?style=flat-square&color=blue" alt="versión" />
  </a>
  <a href="https://github.com/Anthony00q/Seanime_Esp">
    <img src="https://img.shields.io/badge/Traducción-~70%25-orange?style=flat-square" alt="progreso traducción" />
  </a>
  <a href="https://github.com/5rahim/seanime/releases">
    <img src="https://img.shields.io/github/downloads/5rahim/seanime/total?style=flat-square&color=blue" alt="descargas" />
  </a>
  <a href="https://discord.gg/Aruz7wdAaf">
    <img src="https://img.shields.io/discord/1224767201551192224?style=flat-square&logo=Discord&color=blue&label=Discord" alt="discord" />
  </a>
  <a href="https://github.com/sponsors/5rahim">
    <img src="https://img.shields.io/static/v1?label=Sponsor&style=flat-square&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86" alt="sponsor" />
  </a>
</div>

<h5 align="center">
Si te gusta el proyecto original, ¡deja una estrella en el <a href="https://github.com/5rahim/seanime">repositorio original</a>! ⭐️
</h5>

---

## 📌 ¿Qué es este fork?

Este es un **fork en español** del proyecto [Seanime](https://github.com/5rahim/seanime) creado por [5rahim](https://github.com/5rahim).

**Objetivo:** Traducir toda la interfaz de usuario al español para uso personal y público, manteniendo el proyecto original intacto y actualizado.

**Estructura de ramas:**
- `main` → espejo puro del upstream (sin modificaciones)
- `traduccion-es` → rama de trabajo con todas las traducciones al español *(rama por defecto)*

> [!IMPORTANT]
> Seanime no proporciona, aloja ni distribuye contenido multimedia. Los usuarios son responsables de obtener contenido por medios legales y cumplir con las leyes locales. Las extensiones listadas en la app no están afiliadas con Seanime y pueden ser eliminadas si violan leyes de derechos de autor.

---

## 📋 Características

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

## 🌍 Progreso de Traducción

El sistema de traducción es personalizado (el proyecto original no tiene i18n integrado). Se usa un sistema de archivos JSON con deep-merge automático.

### ✅ Completado

| Sección | Keys | Componentes |
|---------|------|-------------|
| Common (botones, labels, mensajes) | 36 | — |
| Home Screen | 142 | 5 |
| Schedule (Horario) | 28 | 5 |
| Discover (Descubrir) | 13 | 6 |
| Navigation (Navegación) | 42 | 2 |
| Video Player (Reproductor) | 33 | 2 |
| Sea Command (Paleta de comandos) | 23 | 1 |
| Settings (Configuración) | ~681 | 19 |
| Nakama (Watch Parties) | 31 | 1 |
| Misc (onlinestream, torrentList, etc.) | 30 | 4 |
| Shared Components | — | 3 |

**Total: ~1059 keys traducidas · 48 componentes**

### ⏳ Pendiente

| Sección | Estimación |
|---------|------------|
| Extensions | ~100+ strings |
| Manga (lectores, entrada) | ~200+ strings |
| Sync | ~40+ strings |
| Search | ~30+ strings |
| Custom Sources | ~15+ strings |
| Entry, Lists, Auth, Webview, MediaLinks, MAL | varios |

---

## 🚀 Inicio Rápido

### Requisitos

- **Go** 1.23+
- **Node.js** 18+ (recomendado 20+)
- **npm** (viene con Node.js)

### Build de Producción (Windows)

El fork incluye un script automatizado:

```bat
abrir-proyecto.bat
```

Esto:
1. Instala dependencias de npm
2. Construye la interfaz web
3. Copia los archivos al directorio `web/`
4. Compila el servidor Go como `seanime.exe`

Luego ejecuta `seanime.exe` y accede a `http://127.0.0.1:43000`.

### Build Manual

```bash
# 1. Construir interfaz web
cd seanime-web
npm install
npm run build
cd ..

# 2. Copiar archivos web
rmdir /s /q web 2>nul
xcopy /e /i /y seanime-web\out web

# 3. Compilar servidor Go (Windows sin system tray)
go build -o seanime.exe -trimpath -ldflags="-s -w" -tags=nosystray

# 4. Ejecutar
seanime.exe
```

### Desarrollo

```bash
# Servidor Go (puerto correcto para frontend dev)
go run main.go serve --port 43000

# Frontend (en otra terminal)
cd seanime-web && npm run dev
```

Acceso: `http://127.0.0.1:43210`

---

## 💻 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Servidor** | [Go](https://go.dev/) 1.26.0, Echo v4, GraphQL (gqlgen), SQLite |
| **Frontend** | [React](https://reactjs.org/), [Rsbuild/Rspack](https://rsbuild.rs/), [TanStack Router](https://tanstack.com/router) |
| **Escritorio** | [Electron](https://www.electronjs.org/) |
| **State** | Jotai, React Hook Form + Zod |

---

## 🤝 Contribuir

Este es un fork personal de traducción. Para reportar bugs o sugerir features del **proyecto original**, visita [5rahim/seanime](https://github.com/5rahim/seanime).

Para sugerencias sobre la **traducción al español**, puedes abrir un issue en este repositorio.

### Sincronizar con el upstream

```bash
git checkout main
git pull upstream main

git checkout traduccion-es
git rebase main
```

---

## ❤️ Créditos

Este proyecto es un fork de [Seanime](https://github.com/5rahim/seanime), creado por [5rahim](https://github.com/5rahim).

Si te gusta este proyecto, considera **sponsorizar al creador original**:

<p align="center">
  <a href="https://github.com/sponsors/5rahim">
    <img src="https://img.shields.io/static/v1?label=Sponsor+5rahim&style=for-the-badge&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86" alt="Sponsor 5rahim" />
  </a>
</p>

El mantenimiento de este proyecto es posible gracias a los sponsors del proyecto original.

---

> [!NOTE]
> Para solicitudes relacionadas con derechos de autor, contacta al mantenedor usando la información en [seanime.app](https://seanime.app/docs/policies).
