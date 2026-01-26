/**
 * Extract applications data from TypeScript to JSON
 *
 * This script reads the applications.ts file and extracts the data arrays
 * into a JSON file for easier maintenance and separation of concerns.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const content = fs.readFileSync(path.join(rootDir, 'src/lib/data/applications.ts'), 'utf-8');

// Extract arrays using regex
const arrayRegex = /export const (\w+_APPLICATIONS): RFApplication\[\] = (\[[\s\S]*?\]);(?=\n\n|$)/g;
let match;
const data = {};

while ((match = arrayRegex.exec(content)) !== null) {
  const name = match[1];
  const arrayStr = match[2];

  // Convert TypeScript-style scientific notation to regular numbers
  let cleaned = arrayStr;

  // Handle e3, e6, e9 style notations (e.g., 148.5e3 -> 148500)
  cleaned = cleaned.replace(/(\d+\.?\d*)e(\d+)/g, (m, base, exp) => {
    return String(parseFloat(base) * Math.pow(10, parseInt(exp)));
  });

  // Handle negative exponents
  cleaned = cleaned.replace(/(\d+\.?\d*)e-(\d+)/g, (m, base, exp) => {
    return String(parseFloat(base) * Math.pow(10, -parseInt(exp)));
  });

  // Clean trailing commas for valid JSON
  cleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

  try {
    // Use Function constructor instead of eval for slightly safer parsing
    // Note: This is only safe because we control the source file
    const parsed = new Function('return ' + cleaned)();
    const key = name.replace('_APPLICATIONS', '').toLowerCase();
    data[key] = parsed;
    console.log(`Parsed ${name}: ${parsed.length} items`);
  } catch (e) {
    console.error(`Error parsing ${name}: ${e.message}`);
  }
}

// Extract CATEGORY_NAMES
const categoryMatch = content.match(/export const CATEGORY_NAMES[^=]*=\s*({[\s\S]*?}) as const;/);
if (categoryMatch) {
  const cleaned = categoryMatch[1]
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']');
  try {
    data.categoryNames = new Function('return ' + cleaned)();
    console.log('Parsed CATEGORY_NAMES');
  } catch (e) {
    console.error(`Error parsing CATEGORY_NAMES: ${e.message}`);
  }
}

fs.writeFileSync(path.join(rootDir, 'src/lib/data/applications.json'), JSON.stringify(data, null, 2));
console.log('\nWritten to applications.json');
console.log(`Total categories: ${Object.keys(data).filter(k => k !== 'categoryNames').length}`);
