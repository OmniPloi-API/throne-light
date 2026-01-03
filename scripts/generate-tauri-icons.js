#!/usr/bin/env node
/**
 * Generate Tauri app icons from the source logo
 * 
 * Prerequisites:
 * - Install sharp: npm install sharp --save-dev
 * - Run: node scripts/generate-tauri-icons.js
 * 
 * This will generate all required icon sizes for macOS, Windows, and Linux
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_IMAGE = path.join(__dirname, '../public/images/THRONELIGHT-LOGO.png');
const OUTPUT_DIR = path.join(__dirname, '../src-tauri/icons');

const ICON_SIZES = [
  { size: 32, name: '32x32.png' },
  { size: 128, name: '128x128.png' },
  { size: 256, name: '128x128@2x.png' },
  { size: 256, name: 'icon.png' },
];

async function generateIcons() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Generating Tauri icons from:', SOURCE_IMAGE);

  for (const { size, name } of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, name);
    await sharp(SOURCE_IMAGE)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    console.log(`  ✓ Generated ${name} (${size}x${size})`);
  }

  console.log('\n⚠️  Manual steps required:');
  console.log('  1. For macOS (.icns): Use an online converter or `iconutil` to create icon.icns');
  console.log('  2. For Windows (.ico): Use an online converter to create icon.ico');
  console.log('  Recommended: https://cloudconvert.com/png-to-icns');
  console.log('\nIcon generation complete!');
}

generateIcons().catch(console.error);
