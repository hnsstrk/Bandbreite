<script lang="ts">
  import * as d3 from 'd3';
  import { IEEE_BANDS, NATO_BANDS } from '$lib/data/bands';
  import { POWER_CHART_CATEGORY_COLORS } from '$lib/data/presets';
  import {
    type DataPoint,
    MARGIN,
    MIN_FREQ, MAX_FREQ, MIN_POWER, MAX_POWER,
    X_TICK_VALUES, X_TICK_LABELS,
    Y_TICK_VALUES, Y_TICK_LABELS, Y_DBM_LABELS,
    COMMUNICATION_POINTS, RADAR_POINTS, SATELLITE_POINTS, IOT_POINTS, INDUSTRIAL_POINTS,
    freqToWavelength, formatWavelengthLocal,
  } from './powerDbData';
  import PowerDbControls from './PowerDbControls.svelte';
  import PowerDbLegend from './PowerDbLegend.svelte';
  import PowerDbTooltip from './PowerDbTooltip.svelte';

  interface Props {
    width?: number;
    height?: number;
  }

  let { width = 1200, height = 600 }: Props = $props();

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
  let xScale = $derived(
    d3.scaleLog().domain([MIN_FREQ, MAX_FREQ]).range([0, chartWidth])
  );

  let yScale = $derived(
    d3.scaleLog().domain([MIN_POWER, MAX_POWER]).range([chartHeight, 0])
  );

  // Filter bands that are in our frequency range
  let visibleBands = $derived(
    (bandMode === 'ieee' ? IEEE_BANDS : NATO_BANDS)
      .filter(band => band.maxHz >= MIN_FREQ && band.minHz <= MAX_FREQ)
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

<div class="power-frequency-chart w-full relative" bind:this={containerRef}>
  <!-- Controls Row -->
  <PowerDbControls
    bind:showIEEEBands
    bind:bandMode
    bind:showCommunication
    bind:showRadar
    bind:showSatellite
    bind:showIot
    bind:showIndustrial
  />

  <svg viewBox="0 0 {width} {height}" class="w-full h-auto" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Sendeleistungen im Frequenzspektrum: Zeigt verschiedene Sender und ihre Leistungen über der Frequenz">
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
    <rect x="0" y="0" width={width} height={height} style="fill: var(--color-chart-bg)" />

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
              <text x={x1 + bandWidth / 2} y="20" text-anchor="middle" class="fill-white font-semibold" font-size="13" style="text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
                {band.name}
              </text>
            {/if}
          {/if}
        {/each}
      </g>
      {/if}

      <!-- Grid lines - vertical (frequency) -->
      {#each X_TICK_VALUES as tickVal (tickVal)}
        <line x1={xScale(tickVal)} y1="0" x2={xScale(tickVal)} y2={chartHeight} style="stroke: var(--color-chart-grid)" stroke-dasharray="4,4" stroke-width="0.5" />
      {/each}

      <!-- Grid lines - horizontal (power) -->
      {#each Y_TICK_VALUES as tickVal (tickVal)}
        <line x1="0" y1={yScale(tickVal)} x2={chartWidth} y2={yScale(tickVal)} style="stroke: var(--color-chart-grid)" stroke-dasharray="4,4" stroke-width="0.5" />
      {/each}

      <!-- All data points rendered by category -->
      {#each allPoints as point (point.name)}
        {@const cx = xScale(point.frequencyHz)}
        {@const cy = yScale(point.powerWatt)}
        {@const color = categoryColors[point.category]}
        <g class="data-point" onmouseenter={(e) => handleMouseEnter(e, point)} onmousemove={handleMouseMove} onmouseleave={handleMouseLeave} role="button" tabindex="0">
          <circle cx={cx} cy={cy} r="12" fill="transparent" class="cursor-pointer" />
          {#if point.category === 'communication'}
            <circle cx={cx} cy={cy} r="5" fill={color} stroke="#1e293b" stroke-width="1.5" filter="url(#pointGlow)" class="pointer-events-none" />
          {:else if point.category === 'radar'}
            <rect x={cx - 5} y={cy - 5} width="10" height="10" rx="1.5" fill={color} stroke="#1e293b" stroke-width="1.5" filter="url(#pointGlow)" class="pointer-events-none" />
          {:else if point.category === 'satellite'}
            <polygon points="{cx},{cy - 6} {cx + 5},{cy + 4} {cx - 5},{cy + 4}" fill={color} stroke="#1e293b" stroke-width="1.5" filter="url(#pointGlow)" class="pointer-events-none" />
          {:else if point.category === 'iot'}
            <polygon points="{cx},{cy - 5} {cx + 5},{cy} {cx},{cy + 5} {cx - 5},{cy}" fill={color} stroke="#1e293b" stroke-width="1.5" filter="url(#pointGlow)" class="pointer-events-none" />
          {:else if point.category === 'industrial'}
            <circle cx={cx} cy={cy} r="6" fill={color} stroke="#1e293b" stroke-width="1.5" filter="url(#pointGlow)" class="pointer-events-none" />
            <circle cx={cx} cy={cy} r="2" fill="#1e293b" class="pointer-events-none" />
          {/if}
        </g>
      {/each}

      <!-- X-axis bottom (Frequency) -->
      <g transform="translate(0, {chartHeight})">
        <line x1="0" y1="0" x2={chartWidth} y2="0" style="stroke: var(--color-chart-axis)" stroke-width="1" />
        {#each X_TICK_VALUES as tickVal, i (tickVal)}
          <g transform="translate({xScale(tickVal)}, 0)">
            <line y2="8" style="stroke: var(--color-chart-axis)" />
            <text y="24" text-anchor="middle" style="fill: var(--color-chart-text-secondary)" font-size="11">{X_TICK_LABELS[i]}</text>
          </g>
        {/each}
        <text x={chartWidth / 2} y="48" text-anchor="middle" style="fill: var(--color-chart-text)" font-size="14" font-weight="500">Frequenz (Hz)</text>
      </g>

      <!-- X-axis top (Wavelength) -->
      <g>
        <line x1="0" y1="0" x2={chartWidth} y2="0" style="stroke: var(--color-chart-axis)" stroke-width="1" />
        {#each X_TICK_VALUES as tickVal, i (tickVal)}
          {@const wavelength = freqToWavelength(tickVal)}
          <g transform="translate({xScale(tickVal)}, 0)">
            <line y2="-8" style="stroke: var(--color-chart-axis)" />
            <text y="-14" text-anchor="middle" style="fill: var(--color-text-tertiary)" font-size="10">{formatWavelengthLocal(wavelength)}</text>
          </g>
        {/each}
        <text x={chartWidth / 2} y="-36" text-anchor="middle" style="fill: var(--color-text-tertiary)" font-size="12">Wellenlänge (m)</text>
      </g>

      <!-- Y-axis left (Power in Watt) -->
      <g>
        <line x1="0" y1="0" x2="0" y2={chartHeight} style="stroke: var(--color-chart-axis)" stroke-width="1" />
        {#each Y_TICK_VALUES as tickVal, i (tickVal)}
          <g transform="translate(0, {yScale(tickVal)})">
            <line x2="-8" style="stroke: var(--color-chart-axis)" />
            <text x="-12" text-anchor="end" dominant-baseline="middle" style="fill: var(--color-chart-text-secondary)" font-size="10">{Y_TICK_LABELS[i]}</text>
          </g>
        {/each}
        <text transform="rotate(-90)" x={-chartHeight / 2} y="-70" text-anchor="middle" style="fill: var(--color-chart-text)" font-size="14" font-weight="500">Leistung (Watt)</text>
      </g>

      <!-- Y-axis right (Power in dBm) -->
      <g transform="translate({chartWidth}, 0)">
        <line x1="0" y1="0" x2="0" y2={chartHeight} style="stroke: var(--color-chart-axis)" stroke-width="1" />
        {#each Y_TICK_VALUES as tickVal, i (tickVal)}
          <g transform="translate(0, {yScale(tickVal)})">
            <line x2="8" style="stroke: var(--color-chart-axis)" />
            <text x="12" text-anchor="start" dominant-baseline="middle" style="fill: var(--color-text-tertiary)" font-size="10">{Y_DBM_LABELS[i]}</text>
          </g>
        {/each}
        <text transform="rotate(90)" x={chartHeight / 2} y="-70" text-anchor="middle" style="fill: var(--color-text-tertiary)" font-size="12">Leistung (dBm)</text>
      </g>

      <!-- Legend -->
      <PowerDbLegend {chartWidth} {chartHeight} {bandMode} />
    </g>
  </svg>

  <!-- Tooltip -->
  <PowerDbTooltip visible={tooltipVisible} x={tooltipX} y={tooltipY} data={tooltipData} />
</div>

<style>
  .power-frequency-chart {
    container-type: inline-size;
  }

  .data-point {
    transition: opacity 0.2s;
  }

  .data-point:hover {
    opacity: 0.8;
  }
</style>
