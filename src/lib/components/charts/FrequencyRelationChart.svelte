<script lang="ts">
  import * as d3 from 'd3';
  import { frequencyToWavelength } from '$lib/utils/calculations';
  import { speedOfLight } from '$lib/stores/speedOfLight.svelte';
  import { IEEE_BANDS, ITU_BANDS, formatFrequencyRange } from '$lib/data/bands';

  interface Props {
    frequencyHz?: number | null;
    width?: number;
    height?: number;
  }

  let { frequencyHz = null, width = 1000, height = 500 }: Props = $props();

  // Chart margins
  const margin = { top: 60, right: 180, bottom: 70, left: 80 };

  // Derived dimensions
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom);

  // Frequency range (1 kHz to 300 GHz)
  const MIN_FREQ = 1e3;
  const MAX_FREQ = 300e9;

  // Speed of light for calculations
  let c = $derived(speedOfLight.value);

  // Logarithmic frequency scale
  let xScale = $derived(
    d3.scaleLog()
      .domain([MIN_FREQ, MAX_FREQ])
      .range([0, chartWidth])
      .clamp(true)
  );

  // Calculate wavelength range
  let wavelengthRange = $derived({
    min: c / MAX_FREQ,  // ~1 mm
    max: c / MIN_FREQ   // ~300 km
  });

  // Secondary Y-axis for wavelength (inverted because higher freq = shorter wavelength)
  let wavelengthScale = $derived(
    d3.scaleLog()
      .domain([wavelengthRange.min, wavelengthRange.max])
      .range([chartHeight, 0])
  );

  // Calculate wavelength at current frequency
  let currentWavelength = $derived(
    frequencyHz && frequencyHz > 0 ? frequencyToWavelength(frequencyHz) : null
  );

  // Marker position
  let markerX = $derived.by(() => {
    if (!frequencyHz || frequencyHz < MIN_FREQ || frequencyHz > MAX_FREQ) return null;
    return xScale(frequencyHz);
  });

  let markerY = $derived.by(() => {
    if (!currentWavelength || currentWavelength < wavelengthRange.min || currentWavelength > wavelengthRange.max) return null;
    return wavelengthScale(currentWavelength);
  });

  // Relationship line: f * wavelength = c (appears as diagonal in log-log space)
  let relationshipLine = $derived.by(() => {
    const points: { x: number; y: number }[] = [];
    const numPoints = 100;

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const logFreq = Math.log10(MIN_FREQ) + t * (Math.log10(MAX_FREQ) - Math.log10(MIN_FREQ));
      const freq = Math.pow(10, logFreq);
      const wavelength = c / freq;

      if (wavelength >= wavelengthRange.min && wavelength <= wavelengthRange.max) {
        points.push({
          x: xScale(freq),
          y: wavelengthScale(wavelength)
        });
      }
    }

    return d3.line<{ x: number; y: number }>()
      .x(d => d.x)
      .y(d => d.y)(points);
  });

  // ITU bands for background visualization (simplified set)
  const ituBandsSimple = [
    { id: 'vlf', name: 'VLF', minHz: 3e3, maxHz: 30e3, color: '#1e3a5f' },
    { id: 'lf', name: 'LF', minHz: 30e3, maxHz: 300e3, color: '#2374ab' },
    { id: 'mf', name: 'MF', minHz: 300e3, maxHz: 3e6, color: '#5499c7' },
    { id: 'hf', name: 'HF', minHz: 3e6, maxHz: 30e6, color: '#7fb3d5' },
    { id: 'vhf', name: 'VHF', minHz: 30e6, maxHz: 300e6, color: '#22c55e' },
    { id: 'uhf', name: 'UHF', minHz: 300e6, maxHz: 3e9, color: '#eab308' },
    { id: 'shf', name: 'SHF', minHz: 3e9, maxHz: 30e9, color: '#f97316' },
    { id: 'ehf', name: 'EHF', minHz: 30e9, maxHz: 300e9, color: '#ef4444' },
  ];

  // Calculate band rectangles
  let bandRects = $derived(
    ituBandsSimple.map(band => {
      const x1 = xScale(Math.max(band.minHz, MIN_FREQ));
      const x2 = xScale(Math.min(band.maxHz, MAX_FREQ));
      return {
        ...band,
        x: x1,
        width: x2 - x1
      };
    }).filter(b => b.width > 0)
  );

  // Common applications/technologies at different frequencies
  const applications = [
    { freq: 50e3, label: 'LW Radio', y: 0.2 },
    { freq: 1e6, label: 'MW Radio', y: 0.3 },
    { freq: 10e6, label: 'SW Radio', y: 0.2 },
    { freq: 100e6, label: 'FM Radio', y: 0.3 },
    { freq: 433e6, label: 'ISM 433', y: 0.15 },
    { freq: 900e6, label: 'GSM/LTE', y: 0.25 },
    { freq: 2.4e9, label: 'WiFi 2.4G', y: 0.35 },
    { freq: 5e9, label: 'WiFi 5G', y: 0.2 },
    { freq: 10e9, label: 'X-Band', y: 0.3 },
    { freq: 28e9, label: '5G mmW', y: 0.15 },
    { freq: 60e9, label: 'WiGig', y: 0.25 },
    { freq: 77e9, label: 'Radar', y: 0.35 },
  ];

  // Filter applications within range
  let visibleApplications = $derived(
    applications.filter(app => app.freq >= MIN_FREQ && app.freq <= MAX_FREQ)
  );

  // X-axis tick values (frequency)
  const freqTickValues = [
    1e3, 10e3, 100e3,
    1e6, 10e6, 100e6,
    1e9, 10e9, 100e9
  ];

  // Y-axis tick values (wavelength in meters)
  const wavelengthTickValues = [
    1e-3, 1e-2, 1e-1, 1, 10, 100, 1e3, 1e4, 1e5
  ];

  // Format frequency for axis
  function formatFrequency(hz: number): string {
    if (hz >= 1e9) return `${hz / 1e9} GHz`;
    if (hz >= 1e6) return `${hz / 1e6} MHz`;
    if (hz >= 1e3) return `${hz / 1e3} kHz`;
    return `${hz} Hz`;
  }

  // Format wavelength for axis
  function formatWavelength(m: number): string {
    if (m >= 1000) return `${m / 1000} km`;
    if (m >= 1) return `${m} m`;
    if (m >= 0.01) return `${m * 100} cm`;
    if (m >= 0.001) return `${m * 1000} mm`;
    return `${m * 1e6} um`;
  }

  // Tooltip state
  let tooltip = $state<{
    visible: boolean;
    x: number;
    y: number;
    freq: number;
    wavelength: number;
  } | null>(null);

  function handleMouseMove(event: MouseEvent) {
    const svgRect = (event.currentTarget as SVGElement).getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left - margin.left;
    const mouseY = event.clientY - svgRect.top - margin.top;

    if (mouseX >= 0 && mouseX <= chartWidth && mouseY >= 0 && mouseY <= chartHeight) {
      const freq = xScale.invert(mouseX);
      const wavelength = c / freq;

      tooltip = {
        visible: true,
        x: mouseX,
        y: mouseY,
        freq,
        wavelength
      };
    } else {
      tooltip = null;
    }
  }

  function handleMouseLeave() {
    tooltip = null;
  }
</script>

<div class="frequency-relation-chart w-full">
  <svg
    viewBox="0 0 {width} {height}"
    class="w-full h-auto cursor-crosshair"
    preserveAspectRatio="xMidYMid meet"
    onmousemove={handleMouseMove}
    onmouseleave={handleMouseLeave}
  >
    <defs>
      <!-- Gradient for relationship line -->
      <linearGradient id="freqRelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#3b82f6" />
        <stop offset="50%" stop-color="#8b5cf6" />
        <stop offset="100%" stop-color="#ec4899" />
      </linearGradient>

      <!-- Glow filter -->
      <filter id="freqRelGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- Background -->
    <rect x="0" y="0" width={width} height={height} class="fill-slate-900" />

    <!-- Chart area -->
    <g transform="translate({margin.left}, {margin.top})">
      <!-- Band regions (background) -->
      {#each bandRects as band (band.id)}
        <rect
          x={band.x}
          y="0"
          width={band.width}
          height={chartHeight}
          fill={band.color}
          opacity="0.15"
        />
        {#if band.width > 40}
          <text
            x={band.x + band.width / 2}
            y="15"
            class="fill-slate-400"
            text-anchor="middle"
            font-size="10"
            opacity="0.8"
          >
            {band.name}
          </text>
        {/if}
      {/each}

      <!-- Grid lines - vertical (frequency) -->
      {#each freqTickValues as tickVal (tickVal)}
        {@const tickX = xScale(tickVal)}
        {#if tickX >= 0 && tickX <= chartWidth}
          <line
            x1={tickX}
            y1="0"
            x2={tickX}
            y2={chartHeight}
            class="stroke-slate-700"
            stroke-dasharray="4,4"
            stroke-width="0.5"
          />
        {/if}
      {/each}

      <!-- Grid lines - horizontal (wavelength) -->
      {#each wavelengthTickValues as tickVal (tickVal)}
        {@const tickY = wavelengthScale(tickVal)}
        {#if tickY >= 0 && tickY <= chartHeight}
          <line
            x1="0"
            y1={tickY}
            x2={chartWidth}
            y2={tickY}
            class="stroke-slate-700"
            stroke-dasharray="4,4"
            stroke-width="0.5"
          />
        {/if}
      {/each}

      <!-- Relationship line (f * lambda = c) -->
      <path
        d={relationshipLine}
        fill="none"
        stroke="url(#freqRelGradient)"
        stroke-width="3"
        stroke-linecap="round"
      />

      <!-- Application markers -->
      {#each visibleApplications as app (app.label)}
        {@const appX = xScale(app.freq)}
        {@const appY = chartHeight * app.y}
        <g transform="translate({appX}, {appY})">
          <circle r="4" class="fill-slate-400" opacity="0.8" />
          <text
            x="8"
            y="4"
            class="fill-slate-300"
            font-size="9"
          >
            {app.label}
          </text>
        </g>
      {/each}

      <!-- Current frequency marker -->
      {#if markerX !== null && markerY !== null}
        <!-- Vertical line -->
        <line
          x1={markerX}
          y1="0"
          x2={markerX}
          y2={chartHeight}
          class="stroke-amber-400"
          stroke-width="2"
          stroke-dasharray="8,4"
          opacity="0.9"
        />
        <!-- Horizontal line -->
        <line
          x1="0"
          y1={markerY}
          x2={chartWidth}
          y2={markerY}
          class="stroke-amber-400"
          stroke-width="2"
          stroke-dasharray="8,4"
          opacity="0.9"
        />
        <!-- Marker point on relationship line -->
        <circle
          cx={markerX}
          cy={markerY}
          r="12"
          class="fill-amber-400"
          filter="url(#freqRelGlow)"
        />
        <circle
          cx={markerX}
          cy={markerY}
          r="6"
          class="fill-amber-200"
        />

        <!-- Value labels -->
        <g transform="translate({markerX + 15}, {Math.min(markerY, chartHeight - 50)})">
          <rect
            x="0"
            y="0"
            width="130"
            height="44"
            rx="4"
            class="fill-slate-800"
            stroke="#475569"
            stroke-width="1"
          />
          <text x="8" y="16" class="fill-slate-400" font-size="10">
            f = <tspan class="fill-amber-400 font-medium">{formatFrequency(frequencyHz!)}</tspan>
          </text>
          <text x="8" y="34" class="fill-slate-400" font-size="10">
            lambda = <tspan class="fill-green-400 font-medium">{formatWavelength(currentWavelength!)}</tspan>
          </text>
        </g>
      {/if}

      <!-- Hover tooltip -->
      {#if tooltip}
        <g transform="translate({tooltip.x + 15}, {Math.max(10, Math.min(tooltip.y - 30, chartHeight - 60))})">
          <rect
            x="0"
            y="0"
            width="140"
            height="50"
            rx="4"
            class="fill-slate-800/95"
            stroke="#475569"
            stroke-width="1"
          />
          <text x="8" y="18" class="fill-slate-300" font-size="11">
            f = {formatFrequency(tooltip.freq)}
          </text>
          <text x="8" y="36" class="fill-slate-300" font-size="11">
            lambda = {formatWavelength(tooltip.wavelength)}
          </text>
        </g>
      {/if}

      <!-- X-axis (Frequency - bottom) -->
      <g transform="translate(0, {chartHeight})">
        <line x1="0" y1="0" x2={chartWidth} y2="0" class="stroke-slate-500" stroke-width="1" />
        {#each freqTickValues as tickVal (tickVal)}
          {@const tickX = xScale(tickVal)}
          {#if tickX >= 0 && tickX <= chartWidth}
            <g transform="translate({tickX}, 0)">
              <line y2="8" class="stroke-slate-500" />
              <text y="24" class="fill-slate-300" text-anchor="middle" font-size="10">
                {formatFrequency(tickVal)}
              </text>
            </g>
          {/if}
        {/each}
        <text
          x={chartWidth / 2}
          y="50"
          class="fill-slate-200"
          text-anchor="middle"
          font-size="13"
          font-weight="500"
        >
          Frequenz (f)
        </text>
      </g>

      <!-- Y-axis (Wavelength - left) -->
      <g>
        <line x1="0" y1="0" x2="0" y2={chartHeight} class="stroke-slate-500" stroke-width="1" />
        {#each wavelengthTickValues as tickVal (tickVal)}
          {@const tickY = wavelengthScale(tickVal)}
          {#if tickY >= 0 && tickY <= chartHeight}
            <g transform="translate(0, {tickY})">
              <line x2="-8" class="stroke-slate-500" />
              <text x="-12" class="fill-slate-300" text-anchor="end" dominant-baseline="middle" font-size="10">
                {formatWavelength(tickVal)}
              </text>
            </g>
          {/if}
        {/each}
        <text
          transform="rotate(-90)"
          x={-chartHeight / 2}
          y="-60"
          class="fill-slate-200"
          text-anchor="middle"
          font-size="13"
          font-weight="500"
        >
          Wellenlaenge (lambda)
        </text>
      </g>

      <!-- Title -->
      <text
        x={chartWidth / 2}
        y="-30"
        class="fill-slate-100"
        text-anchor="middle"
        font-size="16"
        font-weight="600"
      >
        Frequenz-Wellenlaenge-Beziehung
      </text>
      <text
        x={chartWidth / 2}
        y="-12"
        class="fill-slate-400"
        text-anchor="middle"
        font-size="11"
      >
        lambda = c / f (c = {(c / 1e6).toFixed(3)} km/s)
      </text>
    </g>

    <!-- Legend (right side) -->
    <g transform="translate({width - margin.right + 20}, {margin.top})">
      <text class="fill-slate-300 font-medium" font-size="12" y="0">
        ITU-Baender
      </text>
      {#each ituBandsSimple as band, i (band.id)}
        <g transform="translate(0, {18 + i * 16})">
          <rect x="0" y="-6" width="14" height="12" fill={band.color} opacity="0.5" rx="2" />
          <text x="20" y="3" class="fill-slate-400" font-size="9">
            {band.name}
          </text>
        </g>
      {/each}

      <!-- Relationship explanation -->
      <g transform="translate(0, {18 + ituBandsSimple.length * 16 + 20})">
        <text class="fill-slate-300 font-medium" font-size="11" y="0">
          Formel
        </text>
        <text class="fill-slate-400" font-size="10" y="16">
          c = f * lambda
        </text>
        <text class="fill-slate-500" font-size="9" y="32">
          lambda = c / f
        </text>
        <text class="fill-slate-500" font-size="9" y="46">
          f = c / lambda
        </text>
      </g>
    </g>
  </svg>
</div>

<style>
  .frequency-relation-chart {
    container-type: inline-size;
  }
</style>
