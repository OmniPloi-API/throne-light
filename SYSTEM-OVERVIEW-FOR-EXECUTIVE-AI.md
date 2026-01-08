# Throne Light Publishing - Complete System Overview

**Prepared for Executive AI Briefing**
**Date:** January 7, 2026
**Purpose:** App Store Submission Preparation for ThroneLight Reader (macOS & iOS)

---

## 1. BUSINESS OVERVIEW

### The Company
**Throne Light Publishing** is an independent publishing company founded by the author **EOLLES** (pen name). The company's flagship product is the book *"The Crowded Bed & The Empty Throne"* - a prophetic/spiritual self-help book targeting readers seeking personal transformation and sovereignty.

### Brand Philosophy
- **Ethos:** "Sovereignty in every word" - empowering readers to reclaim their personal authority
- **Aesthetic:** "High-Church Minimalism meets Editorial Vogue" - dark, elegant, gold-accented design
- **Tone:** Prophetic, intimate, regal - the author speaks as a guide/mentor figure

### Revenue Model
1. **Direct Digital Sales** - Customers purchase the digital book through our website, receive a license code, and read via the ThroneLight Reader app
2. **Physical Book Sales** - Amazon/retail (tracked but not processed by us)
3. **Partner/Affiliate Program** - Revenue sharing with influencers and promoters

---

## 2. THE DIGITAL CONSTELLATION (Website Architecture)

The website at **thronelightpublishing.com** consists of three interconnected sites:

### Site 1: The Book (`/book`)
- Primary sales/conversion page for "The Crowded Bed & The Empty Throne"
- Long-form sales page with sections: Hero, Mirror, Confrontation, Scroll, Witnesses, Altar
- Goal: Recognition → Confrontation → Purchase

### Site 2: The Author (`/author`)
- EOLLES personal brand/portfolio
- Sections: Voice, Dispatch, Frequency (Music), Gathering (Events), Remnant (Newsletter)
- Goal: Build connection, authority, and email list

### Site 3: The Publisher (`/publisher`)
- Corporate/institutional presence
- Sections: Foundation, Mandate, Archive, Gate, Ledger
- Goal: Establish legitimacy and brand mythos

---

## 3. TECHNICAL ARCHITECTURE

### Core Stack
| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | TailwindCSS |
| **Animations** | Framer Motion |
| **Database** | Supabase (PostgreSQL) |
| **Payments** | Stripe |
| **Email** | Resend |
| **Hosting** | Railway (NOT Vercel) |
| **Desktop App** | Tauri (Rust + WebView) |

### API Structure
39+ REST API endpoints handling:
- Authentication (`/api/auth/*`)
- Checkout & Payments (`/api/checkout/*`)
- Partner Management (`/api/partners/*`)
- Email Campaigns (`/api/email/*`)
- Reader Licensing (`/api/reader/*`)
- Support Tickets (`/api/support/*`)
- Analytics & Events (`/api/events/*`)

---

## 4. THRONELIGHT READER APP

### What It Is
A **native desktop/mobile application** that serves as the exclusive reading platform for purchased digital books from Throne Light Publishing. Think of it as a proprietary Kindle-like reader, but for our books only.

### Technical Implementation
- **Framework:** Tauri v1.x (Rust backend + WebView frontend)
- **Frontend:** Next.js pages wrapped in native shell
- **Bundle Identifier:** `com.thronelight.reader`
- **Signing Identity:** `Developer ID Application: SINGUiSTICS LLC (C69AYXN88H)`
- **Current Version:** 1.0.1

### How It Works
1. Customer purchases book on website via Stripe
2. System generates unique **license code** (format: `XXXX-XXXX-XXXX-XXXX`)
3. Customer receives email with license code and download link
4. Customer downloads ThroneLight Reader app
5. Customer enters license code in app to activate
6. Book content is streamed/loaded from our servers
7. Customer can read on up to **2 devices** per license

### App Features
- Clean, distraction-free reading interface
- Dark mode optimized (matches brand aesthetic)
- Secure content delivery (no local file storage of book content)
- Device activation tracking
- License validation on each launch

### Current Entitlements (macOS)
```xml
com.apple.security.cs.allow-jit = true
com.apple.security.cs.allow-unsigned-executable-memory = true
com.apple.security.cs.disable-library-validation = true
com.apple.security.network.client = true
```

---

## 5. LICENSING & SECURITY SYSTEM

### Core Security Principle
**2-Device Limit** - Each license code can only be activated on a maximum of 2 devices. This prevents piracy while allowing reasonable flexibility (e.g., laptop + phone).

### Database Tables (Supabase)

#### `reader_licenses`
- `license_code` - Unique 16-character code
- `email` - Customer email
- `stripe_session_id` - Payment verification
- `max_devices` - Default 2
- `is_active` / `is_revoked` - Status flags

#### `device_activations`
- `license_id` - Foreign key to license
- `device_fingerprint` - Unique device identifier
- `device_type` - 'macos', 'windows', 'ios', 'android', 'web'
- `is_active` - Can be deactivated to free up slot

#### `license_support_claims`
- For users who need help with device limits
- Claim types: DEVICE_LIMIT_EXCEEDED, ACTIVATION_ISSUE, etc.

### Activation Flow
1. User enters license code in app
2. App generates device fingerprint
3. API checks: Is license valid? How many active devices?
4. If < 2 devices: Activate and allow access
5. If = 2 devices: Deny with option to deactivate old device
6. If 3rd attempt: Oldest session is revoked (FIFO)

---

## 6. PARTNER/AFFILIATE SYSTEM

### How It Works
Partners (influencers, reviewers, promoters) get:
- Unique tracking URL: `thronelightpublishing.com/partners/{slug}`
- Coupon code for their audience
- Commission on sales (configurable %)
- Click bounty on external clicks (Amazon, etc.)

### Partner Portal
Partners can log in at `/partner/login` with their access code to view:
- Real-time analytics (visits, clicks, conversions)
- Earnings breakdown (matured vs pending)
- Withdrawal requests

### Commission Maturity
- 7-day hold on commissions (refund protection)
- After 7 days, funds become "matured" and withdrawable
- Click bounties are instant (no hold)

---

## 7. EMAIL CAMPAIGNS

### "Light of EOLLES" Campaign
- **52 bi-weekly personal letters** from EOLLES to subscribers
- First email sent immediately on signup
- Subsequent emails every 14 days
- 24 months of automated nurturing content
- Non-purchasers see elegant CTA for ThroneLight Reader download

### Technical Implementation
- Resend API for delivery
- Cron endpoint for scheduled sends
- Tracking: sent, delivered, opened, clicked, bounced

---

## 8. ADMIN DASHBOARD

Located at `/admin` (password protected), provides:
- **Command Center** - Global visualization map of traffic
- **Traffic Analysis** - Visits, retention, bounce rates
- **Revenue Analysis** - Sales, commissions, click bounties
- **Partner Management** - Onboard, activate/deactivate partners
- **Reader Support** - License issues, device claims
- **Subscriber Management** - Email list oversight
- **Review Management** - Approve/reject customer reviews

---

## 9. CURRENT DISTRIBUTION STATUS

### Direct Distribution (DMG)
- **Status:** Working, needs notarization
- **Certificate:** Developer ID Application (SINGUiSTICS LLC)
- **Process:** Build → Sign → Notarize → Staple → Distribute

### Mac App Store
- **Status:** Not yet submitted
- **Requirements:**
  - Mac App Distribution certificate (different from Developer ID)
  - App Sandbox entitlements
  - .pkg packaging
  - App Store Connect submission

### iOS App Store
- **Status:** Not yet built
- **Requirements:**
  - iOS build target in Tauri
  - iOS Distribution certificate
  - App Store Connect submission
  - TestFlight beta testing

---

## 10. APP STORE SUBMISSION REQUIREMENTS

### For Mac App Store

#### Certificate Changes Needed
- Current: `Developer ID Application` (for direct distribution)
- Needed: `3rd Party Mac Developer Application` (for App Store)
- Also need: `3rd Party Mac Developer Installer` (for .pkg)

#### Entitlements Changes Needed
Current entitlements are for **notarized direct distribution**. For App Store, we need **App Sandbox**:

```xml
<!-- REQUIRED for App Store -->
<key>com.apple.security.app-sandbox</key>
<true/>

<!-- Network access (required - app fetches content from server) -->
<key>com.apple.security.network.client</key>
<true/>

<!-- May need for file access -->
<key>com.apple.security.files.user-selected.read-write</key>
<true/>
```

**Note:** The current entitlements (`allow-jit`, `allow-unsigned-executable-memory`, `disable-library-validation`) are NOT compatible with App Sandbox and must be removed or justified.

#### App Review Considerations
1. **Content Rating** - Book contains mature themes (relationships, spirituality)
2. **In-App Purchases** - Currently purchases happen on website, not in-app
   - Apple may require in-app purchase for digital content
   - This is a significant architectural consideration
3. **Reader App Guidelines** - Apple has specific rules for "reader" apps
4. **Privacy Policy** - Required, must be accessible

### For iOS App Store

#### Additional Requirements
- iOS-specific UI adaptations
- Touch-optimized reading interface
- iOS entitlements and provisioning profiles
- Potentially different content delivery for mobile

---

## 11. KEY FILES & LOCATIONS

### Tauri Configuration
- `src-tauri/tauri.conf.json` - App config, bundle settings
- `src-tauri/entitlements.plist` - macOS entitlements
- `src-tauri/Cargo.toml` - Rust dependencies
- `src-tauri/src/main.rs` - Rust entry point

### Database Migrations
- `supabase/migrations/008_reader_licensing.sql` - License system schema

### API Endpoints (Reader-related)
- `src/app/api/reader/*` - License activation, validation
- `src/app/api/checkout/*` - Purchase flow
- `src/app/api/auth/*` - User authentication

### Build Commands
```bash
# macOS Universal Binary (Intel + Apple Silicon)
CARGO_TARGET_DIR=/tmp/throne-light-build npm run tauri build -- --target universal-apple-darwin

# Development
npm run tauri:dev
```

---

## 12. IMMEDIATE ACTION ITEMS FOR APP STORE

### Phase 1: Mac App Store Preparation
1. [ ] Create Mac App Distribution certificate in Apple Developer portal
2. [ ] Create Mac App Store provisioning profile
3. [ ] Update entitlements.plist for App Sandbox
4. [ ] Resolve JIT/unsigned memory requirements (may need architectural changes)
5. [ ] Build and sign with App Store certificate
6. [ ] Create .pkg installer
7. [ ] Submit to App Store Connect
8. [ ] Prepare App Store metadata (screenshots, description, keywords)

### Phase 2: iOS Preparation
1. [ ] Configure Tauri for iOS target
2. [ ] Create iOS Distribution certificate and provisioning profile
3. [ ] Adapt UI for touch/mobile
4. [ ] Build iOS app
5. [ ] TestFlight beta testing
6. [ ] Submit to App Store

### Critical Decision Point
**In-App Purchase Requirement:** Apple's App Store guidelines may require that digital content (books) be purchasable via In-App Purchase if sold through an iOS/Mac App Store app. This would require:
- Implementing StoreKit
- Apple takes 30% commission
- Significant backend changes

**Alternative:** Position as a "Reader App" (like Kindle) where purchases happen on web, and app is just for consumption. This has specific Apple guidelines to follow.

---

## 13. CONTACTS & ACCOUNTS

### Apple Developer
- **Team:** SINGUiSTICS LLC
- **Team ID:** C69AYXN88H
- **Portal:** developer.apple.com

### Infrastructure
- **Hosting:** Railway
- **Database:** Supabase
- **Payments:** Stripe
- **Email:** Resend
- **Domain:** thronelightpublishing.com

---

## 14. SUMMARY

**ThroneLight Reader** is a native desktop/mobile application built with Tauri that serves as the exclusive reading platform for Throne Light Publishing's digital books. The system uses a license-code-based activation model with a 2-device limit for piracy protection.

**Current State:**
- macOS app is built and functional
- Direct distribution (DMG) works but needs proper notarization
- App Store submission has not been attempted
- iOS version has not been built

**Primary Challenges for App Store:**
1. Entitlements need to be App Sandbox compatible
2. May need to address Apple's In-App Purchase requirements
3. Need proper certificates for App Store distribution
4. iOS build needs to be configured and tested

---

*Document prepared by Cascade AI for executive briefing purposes.*
