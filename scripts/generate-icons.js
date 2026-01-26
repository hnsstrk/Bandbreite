/**
 * Generate PNG and ICO icons from SVG source
 *
 * Run with: node scripts/generate-icons.js
 */

import sharp from 'sharp';
import toIco from 'to-ico';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const staticDir = path.join(rootDir, 'static');
const iconsDir = path.join(staticDir, 'icons');

// Read the source SVG
const svgPath = path.join(iconsDir, 'icon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Icon sizes to generate
const iconSizes = [
  { name: 'favicon.png', size: 32, dir: staticDir },
  { name: 'apple-touch-icon.png', size: 180, dir: staticDir },
  { name: 'apple-touch-icon-precomposed.png', size: 180, dir: staticDir },
  { name: 'icon-72x72.png', size: 72, dir: iconsDir },
  { name: 'icon-96x96.png', size: 96, dir: iconsDir },
  { name: 'icon-128x128.png', size: 128, dir: iconsDir },
  { name: 'icon-144x144.png', size: 144, dir: iconsDir },
  { name: 'icon-152x152.png', size: 152, dir: iconsDir },
  { name: 'icon-192x192.png', size: 192, dir: iconsDir },
  { name: 'icon-384x384.png', size: 384, dir: iconsDir },
  { name: 'icon-512x512.png', size: 512, dir: iconsDir },
];

async function generateIcons() {
  console.log('Generating icons from SVG...');

  for (const icon of iconSizes) {
    const outputPath = path.join(icon.dir, icon.name);

    try {
      await sharp(Buffer.from(svgContent))
        .resize(icon.size, icon.size)
        .png()
        .toFile(outputPath);

      console.log(`  Created: ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`  Error creating ${icon.name}:`, error.message);
    }
  }

  // Generate favicon.ico from multiple sizes
  console.log('\nGenerating favicon.ico...');
  try {
    const sizes = [16, 32, 48];
    const pngBuffers = await Promise.all(
      sizes.map((size) =>
        sharp(Buffer.from(svgContent)).resize(size, size).png().toBuffer()
      )
    );

    const icoBuffer = await toIco(pngBuffers);
    fs.writeFileSync(path.join(staticDir, 'favicon.ico'), icoBuffer);
    console.log('  Created: favicon.ico (16x16, 32x32, 48x48)');
  } catch (error) {
    console.error('  Error creating favicon.ico:', error.message);
  }

  console.log('\nDone!');
}

generateIcons().catch(console.error);
