# Throne Light Reader - macOS & iOS Distribution Guide

## 🍎 macOS Distribution (Developer ID)

### Prerequisites
1. **Apple Developer Account** ($99/year)
   - Enroll at: https://developer.apple.com/programs/

2. **Developer ID Application Certificate**
   - Log into Apple Developer Portal
   - Go to Certificates, Identifiers & Profiles
   - Create a new "Developer ID Application" certificate
   - Download and install in Keychain Access

### Step 1: Configure Code Signing

1. Find your signing identity:
```bash
security find-identity -v -p codesigning
```

2. Update `src-tauri/tauri.conf.json`:
   - Replace `"Developer ID Application: YOUR_TEAM_NAME (TEAM_ID)"` with your actual identity from step 1
   - Example: `"Developer ID Application: Throne Light Publishing (ABC123XYZ)"`

### Step 2: Build for macOS

```bash
cd /Volumes/T7\ Shield/AMPLE-DEVELOPMENT/CBET-EOLLES\ WEBSITE/throne-light
npm run tauri build -- --target universal-apple-darwin
```

This creates:
- `src-tauri/target/release/bundle/dmg/Throne Light Reader_1.0.1_universal.dmg`
- `src-tauri/target/release/bundle/macos/Throne Light Reader.app`

### Step 3: Notarize for Distribution

```bash
# Store credentials
xcrun notarytool store-credentials "notarytool-profile" \
  --apple-id "your-apple-id@email.com" \
  --team-id "YOUR_TEAM_ID" \
  --password "app-specific-password"

# Notarize the DMG
xcrun notarytool submit "src-tauri/target/release/bundle/dmg/Throne Light Reader_1.0.1_universal.dmg" \
  --keychain-profile "notarytool-profile" \
  --wait

# Staple the notarization
xcrun stapler staple "src-tauri/target/release/bundle/dmg/Throne Light Reader_1.0.1_universal.dmg"
```

### Step 4: Distribute

Upload the notarized DMG to your website or distribute directly.

---

## 📱 iOS App Store Distribution

**IMPORTANT:** Tauri v1 does not support iOS. You need to upgrade to **Tauri v2** for iOS support.

### Migration to Tauri v2 (Required for iOS)

1. **Update dependencies:**
```bash
cd src-tauri
cargo install tauri-cli@2.0.0-beta
```

2. **Update Cargo.toml:**
```toml
[dependencies]
tauri = { version = "2.0.0-beta", features = ["shell-open"] }
```

3. **Update tauri.conf.json to v2 format**

4. **Add iOS target:**
```bash
rustup target add aarch64-apple-ios
rustup target add aarch64-apple-ios-sim
```

### iOS Build Process (After Tauri v2 Migration)

1. **Initialize iOS project:**
```bash
npm run tauri ios init
```

2. **Configure in Xcode:**
   - Open `src-tauri/gen/apple/Throne Light Reader.xcodeproj`
   - Set Team and Signing Certificate
   - Configure App Store Connect capabilities
   - Add app icons and launch screens

3. **Build for iOS:**
```bash
npm run tauri ios build --release
```

4. **Submit to App Store:**
   - Archive in Xcode
   - Upload to App Store Connect
   - Submit for review

---

## 🔐 Security Considerations

### Current Implementation
- ✅ `/reader` route now requires authentication
- ✅ `/library` requires authentication
- ✅ `/read/[bookId]` requires authentication + ownership verification

### Additional Recommendations
1. **Implement "One Device" enforcement** (already in `/read/[bookId]`)
2. **Add watermarking** to downloaded content
3. **Monitor for suspicious sharing patterns**
4. **Rate limit API endpoints**

---

## 📦 Build Commands Reference

### Development
```bash
npm run tauri dev
```

### Production Builds

**macOS Universal (Intel + Apple Silicon):**
```bash
npm run tauri build -- --target universal-apple-darwin
```

**macOS Intel only:**
```bash
npm run tauri build -- --target x86_64-apple-darwin
```

**macOS Apple Silicon only:**
```bash
npm run tauri build -- --target aarch64-apple-darwin
```

**Windows:**
```bash
npm run tauri build -- --target x86_64-pc-windows-msvc
```

**Linux:**
```bash
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

---

## 🚀 Next Steps

1. **Immediate (macOS):**
   - [ ] Enroll in Apple Developer Program
   - [ ] Create Developer ID Application certificate
   - [ ] Update signing identity in `tauri.conf.json`
   - [ ] Build and notarize macOS app
   - [ ] Test installation on clean macOS system

2. **Future (iOS):**
   - [ ] Migrate to Tauri v2 (required for iOS)
   - [ ] Set up iOS provisioning profiles
   - [ ] Configure App Store Connect
   - [ ] Submit for App Store review

---

## 📞 Support

For build issues:
- Tauri Discord: https://discord.com/invite/tauri
- Tauri Docs: https://tauri.app/v1/guides/

For Apple Developer issues:
- Apple Developer Support: https://developer.apple.com/support/
