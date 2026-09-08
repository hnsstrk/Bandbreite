<script lang="ts">
  import { scaleLog } from 'd3-scale';
  import { IEEE_BANDS, NATO_BANDS } from '$lib/data/bands';
  import { POWER_CHART_CATEGORY_COLORS } from '$lib/data/presets';
  import {
    type DataPoint,
    MARGIN,
    MIN_FREQ,
    MAX_FREQ,
    MIN_POWER,
    MAX_POWER,
    COMMUNICATION_POINTS,
    RADAR_POINTS,
    SATELLITE_POINTS,
    IOT_POINTS,
    INDUSTRIAL_POINTS
  } from './powerDbData';
  import ChartFrame from './ChartFrame.svelte';
  import PowerDbControls from './PowerDbControls.svelte';
  import PowerDbTable from './PowerDbTable.svelte';
  import PowerDbLegend from './PowerDbLegend.svelte';
  import PowerDbAxes from './PowerDbAxes.svelte';
  import PowerDbGrid from './PowerDbGrid.svelte';
  import PowerDbTooltip from './PowerDbTooltip.svelte';

  interface Props {
    width?: number;
    height?: number;
  }

  let { width = $bindable(1200), height = 600 }: Props = $props();

  // Tooltip state
  let tooltipVisible = $state(false);
  let tooltipX = $state(0);
  let tooltipY = $state(0);
  let tooltipData = $state<DataPoint | null>(null);

  // Container reference for tooltip positioning
  let containerRef: HTMLDivElement | null = $state(null);

  // Band display mode toggle
  let bandMode = $state<'ieee' | 'nato'>('ieee');

  // Category filter toggles
  let showCommunication = $state(true);
  let showRadar = $state(true);
  let showSatellite = $state(true);
  let showIot = $state(true);
  let showIndustrial = $state(true);
  let showIEEEBands = $state(true);

  // Computed dimensions
  const margin = MARGIN;
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom);

  // Category colors
  const categoryColors = POWER_CHART_CATEGORY_COLORS;

  // All data points combined and filtered by category
  let allPoints = $derived([
    ...(showCommunication ? COMMUNICATION_POINTS : []),
    ...(showRadar ? RADAR_POINTS : []),
    ...(showSatellite ? SATELLITE_POINTS : []),
    ...(showIot ? IOT_POINTS : []),
    ...(showIndustrial ? INDUSTRIAL_POINTS : [])
  ]);

  // Scales
  let xScale = $derived(scaleLog().domain([MIN_FREQ, MAX_FREQ]).range([0, chartWidth]));

  let yScale = $derived(scaleLog().domain([MIN_POWER, MAX_POWER]).range([chartHeight, 0]));

  // Filter bands that are in our frequency range
  let visibleBands = $derived(
    (bandMode === 'ieee' ? IEEE_BANDS : NATO_BANDS).filter((band) => band.maxHz >= MIN_FREQ && band.minHz <= MAX_FREQ)
  );

  // Tooltip event handlers
  function handleMouseEnter(event: MouseEvent, point: DataPoint) {
    tooltipData = point;
    tooltipVisible = true;
    updateTooltipPosition(event);
  }

  function handleMouseMove(event: MouseEvent) {
    if (tooltipVisible) {
      updateTooltipPosition(event);
    }
  }

  function handleMouseLeave() {
    tooltipVisible = false;
    tooltipData = null;
  }

  function updateTooltipPosition(event: MouseEvent) {
    if (!containerRef) return;

    const containerRect = containerRef.getBoundingClientRect();
    const tooltipWidth = 240;
    const tooltipHeight = 140;
    const offset = 15;

    let x = event.clientX - containerRect.left + offset;
    let y = event.clientY - containerRect.top + offset;

    if (x + tooltipWidth > containerRect.width) {
      x = event.clientX - containerRect.left - tooltipWidth - offset;
    }
    if (y + tooltipHeight > containerRect.height) {
      y = event.clientY - containerRect.top - tooltipHeight - offset;
    }

    if (x < 0) x = offset;
    if (y < 0) y = offset;

    tooltipX = x;
    tooltipY = y;
  }
</script>

<div class="power-frequency-chart" bind:this={containerRef}>
  <PowerDbControls
    bind:showIEEEBands
    bind:bandMode
    bind:showCommunication
    bind:showRadar
    bind:showSatellite
    bind:showIot
    bind:showIndustrial
  />

  <ChartFrame
    bind:width
    description="Sendeleistungen verschiedener Funksysteme über der Frequenz, beide Achsen logarithmisch, mit Wellenlänge oben und Dezibel-Milliwatt rechts"
    minWidth={720}
    footnote="Typische Werte; regulatorische Grenzwerte und Betriebsarten können abweichen."
  >
    <svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id="chartClip">
          <rect x="0" y="0" width={chartWidth} height={chartHeight} />
        </clipPath>
      </defs>

      <!-- Background -->
      <rect x="0" y="0" {width} {height} style="fill: var(--color-chart-bg)" />

      <g transform="translate({margin.left}, {margin.top})">
        <!-- Band backgrounds -->
        {#if showIEEEBands}
          <g clip-path="url(#chartClip)" opacity="0.18">
            {#each visibleBands as band (band.id)}
              {@const x1 = Math.max(0, xScale(Math.max(MIN_FREQ, band.minHz)))}
              {@const x2 = Math.min(chartWidth, xScale(Math.min(MAX_FREQ, band.maxHz)))}
              {@const bandWidth = x2 - x1}
              {#if bandWidth > 0}
                <rect x={x1} y="0" width={bandWidth} height={chartHeight} fill={band.color} />
                {#if bandWidth > 30}
                  <text
                    x={x1 + bandWidth / 2}
                    y="20"
                    text-anchor="middle"
                    fill="var(--color-on-solid)"
                    font-weight="600"
                    font-size="13"
                  >
                    {band.name}
                  </text>
                {/if}
              {/if}
            {/each}
          </g>
        {/if}

        <!-- Gitternetz -->
        <PowerDbGrid {chartWidth} {chartHeight} {xScale} {yScale} />

        <!-- All data points rendered by category -->
        {#each allPoints as point (point.name)}
          {@const cx = xScale(point.frequencyHz)}
          {@const cy = yScale(point.powerWatt)}
          {@const color = categoryColors[point.category]}
          <g
            class="data-point"
            onmouseenter={(e) => handleMouseEnter(e, point)}
            onmousemove={handleMouseMove}
            onmouseleave={handleMouseLeave}
            role="button"
            tabindex="0"
          >
            <circle {cx} {cy} r="12" fill="transparent" class="cursor-pointer" />
            {#if point.category === 'communication'}
              <circle
                {cx}
                {cy}
                r="5"
                fill={color}
                stroke="var(--color-surface)"
                stroke-width="1.5"
                filter="url(#pointGlow)"
                class="pointer-events-none"
              />
            {:else if point.category === 'radar'}
              <rect
                x={cx - 5}
                y={cy - 5}
                width="10"
                height="10"
                rx="1.5"
                fill={color}
                stroke="var(--color-surface)"
                stroke-width="1.5"
                filter="url(#pointGlow)"
                class="pointer-events-none"
              />
            {:else if point.category === 'satellite'}
              <polygon
                points="{cx},{cy - 6} {cx + 5},{cy + 4} {cx - 5},{cy + 4}"
                fill={color}
                stroke="var(--color-surface)"
                stroke-width="1.5"
                filter="url(#pointGlow)"
                class="pointer-events-none"
              />
            {:else if point.category === 'iot'}
              <polygon
                points="{cx},{cy - 5} {cx + 5},{cy} {cx},{cy + 5} {cx - 5},{cy}"
                fill={color}
                stroke="var(--color-surface)"
                stroke-width="1.5"
                filter="url(#pointGlow)"
                class="pointer-events-none"
              />
            {:else if point.category === 'industrial'}
              <circle
                {cx}
                {cy}
                r="6"
                fill={color}
                stroke="var(--color-surface)"
                stroke-width="1.5"
                filter="url(#pointGlow)"
                class="pointer-events-none"
              />
              <circle {cx} {cy} r="2" fill="var(--color-surface)" class="pointer-events-none" />
            {/if}
          </g>
        {/each}

        <!-- Achsen: Frequenz, Wellenlänge, Leistung in Watt und dBm -->
        <PowerDbAxes {chartWidth} {chartHeight} {xScale} {yScale} />

        <!-- Legend -->
        <PowerDbLegend {chartWidth} {chartHeight} {bandMode} />
      </g>
    </svg>

    {#snippet dataTable()}
      <PowerDbTable points={allPoints} />
    {/snippet}
  </ChartFrame>

  <!-- Tooltip -->
  <PowerDbTooltip visible={tooltipVisible} x={tooltipX} y={tooltipY} data={tooltipData} />
</div>

<style>
  .power-frequency-chart {
    container-type: inline-size;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .data-point {
    transition: opacity 0.2s;
  }

  .data-point:hover {
    opacity: 0.8;
  }
</style>
