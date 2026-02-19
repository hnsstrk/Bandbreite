<script lang="ts">
  import { formatFrequencyRange, type FrequencyBand } from "$lib/data/bands";
  import SpectrumControls from "./SpectrumControls.svelte";
  import SpectrumCursor from "./SpectrumCursor.svelte";
  import SpectrumTooltip from "./SpectrumTooltip.svelte";
  import SpectrumLegend from "./SpectrumLegend.svelte";
  import {
    createSpectrumState,
    MARGIN,
    ROW_HEIGHT,
    MIN_ZOOM,
    ROUNDED_SPEED_OF_LIGHT,
    formatFrequencyLocal,
    formatWavelengthLocal,
  } from "./spectrumState.svelte";
  import { safeDivide } from "$lib/utils/handlers";

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
      <!-- TOP AXIS: Wavelength -->
      <g transform="translate(0, {MARGIN.top - 10})">
        <line
          x1="0"
          y1="0"
          x2={spectrumState.innerWidth}
          y2="0"
          style="stroke: var(--color-chart-axis)"
          stroke-width="1"
        />
        <text
          x="-10"
          y="5"
          text-anchor="end"
          style="fill: var(--color-text-tertiary)"
          class="text-xs"
        >
          wavelength
        </text>
        {#each spectrumState.wavelengthTicks as tick (tick.label)}
          {@const tickX = spectrumState.xScale(tick.freq)}
          {#if tickX >= 0 && tickX <= spectrumState.innerWidth}
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
              <!-- Duale Beschriftung: korrespondierende Frequenz -->
              <text
                y="-23"
                text-anchor="middle"
                style="fill: var(--color-text-tertiary); font-size: 8px; opacity: 0.7;"
              >
                ({formatFrequencyLocal(tick.freq)})
              </text>
            </g>
          {/if}
        {/each}
      </g>

      <!-- Vertikale Gitterlinien von Wellenlängen-Ticks -->
      <g aria-hidden="true">
        {#each spectrumState.wavelengthTicks as tick (tick.label)}
          {@const tickX = spectrumState.xScale(tick.freq)}
          {#if tickX >= 0 && tickX <= spectrumState.innerWidth}
            <line
              x1={tickX}
              y1={MARGIN.top - 10}
              x2={tickX}
              y2={MARGIN.top + spectrumState.bandRowsHeight + 10}
              style="stroke: var(--color-chart-grid)"
              stroke-width="0.5"
              stroke-dasharray="4 3"
              opacity="0.3"
            />
          {/if}
        {/each}
      </g>

      <!-- Band rows -->
      {#each spectrumState.rowConfig as row, rowIndex (row.key)}
        {#if spectrumState.visibleRows[row.key]}
          {@const rowY = spectrumState.getRowY(rowIndex)}
          <g transform="translate(0, {rowY})">
            <!-- Row label -->
            <text
              x="-10"
              y={ROW_HEIGHT / 2}
              text-anchor="end"
              dominant-baseline="middle"
              style="fill: var(--color-text-tertiary)"
              class="text-sm font-medium"
            >
              {row.label}
            </text>

            <!-- Background rectangle -->
            <rect
              x="0"
              y="0"
              width={spectrumState.innerWidth}
              height={ROW_HEIGHT}
              style="fill: var(--color-bg-surface); stroke: var(--color-chart-grid)"
              stroke-width="1"
            />

            <!-- Band rectangles -->
            {#each row.bands as band (band.id)}
              <!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_no_noninteractive_tabindex -->
              <g
                role="graphics-symbol"
                aria-label="{band.name}: {formatFrequencyRange(
                  band.minHz,
                  band.maxHz,
                )}"
                onmouseenter={(e) => handleShowTooltip(e, band)}
                onmouseleave={spectrumState.hideTooltip}
                onmousemove={(e) => handleShowTooltip(e, band)}
                onclick={() => onBandClick?.(band)}
                onkeydown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onBandClick?.(band);
                }}
                tabindex="0"
                class="cursor-pointer"
              >
                <rect
                  x={band.x}
                  y="2"
                  width={Math.max(band.width, 2)}
                  height={ROW_HEIGHT - 4}
                  fill={band.color === "visible"
                    ? "url(#visibleLightGradient)"
                    : band.color}
                  opacity={selectedBandId === band.id ? 1 : 0.9}
                  stroke={selectedBandId === band.id ? "#fbbf24" : "#0f172a"}
                  stroke-width={selectedBandId === band.id ? 2.5 : 0.5}
                  class="transition-opacity hover:opacity-70"
                />
                {#if showLabels && band.width > 25}
                  <text
                    x={band.x + band.width / 2}
                    y={ROW_HEIGHT / 2}
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

      <!-- Interactive cursor showing frequency ↔ wavelength -->
      {#if spectrumState.cursorX !== null && spectrumState.cursorFrequencyHz !== null}
        <SpectrumCursor
          cursorX={spectrumState.cursorX}
          frequencyLabel={spectrumState.cursorFrequencyLabel}
          wavelengthLabel={spectrumState.cursorWavelengthLabel}
          topY={MARGIN.top - 10}
          bottomY={MARGIN.top + spectrumState.bandRowsHeight + 10}
          innerWidth={spectrumState.innerWidth}
        />
      {/if}

      <!-- Single marker line spanning all visible rows -->
      {#if markerX !== null && spectrumState.visibleRowCount > 0}
        <line
          x1={markerX}
          y1={MARGIN.top - 5}
          x2={markerX}
          y2={MARGIN.top + spectrumState.bandRowsHeight + 5}
          stroke="#fbbf24"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <circle
          cx={markerX}
          cy={MARGIN.top - 5}
          r="5"
          fill="#fbbf24"
          stroke="#0f172a"
          stroke-width="1.5"
        />
        <circle
          cx={markerX}
          cy={MARGIN.top + spectrumState.bandRowsHeight + 5}
          r="5"
          fill="#fbbf24"
          stroke="#0f172a"
          stroke-width="1.5"
        />
      {/if}

      <!-- BOTTOM AXIS: Frequency -->
      <g
        transform="translate(0, {MARGIN.top +
          spectrumState.bandRowsHeight +
          10})"
      >
        <line
          x1="0"
          y1="0"
          x2={spectrumState.innerWidth}
          y2="0"
          style="stroke: var(--color-chart-axis)"
          stroke-width="1"
        />
        <text
          x="-10"
          y="5"
          text-anchor="end"
          style="fill: var(--color-text-tertiary)"
          class="text-xs"
        >
          f
        </text>
        {#each spectrumState.frequencyTicks as tick (tick)}
          {@const tickX = spectrumState.xScale(tick)}
          {#if tickX >= 0 && tickX <= spectrumState.innerWidth}
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
                {formatFrequencyLocal(tick)}
              </text>
              <!-- Duale Beschriftung: korrespondierende Wellenlänge -->
              <text
                y="31"
                text-anchor="middle"
                style="fill: var(--color-text-tertiary); font-size: 8px; opacity: 0.7;"
              >
                ({formatWavelengthLocal(safeDivide(ROUNDED_SPEED_OF_LIGHT, tick, 0))})
              </text>
            </g>
          {/if}
        {/each}
      </g>
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
