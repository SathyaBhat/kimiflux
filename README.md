# KimiFlux

A Windows desktop RSS reader powered by Miniflux API, built with Tauri + React.

## Features

- 📰 Sync with Miniflux RSS server
- 🎯 View unread articles by feed or category
- 📖 Clean reading experience with article view
- ⭐ Star articles for later
- 🌐 Fetch full article content
- 🔔 Native Windows notifications
- 🖥️ System tray integration

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) toolchain
- A Miniflux server with API key

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run tauri dev

# Build for production
npm run tauri build
```

## Setup

On first launch, you'll be prompted to enter your Miniflux server details:

1. **Server URL**: Your Miniflux instance URL (e.g., `https://miniflux.example.com`)
2. **API Key**: Generate this in Miniflux → Settings → API Keys

Your credentials are stored locally in your browser's localStorage.

## Tech Stack

- **Tauri** - Rust-based desktop framework
- **React + TypeScript** - Frontend
- **Axios** - HTTP client for Miniflux API

## Project Structure

```
kimiflux/
├── src/
│   ├── components/
│   │   ├── ArticleList.tsx    # Article list view
│   │   ├── ArticleView.tsx     # Individual article reader
│   │   ├── SettingsModal.tsx   # Config dialog
│   │   └── Sidebar.tsx          # Feed navigation
│   ├── services/
│   │   └── miniflux.ts         # Miniflux API client
│   ├── types/
│   │   └── miniflux.ts         # TypeScript types
│   ├── App.tsx                 # Main app component
│   ├── main.tsx               # Entry point
│   └── styles.css             # App styles
├── src-tauri/                 # Rust backend
└── package.json
```

## License

MIT
