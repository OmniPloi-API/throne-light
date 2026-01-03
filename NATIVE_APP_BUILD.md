# Throne Light Reader - Native App Build Guide

This project uses **Tauri** to create native desktop applications (.dmg for macOS, .exe for Windows) that feel like real installed software.

## Prerequisites

### 1. Install Rust
Tauri requires Rust to compile native code.

```bash
# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# After installation, restart your terminal or run:
source $HOME/.cargo/env
```

### 2. Install System Dependencies

**macOS:**
```bash
xcode-select --install
```

**Windows:**
- Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- Install [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually pre-installed on Windows 11)

### 3. Install Node Dependencies
```bash
npm install
```

## Generate App Icons

Before building, generate the app icons:

```bash
# Install sharp (one-time)
npm install sharp --save-dev

# Generate PNG icons
node scripts/generate-tauri-icons.js
```

Then manually convert the generated `icon.png` to:
- `icon.icns` for macOS (use https://cloudconvert.com/png-to-icns)
- `icon.ico` for Windows (use https://cloudconvert.com/png-to-ico)

Place these files in `src-tauri/icons/`.

## Development

Run the app in development mode (with hot reload):

```bash
npm run tauri:dev
```

This will:
1. Start the Next.js dev server
2. Open the native app window pointing to localhost:3000

## Building for Production

### macOS (.dmg)
```bash
npm run tauri:build:mac
```

Output: `src-tauri/target/release/bundle/dmg/Throne Light Reader_1.0.0_universal.dmg`

### Windows (.exe)
```bash
npm run tauri:build:win
```

Output: `src-tauri/target/release/bundle/msi/Throne Light Reader_1.0.0_x64_en-US.msi`

### All Platforms
```bash
npm run tauri:build
```

## Distribution

After building, you'll have installer files in `src-tauri/target/release/bundle/`:

| Platform | File Type | Location |
|----------|-----------|----------|
| macOS | .dmg | `bundle/dmg/` |
| macOS | .app | `bundle/macos/` |
| Windows | .msi | `bundle/msi/` |
| Windows | .exe | `bundle/nsis/` |
| Linux | .deb | `bundle/deb/` |
| Linux | .AppImage | `bundle/appimage/` |

## Hosting Downloads

Upload the installer files to your server or a CDN, then link to them from your website:

```html
<a href="/downloads/ThroneLight-Reader-1.0.0.dmg">Download for Mac</a>
<a href="/downloads/ThroneLight-Reader-1.0.0.exe">Download for Windows</a>
```

## How It Works

1. **Development**: Tauri opens a native window that loads your Next.js dev server
2. **Production**: Next.js is statically exported, bundled into the native app, and served locally

The app:
- Uses the system's native webview (WebKit on Mac, WebView2 on Windows)
- Produces small installers (~10-20MB vs Electron's ~150MB)
- Feels like a native app with proper window controls, dock icon, etc.

## Important Notes

- The native app loads `/reader/home` as the start page
- All book content still requires internet (security requirement)
- The app shell (UI) works offline once installed
- Users get a real `.app` on Mac and `.exe` on Windows

## Troubleshooting

### "tauri" command not found
```bash
npm install
```

### Rust compilation errors
```bash
rustup update
```

### macOS code signing
For distribution outside the App Store, you may need to:
1. Get an Apple Developer certificate
2. Configure signing in `tauri.conf.json`
3. Or instruct users to right-click → Open on first launch

### Windows SmartScreen warning
For distribution, consider:
1. Code signing with an EV certificate
2. Or instruct users to click "More info" → "Run anyway"
