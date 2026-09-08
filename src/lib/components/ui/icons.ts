/**
 * Icon-Katalog für {@link Icon}.
 *
 * Alle Icons sind Strichzeichnungen auf einem 24x24-Raster.
 * Sie werden ausschließlich über `stroke="currentColor"` eingefärbt —
 * niemals über feste Farbwerte — und ersetzen die bisherigen Emoji.
 *
 * Jeder Eintrag ist eine Liste von SVG-Pfaddaten (`d`-Attribute).
 */

export const ICONS = {
  /* --- Navigation und Bedienung --- */
  search: ['M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0', 'M16.5 16.5 21 21'],
  menu: ['M3 6h18', 'M3 12h18', 'M3 18h18'],
  close: ['M6 6 18 18', 'M18 6 6 18'],
  'chevron-down': ['M6 9l6 6 6-6'],
  'chevron-right': ['M9 6l6 6-6 6'],
  'chevron-left': ['M15 6l-6 6 6 6'],
  'arrow-right': ['M4 12h16', 'M14 6l6 6-6 6'],
  external: [
    'M14 4h6v6',
    'M20 4 11 13',
    'M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5'
  ],

  /* --- Theme --- */
  sun: [
    'M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
    'M12 2v2',
    'M12 20v2',
    'M4.22 4.22l1.42 1.42',
    'M18.36 18.36l1.42 1.42',
    'M2 12h2',
    'M20 12h2',
    'M4.22 19.78l1.42-1.42',
    'M18.36 5.64l1.42-1.42'
  ],
  moon: ['M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'],
  monitor: ['M3 5h18v11H3z', 'M8 21h8', 'M12 16v5'],

  /* --- Bereiche der Anwendung --- */
  calculator: [
    'M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z',
    'M7.5 7h9v3h-9z',
    'M8.5 14h.01',
    'M12 14h.01',
    'M15.5 14h.01',
    'M8.5 17.5h.01',
    'M12 17.5h.01',
    'M15.5 17.5h.01'
  ],
  radio: [
    'M13.5 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0',
    'M7.8 16.2a6 6 0 0 1 0-8.4',
    'M16.2 7.8a6 6 0 0 1 0 8.4',
    'M4.9 19.1a10 10 0 0 1 0-14.2',
    'M19.1 4.9a10 10 0 0 1 0 14.2'
  ],
  book: ['M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z', 'M4 19a2 2 0 0 1 2-2h13'],
  database: [
    'M20 4.5c0 1.4-3.6 2.5-8 2.5S4 5.9 4 4.5 7.6 2 12 2s8 1.1 8 2.5z',
    'M20 4.5v15c0 1.4-3.6 2.5-8 2.5s-8-1.1-8-2.5v-15',
    'M20 12c0 1.4-3.6 2.5-8 2.5S4 13.4 4 12'
  ],
  wave: ['M2 12c1.7-5 3.3-5 5 0s3.3 5 5 0 3.3-5 5 0 3.3 5 5 0'],
  antenna: [
    'M12 21v-9',
    'M9.5 9.5a3.5 3.5 0 0 1 5 0',
    'M7 7a7 7 0 0 1 10 0',
    'M13 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0',
    'M9 21h6'
  ],
  satellite: [
    'M4.5 12.5 12 5l3.5 3.5L8 16z',
    'M9 9 5.5 5.5',
    'M15 15l3.5 3.5',
    'M14 20a6 6 0 0 0 6-6',
    'M14 16.5a2.5 2.5 0 0 0 2.5-2.5'
  ],
  signal: ['M4 20v-3', 'M9 20v-7', 'M14 20V9', 'M19 20V5'],
  spectrum: ['M3 15v4', 'M7.5 9v10', 'M12 5v14', 'M16.5 11v8', 'M21 14v5'],
  globe: [
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
    'M3 12h18',
    'M12 3c2.5 2.7 3.7 5.7 3.7 9s-1.2 6.3-3.7 9c-2.5-2.7-3.7-5.7-3.7-9S9.5 5.7 12 3z'
  ],

  /* --- Fachthemen (Namen aus NAV_TREE) --- */
  radar: ['M12 3a9 9 0 1 0 9 9', 'M12 7.5a4.5 4.5 0 1 0 4.5 4.5', 'M12 12 19 5', 'M17.5 14.5h.01'],
  'radio-tower': [
    'M13 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0',
    'M8.8 13.2a4.5 4.5 0 0 1 0-6.4',
    'M15.2 6.8a4.5 4.5 0 0 1 0 6.4',
    'M6 16a9 9 0 0 1 0-12',
    'M18 4a9 9 0 0 1 0 12',
    'M12 12.5V21',
    'M9 21h6'
  ],
  broadcast: [
    'M12 13.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
    'M8.5 15a5 5 0 0 1 0-7',
    'M15.5 8a5 5 0 0 1 0 7',
    'M5.6 17.9a9 9 0 0 1 0-12.8',
    'M18.4 5.1a9 9 0 0 1 0 12.8'
  ],
  waves: [
    'M2 9c1.7-3.5 3.3-3.5 5 0s3.3 3.5 5 0 3.3-3.5 5 0 3.3 3.5 5 0',
    'M2 15c1.7-3.5 3.3-3.5 5 0s3.3 3.5 5 0 3.3-3.5 5 0 3.3 3.5 5 0'
  ],
  ellipse: ['M12 6c5.5 0 10 2.7 10 6s-4.5 6-10 6-10-2.7-10-6 4.5-6 10-6z', 'M2 12h20'],
  target: [
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
    'M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
    'M13 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0'
  ],
  smartphone: [
    'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z',
    'M10.5 18.5h3'
  ],
  cloud: ['M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z'],
  power: ['M12 3v9', 'M7.5 6.4a7.5 7.5 0 1 0 9 0'],
  layers: ['M12 3 3 8l9 5 9-5-9-5z', 'M3 12l9 5 9-5', 'M3 16l9 5 9-5'],
  exchange: ['M4 9h13', 'M14 6l3 3-3 3', 'M20 15H7', 'M10 12l-3 3 3 3'],

  /* --- Zahlen, Listen, Dokumente --- */
  'bar-chart': ['M3 20h18', 'M6 20V11', 'M12 20V4', 'M18 20v-6'],
  'trending-down': ['M3 7l5.5 5.5 5-5L21 16', 'M16 16h5v-5'],
  activity: ['M3 12h4l3-8 4 16 3-8h4'],
  sigma: ['M18 7V4H6l6 8-6 8h12v-3'],
  list: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3.5 6h.01', 'M3.5 12h.01', 'M3.5 18h.01'],
  table: [
    'M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z',
    'M3 9.5h18',
    'M3 15h18',
    'M9.5 9.5V20',
    'M15 9.5V20'
  ],
  map: ['M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z', 'M9 4v13.5', 'M15 6.5V20'],
  'file-text': [
    'M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z',
    'M14 3v4h4',
    'M9 12h6',
    'M9 16h6'
  ],

  /* --- Status und Hinweise --- */
  info: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0', 'M12 11v5', 'M12 8h.01'],
  warning: [
    'M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    'M12 9v4',
    'M12 17h.01'
  ],
  check: ['M4 12.5 9 17.5 20 6.5'],

  /* --- Aktionen --- */
  copy: [
    'M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1z',
    'M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1'
  ],
  share: [
    'M21 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    'M9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    'M21 19a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    'M8.6 10.6l6.8-3.2',
    'M8.6 13.4l6.8 3.2'
  ],
  reset: ['M3 12a9 9 0 1 0 3-6.7L3 8', 'M3 3v5h5'],
  filter: ['M3 5h18l-7 8v6l-4 2v-8z'],
  sliders: ['M4 8h10', 'M18 8h2', 'M4 16h4', 'M12 16h8', 'M16 6v4', 'M10 14v4'],
  clock: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0', 'M12 7v5l3.5 2'],
  play: ['M8 5l11 7-11 7z'],
  pause: ['M9 5v14', 'M15 5v14']
} as const;

export type IconName = keyof typeof ICONS;

/** Alle verfügbaren Icon-Namen, z. B. für Tests und Dokumentation. */
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

/** Prüft, ob ein beliebiger String ein bekannter Icon-Name ist. */
export function isIconName(value: string): value is IconName {
  return Object.prototype.hasOwnProperty.call(ICONS, value);
}
