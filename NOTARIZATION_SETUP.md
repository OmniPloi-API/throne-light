# Apple Code Signing & Notarization Setup Guide

This guide will help you set up code signing and notarization for the Throne Light Reader macOS app.

## Prerequisites

You need an active **Apple Developer Program** membership ($99/year).

## Step 1: Generate App-Specific Password

1. Go to https://appleid.apple.com
2. Sign in with your Apple ID
3. Navigate to **Security** → **App-Specific Passwords**
4. Click **Generate Password**
5. Name it "Throne Light Notarization"
6. **Save this password** - you'll need it for GitHub secrets

## Step 2: Get Your Team ID

1. Go to https://developer.apple.com/account
2. Click on **Membership** in the sidebar
3. Your **Team ID** is displayed (10-character string like `A1B2C3D4E5`)
4. **Save this Team ID**

## Step 3: Create Developer ID Certificate

1. Go to https://developer.apple.com/account/resources/certificates/list
2. Click the **+** button to create a new certificate
3. Select **Developer ID Application** (for distribution outside the Mac App Store)
4. Follow the instructions to create a Certificate Signing Request (CSR):
   - Open **Keychain Access** on your Mac
   - Menu: **Keychain Access** → **Certificate Assistant** → **Request a Certificate from a Certificate Authority**
   - Enter your email address
   - Common Name: "Throne Light Publishing"
   - Select "Saved to disk"
   - Click **Continue** and save the CSR file
5. Upload the CSR file to Apple Developer portal
6. Download the certificate (`.cer` file)
7. Double-click to install it in Keychain Access

## Step 4: Export Certificate as P12

1. Open **Keychain Access**
2. In the left sidebar, select **My Certificates**
3. Find your "Developer ID Application" certificate
4. Right-click and select **Export**
5. Save as `.p12` file
6. **Set a password** and remember it
7. Save the file securely

## Step 5: Convert Certificate to Base64

Open Terminal and run:

```bash
base64 -i /path/to/your/certificate.p12 | pbcopy
```

This copies the base64-encoded certificate to your clipboard.

## Step 6: Get Your Signing Identity

In Terminal, run:

```bash
security find-identity -v -p codesigning
```

Look for the line with "Developer ID Application" and copy the full identity string, e.g.:
```
Developer ID Application: Your Name (TEAM_ID)
```

## Step 7: Add GitHub Secrets

Go to your GitHub repository:
1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add each of these:

| Secret Name | Value |
|-------------|-------|
| `MACOS_CERTIFICATE` | The base64 string from Step 5 |
| `MACOS_CERTIFICATE_PASSWORD` | The password you set in Step 4 |
| `KEYCHAIN_PASSWORD` | Any secure password (e.g., generate a random one) |
| `APPLE_SIGNING_IDENTITY` | The full identity string from Step 6 |
| `APPLE_ID` | Your Apple ID email |
| `APPLE_PASSWORD` | The app-specific password from Step 1 |
| `APPLE_TEAM_ID` | Your Team ID from Step 2 |

## Step 8: Test the Workflow

### Option A: Create a Git Tag (Automatic Release)

```bash
git tag v1.0.4
git push origin v1.0.4
```

This will trigger the GitHub Actions workflow automatically.

### Option B: Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **Release Throne Light Reader** workflow
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

## Step 9: Verify Notarization

After the workflow completes:

1. Download the DMG from the GitHub release
2. Open Terminal and run:

```bash
spctl -a -vv -t install /path/to/ThroneLight-Reader-macOS-AppleSilicon.dmg
```

You should see:
```
accepted
source=Notarized Developer ID
```

## Troubleshooting

### "No signing identity found"
- Make sure you've installed the certificate in Keychain Access
- Verify the certificate hasn't expired
- Check that `APPLE_SIGNING_IDENTITY` matches exactly

### "Notarization failed"
- Verify `APPLE_ID`, `APPLE_PASSWORD`, and `APPLE_TEAM_ID` are correct
- Check that your Apple Developer account is active
- Review the notarization log in GitHub Actions output

### "Invalid app-specific password"
- Generate a new app-specific password at appleid.apple.com
- Update the `APPLE_PASSWORD` secret in GitHub

## Local Testing (Optional)

To test signing locally before pushing:

```bash
# Set environment variables
export APPLE_CERTIFICATE="your-base64-cert"
export APPLE_CERTIFICATE_PASSWORD="your-cert-password"
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"
export APPLE_ID="your@email.com"
export APPLE_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="A1B2C3D4E5"

# Build
npm run tauri build
```

## Notes

- Notarization typically takes 2-5 minutes
- The workflow will wait for notarization to complete
- Once notarized, users can open the app without any warnings
- Certificates expire after 5 years - you'll need to renew them

## Support

If you encounter issues, check:
- GitHub Actions logs for detailed error messages
- Apple Developer portal for certificate status
- Notarization history at https://developer.apple.com/account
