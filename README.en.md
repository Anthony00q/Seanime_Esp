<p align="center">
<a href="https://github.com/Anthony00q/Seanime_Esp">
<img src="docs/images/seanime-logo.png" alt="preview" width="70px"/>
</a>
</p>

<h1 align="center"><b>Seanime Esp</b></h1>

<p align="center">
<img src="docs/images/hero_mockup.png" alt="preview" width="100%"/>
  <b>Multilingual Fork of Seanime (with main focus on Spanish)</b> — Media server with web interface and desktop app for anime and manga
</p>

<p align="center">
  <a href="./README.md">Español</a> |
  <a href="./README.pt.md">Português</a> |
  <strong>English</strong>
</p>

<p align="center">
  <a href="https://github.com/5rahim/seanime">Original Project</a> |
  <a href="https://seanime.app/docs">Documentation</a> |
  <a href="https://github.com/Anthony00q/Seanime_Esp/releases">Latest release</a> |
  <a href="https://seanime.app/docs/policies">Copyright</a> |
  <a href="https://discord.gg/Sbr7Phzt6m">Discord</a>
</p>

<div align="center">
  <a href="https://github.com/Anthony00q/Seanime_Esp/releases">
    <img src="https://img.shields.io/github/v/release/Anthony00q/Seanime_Esp?style=flat-square&color=blue" alt="version" />
  </a>
  <a href="https://github.com/Anthony00q/Seanime_Esp">
    <img src="https://img.shields.io/badge/Languages-ES%20%7C%20PT%20%7C%20EN-blue?style=flat-square" alt="supported languages" />
  </a>
  <a href="https://discord.gg/Aruz7wdAaf">
    <img src="https://img.shields.io/discord/1224767201551192224?style=flat-square&logo=Discord&color=blue&label=Discord" alt="discord" />
  </a>
</div>

<h5 align="center">
If you like the project, leave a star on this and the <a href="https://github.com/5rahim/seanime">original repository</a>! ⭐️
</h5>

---

## What is this fork?

This is a **multilingual fork** of the [Seanime](https://github.com/5rahim/seanime) project created by [5rahim](https://github.com/5rahim).

**Mission:** Transform Seanime into a globally accessible platform through a robust internationalization (i18n) architecture, a feature missing in the base project. Our main focus is the Spanish and Portuguese-speaking community, ensuring full and immediate parity with updates from the original project.

**Branch structure:**
- `main` → pure mirror of upstream (no modifications)
- `traducciones` → working branch with translations

> [!IMPORTANT]
> Seanime does not provide, host or distribute media content. Users are responsible for obtaining content through legal means and complying with local laws. Extensions listed in the app are not affiliated with Seanime and may be removed if they violate copyright laws.

---

## Features

- **Cross-platform**: Web interface and desktop app for Windows, Linux and macOS, accessible from iOS and Android devices.
- **Seanime Denshi**: Desktop client with integrated video player based on libmpv (SSA/ASS subtitles, shaders and more).
- **AniList Integration**: Browse and manage your lists, discover anime and manga.
- **Custom Sources**: Support for adding anime and manga not on AniList.
- **Library Management**: Fast and smart scanning of local files without strict naming conventions or mandatory folder structures.
- **Torrent Integration**: Integrated torrent search engine via extensions and download support with qBittorrent, Transmission, TorBox, Real-Debrid, AllDebrid and Premiumize.
- **Torrent Streaming**: Stream torrents directly to the video player without waiting for downloads (supports BitTorrent, TorBox, Real-Debrid, AllDebrid and Premiumize).
- **Online Streaming**: Watch anime from online sources directly in the app via extensions.
- **Automatic Downloads**: Track and automatically download new episodes with customizable filters and advanced features (prioritization, scoring, delay, etc.).
- **Extension Catalog**: In-app repository to install and manage extensions for online streaming, manga sources and torrent providers.
- **Manga Reader**: Read chapters from your local library or via extensions with a unified interface.
- **Transcoding and Direct Play**: Stream your library to any device's web browser with on-the-fly transcoding or direct play.
- **External Player Support**: Seamless integration with MPV, VLC and MPC-HC on desktop.
- **Mobile Player Integration**: Open files and streams in mobile players (Outplayer, VLC, etc.) via intents or deep links.
- **Playlists**: Create and manage playlists for a continuous viewing experience.
- **Customizable Interface**: Customize the UI with color themes, background images and layout options.
- **Discord Rich Presence**: Automatically display your viewing activity.
- **Offline Mode**: Access your anime and manga library without internet connection.
- **Calendar**: Track upcoming releases and missed episodes.

---

## 📥 Getting Started (Installation)

1. Go to the [Releases](https://github.com/Anthony00q/Seanime_Esp/releases) section.
2. Download the archive for your operating system (Windows, Linux or macOS).
3. Extract the archive to a folder of your choice and run the app.

> [!CAUTION]
> If you already have the original Seanime installed, remove it completely before using this fork. Also be sure to delete its data folder, located in your operating system's app config directory.

---

## Architecture and Translation Progress

The original project has no native support for multiple languages (i18n), so a robust JSON-based translation architecture was built from scratch.

### 🌍 Current Status (Complete Translation)

The current ecosystem covers **100% of the interface natively in Spanish, English and Portuguese (pt)**. The biggest novelty is that the language is fully dynamic: users can freely switch between the three languages from Settings, applying changes in real time to the entire interface. Moreover, the modular architecture allows scaling to any additional language without friction. Constant maintenance is performed to polish context, ensure natural language and guarantee that every update from the original project is adapted immediately upon release.

**Technical System Details:**
- **Thousands of translation keys** in 25 modular JSON files, with strict type validation to prevent errors.
- **Intact Go backend** — Native server messages are intercepted and translated in the frontend (`SERVER_TOAST_MAP`).
- **Dates and Calendars** — Full dynamic adaptation of date formatting using `date-fns` and idiomatic capitalization patches.
- **Zero Hardcoding** — Not a single visible string hard-coded directly in React code.
- **Scalable Support** — Modular architecture that allows any contributor to easily add new languages following the `Traducciones.md` guide.

**Translated Areas and Components:**
More than **300 React components** and **hundreds of server notifications** have been adapted, covering the entire experience:
- **Visual Core:** Navigation, Command Palette (Sea Command), Home Screen, Discovery and Setup Wizard.
- **Consumption:** Full Video Player (Subtitles, Chromecast, Anime4K), Interactive Manga Reader and Watch Parties (Nakama).
- **Management:** Advanced Settings, Local Library Scanner, Explorer, Automatic Downloader and Extension Store.
- **AniList & Metadata:** Fully integrated dictionary (hundreds of keys for genres, formats, statuses, seasons and tags), Progress Tracking and Offline Lists.

---

## Tech Stack

| Layer | Technology |
|------|-----------|
| **Server** | [Go](https://go.dev/) |
| **Frontend** | [React](https://reactjs.org/), [Rsbuild/Rspack](https://rsbuild.rs/), [TanStack Router](https://tanstack.com/router) |
| **Desktop** | [Electron](https://www.electronjs.org/) |

---

## Development and Build

See the full guide at [DEVELOPMENT_AND_BUILD.md](DEVELOPMENT_AND_BUILD.md).

---

## Credits

This project is a fork of [Seanime](https://github.com/5rahim/seanime), created by [5rahim](https://github.com/5rahim).

If you like this project, consider **sponsoring the original creator**:

<p align="center">
  <a href="https://github.com/sponsors/5rahim">
    <img src="https://img.shields.io/static/v1?label=Sponsor&style=for-the-badge&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86" alt="Sponsor" />
  </a>
</p>


---

> [!NOTE]
> For copyright-related inquiries, contact the maintainer using the contact information on [THE WEBSITE](https://seanime.app/docs/policies).
