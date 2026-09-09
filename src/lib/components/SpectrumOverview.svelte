<script lang="ts">
  import type { FrequencyBand } from '$lib/data/bands';
  import SpectrumControls from './SpectrumControls.svelte';
  import SpectrumCursor from './SpectrumCursor.svelte';
  import SpectrumTooltip from './SpectrumTooltip.svelte';
  import SpectrumLegend from './SpectrumLegend.svelte';
  import SpectrumWavelengthAxis from './SpectrumWavelengthAxis.svelte';
  import SpectrumFrequencyAxis from './SpectrumFrequencyAxis.svelte';
  import SpectrumRows from './SpectrumRows.svelte';
  import SpectrumMarker from './SpectrumMarker.svelte';
  import { createSpectrumState } from './spectrumState.svelte';

  interface Props {
    frequencyHz?: number;
    showLabels?: boolean;
    onBandClick?: (band: FrequencyBand) => void;
    selectedBandId?: string | null;
  }

  let { frequencyHz, showLabels = true, onBandClick, selectedBandId = null }: Props = $props();

  // Create reactive state
  const spectrumState = createSpectrumState();

  // Container element for resize observation and tooltip positioning
  let containerElement: HTMLDivElement | undefined = $state(undefined);

  // SVG element reference for cursor coordinate calculation
  let svgElement: SVGSVGElement | undefined = $state(undefined);

  // Derived marker position
  let markerX = $derived(spectrumState.getMarkerX(frequencyHz));

  // Breitenabhängiger Maßsatz: schmale Container bekommen engere Reihen,
  // eine schmale Beschriftungsspalte und Achsen ohne Zweitangabe.
  let metrics = $derived(spectrumState.metrics);

  // Achsen- und Markerpositionen (Abstand zur obersten/untersten Reihe)
  const AXIS_OFFSET = 10;
  const MARKER_OFFSET = 5;
  let topAxisY = $derived(metrics.margin.top - AXIS_OFFSET);
  let bottomAxisY = $derived(metrics.margin.top + spectrumState.bandRowsHeight + AXIS_OFFSET);

  // Safe wavelength display for control bar
  let wavelengthDisplay = $derived(frequencyHz ? spectrumState.safeFormatWavelength(frequencyHz) : '');

  // ResizeObserver for responsive width
  $effect(() => {
    if (!containerElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        spectrumState.containerWidth = entry.contentRect.width;
        // Außenmaß inklusive Polster: entscheidet über volle oder schmale Fassung
        spectrumState.outerWidth =
          entry.target instanceof HTMLElement ? entry.target.offsetWidth : entry.contentRect.width;
      }
    });

    resizeObserver.observe(containerElement);

    return () => {
      resizeObserver.disconnect();
    };
  });

  // Tooltip event handlers that inject container rect
  function handleShowTooltip(event: MouseEvent, band: FrequencyBand) {
    const rect = containerElement?.getBoundingClientRect();
    spectrumState.showTooltip(event, band, rect);
  }

  function handleCenterOnMarker() {
    if (frequencyHz) {
      spectrumState.centerOnFrequency(frequencyHz);
    }
  }

  // Cursor mouse handlers
  function handleSvgMouseMove(event: MouseEvent) {
    if (!svgElement) return;
    const svgRect = svgElement.getBoundingClientRect();
    const localX = event.clientX - svgRect.left - metrics.margin.left;
    spectrumState.handleCursorMove(localX);
  }

  function handleSvgMouseLeave() {
    spectrumState.handleCursorLeave();
  }
</script>

<div
  bind:this={containerElement}
  class="relative w-full rounded-lg"
  class:p-4={!metrics.compact}
  class:p-1={metrics.compact}
  style="background-color: var(--color-chart-bg)"
  role="img"
  aria-label="Elektromagnetisches Spektrum - von ELF bis Gammastrahlung"
>
  <!-- Control bar -->
  <SpectrumControls
    compact={metrics.compact}
    visibleRows={spectrumState.visibleRows}
    viewMode={spectrumState.viewMode}
    zoomLevel={spectrumState.zoomLevel}
    {frequencyHz}
    {wavelengthDisplay}
    onToggleRow={spectrumState.toggleRow}
    onSetViewMode={spectrumState.setViewMode}
    onZoomIn={spectrumState.zoomIn}
    onZoomOut={spectrumState.zoomOut}
    onResetZoom={spectrumState.resetZoom}
    onPanLeft={spectrumState.panLeft}
    onPanRight={spectrumState.panRight}
    onJumpToVisibleLight={spectrumState.jumpToVisibleLight}
    onCenterOnMarker={handleCenterOnMarker}
  />

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <svg
    bind:this={svgElement}
    width="100%"
    height={spectrumState.totalHeight}
    class="cursor-crosshair"
    onmousemove={handleSvgMouseMove}
    onmouseleave={handleSvgMouseLeave}
  >
    <defs>
      <linearGradient id="visibleLightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        {#each spectrumState.visibleLightGradientStops as stop (stop.offset)}
          <stop offset={stop.offset} stop-color={stop.color} />
        {/each}
      </linearGradient>
    </defs>

    <g transform="translate({metrics.margin.left}, 0)">
      <SpectrumWavelengthAxis
        ticks={spectrumState.wavelengthTicks}
        xScale={spectrumState.xScale}
        innerWidth={spectrumState.innerWidth}
        axisY={topAxisY}
        gridBottomY={bottomAxisY}
        {metrics}
      />

      <SpectrumRows
        rows={spectrumState.rowConfig}
        visibleRows={spectrumState.visibleRows}
        innerWidth={spectrumState.innerWidth}
        {showLabels}
        {selectedBandId}
        getRowY={spectrumState.getRowY}
        {onBandClick}
        onShowTooltip={handleShowTooltip}
        onHideTooltip={spectrumState.hideTooltip}
        {metrics}
      />

      <!-- Interactive cursor showing frequency ↔ wavelength -->
      {#if spectrumState.cursorX !== null && spectrumState.cursorFrequencyHz !== null}
        <SpectrumCursor
          cursorX={spectrumState.cursorX}
          frequencyLabel={spectrumState.cursorFrequencyLabel}
          wavelengthLabel={spectrumState.cursorWavelengthLabel}
          topY={topAxisY}
          bottomY={bottomAxisY}
          innerWidth={spectrumState.innerWidth}
        />
      {/if}

      {#if markerX !== null && spectrumState.visibleRowCount > 0}
        <SpectrumMarker
          {markerX}
          topY={metrics.margin.top - MARKER_OFFSET}
          bottomY={metrics.margin.top + spectrumState.bandRowsHeight + MARKER_OFFSET}
        />
      {/if}

      <SpectrumFrequencyAxis
        ticks={spectrumState.frequencyTicks}
        xScale={spectrumState.xScale}
        innerWidth={spectrumState.innerWidth}
        axisY={bottomAxisY}
        {metrics}
      />
    </g>
  </svg>

  <!-- Tooltip -->
  <SpectrumTooltip
    visible={spectrumState.tooltip.visible}
    x={spectrumState.tooltip.x}
    y={spectrumState.tooltip.y}
    band={spectrumState.tooltip.band}
    containerWidth={spectrumState.containerWidth}
    speedOfLight={spectrumState.currentSpeedOfLight}
  />

  <!-- Legend -->
  <SpectrumLegend compact={metrics.compact} />

  <!-- Zoom hint: schmal überdeckte er die Legende, dort liegen die Schalter ohnehin direkt darüber -->
  {#if spectrumState.zoomLevel > 1 && !metrics.compact}
    <div class="absolute bottom-2 left-2 text-xs text-slate-500">
      Nutzen Sie die Buttons oben zum Zoomen und Verschieben
    </div>
  {/if}
</div>
