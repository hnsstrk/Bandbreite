/**
 * Beschriftungen und Farben der Spektrum-Bedienleiste — reine Daten.
 *
 * Volle und schmale Leiste teilen sich diese Liste: die volle zeigt `label`,
 * die schmale `shortLabel`. So kann keine Fassung der anderen davonlaufen.
 */

import type { RowKey, VisibleRows } from './spectrumBands';
import type { ViewMode } from './spectrumState.svelte';

export interface RowChip {
  key: RowKey;
  /** Beschriftung in der vollen Leiste. */
  label: string;
  /** Kurzform in der schmalen Leiste. */
  shortLabel: string;
  /** Farbpunkt in der Reihenfarbe. */
  dot: string;
  /** Lesbare Textfassung derselben Reihe. */
  ink: string;
}

export const ROW_CHIPS: readonly RowChip[] = [
  {
    key: 'em',
    label: 'EM-Spektrum',
    shortLabel: 'EM',
    dot: 'var(--color-series-1)',
    ink: 'var(--color-cat-blue)'
  },
  {
    key: 'itu',
    label: 'ITU',
    shortLabel: 'ITU',
    dot: 'var(--color-series-5)',
    ink: 'var(--color-cat-cyan)'
  },
  {
    key: 'ieee',
    label: 'IEEE',
    shortLabel: 'IEEE',
    dot: 'var(--color-series-4)',
    ink: 'var(--color-cat-violet)'
  },
  {
    key: 'nato',
    label: 'NATO',
    shortLabel: 'NATO',
    dot: 'var(--color-series-6)',
    ink: 'var(--color-cat-red)'
  },
  {
    key: 'civilian',
    label: 'Zivil',
    shortLabel: 'Zivil',
    dot: 'var(--color-series-2)',
    ink: 'var(--color-cat-green)'
  }
];

export interface ViewModeOption {
  value: ViewMode;
  /** Beschriftung in der vollen Leiste. */
  label: string;
  /** Kurzform im Auswahlfeld der schmalen Leiste. */
  shortLabel: string;
  /** Zusatzhinweis (nur wo gesetzt). */
  title?: string;
}

export const VIEW_MODES: readonly ViewModeOption[] = [
  { value: 'rf', label: 'RF (3 Hz - 3 THz)', shortLabel: 'RF' },
  { value: 'visible', label: 'RF + Licht (bis 1 PHz)', shortLabel: 'RF + Licht' },
  { value: 'full', label: 'Gesamt (bis Gamma)', shortLabel: 'Gesamt' },
  {
    value: 'ieee',
    label: 'IEEE (3 MHz – 110 GHz)',
    shortLabel: 'IEEE',
    title: 'IEEE-Radarbänder nach IEEE Std 521, 3 MHz bis 110 GHz'
  }
];

/** Auswahlwert des Ansichtsfeldes zurück in einen `ViewMode`. */
export function toViewMode(value: string): ViewMode {
  const found = VIEW_MODES.find((mode) => mode.value === value);
  return found ? found.value : VIEW_MODES[0].value;
}

/** Eigenschaften beider Fassungen der Bedienleiste. */
export interface SpectrumControlsProps {
  visibleRows: VisibleRows;
  viewMode: ViewMode;
  zoomLevel: number;
  frequencyHz: number | undefined;
  wavelengthDisplay: string;
  onToggleRow: (row: RowKey) => void;
  onSetViewMode: (mode: ViewMode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onPanLeft: () => void;
  onPanRight: () => void;
  onJumpToVisibleLight: () => void;
  onCenterOnMarker: () => void;
}
