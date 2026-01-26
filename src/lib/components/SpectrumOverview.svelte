<script lang="ts">
  import * as d3 from 'd3';
  import {
    IEEE_BANDS,
    NATO_BANDS,
    ITU_BANDS,
    CIVILIAN_BANDS,
    formatFrequencyRange,
    type FrequencyBand
  } from '$lib/data/bands';
  import { speedOfLight } from '$lib/stores/speedOfLight.svelte';
  import InfoTooltip from '$lib/components/ui/InfoTooltip.svelte';
  import { spectrumExplanations } from '$lib/data/explanations';

  interface Props {
    frequencyHz?: number;
    showLabels?: boolean;
  }

  let { frequencyHz, showLabels = true }: Props = $props();

  // Constants - Full EM Spectrum from ELF to Gamma rays
  const SPECTRUM_MIN = 3;           // 3 Hz (ELF)
  const SPECTRUM_MAX_GAMMA = 3e19;  // 30 EHz (Gamma rays)
  const SPECTRUM_MAX_RF = 3e12;     // 3 THz (RF/Microwave/Far-IR)
  const SPECTRUM_MAX_VISIBLE = 1e15; // 1 PHz (includes visible light)

  // Visible light frequency range (380-780nm wavelength)
  // c = 299792458 m/s
  // f = c / lambda
  // 780nm -> ~384 THz (red)
  // 380nm -> ~789 THz (violet)
  const VISIBLE_MIN_HZ = 384e12;  // ~780nm red
  const VISIBLE_MAX_HZ = 789e12;  // ~380nm violet

  // Speed of light - reactive to store
  let currentSpeedOfLight = $derived(speedOfLight.value);

  // View mode presets
  type ViewMode = 'rf' | 'visible' | 'full';
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
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 100;

  // Layout constants
  const rowHeight = 48;
  const margin = { top: 60, right: 20, bottom: 60, left: 80 };
  const gap = 8;

  // Row visibility state
  let visibleRows = $state({
    em: true,
    itu: true,
    ieee: true,
    nato: true,
    civilian: false
  });

  type RowKey = keyof typeof visibleRows;

  // Toggle row visibility
  function toggleRow(row: RowKey) {
    visibleRows[row] = !visibleRows[row];
  }

  // Container state
  let containerWidth = $state(800);
  let containerElement: HTMLDivElement | undefined = $state(undefined);

  // Tooltip state
  let tooltip = $state<{
    visible: boolean;
    x: number;
    y: number;
    band: FrequencyBand | null;
  }>({ visible: false, x: 0, y: 0, band: null });

  // Derived calculations
  let innerWidth = $derived(Math.max(containerWidth - margin.left - margin.right, 100));

  let visibleRowCount = $derived(
    Object.values(visibleRows).filter(Boolean).length
  );

  // Calculate zoomed domain
  let zoomedDomain = $derived.by(() => {
    const logMin = Math.log10(SPECTRUM_MIN);
    const logMax = Math.log10(spectrumMax);
    const logRange = logMax - logMin;

    // Calculate visible range based on zoom level
    const visibleLogRange = logRange / zoomLevel;

    // Calculate pan limits
    const maxPan = logRange - visibleLogRange;
    const clampedPan = Math.max(0, Math.min(panOffset, maxPan));

    const newLogMin = logMin + clampedPan;
    const newLogMax = newLogMin + visibleLogRange;

    return [Math.pow(10, newLogMin), Math.pow(10, newLogMax)] as [number, number];
  });

  // ONE shared D3 logarithmic scale with zoom support
  let xScale = $derived(
    d3.scaleLog()
      .domain(zoomedDomain)
      .range([0, innerWidth])
  );

  // Extended EM Bands with optical and higher frequencies
  const EXTENDED_EM_BANDS: FrequencyBand[] = [
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
    { id: 'em-xray-soft', name: 'Soft X-Ray', nameDE: 'Weiche Röntgenstrahlung', minHz: 30e15, maxHz: 3e17, color: '#0891b2', category: 'em' },
    { id: 'em-xray-hard', name: 'Hard X-Ray', nameDE: 'Harte Röntgenstrahlung', minHz: 3e17, maxHz: 30e18, color: '#0e7490', category: 'em' },
    { id: 'em-gamma', name: 'Gamma', nameDE: 'Gammastrahlung', minHz: 30e18, maxHz: 3e22, color: '#ec4899', category: 'em' },
  ];

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

  // Mouse wheel zoom is DISABLED to avoid conflicts with page scrolling
  // Navigation is only possible via the zoom/pan buttons above
  // function handleWheel(event: WheelEvent) {
  //   event.preventDefault();
  //   if (event.deltaY < 0) {
  //     zoomIn();
  //   } else {
  //     zoomOut();
  //   }
  // }

  // Helper function to calculate band rectangle
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

  // Function to get visible light color at a given frequency
  function getVisibleLightColor(frequencyHz: number): string {
    // Map frequency to wavelength in nm
    const wavelengthNm = (currentSpeedOfLight / frequencyHz) * 1e9;

    // Approximate wavelength to RGB
    // Based on: https://www.physics.sfasu.edu/astro/color/spectra.html
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

    // Intensity adjustment for edges
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

  // Calculate visible light gradient stops based on current view
  let visibleLightGradientStops = $derived.by(() => {
    const [domainMin, domainMax] = zoomedDomain;
    const visMin = Math.max(VISIBLE_MIN_HZ, domainMin);
    const visMax = Math.min(VISIBLE_MAX_HZ, domainMax);

    if (visMin >= visMax) return [];

    const stops: { offset: string; color: string }[] = [];
    const numStops = 20;

    for (let i = 0; i <= numStops; i++) {
      const t = i / numStops;
      // Logarithmic interpolation
      const logMin = Math.log10(visMin);
      const logMax = Math.log10(visMax);
      const freq = Math.pow(10, logMin + t * (logMax - logMin));
      const color = getVisibleLightColor(freq);
      stops.push({ offset: `${t * 100}%`, color });
    }

    return stops;
  });

  // Calculate band rectangles for each row
  let emBandRects = $derived(
    EXTENDED_EM_BANDS.map(band => {
      const rect = calcBandRect(band);
      return { ...band, ...rect };
    }).filter(b => b.visible)
  );

  let ituBandRects = $derived(
    ITU_BANDS.map(band => {
      const rect = calcBandRect(band);
      return { ...band, ...rect };
    }).filter(b => b.visible)
  );

  let ieeeBandRects = $derived(
    IEEE_BANDS.map(band => {
      const rect = calcBandRect(band);
      return { ...band, ...rect };
    }).filter(b => b.visible)
  );

  let natoBandRects = $derived(
    NATO_BANDS.map(band => {
      const rect = calcBandRect(band);
      return { ...band, ...rect };
    }).filter(b => b.visible)
  );

  let civilianBandRects = $derived(
    CIVILIAN_BANDS.map(band => {
      const rect = calcBandRect(band);
      return { ...band, ...rect };
    }).filter(b => b.visible)
  );

  // Single marker position for all rows (check if in visible range)
  let markerX = $derived.by(() => {
    if (!frequencyHz || frequencyHz < SPECTRUM_MIN || frequencyHz > spectrumMax) {
      return null;
    }
    const [domainMin, domainMax] = zoomedDomain;
    if (frequencyHz < domainMin || frequencyHz > domainMax) {
      return null;
    }
    return xScale(frequencyHz);
  });

  // Format frequency for display
  function formatFrequency(hz: number): string {
    if (hz >= 1e18) return `${(hz / 1e18).toFixed(1)} EHz`;
    if (hz >= 1e15) return `${(hz / 1e15).toFixed(1)} PHz`;
    if (hz >= 1e12) return `${(hz / 1e12).toFixed(1)} THz`;
    if (hz >= 1e9) return `${(hz / 1e9).toFixed(1)} GHz`;
    if (hz >= 1e6) return `${(hz / 1e6).toFixed(1)} MHz`;
    if (hz >= 1e3) return `${(hz / 1e3).toFixed(1)} kHz`;
    return `${hz.toFixed(0)} Hz`;
  }

  // Format wavelength for display
  function formatWavelength(meters: number): string {
    if (meters >= 1000) return `${(meters / 1000).toFixed(0)} km`;
    if (meters >= 1) return `${meters.toFixed(meters >= 10 ? 0 : 1)} m`;
    if (meters >= 0.01) return `${(meters * 100).toFixed(meters >= 0.1 ? 0 : 1)} cm`;
    if (meters >= 0.001) return `${(meters * 1000).toFixed(meters >= 0.01 ? 0 : 1)} mm`;
    if (meters >= 1e-6) return `${(meters * 1e6).toFixed(meters >= 1e-5 ? 0 : 1)} um`;
    if (meters >= 1e-9) return `${(meters * 1e9).toFixed(meters >= 1e-8 ? 0 : 1)} nm`;
    if (meters >= 1e-12) return `${(meters * 1e12).toFixed(meters >= 1e-11 ? 0 : 1)} pm`;
    return `${(meters * 1e15).toFixed(0)} fm`;
  }

  // Frequency axis ticks - dynamically computed based on zoom domain
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
      // Add intermediate ticks for better resolution when zoomed
      if (zoomLevel > 3) {
        const midValue = value * 3;
        if (midValue >= domainMin && midValue <= domainMax) {
          ticks.push(midValue);
        }
      }
    }

    return ticks.sort((a, b) => a - b);
  });

  // Wavelength axis ticks - reactive to zoom domain
  let wavelengthTicks = $derived.by(() => {
    const [domainMin, domainMax] = zoomedDomain;
    const allTicks = [
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

    return allTicks
      .map(t => ({ freq: currentSpeedOfLight / t.wavelength, label: t.label }))
      .filter(t => t.freq >= domainMin && t.freq <= domainMax);
  });

  // Tooltip handlers
  function showTooltip(event: MouseEvent, band: FrequencyBand) {
    const rect = containerElement?.getBoundingClientRect();
    if (!rect) return;
    tooltip = {
      visible: true,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      band
    };
  }

  function hideTooltip() {
    tooltip = { ...tooltip, visible: false, band: null };
  }

  // ResizeObserver for responsive width
  $effect(() => {
    if (!containerElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidth = entry.contentRect.width;
      }
    });

    resizeObserver.observe(containerElement);

    return () => {
      resizeObserver.disconnect();
    };
  });

  // Calculate row Y positions based on visibility
  function getRowY(rowIndex: number): number {
    let y = margin.top;
    const rowOrder: RowKey[] = ['em', 'itu', 'ieee', 'nato', 'civilian'];
    for (let i = 0; i < rowIndex; i++) {
      if (visibleRows[rowOrder[i]]) {
        y += rowHeight + gap;
      }
    }
    return y;
  }

  // Total SVG height
  let totalHeight = $derived(
    margin.top + (visibleRowCount * rowHeight) + ((visibleRowCount - 1) * gap) + margin.bottom
  );

  // Calculate total band row height for marker line
  let bandRowsHeight = $derived(
    (visibleRowCount * rowHeight) + ((visibleRowCount - 1) * gap)
  );

  // Row configuration
  const rowConfig: { key: RowKey; label: string; bands: typeof emBandRects }[] = $derived([
    { key: 'em', label: 'EM', bands: emBandRects },
    { key: 'itu', label: 'ITU', bands: ituBandRects },
    { key: 'ieee', label: 'IEEE', bands: ieeeBandRects },
    { key: 'nato', label: 'NATO', bands: natoBandRects },
    { key: 'civilian', label: 'Zivil', bands: civilianBandRects }
  ]);

  // Format zoom level for display
  function formatZoom(level: number): string {
    if (level >= 10) return `${Math.round(level)}x`;
    return `${level.toFixed(1)}x`;
  }

  // Center view on marker frequency
  function centerOnMarker() {
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

    // Set zoom to show visible light region nicely
    zoomLevel = 3;
    const visibleLogRange = logRange / zoomLevel;
    const visibleCenterLog = Math.log10(Math.sqrt(VISIBLE_MIN_HZ * VISIBLE_MAX_HZ));

    panOffset = Math.max(0, Math.min(logRange - visibleLogRange, visibleCenterLog - logMin - visibleLogRange / 2));
  }

</script>

<div
  bind:this={containerElement}
  class="w-full rounded-lg p-4 relative"
  style="background-color: var(--color-chart-bg)"
  role="img"
  aria-label="Elektromagnetisches Spektrum - von ELF bis Gammastrahlung"
>
  <!-- Control bar: Band row selector, view mode, zoom controls, and frequency display -->
  <div class="flex flex-wrap gap-4 mb-4 items-center">
    <!-- Band row selector -->
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-slate-400 text-sm mr-1">
        Bänder:
        <InfoTooltip
          title={spectrumExplanations.emSpectrum.title}
          short={spectrumExplanations.emSpectrum.short}
          detailed={spectrumExplanations.emSpectrum.detailed}
        />
      </span>
      <button
        class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.em ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
        onclick={() => toggleRow('em')}
        aria-pressed={visibleRows.em}
      >
        EM-Spektrum
      </button>
      <button
        class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.itu ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
        onclick={() => toggleRow('itu')}
        aria-pressed={visibleRows.itu}
      >
        ITU
      </button>
      <button
        class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.ieee ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
        onclick={() => toggleRow('ieee')}
        aria-pressed={visibleRows.ieee}
      >
        IEEE
      </button>
      <button
        class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.nato ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
        onclick={() => toggleRow('nato')}
        aria-pressed={visibleRows.nato}
      >
        NATO
      </button>
      <button
        class="px-3 py-1.5 text-sm rounded transition-colors {visibleRows.civilian ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
        onclick={() => toggleRow('civilian')}
        aria-pressed={visibleRows.civilian}
      >
        Zivil
      </button>
    </div>

    <!-- View mode toggle -->
    <div class="flex items-center gap-2">
      <span class="text-slate-400 text-sm">Ansicht:</span>
      <button
        class="px-3 py-1.5 text-sm rounded transition-colors {viewMode === 'rf' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
        onclick={() => { viewMode = 'rf'; resetZoom(); }}
      >
        RF (3 Hz - 3 THz)
      </button>
      <button
        class="px-3 py-1.5 text-sm rounded transition-colors {viewMode === 'visible' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
        onclick={() => { viewMode = 'visible'; resetZoom(); }}
      >
        RF + Licht (bis 1 PHz)
      </button>
      <button
        class="px-3 py-1.5 text-sm rounded transition-colors {viewMode === 'full' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
        onclick={() => { viewMode = 'full'; resetZoom(); }}
      >
        Gesamt (bis Gamma)
      </button>
    </div>

    <!-- Zoom and pan controls -->
    <div class="flex items-center gap-2">
      <button
        class="px-2 py-1 text-sm bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-violet-500 text-white rounded hover:opacity-80"
        onclick={jumpToVisibleLight}
        aria-label="Sichtbares Licht anzeigen"
        title="Sichtbares Licht anzeigen"
      >
        Sichtbar
      </button>
      <span class="text-slate-400 text-sm ml-2">Zoom:</span>
      <button
        class="w-8 h-8 flex items-center justify-center bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={panLeft}
        disabled={zoomLevel <= MIN_ZOOM}
        aria-label="Nach links verschieben"
        title="Nach links verschieben"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        class="w-8 h-8 flex items-center justify-center bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={zoomOut}
        disabled={zoomLevel <= MIN_ZOOM}
        aria-label="Herauszoomen"
        title="Herauszoomen"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>
      <span class="text-slate-300 text-sm font-mono min-w-[3.5rem] text-center">{formatZoom(zoomLevel)}</span>
      <button
        class="w-8 h-8 flex items-center justify-center bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={zoomIn}
        disabled={zoomLevel >= MAX_ZOOM}
        aria-label="Hineinzoomen"
        title="Hineinzoomen"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      <button
        class="w-8 h-8 flex items-center justify-center bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={panRight}
        disabled={zoomLevel <= MIN_ZOOM}
        aria-label="Nach rechts verschieben"
        title="Nach rechts verschieben"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <button
        class="px-2 py-1 text-sm bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
        onclick={resetZoom}
        aria-label="Zoom zurücksetzen"
        title="Zoom zurücksetzen"
      >
        Reset
      </button>
      {#if frequencyHz}
        <button
          class="px-2 py-1 text-sm bg-amber-700 text-amber-100 rounded hover:bg-amber-600"
          onclick={centerOnMarker}
          aria-label="Auf Marker zentrieren"
          title="Auf Marker zentrieren"
        >
          Zentrieren
        </button>
      {/if}
    </div>

    <!-- Frequency marker display (integrated into control bar) -->
    {#if frequencyHz}
      <div class="ml-auto flex items-center bg-amber-500/20 border border-amber-500/50 rounded px-3 py-1.5">
        <span class="text-amber-400 text-sm font-mono">{formatFrequency(frequencyHz)}</span>
        <span class="text-amber-400/70 text-xs ml-2">
          (lambda = {formatWavelength(currentSpeedOfLight / frequencyHz)})
        </span>
      </div>
    {/if}
  </div>

  <svg
    width="100%"
    height={totalHeight}
    class="cursor-crosshair"
  >
    <defs>
      <!-- Dynamic visible light gradient based on current view -->
      <linearGradient id="visibleLightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        {#each visibleLightGradientStops as stop (stop.offset)}
          <stop offset={stop.offset} stop-color={stop.color} />
        {/each}
      </linearGradient>

    </defs>

    <g transform="translate({margin.left}, 0)">
      <!-- TOP AXIS: Wavelength -->
      <g transform="translate(0, {margin.top - 10})">
        <line
          x1="0"
          y1="0"
          x2={innerWidth}
          y2="0"
          style="stroke: var(--color-chart-axis)"
          stroke-width="1"
        />
        <text
          x="-10"
          y="5"
          text-anchor="end"
          style="fill: var(--color-text-tertiary)" class="text-xs"
        >
          wavelength
        </text>
        {#each wavelengthTicks as tick (tick.label)}
          {@const tickX = xScale(tick.freq)}
          {#if tickX >= 0 && tickX <= innerWidth}
            <g transform="translate({tickX}, 0)">
              <line
                y1="-6"
                y2="0"
                style="stroke: var(--color-chart-axis)"
                stroke-width="1"
              />
              <text
                y="-12"
                text-anchor="middle"
                style="fill: var(--color-text-tertiary); font-size: 10px;"
              >
                {tick.label}
              </text>
            </g>
          {/if}
        {/each}
      </g>

      <!-- Band rows -->
      {#each rowConfig as row, rowIndex (row.key)}
        {#if visibleRows[row.key]}
          {@const rowY = getRowY(rowIndex)}
          <g transform="translate(0, {rowY})">
            <!-- Row label -->
            <text
              x="-10"
              y={rowHeight / 2}
              text-anchor="end"
              dominant-baseline="middle"
              style="fill: var(--color-text-tertiary)" class="text-sm font-medium"
            >
              {row.label}
            </text>

            <!-- Background rectangle -->
            <rect
              x="0"
              y="0"
              width={innerWidth}
              height={rowHeight}
              style="fill: var(--color-bg-surface); stroke: var(--color-chart-grid)"
              stroke-width="1"
            />

            <!-- Band rectangles -->
            {#each row.bands as band (band.id)}
              <g
                role="graphics-symbol"
                aria-label="{band.name}: {formatFrequencyRange(band.minHz, band.maxHz)}"
                onmouseenter={(e) => showTooltip(e, band)}
                onmouseleave={hideTooltip}
                onmousemove={(e) => showTooltip(e, band)}
                class="cursor-pointer"
              >
                <rect
                  x={band.x}
                  y="2"
                  width={Math.max(band.width, 2)}
                  height={rowHeight - 4}
                  fill={band.color === 'visible' ? 'url(#visibleLightGradient)' : band.color}
                  opacity="0.9"
                  stroke="#0f172a"
                  stroke-width="0.5"
                  class="transition-opacity hover:opacity-70"
                />
                {#if showLabels && band.width > 25}
                  <text
                    x={band.x + band.width / 2}
                    y={rowHeight / 2}
                    text-anchor="middle"
                    dominant-baseline="middle"
                    class="fill-white text-xs font-medium pointer-events-none"
                    style="text-shadow: 0 1px 2px rgba(0,0,0,0.9); font-size: 11px;"
                  >
                    {band.name}
                  </text>
                {/if}
              </g>
            {/each}
          </g>
        {/if}
      {/each}

      <!-- Single marker line spanning all visible rows -->
      {#if markerX !== null && visibleRowCount > 0}
        <line
          x1={markerX}
          y1={margin.top - 5}
          x2={markerX}
          y2={margin.top + bandRowsHeight + 5}
          stroke="#fbbf24"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <!-- Marker label at top -->
        <circle
          cx={markerX}
          cy={margin.top - 5}
          r="5"
          fill="#fbbf24"
          stroke="#0f172a"
          stroke-width="1.5"
        />
        <!-- Marker label at bottom -->
        <circle
          cx={markerX}
          cy={margin.top + bandRowsHeight + 5}
          r="5"
          fill="#fbbf24"
          stroke="#0f172a"
          stroke-width="1.5"
        />
      {/if}

      <!-- BOTTOM AXIS: Frequency -->
      <g transform="translate(0, {margin.top + bandRowsHeight + 10})">
        <line
          x1="0"
          y1="0"
          x2={innerWidth}
          y2="0"
          style="stroke: var(--color-chart-axis)"
          stroke-width="1"
        />
        <text
          x="-10"
          y="5"
          text-anchor="end"
          style="fill: var(--color-text-tertiary)" class="text-xs"
        >
          f
        </text>
        {#each frequencyTicks as tick (tick)}
          {@const tickX = xScale(tick)}
          {#if tickX >= 0 && tickX <= innerWidth}
            <g transform="translate({tickX}, 0)">
              <line
                y1="0"
                y2="6"
                style="stroke: var(--color-chart-axis)"
                stroke-width="1"
              />
              <text
                y="20"
                text-anchor="middle"
                style="fill: var(--color-text-tertiary); font-size: 10px;"
              >
                {formatFrequency(tick)}
              </text>
            </g>
          {/if}
        {/each}
      </g>

    </g>
  </svg>

  <!-- Tooltip -->
  {#if tooltip.visible && tooltip.band}
    <div
      class="absolute pointer-events-none rounded-lg shadow-xl px-4 py-3 z-50 min-w-[220px]"
      style="background-color: var(--color-chart-tooltip-bg); border: 1px solid var(--color-chart-tooltip-border); left: {Math.min(tooltip.x + 10, containerWidth - 240)}px; top: {Math.max(10, tooltip.y - 120)}px;"
    >
      <div class="flex items-center gap-2 mb-2">
        {#if tooltip.band.color === 'visible'}
          <div
            class="w-4 h-4 rounded"
            style="background: linear-gradient(to right, #dc2626, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6);"
          ></div>
        {:else}
          <div
            class="w-4 h-4 rounded"
            style="background-color: {tooltip.band.color};"
          ></div>
        {/if}
        <div class="font-medium" style="color: var(--color-chart-text)">{tooltip.band.name}</div>
      </div>
      {#if tooltip.band.nameDE && tooltip.band.nameDE !== tooltip.band.name}
        <div class="text-sm mb-2" style="color: var(--color-chart-text-secondary)">{tooltip.band.nameDE}</div>
      {/if}
      <div class="space-y-1 text-sm">
        <div class="flex justify-between">
          <span style="color: var(--color-chart-text-secondary)">Frequenz:</span>
          <span class="font-mono" style="color: var(--color-chart-text)">{formatFrequencyRange(tooltip.band.minHz, tooltip.band.maxHz)}</span>
        </div>
        <div class="flex justify-between">
          <span style="color: var(--color-chart-text-secondary)">Wellenlänge:</span>
          <span class="font-mono" style="color: var(--color-chart-text)">
            {formatWavelength(currentSpeedOfLight / tooltip.band.maxHz)} - {formatWavelength(currentSpeedOfLight / tooltip.band.minHz)}
          </span>
        </div>
        <div class="flex justify-between">
          <span style="color: var(--color-chart-text-secondary)">Kategorie:</span>
          <span class="capitalize" style="color: var(--color-chart-text)">{tooltip.band.category}</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Legend for spectrum regions -->
  <div class="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
    <div class="flex items-center gap-1">
      <div class="w-3 h-3 rounded bg-blue-500"></div>
      <span>Radio</span>
    </div>
    <div class="flex items-center gap-1">
      <div class="w-3 h-3 rounded bg-indigo-500"></div>
      <span>Mikrowellen</span>
    </div>
    <div class="flex items-center gap-1">
      <div class="w-3 h-3 rounded bg-red-700"></div>
      <span>Infrarot</span>
    </div>
    <div class="flex items-center gap-1">
      <div class="w-3 h-3 rounded" style="background: linear-gradient(to right, #dc2626, #eab308, #22c55e, #3b82f6, #8b5cf6);"></div>
      <span>Sichtbar</span>
    </div>
    <div class="flex items-center gap-1">
      <div class="w-3 h-3 rounded bg-violet-700"></div>
      <span>Ultraviolett</span>
    </div>
    <div class="flex items-center gap-1">
      <div class="w-3 h-3 rounded bg-cyan-600"></div>
      <span>Röntgen</span>
    </div>
    <div class="flex items-center gap-1">
      <div class="w-3 h-3 rounded bg-pink-500"></div>
      <span>Gamma</span>
    </div>
  </div>

  <!-- Zoom hint -->
  {#if zoomLevel > 1}
    <div class="absolute bottom-2 left-2 text-slate-500 text-xs">
      Nutzen Sie die Buttons oben zum Zoomen und Verschieben
    </div>
  {/if}
</div>
