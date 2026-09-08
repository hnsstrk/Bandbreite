/**
 * Reaktiver Zustand von SpectrumOverview.
 *
 * Hält nur Zustand und leitet ab; die Mathematik liegt in reinen Modulen:
 * - `spectrumZoom.ts`   — Log-Domäne, Zoom/Pan, Achsen-Ticks
 * - `spectrumBands.ts`  — Bandreihen, Rechtecke, Farbverlauf, Layoutmaße
 * - `spectrumFormat.ts` — Kurzformate für Frequenz, Wellenlänge, Zoomstufe
 * - `spectrumCursor.svelte.ts` — Fadenkreuz
 * Alle Exporte dieser Module werden hier weitergereicht, damit die bisherige
 * Import-Adresse `./spectrumState.svelte` unverändert bleibt.
 */

import { scaleLog } from 'd3-scale';
import type { FrequencyBand } from '$lib/data/bands';
import { speedOfLight } from '$lib/stores/speedOfLight.svelte';
import { safeDivide } from '$lib/utils/handlers';
import {
  SPECTRUM_MIN_HZ,
  SPECTRUM_MAX_RF_HZ,
  SPECTRUM_MAX_VISIBLE_HZ,
  SPECTRUM_MAX_GAMMA_HZ
} from '$lib/data/spectrum';
import {
  MIN_ZOOM,
  MAX_ZOOM,
  ZOOM_STEP_FACTOR,
  VISIBLE_LIGHT_ZOOM,
  zoomedDomain as computeZoomedDomain,
  panOffsetKeepingCenter,
  panOffsetStepped,
  panOffsetCenteredOn,
  frequencyTicks as computeFrequencyTicks,
  wavelengthTicks as computeWavelengthTicks
} from './spectrumZoom';
import {
  MARGIN,
  ROW_ORDER,
  ROW_LABELS,
  ROW_SOURCES,
  DEFAULT_VISIBLE_ROWS,
  VISIBLE_MIN_HZ,
  VISIBLE_MAX_HZ,
  bandRects,
  rowY,
  rowsHeight,
  visibleLightGradientStops as computeGradientStops,
  type RowKey,
  type VisibleRows,
  type RowConfig
} from './spectrumBands';
import { formatWavelengthLocal } from './spectrumFormat';
import { createSpectrumCursor } from './spectrumCursor.svelte';

// =============================================================================
// Re-exports (öffentliche API unverändert)
// =============================================================================

export { MIN_ZOOM, MAX_ZOOM, WAVELENGTH_TICK_DEFS } from './spectrumZoom';
export {
  MARGIN,
  ROW_HEIGHT,
  GAP,
  VISIBLE_MIN_HZ,
  VISIBLE_MAX_HZ,
  EXTENDED_EM_BANDS,
  getVisibleLightColor,
  type RowKey,
  type VisibleRows,
  type BandRect,
  type RowConfig
} from './spectrumBands';
export { formatFrequencyLocal, formatWavelengthLocal, formatZoom } from './spectrumFormat';
export { ROUNDED_SPEED_OF_LIGHT } from './spectrumCursor.svelte';

export type ViewMode = 'rf' | 'visible' | 'full';

export interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  band: FrequencyBand | null;
}

export const SPECTRUM_MIN = SPECTRUM_MIN_HZ;
export const SPECTRUM_MAX_GAMMA = SPECTRUM_MAX_GAMMA_HZ;
export const SPECTRUM_MAX_RF = SPECTRUM_MAX_RF_HZ;
export const SPECTRUM_MAX_VISIBLE = SPECTRUM_MAX_VISIBLE_HZ;

/** Kleinste Zeichenbreite, damit die Skala auch in schmalen Containern gültig bleibt. */
const MIN_INNER_WIDTH = 100;
const DEFAULT_CONTAINER_WIDTH = 800;

// =============================================================================
// Main state factory
// =============================================================================

export function createSpectrumState() {
  // Speed of light - reactive to store
  let currentSpeedOfLight = $derived(speedOfLight.value);

  // View mode
  let viewMode = $state<ViewMode>('visible');

  // Derived spectrum max based on view mode
  let spectrumMax = $derived.by(() => {
    switch (viewMode) {
      case 'rf':
        return SPECTRUM_MAX_RF;
      case 'visible':
        return SPECTRUM_MAX_VISIBLE;
      case 'full':
        return SPECTRUM_MAX_GAMMA;
    }
  });

  // Zoom state
  let zoomLevel = $state(1);
  let panOffset = $state(0);

  // Row visibility state
  const visibleRows = $state<VisibleRows>({ ...DEFAULT_VISIBLE_ROWS });

  // Container state
  let containerWidth = $state(DEFAULT_CONTAINER_WIDTH);

  // Tooltip state
  let tooltip = $state<TooltipState>({ visible: false, x: 0, y: 0, band: null });

  // Derived calculations
  let innerWidth = $derived(Math.max(containerWidth - MARGIN.left - MARGIN.right, MIN_INNER_WIDTH));

  let visibleRowCount = $derived(Object.values(visibleRows).filter(Boolean).length);

  let zoomedDomain = $derived(computeZoomedDomain(SPECTRUM_MIN, spectrumMax, zoomLevel, panOffset));

  // Shared logarithmic scale
  let xScale = $derived(scaleLog().domain(zoomedDomain).range([0, innerWidth]));

  const cursor = createSpectrumCursor({ xScale: () => xScale, innerWidth: () => innerWidth });

  // Row configuration with band rectangles
  let rowConfig: RowConfig[] = $derived(
    ROW_ORDER.map((key) => ({
      key,
      label: ROW_LABELS[key],
      bands: bandRects(ROW_SOURCES[key], zoomedDomain, xScale)
    }))
  );

  let visibleLightGradientStops = $derived(computeGradientStops(zoomedDomain, currentSpeedOfLight));

  let frequencyTicks = $derived(computeFrequencyTicks(zoomedDomain, zoomLevel));

  let wavelengthTicks = $derived(computeWavelengthTicks(zoomedDomain, currentSpeedOfLight));

  // Total band rows height for marker line
  let bandRowsHeight = $derived(rowsHeight(visibleRowCount));

  // Total SVG height
  let totalHeight = $derived(MARGIN.top + bandRowsHeight + MARGIN.bottom);

  function getRowY(rowIndex: number): number {
    return rowY(rowIndex, visibleRows);
  }

  function toggleRow(row: RowKey) {
    visibleRows[row] = !visibleRows[row];
  }

  // Zoom control functions
  function zoomIn() {
    if (zoomLevel < MAX_ZOOM) {
      const newZoom = Math.min(zoomLevel * ZOOM_STEP_FACTOR, MAX_ZOOM);
      panOffset = panOffsetKeepingCenter(SPECTRUM_MIN, spectrumMax, zoomLevel, panOffset, newZoom);
      zoomLevel = newZoom;
    }
  }

  function zoomOut() {
    if (zoomLevel > MIN_ZOOM) {
      const newZoom = Math.max(zoomLevel / ZOOM_STEP_FACTOR, MIN_ZOOM);
      panOffset = panOffsetKeepingCenter(SPECTRUM_MIN, spectrumMax, zoomLevel, panOffset, newZoom);
      zoomLevel = newZoom;
    }
  }

  function resetZoom() {
    zoomLevel = 1;
    panOffset = 0;
  }

  function panLeft() {
    panOffset = panOffsetStepped(SPECTRUM_MIN, spectrumMax, zoomLevel, panOffset, -1);
  }

  function panRight() {
    panOffset = panOffsetStepped(SPECTRUM_MIN, spectrumMax, zoomLevel, panOffset, 1);
  }

  // Center view on a given frequency
  function centerOnFrequency(frequencyHz: number) {
    if (!frequencyHz || frequencyHz < SPECTRUM_MIN || frequencyHz > spectrumMax) return;
    panOffset = panOffsetCenteredOn(SPECTRUM_MIN, spectrumMax, zoomLevel, frequencyHz);
  }

  // Jump to visible light spectrum
  function jumpToVisibleLight() {
    viewMode = 'visible';
    zoomLevel = VISIBLE_LIGHT_ZOOM;
    const visibleCenterHz = Math.sqrt(VISIBLE_MIN_HZ * VISIBLE_MAX_HZ);
    panOffset = panOffsetCenteredOn(SPECTRUM_MIN, SPECTRUM_MAX_VISIBLE, zoomLevel, visibleCenterHz);
  }

  // Set view mode and reset zoom
  function setViewMode(mode: ViewMode) {
    viewMode = mode;
    resetZoom();
  }

  // Calculate marker X position
  function getMarkerX(frequencyHz: number | undefined): number | null {
    if (!frequencyHz || frequencyHz < SPECTRUM_MIN || frequencyHz > spectrumMax) {
      return null;
    }
    const [domainMin, domainMax] = zoomedDomain;
    if (frequencyHz < domainMin || frequencyHz > domainMax) {
      return null;
    }
    return xScale(frequencyHz);
  }

  // Tooltip handlers
  function showTooltip(event: MouseEvent, band: FrequencyBand, containerRect: DOMRect | undefined) {
    if (!containerRect) return;
    tooltip = {
      visible: true,
      x: event.clientX - containerRect.left,
      y: event.clientY - containerRect.top,
      band
    };
  }

  function hideTooltip() {
    tooltip = { ...tooltip, visible: false, band: null };
  }

  // Safe wavelength formatting for display
  function safeFormatWavelength(frequencyHz: number): string {
    if (frequencyHz <= 0) return '---';
    return formatWavelengthLocal(safeDivide(currentSpeedOfLight, frequencyHz, 0));
  }

  return {
    get currentSpeedOfLight() {
      return currentSpeedOfLight;
    },
    get viewMode() {
      return viewMode;
    },
    get spectrumMax() {
      return spectrumMax;
    },
    get zoomLevel() {
      return zoomLevel;
    },
    get panOffset() {
      return panOffset;
    },
    get visibleRows() {
      return visibleRows;
    },
    get containerWidth() {
      return containerWidth;
    },
    set containerWidth(w: number) {
      containerWidth = w;
    },
    get tooltip() {
      return tooltip;
    },
    get innerWidth() {
      return innerWidth;
    },
    get visibleRowCount() {
      return visibleRowCount;
    },
    get zoomedDomain() {
      return zoomedDomain;
    },
    get xScale() {
      return xScale;
    },
    get visibleLightGradientStops() {
      return visibleLightGradientStops;
    },
    get frequencyTicks() {
      return frequencyTicks;
    },
    get wavelengthTicks() {
      return wavelengthTicks;
    },
    get rowConfig() {
      return rowConfig;
    },
    get totalHeight() {
      return totalHeight;
    },
    get bandRowsHeight() {
      return bandRowsHeight;
    },
    get cursorFrequencyHz() {
      return cursor.cursorFrequencyHz;
    },
    get cursorX() {
      return cursor.cursorX;
    },
    get cursorWavelengthLabel() {
      return cursor.cursorWavelengthLabel;
    },
    get cursorFrequencyLabel() {
      return cursor.cursorFrequencyLabel;
    },

    toggleRow,
    getRowY,
    zoomIn,
    zoomOut,
    resetZoom,
    panLeft,
    panRight,
    centerOnFrequency,
    jumpToVisibleLight,
    setViewMode,
    getMarkerX,
    showTooltip,
    hideTooltip,
    safeFormatWavelength,
    handleCursorMove: cursor.handleCursorMove,
    handleCursorLeave: cursor.handleCursorLeave
  };
}
