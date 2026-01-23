<script lang="ts">
  import * as d3 from 'd3';
  import { frequencyToWavelength } from '$lib/utils/calculations';
  import { speedOfLight } from '$lib/stores/speedOfLight.svelte';

  interface Props {
    frequencyHz?: number;
    width?: number;
    height?: number;
  }

  let { frequencyHz, width = 1200, height = 300 }: Props = $props();

  // Speed of light for wavelength calculations - reactive to store
  let currentSpeedOfLight = $derived(speedOfLight.value);

  // Full EM spectrum bands from lowest to highest frequency
  const emSpectrumBands = [
    { name: 'Radio', nameDE: 'Radiowellen', minHz: 3, maxHz: 300e9, color: '#3b82f6' },
    { name: 'Microwave', nameDE: 'Mikrowellen', minHz: 300e6, maxHz: 300e9, color: '#6366f1' },
    { name: 'Infrared', nameDE: 'Infrarot', minHz: 300e9, maxHz: 400e12, color: '#ef4444' },
    { name: 'Visible', nameDE: 'Sichtbar', minHz: 400e12, maxHz: 800e12, color: 'url(#visibleGradient)' },
    { name: 'Ultraviolet', nameDE: 'UV', minHz: 800e12, maxHz: 30e15, color: '#8b5cf6' },
    { name: 'X-Ray', nameDE: 'Roentgen', minHz: 30e15, maxHz: 30e18, color: '#06b6d4' },
    { name: 'Gamma', nameDE: 'Gamma', minHz: 30e18, maxHz: 3e21, color: '#ec4899' }
  ];

  // Frequency range: 3 Hz to 3 PHz (3e15 Hz) - covers radio to gamma
  const MIN_FREQ = 3; // 3 Hz (ELF)
  const MAX_FREQ = 3e18; // 3 EHz (extends into gamma rays)

  // Wavelength range derived from frequency (lambda = c / f) - reactive
  let minWavelength = $derived(currentSpeedOfLight / MAX_FREQ); // ~0.1 pm
  let maxWavelength = $derived(currentSpeedOfLight / MIN_FREQ); // ~100,000 km

  // Chart margins
  const margin = { top: 50, right: 80, bottom: 70, left: 100 };

  // Computed dimensions
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom);

  // Logarithmic scales using D3
  let xScale = $derived(
    d3.scaleLog()
      .domain([MIN_FREQ, MAX_FREQ])
      .range([0, chartWidth])
      .clamp(true)
  );

  let yScale = $derived(
    d3.scaleLog()
      .domain([minWavelength, maxWavelength])
      .range([0, chartHeight])
      .clamp(true)
  );

  // Generate curve data points for lambda = c / f
  let curveData = $derived.by(() => {
    const points: { freq: number; wavelength: number }[] = [];
    const numPoints = 300;

    for (let i = 0; i <= numPoints; i++) {
      const freq = MIN_FREQ * Math.pow(MAX_FREQ / MIN_FREQ, i / numPoints);
      const wavelength = currentSpeedOfLight / freq;
      points.push({ freq, wavelength });
    }
    return points;
  });

  // Line generator
  let lineGenerator = $derived(
    d3.line<{ freq: number; wavelength: number }>()
      .x(d => xScale(d.freq))
      .y(d => yScale(d.wavelength))
  );

  // Marker position for current frequency
  let markerPosition = $derived.by(() => {
    if (!frequencyHz || frequencyHz < MIN_FREQ || frequencyHz > MAX_FREQ) return null;
    const wavelength = frequencyToWavelength(frequencyHz);
    return {
      x: xScale(frequencyHz),
      y: yScale(wavelength),
      freq: frequencyHz,
      wavelength
    };
  });

  // Format frequency with SI prefixes
  function formatFrequency(hz: number): string {
    if (hz >= 1e18) return `${(hz / 1e18).toFixed(1)} EHz`;
    if (hz >= 1e15) return `${(hz / 1e15).toFixed(1)} PHz`;
    if (hz >= 1e12) return `${(hz / 1e12).toFixed(1)} THz`;
    if (hz >= 1e9) return `${(hz / 1e9).toFixed(1)} GHz`;
    if (hz >= 1e6) return `${(hz / 1e6).toFixed(1)} MHz`;
    if (hz >= 1e3) return `${(hz / 1e3).toFixed(1)} kHz`;
    return `${hz.toFixed(0)} Hz`;
  }

  // Format wavelength with SI prefixes
  function formatWavelength(m: number): string {
    if (m >= 1e6) return `${(m / 1e6).toFixed(0)} Mm`;
    if (m >= 1e3) return `${(m / 1e3).toFixed(1)} km`;
    if (m >= 1) return `${m.toFixed(2)} m`;
    if (m >= 1e-2) return `${(m * 100).toFixed(1)} cm`;
    if (m >= 1e-3) return `${(m * 1e3).toFixed(1)} mm`;
    if (m >= 1e-6) return `${(m * 1e6).toFixed(2)} um`;
    if (m >= 1e-9) return `${(m * 1e9).toFixed(1)} nm`;
    if (m >= 1e-12) return `${(m * 1e12).toFixed(1)} pm`;
    return `${(m * 1e15).toFixed(1)} fm`;
  }

  // X-axis tick values (frequency) - logarithmic spacing
  const xTickValues = [
    1, 1e3, 1e6, 1e9, 1e12, 1e15, 1e18
  ];
  const xTickLabels = ['1 Hz', '1 kHz', '1 MHz', '1 GHz', '1 THz', '1 PHz', '1 EHz'];

  // Y-axis tick values (wavelength) - logarithmic spacing
  const yTickValues = [
    1e-12, 1e-9, 1e-6, 1e-3, 1, 1e3, 1e6, 1e8
  ];
  const yTickLabels = ['1 pm', '1 nm', '1 um', '1 mm', '1 m', '1 km', '1 Mm', '100 Mm'];

  // Determine which band a frequency belongs to
  function getBandForFrequency(hz: number): typeof emSpectrumBands[0] | null {
    for (const band of emSpectrumBands) {
      if (hz >= band.minHz && hz <= band.maxHz) {
        return band;
      }
    }
    return null;
  }

  // Current band for marker
  let currentBand = $derived(frequencyHz ? getBandForFrequency(frequencyHz) : null);
</script>

<div class="frequency-wavelength-chart w-full">
  <svg
    viewBox="0 0 {width} {height}"
    class="w-full h-auto"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <!-- Visible spectrum rainbow gradient -->
      <linearGradient id="visibleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#9400D3" />
        <stop offset="12%" stop-color="#4B0082" />
        <stop offset="25%" stop-color="#0000FF" />
        <stop offset="40%" stop-color="#00FF00" />
        <stop offset="55%" stop-color="#FFFF00" />
        <stop offset="70%" stop-color="#FF7F00" />
        <stop offset="100%" stop-color="#FF0000" />
      </linearGradient>

      <!-- Glow filter for marker -->
      <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- Drop shadow for tooltip -->
      <filter id="tooltipShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3" />
      </filter>
    </defs>

    <!-- Background -->
    <rect
      x="0"
      y="0"
      width={width}
      height={height}
      class="fill-slate-900"
    />

    <!-- Chart area -->
    <g transform="translate({margin.left}, {margin.top})">
      <!-- EM Spectrum band regions as colored backgrounds -->
      {#each emSpectrumBands as band (band.name)}
        {@const clampedMin = Math.max(MIN_FREQ, band.minHz)}
        {@const clampedMax = Math.min(MAX_FREQ, band.maxHz)}
        {@const x1 = xScale(clampedMin)}
        {@const x2 = xScale(clampedMax)}
        {@const bandWidth = x2 - x1}
        {#if bandWidth > 0}
          <rect
            x={x1}
            y="0"
            width={bandWidth}
            height={chartHeight}
            fill={band.color}
            opacity="0.2"
          />
          <!-- Band label at top -->
          {#if bandWidth > 30}
            <text
              x={x1 + bandWidth / 2}
              y="18"
              class="fill-slate-300 font-medium"
              text-anchor="middle"
              font-size="11"
            >
              {band.name}
            </text>
            <text
              x={x1 + bandWidth / 2}
              y="32"
              class="fill-slate-500"
              text-anchor="middle"
              font-size="9"
            >
              {band.nameDE}
            </text>
          {/if}
        {/if}
      {/each}

      <!-- Grid lines - vertical (frequency) -->
      {#each xTickValues as tickVal (tickVal)}
        {#if tickVal >= MIN_FREQ && tickVal <= MAX_FREQ}
          <line
            x1={xScale(tickVal)}
            y1="0"
            x2={xScale(tickVal)}
            y2={chartHeight}
            class="stroke-slate-700"
            stroke-dasharray="4,4"
            stroke-width="0.5"
          />
        {/if}
      {/each}

      <!-- Grid lines - horizontal (wavelength) -->
      {#each yTickValues as tickVal (tickVal)}
        {#if tickVal >= minWavelength && tickVal <= maxWavelength}
          <line
            x1="0"
            y1={yScale(tickVal)}
            x2={chartWidth}
            y2={yScale(tickVal)}
            class="stroke-slate-700"
            stroke-dasharray="4,4"
            stroke-width="0.5"
          />
        {/if}
      {/each}

      <!-- The inverse relationship curve: wavelength = c / frequency -->
      <path
        d={lineGenerator(curveData)}
        fill="none"
        class="stroke-cyan-400"
        stroke-width="2.5"
        stroke-linecap="round"
      />

      <!-- X-axis (Frequency) -->
      <g transform="translate(0, {chartHeight})">
        <line
          x1="0"
          y1="0"
          x2={chartWidth}
          y2="0"
          class="stroke-slate-500"
          stroke-width="1"
        />
        {#each xTickValues as tickVal, i (tickVal)}
          {#if tickVal >= MIN_FREQ && tickVal <= MAX_FREQ}
            <g transform="translate({xScale(tickVal)}, 0)">
              <line y2="8" class="stroke-slate-500" />
              <text
                y="24"
                class="fill-slate-300"
                text-anchor="middle"
                font-size="11"
              >
                {xTickLabels[i]}
              </text>
            </g>
          {/if}
        {/each}
        <!-- X-axis label -->
        <text
          x={chartWidth / 2}
          y="52"
          class="fill-slate-200"
          text-anchor="middle"
          font-size="14"
          font-weight="500"
        >
          Frequenz / Frequency
        </text>
      </g>

      <!-- Y-axis (Wavelength) -->
      <g>
        <line
          x1="0"
          y1="0"
          x2="0"
          y2={chartHeight}
          class="stroke-slate-500"
          stroke-width="1"
        />
        {#each yTickValues as tickVal, i (tickVal)}
          {#if tickVal >= minWavelength && tickVal <= maxWavelength}
            <g transform="translate(0, {yScale(tickVal)})">
              <line x2="-8" class="stroke-slate-500" />
              <text
                x="-12"
                class="fill-slate-300"
                text-anchor="end"
                dominant-baseline="middle"
                font-size="11"
              >
                {yTickLabels[i]}
              </text>
            </g>
          {/if}
        {/each}
        <!-- Y-axis label -->
        <text
          transform="rotate(-90)"
          x={-chartHeight / 2}
          y="-70"
          class="fill-slate-200"
          text-anchor="middle"
          font-size="14"
          font-weight="500"
        >
          Wellenlaenge / Wavelength
        </text>
      </g>

      <!-- Interactive marker for current frequency -->
      {#if markerPosition}
        <!-- Crosshair lines -->
        <line
          x1={markerPosition.x}
          y1="0"
          x2={markerPosition.x}
          y2={chartHeight}
          class="stroke-amber-400"
          stroke-width="1.5"
          stroke-dasharray="8,4"
          opacity="0.8"
        />
        <line
          x1="0"
          y1={markerPosition.y}
          x2={chartWidth}
          y2={markerPosition.y}
          class="stroke-amber-400"
          stroke-width="1.5"
          stroke-dasharray="8,4"
          opacity="0.8"
        />

        <!-- Marker dot with glow effect -->
        <circle
          cx={markerPosition.x}
          cy={markerPosition.y}
          r="10"
          class="fill-amber-400"
          filter="url(#markerGlow)"
        />
        <circle
          cx={markerPosition.x}
          cy={markerPosition.y}
          r="5"
          class="fill-amber-200"
        />

        <!-- Tooltip with frequency and wavelength info -->
        {@const tooltipWidth = 160}
        {@const tooltipHeight = currentBand ? 70 : 55}
        {@const tooltipX = markerPosition.x > chartWidth / 2 ? markerPosition.x - tooltipWidth - 15 : markerPosition.x + 15}
        {@const tooltipY = markerPosition.y > chartHeight / 2 ? markerPosition.y - tooltipHeight - 10 : markerPosition.y + 10}
        <g transform="translate({tooltipX}, {tooltipY})" filter="url(#tooltipShadow)">
          <rect
            x="0"
            y="0"
            width={tooltipWidth}
            height={tooltipHeight}
            rx="6"
            class="fill-slate-800"
            stroke="#475569"
            stroke-width="1"
          />
          <text x="12" y="20" class="fill-slate-200 font-medium" font-size="12">
            f = {formatFrequency(markerPosition.freq)}
          </text>
          <text x="12" y="38" class="fill-slate-200 font-medium" font-size="12">
            λ = {formatWavelength(markerPosition.wavelength)}
          </text>
          {#if currentBand}
            <text x="12" y="56" class="fill-slate-400" font-size="10">
              Band: {currentBand.name} ({currentBand.nameDE})
            </text>
          {/if}
        </g>
      {/if}

      <!-- Chart title -->
      <text
        x={chartWidth / 2}
        y="-25"
        class="fill-slate-100"
        text-anchor="middle"
        font-size="18"
        font-weight="600"
      >
        Elektromagnetisches Spektrum - Frequenz/Wellenlaenge (λ = c / f)
      </text>
    </g>

    <!-- Legend -->
    <g transform="translate({width - margin.right + 10}, {margin.top})">
      <text class="fill-slate-300 font-medium" font-size="11" y="0">
        EM-Bereiche
      </text>
      {#each emSpectrumBands as band, i (band.name)}
        <g transform="translate(0, {20 + i * 22})">
          <rect
            x="0"
            y="0"
            width="14"
            height="14"
            rx="2"
            fill={band.name === 'Visible' ? '#22c55e' : band.color}
            opacity="0.8"
          />
          <text
            x="20"
            y="11"
            class="fill-slate-400"
            font-size="9"
          >
            {band.name}
          </text>
        </g>
      {/each}
    </g>
  </svg>
</div>

<style>
  .frequency-wavelength-chart {
    container-type: inline-size;
  }
</style>
