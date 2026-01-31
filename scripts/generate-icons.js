/**
 * Generate PNG and ICO icons from SVG source
 *
 * Run with: node scripts/generate-icons.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Creates an ICO file from multiple PNG buffers.
 * ICO format: https://en.wikipedia.org/wiki/ICO_(file_format)
 */
function createIco(pngBuffers) {
  const images = pngBuffers.map((png) => {
    // Parse PNG to get dimensions (width at offset 16, height at offset 20)
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    return { data: png, width, height };
  });

  // ICO Header: 6 bytes
  const headerSize = 6;
  // ICO Directory Entry: 16 bytes per image
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * images.length;

  // Calculate total size and offsets
  let dataOffset = headerSize + dirSize;
  const offsets = images.map((img) => {
    const offset = dataOffset;
    dataOffset += img.data.length;
    return offset;
  });

  const totalSize = dataOffset;
  const buffer = Buffer.alloc(totalSize);

  // Write ICO Header
  buffer.writeUInt16LE(0, 0); // Reserved (0)
  buffer.writeUInt16LE(1, 2); // Image type: 1 = ICO
  buffer.writeUInt16LE(images.length, 4); // Number of images

  // Write Directory Entries
  images.forEach((img, i) => {
    const entryOffset = headerSize + i * dirEntrySize;
    buffer.writeUInt8(img.width >= 256 ? 0 : img.width, entryOffset); // Width (0 = 256)
    buffer.writeUInt8(img.height >= 256 ? 0 : img.height, entryOffset + 1); // Height
    buffer.writeUInt8(0, entryOffset + 2); // Color palette (0 = no palette)
    buffer.writeUInt8(0, entryOffset + 3); // Reserved
    buffer.writeUInt16LE(1, entryOffset + 4); // Color planes
    buffer.writeUInt16LE(32, entryOffset + 6); // Bits per pixel
    buffer.writeUInt32LE(img.data.length, entryOffset + 8); // Image data size
    buffer.writeUInt32LE(offsets[i], entryOffset + 12); // Offset to image data
  });

  // Write Image Data
  images.forEach((img, i) => {
    img.data.copy(buffer, offsets[i]);
  });

  return buffer;
}

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

    const icoBuffer = createIco(pngBuffers);
    fs.writeFileSync(path.join(staticDir, 'favicon.ico'), icoBuffer);
    console.log('  Created: favicon.ico (16x16, 32x32, 48x48)');
  } catch (error) {
    console.error('  Error creating favicon.ico:', error.message);
  }

  console.log('\nDone!');
}

generateIcons().catch(console.error);
