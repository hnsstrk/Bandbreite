/**
 * Reactive state module for SpectrumOverview.
 *
 * Contains all calculation logic, zoom/pan state, band rectangle computation,
 * axis ticks, and helper functions for the spectrum visualization.
 */

import * as d3 from 'd3';
import {
  IEEE_BANDS,
  NATO_BANDS,
  ITU_BANDS,
  CIVILIAN_BANDS,
  type FrequencyBand
} from '$lib/data/bands';
import { speedOfLight } from '$lib/stores/speedOfLight.svelte';
import { safeDivide } from '$lib/utils/handlers';
import {
  SPECTRUM_MIN_HZ,
  SPECTRUM_MAX_RF_HZ,
  SPECTRUM_MAX_VISIBLE_HZ,
  SPECTRUM_MAX_GAMMA_HZ,
  VISIBLE_LIGHT
} from '$lib/data/spectrum';

// =============================================================================
// Types
// =============================================================================

export type ViewMode = 'rf' | 'visible' | 'full';
export type RowKey = 'em' | 'itu' | 'ieee' | 'nato' | 'civilian';

export interface VisibleRows {
  em: boolean;
  itu: boolean;
  ieee: boolean;
  nato: boolean;
  civilian: boolean;
}

export interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  band: FrequencyBand | null;
}

export interface BandRect extends FrequencyBand {
  x: number;
  width: number;
  visible: boolean;
}

export interface RowConfig {
  key: RowKey;
  label: string;
  bands: BandRect[];
}

// =============================================================================
// Constants
// =============================================================================

export const SPECTRUM_MIN = SPECTRUM_MIN_HZ;
export const SPECTRUM_MAX_GAMMA = SPECTRUM_MAX_GAMMA_HZ;
export const SPECTRUM_MAX_RF = SPECTRUM_MAX_RF_HZ;
export const SPECTRUM_MAX_VISIBLE = SPECTRUM_MAX_VISIBLE_HZ;

export const VISIBLE_MIN_HZ = VISIBLE_LIGHT.minHz;
export const VISIBLE_MAX_HZ = VISIBLE_LIGHT.maxHz;

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 100;

export const ROW_HEIGHT = 48;
export const MARGIN = { top: 60, right: 20, bottom: 60, left: 80 };
export const GAP = 8;

export const ROUNDED_SPEED_OF_LIGHT = 3e8; // 3 × 10⁸ m/s

// =============================================================================
// Extended EM Bands
// =============================================================================

export const EXTENDED_EM_BANDS: FrequencyBand[] = [
  { id: 'em-radio', name: 'Radio', nameDE: 'Radiowellen', minHz: 3, maxHz: 300e9, color: '#3b82f6', category: 'em' },
  { id: 'em-microwave', name: 'Microwave', nameDE: 'Mikrowellen', minHz: 300e6, maxHz: 300e9, color: '#6366f1', category: 'em' },
  { id: 'em-infrared-far', name: 'Far-IR', nameDE: 'Fernes Infrarot', minHz: 300e9, maxHz: 30e12, color: '#991b1b', category: 'em' },
  { id: 'em-infrared-mid', name: 'Mid-IR', nameDE: 'Mittleres Infrarot', minHz: 30e12, maxHz: 120e12, color: '#b91c1c', category: 'em' },
  { id: 'em-infrared-near', name: 'Near-IR', nameDE: 'Nahes Infrarot', minHz: 120e12, maxHz: VISIBLE_MIN_HZ, color: '#dc2626', category: 'em' },
  { id: 'em-visible', name: 'Visible', nameDE: 'Sichtbares Licht', minHz: VISIBLE_MIN_HZ, maxHz: VISIBLE_MAX_HZ, color: 'visible', category: 'em' },
  { id: 'em-uv-near', name: 'UV-A', nameDE: 'UV-A', minHz: VISIBLE_MAX_HZ, maxHz: 952e12, color: '#7c3aed', category: 'em' },
  { id: 'em-uv-mid', name: 'UV-B', nameDE: 'UV-B', minHz: 952e12, maxHz: 1.07e15, color: '#6d28d9', category: 'em' },
  { id: 'em-uv-far', name: 'UV-C', nameDE: 'UV-C', minHz: 1.07e15, maxHz: 3e15, color: '#5b21b6', category: 'em' },
  { id: 'em-euv', name: 'EUV', nameDE: 'Extremes UV', minHz: 3e15, maxHz: 30e15, color: '#4c1d95', category: 'em' },
  { id: 'em-xray-soft', name: 'Soft X-Ray', nameDE: 'Weiche Roentgenstrahlung', minHz: 30e15, maxHz: 3e17, color: '#0891b2', category: 'em' },
  { id: 'em-xray-hard', name: 'Hard X-Ray', nameDE: 'Harte Roentgenstrahlung', minHz: 3e17, maxHz: 30e18, color: '#0e7490', category: 'em' },
  { id: 'em-gamma', name: 'Gamma', nameDE: 'Gammastrahlung', minHz: 30e18, maxHz: 3e22, color: '#ec4899', category: 'em' },
];

// =============================================================================
// Wavelength tick definitions (static)
// =============================================================================

const WAVELENGTH_TICK_DEFS = [
  { wavelength: 100e6, label: '100 Mm' },
  { wavelength: 10e6, label: '10 Mm' },
  { wavelength: 1e6, label: '1 Mm' },
  { wavelength: 100e3, label: '100 km' },
  { wavelength: 10e3, label: '10 km' },
  { wavelength: 1e3, label: '1 km' },
  { wavelength: 100, label: '100 m' },
  { wavelength: 10, label: '10 m' },
  { wavelength: 1, label: '1 m' },
  { wavelength: 0.1, label: '10 cm' },
  { wavelength: 0.01, label: '1 cm' },
  { wavelength: 0.001, label: '1 mm' },
  { wavelength: 0.0001, label: '100 um' },
  { wavelength: 0.00001, label: '10 um' },
  { wavelength: 0.000001, label: '1 um' },
  { wavelength: 1e-7, label: '100 nm' },
  { wavelength: 1e-8, label: '10 nm' },
  { wavelength: 1e-9, label: '1 nm' },
  { wavelength: 1e-10, label: '100 pm' },
  { wavelength: 1e-11, label: '10 pm' },
  { wavelength: 1e-12, label: '1 pm' },
  { wavelength: 1e-13, label: '100 fm' },
  { wavelength: 1e-14, label: '10 fm' },
];

// =============================================================================
// Formatting helpers (local to spectrum, not the global formatters)
// =============================================================================

export function formatFrequencyLocal(hz: number): string {
  if (hz >= 1e18) return `${(hz / 1e18).toFixed(1)} EHz`;
  if (hz >= 1e15) return `${(hz / 1e15).toFixed(1)} PHz`;
  if (hz >= 1e12) return `${(hz / 1e12).toFixed(1)} THz`;
  if (hz >= 1e9) return `${(hz / 1e9).toFixed(1)} GHz`;
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(1)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(1)} kHz`;
  return `${hz.toFixed(0)} Hz`;
}

export function formatWavelengthLocal(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(0)} km`;
  if (meters >= 1) return `${meters.toFixed(meters >= 10 ? 0 : 1)} m`;
  if (meters >= 0.01) return `${(meters * 100).toFixed(meters >= 0.1 ? 0 : 1)} cm`;
  if (meters >= 0.001) return `${(meters * 1000).toFixed(meters >= 0.01 ? 0 : 1)} mm`;
  if (meters >= 1e-6) return `${(meters * 1e6).toFixed(meters >= 1e-5 ? 0 : 1)} um`;
  if (meters >= 1e-9) return `${(meters * 1e9).toFixed(meters >= 1e-8 ? 0 : 1)} nm`;
  if (meters >= 1e-12) return `${(meters * 1e12).toFixed(meters >= 1e-11 ? 0 : 1)} pm`;
  return `${(meters * 1e15).toFixed(0)} fm`;
}

export function formatZoom(level: number): string {
  if (level >= 10) return `${Math.round(level)}x`;
  return `${level.toFixed(1)}x`;
}

// =============================================================================
// Visible light color calculation
// =============================================================================

export function getVisibleLightColor(frequencyHz: number, c: number): string {
  // Guard: frequencyHz must be positive
  if (frequencyHz <= 0) return 'rgb(0, 0, 0)';

  const wavelengthNm = safeDivide(c, frequencyHz, 0) * 1e9;

  let r = 0, g = 0, b = 0;

  if (wavelengthNm >= 380 && wavelengthNm < 440) {
    r = -(wavelengthNm - 440) / (440 - 380);
    g = 0;
    b = 1;
  } else if (wavelengthNm >= 440 && wavelengthNm < 490) {
    r = 0;
    g = (wavelengthNm - 440) / (490 - 440);
    b = 1;
  } else if (wavelengthNm >= 490 && wavelengthNm < 510) {
    r = 0;
    g = 1;
    b = -(wavelengthNm - 510) / (510 - 490);
  } else if (wavelengthNm >= 510 && wavelengthNm < 580) {
    r = (wavelengthNm - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (wavelengthNm >= 580 && wavelengthNm < 645) {
    r = 1;
    g = -(wavelengthNm - 645) / (645 - 580);
    b = 0;
  } else if (wavelengthNm >= 645 && wavelengthNm <= 780) {
    r = 1;
    g = 0;
    b = 0;
  }

  let factor = 1.0;
  if (wavelengthNm >= 380 && wavelengthNm < 420) {
    factor = 0.3 + 0.7 * (wavelengthNm - 380) / (420 - 380);
  } else if (wavelengthNm >= 645 && wavelengthNm <= 780) {
    factor = 0.3 + 0.7 * (780 - wavelengthNm) / (780 - 645);
  }

  r = Math.round(255 * Math.pow(r * factor, 0.8));
  g = Math.round(255 * Math.pow(g * factor, 0.8));
  b = Math.round(255 * Math.pow(b * factor, 0.8));

  return `rgb(${r}, ${g}, ${b})`;
}

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
      case 'rf': return SPECTRUM_MAX_RF;
      case 'visible': return SPECTRUM_MAX_VISIBLE;
      case 'full': return SPECTRUM_MAX_GAMMA;
    }
  });

  // Zoom state
  let zoomLevel = $state(1);
  let panOffset = $state(0);

  // Row visibility state
  let visibleRows = $state<VisibleRows>({
    em: true,
    itu: true,
    ieee: true,
    nato: true,
    civilian: false
  });

  // Container state
  let containerWidth = $state(800);

  // Tooltip state
  let tooltip = $state<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    band: null
  });

  // Derived calculations
  let innerWidth = $derived(Math.max(containerWidth - MARGIN.left - MARGIN.right, 100));

  let visibleRowCount = $derived(
    Object.values(visibleRows).filter(Boolean).length
  );

  // Calculate zoomed domain
  let zoomedDomain = $derived.by(() => {
    const logMin = Math.log10(SPECTRUM_MIN);
    const logMax = Math.log10(spectrumMax);
    const logRange = logMax - logMin;

    const visibleLogRange = logRange / zoomLevel;
    const maxPan = logRange - visibleLogRange;
    const clampedPan = Math.max(0, Math.min(panOffset, maxPan));

    const newLogMin = logMin + clampedPan;
    const newLogMax = newLogMin + visibleLogRange;

    return [Math.pow(10, newLogMin), Math.pow(10, newLogMax)] as [number, number];
  });

  // Shared D3 logarithmic scale
  let xScale = $derived(
    d3.scaleLog()
      .domain(zoomedDomain)
      .range([0, innerWidth])
  );

  // Cursor state
  let cursorFrequencyHz = $state<number | null>(null);

  let cursorX = $derived(
    cursorFrequencyHz !== null ? xScale(cursorFrequencyHz) : null
  );

  let cursorWavelengthLabel = $derived(
    cursorFrequencyHz !== null && cursorFrequencyHz > 0
      ? formatWavelengthLocal(ROUNDED_SPEED_OF_LIGHT / cursorFrequencyHz)
      : ''
  );

  let cursorFrequencyLabel = $derived(
    cursorFrequencyHz !== null && cursorFrequencyHz > 0
      ? formatFrequencyLocal(cursorFrequencyHz)
      : ''
  );

  // Helper: calculate band rectangle
  function calcBandRect(band: { minHz: number; maxHz: number }) {
    const [domainMin, domainMax] = zoomedDomain;
    const clampedMin = Math.max(band.minHz, domainMin);
    const clampedMax = Math.min(band.maxHz, domainMax);
    if (clampedMin >= domainMax || clampedMax <= domainMin) {
      return { x: 0, width: 0, visible: false };
    }
    const x = xScale(clampedMin);
    const width = xScale(clampedMax) - x;
    return { x, width, visible: width > 0 };
  }

  // Band rectangles for each row
  let emBandRects = $derived(
    EXTENDED_EM_BANDS.map(band => ({ ...band, ...calcBandRect(band) })).filter(b => b.visible)
  );

  let ituBandRects = $derived(
    ITU_BANDS.map(band => ({ ...band, ...calcBandRect(band) })).filter(b => b.visible)
  );

  let ieeeBandRects = $derived(
    IEEE_BANDS.map(band => ({ ...band, ...calcBandRect(band) })).filter(b => b.visible)
  );

  let natoBandRects = $derived(
    NATO_BANDS.map(band => ({ ...band, ...calcBandRect(band) })).filter(b => b.visible)
  );

  let civilianBandRects = $derived(
    CIVILIAN_BANDS.map(band => ({ ...band, ...calcBandRect(band) })).filter(b => b.visible)
  );

  // Visible light gradient stops
  let visibleLightGradientStops = $derived.by(() => {
    const [domainMin, domainMax] = zoomedDomain;
    const visMin = Math.max(VISIBLE_MIN_HZ, domainMin);
    const visMax = Math.min(VISIBLE_MAX_HZ, domainMax);

    if (visMin >= visMax) return [];

    const stops: { offset: string; color: string }[] = [];
    const numStops = 20;

    for (let i = 0; i <= numStops; i++) {
      const t = i / numStops;
      const logMin = Math.log10(visMin);
      const logMax = Math.log10(visMax);
      const freq = Math.pow(10, logMin + t * (logMax - logMin));
      const color = getVisibleLightColor(freq, currentSpeedOfLight);
      stops.push({ offset: `${t * 100}%`, color });
    }

    return stops;
  });

  // Frequency axis ticks
  let frequencyTicks = $derived.by(() => {
    const [domainMin, domainMax] = zoomedDomain;
    const logMin = Math.floor(Math.log10(domainMin));
    const logMax = Math.ceil(Math.log10(domainMax));
    const ticks: number[] = [];

    for (let exp = logMin; exp <= logMax; exp++) {
      const value = Math.pow(10, exp);
      if (value >= domainMin && value <= domainMax) {
        ticks.push(value);
      }
      if (zoomLevel > 3) {
        const midValue = value * 3;
        if (midValue >= domainMin && midValue <= domainMax) {
          ticks.push(midValue);
        }
      }
    }

    return ticks.sort((a, b) => a - b);
  });

  // Wavelength axis ticks
  let wavelengthTicks = $derived.by(() => {
    const [domainMin, domainMax] = zoomedDomain;
    return WAVELENGTH_TICK_DEFS
      .map(t => ({ freq: currentSpeedOfLight / t.wavelength, label: t.label }))
      .filter(t => t.freq >= domainMin && t.freq <= domainMax);
  });

  // Row configuration
  let rowConfig: RowConfig[] = $derived([
    { key: 'em' as RowKey, label: 'EM', bands: emBandRects },
    { key: 'itu' as RowKey, label: 'ITU', bands: ituBandRects },
    { key: 'ieee' as RowKey, label: 'IEEE', bands: ieeeBandRects },
    { key: 'nato' as RowKey, label: 'NATO', bands: natoBandRects },
    { key: 'civilian' as RowKey, label: 'Zivil', bands: civilianBandRects }
  ]);

  // Total SVG height
  let totalHeight = $derived(
    MARGIN.top + (visibleRowCount * ROW_HEIGHT) + ((visibleRowCount - 1) * GAP) + MARGIN.bottom
  );

  // Total band rows height for marker line
  let bandRowsHeight = $derived(
    (visibleRowCount * ROW_HEIGHT) + ((visibleRowCount - 1) * GAP)
  );

  // Row Y position calculation
  function getRowY(rowIndex: number): number {
    let y = MARGIN.top;
    const rowOrder: RowKey[] = ['em', 'itu', 'ieee', 'nato', 'civilian'];
    for (let i = 0; i < rowIndex; i++) {
      if (visibleRows[rowOrder[i]]) {
        y += ROW_HEIGHT + GAP;
      }
    }
    return y;
  }

  // Toggle row visibility
  function toggleRow(row: RowKey) {
    visibleRows[row] = !visibleRows[row];
  }

  // Zoom control functions
  function zoomIn() {
    if (zoomLevel < MAX_ZOOM) {
      const newZoom = Math.min(zoomLevel * 1.5, MAX_ZOOM);
      const logMin = Math.log10(SPECTRUM_MIN);
      const logMax = Math.log10(spectrumMax);
      const logRange = logMax - logMin;
      const oldVisibleRange = logRange / zoomLevel;
      const newVisibleRange = logRange / newZoom;
      const centerOffset = panOffset + oldVisibleRange / 2;
      panOffset = Math.max(0, centerOffset - newVisibleRange / 2);
      zoomLevel = newZoom;
    }
  }

  function zoomOut() {
    if (zoomLevel > MIN_ZOOM) {
      const newZoom = Math.max(zoomLevel / 1.5, MIN_ZOOM);
      const logMin = Math.log10(SPECTRUM_MIN);
      const logMax = Math.log10(spectrumMax);
      const logRange = logMax - logMin;
      const oldVisibleRange = logRange / zoomLevel;
      const newVisibleRange = logRange / newZoom;
      const centerOffset = panOffset + oldVisibleRange / 2;
      panOffset = Math.max(0, centerOffset - newVisibleRange / 2);
      zoomLevel = newZoom;
    }
  }

  function resetZoom() {
    zoomLevel = 1;
    panOffset = 0;
  }

  function panLeft() {
    const logMin = Math.log10(SPECTRUM_MIN);
    const logMax = Math.log10(spectrumMax);
    const logRange = logMax - logMin;
    const visibleLogRange = logRange / zoomLevel;
    const panStep = visibleLogRange * 0.25;
    panOffset = Math.max(0, panOffset - panStep);
  }

  function panRight() {
    const logMin = Math.log10(SPECTRUM_MIN);
    const logMax = Math.log10(spectrumMax);
    const logRange = logMax - logMin;
    const visibleLogRange = logRange / zoomLevel;
    const maxPan = logRange - visibleLogRange;
    const panStep = visibleLogRange * 0.25;
    panOffset = Math.min(maxPan, panOffset + panStep);
  }

  // Center view on a given frequency
  function centerOnFrequency(frequencyHz: number) {
    if (!frequencyHz || frequencyHz < SPECTRUM_MIN || frequencyHz > spectrumMax) return;

    const logMin = Math.log10(SPECTRUM_MIN);
    const logMax = Math.log10(spectrumMax);
    const logRange = logMax - logMin;
    const visibleLogRange = logRange / zoomLevel;
    const markerLogPos = Math.log10(frequencyHz);

    panOffset = Math.max(0, Math.min(logRange - visibleLogRange, markerLogPos - logMin - visibleLogRange / 2));
  }

  // Jump to visible light spectrum
  function jumpToVisibleLight() {
    viewMode = 'visible';
    const logMin = Math.log10(SPECTRUM_MIN);
    const logMax = Math.log10(SPECTRUM_MAX_VISIBLE);
    const logRange = logMax - logMin;

    zoomLevel = 3;
    const visibleLogRange = logRange / zoomLevel;
    const visibleCenterLog = Math.log10(Math.sqrt(VISIBLE_MIN_HZ * VISIBLE_MAX_HZ));

    panOffset = Math.max(0, Math.min(logRange - visibleLogRange, visibleCenterLog - logMin - visibleLogRange / 2));
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

  // Cursor handlers
  function handleCursorMove(svgLocalX: number) {
    if (svgLocalX < 0 || svgLocalX > innerWidth) {
      cursorFrequencyHz = null;
      return;
    }
    try {
      cursorFrequencyHz = xScale.invert(svgLocalX);
    } catch {
      cursorFrequencyHz = null;
    }
  }

  function handleCursorLeave() {
    cursorFrequencyHz = null;
  }

  // Safe wavelength formatting for display
  function safeFormatWavelength(frequencyHz: number): string {
    if (frequencyHz <= 0) return '---';
    return formatWavelengthLocal(safeDivide(currentSpeedOfLight, frequencyHz, 0));
  }

  return {
    get currentSpeedOfLight() { return currentSpeedOfLight; },
    get viewMode() { return viewMode; },
    get spectrumMax() { return spectrumMax; },
    get zoomLevel() { return zoomLevel; },
    get panOffset() { return panOffset; },
    get visibleRows() { return visibleRows; },
    get containerWidth() { return containerWidth; },
    set containerWidth(w: number) { containerWidth = w; },
    get tooltip() { return tooltip; },
    get innerWidth() { return innerWidth; },
    get visibleRowCount() { return visibleRowCount; },
    get zoomedDomain() { return zoomedDomain; },
    get xScale() { return xScale; },
    get visibleLightGradientStops() { return visibleLightGradientStops; },
    get frequencyTicks() { return frequencyTicks; },
    get wavelengthTicks() { return wavelengthTicks; },
    get rowConfig() { return rowConfig; },
    get totalHeight() { return totalHeight; },
    get bandRowsHeight() { return bandRowsHeight; },
    get cursorFrequencyHz() { return cursorFrequencyHz; },
    get cursorX() { return cursorX; },
    get cursorWavelengthLabel() { return cursorWavelengthLabel; },
    get cursorFrequencyLabel() { return cursorFrequencyLabel; },

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
    handleCursorMove,
    handleCursorLeave,
  };
}
