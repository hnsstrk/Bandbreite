<script lang="ts">
  import * as d3 from 'd3';
  import { calculateFSPL, calculateRange, frequencyToWavelength } from '$lib/utils/calculations';
  import { convertToHz, convertFromHz, wattToDbm, dbmToWatt } from '$lib/utils/conversions';
  import { FREQUENCY_UNITS } from '$lib/data/units';

  interface Props {
    frequencyHz?: number | null;
    width?: number;
    height?: number;
  }

  let { frequencyHz = null, width = 900, height = 450 }: Props = $props();

  // Chart margins
  const margin = { top: 40, right: 100, bottom: 60, left: 70 };

  // Input state
  let inputFrequency = $state(2.4);
  let inputFrequencyUnit = $state('GHz');
  let inputDistance = $state(100);
  let inputDistanceUnit = $state('m');
  let showMultipleFrequencies = $state(true);

  // Distance unit factors
  const DISTANCE_UNITS = [
    { id: 'm', symbol: 'm', factor: 1 },
    { id: 'km', symbol: 'km', factor: 1000 },
    { id: 'mi', symbol: 'mi', factor: 1609.344 },
    { id: 'ft', symbol: 'ft', factor: 0.3048 },
  ];

  // Quick frequency presets
  const frequencyPresets = [
    { label: '433 MHz', hz: 433e6, desc: 'ISM/LoRa' },
    { label: '868 MHz', hz: 868e6, desc: 'LoRa EU' },
    { label: '915 MHz', hz: 915e6, desc: 'LoRa US' },
    { label: '2.4 GHz', hz: 2.4e9, desc: 'WLAN/BT' },
    { label: '5 GHz', hz: 5e9, desc: 'WLAN 5' },
    { label: '5.8 GHz', hz: 5.8e9, desc: 'FPV/ISM' },
    { label: '28 GHz', hz: 28e9, desc: '5G mmWave' },
    { label: '60 GHz', hz: 60e9, desc: 'WiGig' },
    { label: '77 GHz', hz: 77e9, desc: 'Kfz-Radar' },
  ];

  // Reference frequencies for multi-line chart
  const chartFrequencies = [
    { hz: 433e6, label: '433 MHz', color: '#22c55e' },
    { hz: 868e6, label: '868 MHz', color: '#84cc16' },
    { hz: 2.4e9, label: '2.4 GHz', color: '#3b82f6' },
    { hz: 5e9, label: '5 GHz', color: '#8b5cf6' },
    { hz: 28e9, label: '28 GHz', color: '#f97316' },
    { hz: 60e9, label: '60 GHz', color: '#ef4444' },
  ];

  // Derived frequency in Hz
  let currentFrequencyHz = $derived(
    frequencyHz ?? convertToHz(inputFrequency, inputFrequencyUnit)
  );

  // Derived distance in meters
  let currentDistanceM = $derived(
    inputDistance * (DISTANCE_UNITS.find(u => u.id === inputDistanceUnit)?.factor ?? 1)
  );

  // Calculated FSPL
  let fsplDb = $derived(
    currentFrequencyHz > 0 && currentDistanceM > 0
      ? calculateFSPL(currentDistanceM, currentFrequencyHz)
      : null
  );

  // Wavelength
  let wavelengthM = $derived(
    currentFrequencyHz > 0 ? frequencyToWavelength(currentFrequencyHz) : null
  );

  // Chart dimensions
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom);

  // Distance range for chart (logarithmic: 1m to 100km)
  const MIN_DISTANCE = 1;
  const MAX_DISTANCE = 100000;

  // FSPL range for chart
  const MIN_FSPL = 20;
  const MAX_FSPL = 180;

  // D3 scales
  let xScale = $derived(
    d3.scaleLog()
      .domain([MIN_DISTANCE, MAX_DISTANCE])
      .range([0, chartWidth])
  );

  let yScale = $derived(
    d3.scaleLinear()
      .domain([MIN_FSPL, MAX_FSPL])
      .range([0, chartHeight])
  );

  // Generate line data for a specific frequency
  function generateLineData(freqHz: number): { distance: number; fspl: number }[] {
    const points: { distance: number; fspl: number }[] = [];
    const numPoints = 200;
    const logMin = Math.log10(MIN_DISTANCE);
    const logMax = Math.log10(MAX_DISTANCE);

    for (let i = 0; i <= numPoints; i++) {
      const logDist = logMin + (logMax - logMin) * (i / numPoints);
      const distance = Math.pow(10, logDist);
      const fspl = calculateFSPL(distance, freqHz);
      if (fspl >= MIN_FSPL && fspl <= MAX_FSPL) {
        points.push({ distance, fspl });
      }
    }
    return points;
  }

  // Line generator
  let lineGenerator = $derived(
    d3.line<{ distance: number; fspl: number }>()
      .x(d => xScale(d.distance))
      .y(d => yScale(d.fspl))
  );

  // Chart line paths
  let chartLines = $derived(
    chartFrequencies.map(freq => ({
      ...freq,
      path: lineGenerator(generateLineData(freq.hz))
    }))
  );

  // Current frequency line (if different from presets)
  let currentFreqLine = $derived.by(() => {
    if (!currentFrequencyHz || currentFrequencyHz <= 0) return null;
    // Check if current frequency is close to a preset
    const isPreset = chartFrequencies.some(f =>
      Math.abs(f.hz - currentFrequencyHz) / currentFrequencyHz < 0.05
    );
    if (isPreset) return null;
    return {
      hz: currentFrequencyHz,
      label: formatFrequency(currentFrequencyHz),
      color: '#fbbf24',
      path: lineGenerator(generateLineData(currentFrequencyHz))
    };
  });

  // Marker position
  let markerPos = $derived.by(() => {
    if (!fsplDb || currentDistanceM <= 0) return null;
    const x = xScale(Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, currentDistanceM)));
    const y = yScale(Math.max(MIN_FSPL, Math.min(MAX_FSPL, fsplDb)));
    return { x, y };
  });

  // X-axis ticks
  const xTickValues = [1, 10, 100, 1000, 10000, 100000];

  // Y-axis ticks
  const yTickValues = [20, 40, 60, 80, 100, 120, 140, 160, 180];

  // Format frequency for display
  function formatFrequency(hz: number): string {
    if (hz >= 1e9) return `${(hz / 1e9).toFixed(1)} GHz`;
    if (hz >= 1e6) return `${(hz / 1e6).toFixed(1)} MHz`;
    if (hz >= 1e3) return `${(hz / 1e3).toFixed(1)} kHz`;
    return `${hz.toFixed(0)} Hz`;
  }

  // Format distance for display
  function formatDistance(m: number): string {
    if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
    return `${m.toFixed(0)} m`;
  }

  // Format wavelength
  function formatWavelength(m: number): string {
    if (m >= 1) return `${m.toFixed(2)} m`;
    if (m >= 0.01) return `${(m * 100).toFixed(2)} cm`;
    if (m >= 0.001) return `${(m * 1000).toFixed(2)} mm`;
    return `${(m * 1e6).toFixed(2)} \u03BCm`;
  }

  // Event handlers
  function handleFrequencyInput(e: Event) {
    const target = e.target as HTMLInputElement;
    inputFrequency = target.value ? parseFloat(target.value) : 0;
  }

  function handleFrequencyUnitChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    inputFrequencyUnit = target.value;
  }

  function handleDistanceInput(e: Event) {
    const target = e.target as HTMLInputElement;
    inputDistance = target.value ? parseFloat(target.value) : 0;
  }

  function handleDistanceUnitChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    inputDistanceUnit = target.value;
  }

  function setPresetFrequency(hz: number) {
    inputFrequency = hz / 1e9;
    inputFrequencyUnit = 'GHz';
  }

  // Sync with external frequencyHz prop
  $effect(() => {
    if (frequencyHz !== null && frequencyHz !== undefined && frequencyHz > 0) {
      // Update internal state to match external prop
      if (frequencyHz >= 1e9) {
        inputFrequency = frequencyHz / 1e9;
        inputFrequencyUnit = 'GHz';
      } else if (frequencyHz >= 1e6) {
        inputFrequency = frequencyHz / 1e6;
        inputFrequencyUnit = 'MHz';
      } else if (frequencyHz >= 1e3) {
        inputFrequency = frequencyHz / 1e3;
        inputFrequencyUnit = 'kHz';
      } else {
        inputFrequency = frequencyHz;
        inputFrequencyUnit = 'Hz';
      }
    }
  });
</script>

<div class="card">
  <h3 class="text-heading-3 mb-4">Free Space Path Loss (FSPL) Kalkulator</h3>

  <!-- Input Section -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    <!-- Frequency Input -->
    <div class="space-y-2">
      <label class="text-label">Frequenz</label>
      <div class="flex items-center gap-2">
        <input
          type="number"
          value={inputFrequency}
          oninput={handleFrequencyInput}
          class="input-field flex-1"
          placeholder="Frequenz"
          step="any"
          min="0"
        />
        <select
          value={inputFrequencyUnit}
          onchange={handleFrequencyUnitChange}
          class="select-field"
        >
          {#each FREQUENCY_UNITS as unit (unit.id)}
            <option value={unit.id}>{unit.symbol}</option>
          {/each}
        </select>
      </div>
      <!-- Quick Presets -->
      <div class="flex flex-wrap gap-1 mt-2">
        {#each frequencyPresets as preset (preset.label)}
          <button
            type="button"
            onclick={() => setPresetFrequency(preset.hz)}
            class="btn-chip"
            title={preset.desc}
          >
            {preset.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Distance Input -->
    <div class="space-y-2">
      <label class="text-label">Distanz</label>
      <div class="flex items-center gap-2">
        <input
          type="number"
          value={inputDistance}
          oninput={handleDistanceInput}
          class="input-field flex-1"
          placeholder="Distanz"
          step="any"
          min="0"
        />
        <select
          value={inputDistanceUnit}
          onchange={handleDistanceUnitChange}
          class="select-field"
        >
          {#each DISTANCE_UNITS as unit (unit.id)}
            <option value={unit.id}>{unit.symbol}</option>
          {/each}
        </select>
      </div>
      <!-- Quick Distance Presets -->
      <div class="flex flex-wrap gap-1 mt-2">
        {#each [10, 50, 100, 500, 1000, 5000, 10000] as dist (dist)}
          <button
            type="button"
            onclick={() => { inputDistance = dist; inputDistanceUnit = 'm'; }}
            class="btn-chip"
          >
            {dist >= 1000 ? `${dist/1000} km` : `${dist} m`}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Results Section -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <!-- FSPL Result -->
    <div class="result-box">
      <div class="result-label">FSPL</div>
      <div class="text-2xl font-bold text-blue-500 dark:text-blue-400">
        {fsplDb !== null ? fsplDb.toFixed(2) : '—'} <span class="text-lg result-label">dB</span>
      </div>
    </div>

    <!-- Wavelength -->
    <div class="result-box">
      <div class="result-label">Wellenlänge</div>
      <div class="text-2xl font-bold text-green-600 dark:text-green-400">
        {wavelengthM !== null ? formatWavelength(wavelengthM) : '—'}
      </div>
    </div>

    <!-- Effective Distance -->
    <div class="result-box">
      <div class="result-label">Distanz</div>
      <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">
        {currentDistanceM > 0 ? formatDistance(currentDistanceM) : '—'}
      </div>
    </div>
  </div>

  <!-- Formula Display -->
  <div class="formula-box">
    <div class="text-xs text-muted mb-1">Formel:</div>
    <div class="font-mono text-sm text-primary text-center">
      FSPL(dB) = 20·log<sub>10</sub>(d) + 20·log<sub>10</sub>(f) + 20·log<sub>10</sub>(4&#960;/c) = 20·log<sub>10</sub>(d) + 20·log<sub>10</sub>(f) - 147,55
    </div>
  </div>

  <!-- Chart Toggle -->
  <div class="flex items-center justify-between mb-4">
    <h4 class="text-label">FSPL vs. Distanz</h4>
    <label class="flex items-center gap-2 text-sm text-secondary cursor-pointer">
      <input
        type="checkbox"
        bind:checked={showMultipleFrequencies}
        class="checkbox"
      />
      Vergleichskurven anzeigen
    </label>
  </div>

  <!-- Chart -->
  <div class="w-full overflow-x-auto">
    <svg
      viewBox="0 0 {width} {height}"
      class="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="fsplMarkerGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Background -->
      <rect x="0" y="0" width={width} height={height} style="fill: var(--color-chart-bg)" />

      <!-- Chart Area -->
      <g transform="translate({margin.left}, {margin.top})">
        <!-- Grid lines - vertical (distance) -->
        {#each xTickValues as tickVal (tickVal)}
          <line
            x1={xScale(tickVal)}
            y1="0"
            x2={xScale(tickVal)}
            y2={chartHeight}
            style="stroke: var(--color-chart-grid)"
            stroke-dasharray="4,4"
            stroke-width="0.5"
          />
        {/each}

        <!-- Grid lines - horizontal (FSPL) -->
        {#each yTickValues as tickVal (tickVal)}
          <line
            x1="0"
            y1={yScale(tickVal)}
            x2={chartWidth}
            y2={yScale(tickVal)}
            style="stroke: var(--color-chart-grid)"
            stroke-dasharray="4,4"
            stroke-width="0.5"
          />
        {/each}

        <!-- Reference frequency lines -->
        {#if showMultipleFrequencies}
          {#each chartLines as line (line.hz)}
            <path
              d={line.path}
              fill="none"
              stroke={line.color}
              stroke-width="2"
              opacity="0.7"
            />
          {/each}
        {/if}

        <!-- Current frequency line (highlighted) -->
        {#if currentFreqLine}
          <path
            d={currentFreqLine.path}
            fill="none"
            stroke={currentFreqLine.color}
            stroke-width="3"
          />
        {/if}

        <!-- Marker for current calculation -->
        {#if markerPos}
          <!-- Crosshair -->
          <line
            x1={markerPos.x}
            y1="0"
            x2={markerPos.x}
            y2={chartHeight}
            class="stroke-amber-400"
            stroke-width="1.5"
            stroke-dasharray="8,4"
            opacity="0.8"
          />
          <line
            x1="0"
            y1={markerPos.y}
            x2={chartWidth}
            y2={markerPos.y}
            class="stroke-amber-400"
            stroke-width="1.5"
            stroke-dasharray="8,4"
            opacity="0.8"
          />

          <!-- Marker dot -->
          <circle
            cx={markerPos.x}
            cy={markerPos.y}
            r="10"
            class="fill-amber-400"
            filter="url(#fsplMarkerGlow)"
          />
          <circle
            cx={markerPos.x}
            cy={markerPos.y}
            r="5"
            class="fill-amber-200"
          />

          <!-- Value label -->
          <g transform="translate({markerPos.x + (markerPos.x > chartWidth / 2 ? -80 : 10)}, {markerPos.y + (markerPos.y > chartHeight / 2 ? -40 : 10)})">
            <rect
              x="0"
              y="0"
              width="70"
              height="32"
              rx="4"
              style="fill: var(--color-chart-tooltip-bg); stroke: var(--color-chart-tooltip-border)"
              stroke-width="1"
            />
            <text x="8" y="14" style="fill: var(--color-chart-text)" font-size="10">
              {formatFrequency(currentFrequencyHz)}
            </text>
            <text x="8" y="26" class="fill-amber-400 font-bold" font-size="11">
              {fsplDb?.toFixed(1)} dB
            </text>
          </g>
        {/if}

        <!-- X-axis (Distance) -->
        <g transform="translate(0, {chartHeight})">
          <line x1="0" y1="0" x2={chartWidth} y2="0" style="stroke: var(--color-chart-axis)" stroke-width="1" />
          {#each xTickValues as tickVal (tickVal)}
            <g transform="translate({xScale(tickVal)}, 0)">
              <line y2="8" style="stroke: var(--color-chart-axis)" />
              <text y="24" style="fill: var(--color-chart-text-secondary)" text-anchor="middle" font-size="11">
                {tickVal >= 1000 ? `${tickVal / 1000} km` : `${tickVal} m`}
              </text>
            </g>
          {/each}
          <text x={chartWidth / 2} y="48" style="fill: var(--color-chart-text)" text-anchor="middle" font-size="13" font-weight="500">
            Distanz (log)
          </text>
        </g>

        <!-- Y-axis (FSPL) -->
        <g>
          <line x1="0" y1="0" x2="0" y2={chartHeight} style="stroke: var(--color-chart-axis)" stroke-width="1" />
          {#each yTickValues as tickVal (tickVal)}
            <g transform="translate(0, {yScale(tickVal)})">
              <line x2="-8" style="stroke: var(--color-chart-axis)" />
              <text x="-12" style="fill: var(--color-chart-text-secondary)" text-anchor="end" dominant-baseline="middle" font-size="11">
                {tickVal}
              </text>
            </g>
          {/each}
          <text
            transform="rotate(-90)"
            x={-chartHeight / 2}
            y="-50"
            style="fill: var(--color-chart-text)"
            text-anchor="middle"
            font-size="13"
            font-weight="500"
          >
            FSPL (dB)
          </text>
        </g>

      </g>

      <!-- Legend -->
      {#if showMultipleFrequencies}
        <g transform="translate({width - margin.right + 10}, {margin.top})">
          <text style="fill: var(--color-chart-text)" font-weight="500" font-size="11" y="0">
            Frequenzen
          </text>
          {#each chartFrequencies as freq, i (freq.hz)}
            <g transform="translate(0, {15 + i * 18})">
              <line x1="0" y1="0" x2="20" y2="0" stroke={freq.color} stroke-width="2" />
              <text x="26" y="4" style="fill: var(--color-chart-text-secondary)" font-size="10">{freq.label}</text>
            </g>
          {/each}
          {#if currentFreqLine}
            <g transform="translate(0, {15 + chartFrequencies.length * 18})">
              <line x1="0" y1="0" x2="20" y2="0" stroke={currentFreqLine.color} stroke-width="3" />
              <text x="26" y="4" fill="#fbbf24" font-weight="500" font-size="10">Aktuell</text>
            </g>
          {/if}
        </g>
      {/if}
    </svg>
  </div>

  <!-- Additional Info -->
  <div class="mt-4 text-xs text-muted">
    <p>
      Die Freiraumdämpfung (FSPL) beschreibt den Signalverlust einer elektromagnetischen Welle
      im freien Raum ohne Hindernisse. Sie steigt quadratisch mit Frequenz und Distanz an.
    </p>
  </div>
</div>
