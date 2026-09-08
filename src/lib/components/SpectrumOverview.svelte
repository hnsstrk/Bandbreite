<script lang="ts">
  import type { FrequencyBand } from "$lib/data/bands";
  import SpectrumControls from "./SpectrumControls.svelte";
  import SpectrumCursor from "./SpectrumCursor.svelte";
  import SpectrumTooltip from "./SpectrumTooltip.svelte";
  import SpectrumLegend from "./SpectrumLegend.svelte";
  import SpectrumWavelengthAxis from "./SpectrumWavelengthAxis.svelte";
  import SpectrumFrequencyAxis from "./SpectrumFrequencyAxis.svelte";
  import SpectrumRows from "./SpectrumRows.svelte";
  import SpectrumMarker from "./SpectrumMarker.svelte";
  import { createSpectrumState, MARGIN } from "./spectrumState.svelte";

  interface Props {
    frequencyHz?: number;
    showLabels?: boolean;
    onBandClick?: (band: FrequencyBand) => void;
    selectedBandId?: string | null;
  }

  let {
    frequencyHz,
    showLabels = true,
    onBandClick,
    selectedBandId = null,
  }: Props = $props();

  // Create reactive state
  const spectrumState = createSpectrumState();

  // Container element for resize observation and tooltip positioning
  let containerElement: HTMLDivElement | undefined = $state(undefined);

  // SVG element reference for cursor coordinate calculation
  let svgElement: SVGSVGElement | undefined = $state(undefined);

  // Derived marker position
  let markerX = $derived(spectrumState.getMarkerX(frequencyHz));

  // Achsen- und Markerpositionen (Abstand zur obersten/untersten Reihe)
  const AXIS_OFFSET = 10;
  const MARKER_OFFSET = 5;
  let topAxisY = $derived(MARGIN.top - AXIS_OFFSET);
  let bottomAxisY = $derived(MARGIN.top + spectrumState.bandRowsHeight + AXIS_OFFSET);

  // Safe wavelength display for control bar
  let wavelengthDisplay = $derived(
    frequencyHz ? spectrumState.safeFormatWavelength(frequencyHz) : "",
  );

  // ResizeObserver for responsive width
  $effect(() => {
    if (!containerElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        spectrumState.containerWidth = entry.contentRect.width;
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
    const localX = event.clientX - svgRect.left - MARGIN.left;
    spectrumState.handleCursorMove(localX);
  }

  function handleSvgMouseLeave() {
    spectrumState.handleCursorLeave();
  }
</script>

<div
  bind:this={containerElement}
  class="w-full rounded-lg p-4 relative"
  style="background-color: var(--color-chart-bg)"
  role="img"
  aria-label="Elektromagnetisches Spektrum - von ELF bis Gammastrahlung"
>
  <!-- Control bar -->
  <SpectrumControls
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
      <linearGradient
        id="visibleLightGradient"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="0%"
      >
        {#each spectrumState.visibleLightGradientStops as stop (stop.offset)}
          <stop offset={stop.offset} stop-color={stop.color} />
        {/each}
      </linearGradient>
    </defs>

    <g transform="translate({MARGIN.left}, 0)">
      <SpectrumWavelengthAxis
        ticks={spectrumState.wavelengthTicks}
        xScale={spectrumState.xScale}
        innerWidth={spectrumState.innerWidth}
        axisY={topAxisY}
        gridBottomY={bottomAxisY}
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
          topY={MARGIN.top - MARKER_OFFSET}
          bottomY={MARGIN.top + spectrumState.bandRowsHeight + MARKER_OFFSET}
        />
      {/if}

      <SpectrumFrequencyAxis
        ticks={spectrumState.frequencyTicks}
        xScale={spectrumState.xScale}
        innerWidth={spectrumState.innerWidth}
        axisY={bottomAxisY}
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
  <SpectrumLegend />

  <!-- Zoom hint -->
  {#if spectrumState.zoomLevel > 1}
    <div class="absolute bottom-2 left-2 text-slate-500 text-xs">
      Nutzen Sie die Buttons oben zum Zoomen und Verschieben
    </div>
  {/if}
</div>
