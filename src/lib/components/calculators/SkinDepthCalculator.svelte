<script lang="ts">
  import * as d3 from 'd3';
  import {
    calculateSkinDepth,
    SEAWATER_CONDUCTIVITY,
    SEAWATER_PENETRATION,
    VACUUM_PERMEABILITY
  } from '$lib/data/constants';
  import { formatFrequency, formatNumber, formatDistance } from '$lib/utils/formatting';
  import { parseNumericInput, clamp } from '$lib/utils/handlers';
  import InfoTooltip from '$lib/components/ui/InfoTooltip.svelte';

  interface Props {
    width?: number;
    height?: number;
  }

  let { width = 900, height = 400 }: Props = $props();

  // Input state
  let frequencyHz = $state(10000);
  let conductivity = $state<number>(SEAWATER_CONDUCTIVITY);
  let selectedMedium = $state('seawater');

  // Chart margins
  const margin = { top: 40, right: 120, bottom: 60, left: 80 };

  // Computed dimensions
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom);

  // Medium presets
  const mediumPresets = [
    { id: 'seawater', name: 'Seewasser', nameDE: 'Seewasser', conductivity: 4, color: '#3b82f6' },
    { id: 'freshwater', name: 'Fresh Water', nameDE: 'Suesswasser', conductivity: 0.01, color: '#22c55e' },
    { id: 'wet-earth', name: 'Wet Earth', nameDE: 'Feuchte Erde', conductivity: 0.1, color: '#8b5cf6' },
    { id: 'dry-earth', name: 'Dry Earth', nameDE: 'Trockene Erde', conductivity: 0.001, color: '#f97316' },
    { id: 'copper', name: 'Copper', nameDE: 'Kupfer', conductivity: 5.96e7, color: '#ef4444' },
    { id: 'aluminum', name: 'Aluminum', nameDE: 'Aluminium', conductivity: 3.5e7, color: '#6b7280' },
  ];

  // Frequency presets for VLF/ELF
  const frequencyPresets = [
    { label: '3 Hz', hz: 3, desc: 'ELF - U-Boot tief' },
    { label: '30 Hz', hz: 30, desc: 'ELF - Sanguine' },
    { label: '300 Hz', hz: 300, desc: 'ULF' },
    { label: '3 kHz', hz: 3000, desc: 'VLF unten' },
    { label: '10 kHz', hz: 10000, desc: 'VLF typisch' },
    { label: '30 kHz', hz: 30000, desc: 'VLF oben' },
    { label: '77.5 kHz', hz: 77500, desc: 'DCF77' },
  ];

  // Calculate skin depth
  let skinDepthM = $derived(
    frequencyHz > 0 && conductivity > 0
      ? calculateSkinDepth(frequencyHz, conductivity)
      : 0
  );

  // Practical communication depth (approx. 2-3 skin depths)
  let practicalDepthM = $derived(skinDepthM * 2.5);

  // Find closest reference value from SEAWATER_PENETRATION
  let referenceData = $derived.by(() => {
    if (selectedMedium !== 'seawater') return null;

    const closest = SEAWATER_PENETRATION.reduce((prev, curr) =>
      Math.abs(curr.frequencyHz - frequencyHz) < Math.abs(prev.frequencyHz - frequencyHz)
        ? curr
        : prev
    );

    // Only return if reasonably close
    if (frequencyHz > 0 && Math.abs(closest.frequencyHz - frequencyHz) / frequencyHz < 0.5) {
      return closest;
    }
    return null;
  });

  // Generate curve data for different media
  let curveData = $derived.by(() => {
    const data: { frequency: number; depth: number; medium: string; color: string }[] = [];

    for (const medium of mediumPresets.filter(m => m.id !== 'copper' && m.id !== 'aluminum')) {
      for (let logF = 0; logF <= 5; logF += 0.1) {
        const freq = Math.pow(10, logF);
        const depth = calculateSkinDepth(freq, medium.conductivity);
        if (depth > 0 && depth < 10000) {
          data.push({
            frequency: freq,
            depth,
            medium: medium.id,
            color: medium.color
          });
        }
      }
    }

    return data;
  });

  // Group curve data by medium
  let curvesByMedium = $derived.by(() => {
    const grouped: Record<string, { frequency: number; depth: number }[]> = {};
    for (const point of curveData) {
      if (!grouped[point.medium]) {
        grouped[point.medium] = [];
      }
      grouped[point.medium].push({ frequency: point.frequency, depth: point.depth });
    }
    return grouped;
  });

  // D3 scales
  let xScale = $derived(
    d3.scaleLog()
      .domain([1, 100000])
      .range([0, chartWidth])
  );

  let yScale = $derived(
    d3.scaleLog()
      .domain([0.1, 1000])
      .range([chartHeight, 0])
  );

  // Line generator
  let lineGenerator = $derived(
    d3.line<{ frequency: number; depth: number }>()
      .x(d => xScale(d.frequency))
      .y(d => yScale(Math.max(0.1, Math.min(1000, d.depth))))
  );

  // Current marker position
  let markerPos = $derived({
    x: xScale(clamp(frequencyHz, 1, 100000)),
    y: yScale(clamp(skinDepthM, 0.1, 1000))
  });

  // X-axis ticks
  const xTickValues = [1, 10, 100, 1000, 10000, 100000];

  // Y-axis ticks
  const yTickValues = [0.1, 1, 10, 100, 1000];

  // Event handlers
  function handleFrequencyInput(e: Event) {
    frequencyHz = clamp(parseNumericInput(e, 1), 1, 1e9);
  }

  function handleConductivityInput(e: Event) {
    const newValue = clamp(parseNumericInput(e, 0.001), 1e-6, 1e8);
    conductivity = newValue;
    selectedMedium = 'custom';
  }

  function setMedium(medium: typeof mediumPresets[0]) {
    selectedMedium = medium.id;
    conductivity = medium.conductivity;
  }

  function setFrequencyPreset(hz: number) {
    frequencyHz = hz;
  }
</script>

<div class="card">
  <h3 class="text-heading-3 mb-4">Skin-Depth / Eindringtiefe</h3>

  <!-- Input Section -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    <!-- Frequency Input -->
    <div class="space-y-2">
      <label for="skin-frequency" class="text-label">
        Frequenz
        <InfoTooltip
          title="Frequenz"
          short="Frequenz des elektromagnetischen Signals"
          detailed="Bei niedrigeren Frequenzen ist die Eindringtiefe größer. ELF/VLF (3 Hz - 30 kHz) wird für U-Boot-Kommunikation genutzt."
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="skin-frequency"
          type="number"
          value={frequencyHz}
          oninput={handleFrequencyInput}
          class="input-field flex-1"
          step="any"
          min="1"
        />
        <span class="text-secondary text-sm w-8">Hz</span>
      </div>
      <div class="text-xs text-muted">
        = {formatFrequency(frequencyHz)}
      </div>
      <div class="flex flex-wrap gap-1">
        {#each frequencyPresets as preset (preset.hz)}
          <button
            type="button"
            onclick={() => setFrequencyPreset(preset.hz)}
            class="btn-chip"
            title={preset.desc}
          >
            {preset.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Medium Selection -->
    <div class="space-y-2">
      <label for="skin-conductivity" class="text-label">
        Leitfähigkeit (sigma)
        <InfoTooltip
          title="Elektrische Leitfähigkeit"
          short="Leitfähigkeit des Mediums in S/m"
          detailed="Seewasser: 4 S/m, Suesswasser: 0.01 S/m, feuchte Erde: 0.1 S/m, trockene Erde: 0.001 S/m"
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="skin-conductivity"
          type="number"
          value={conductivity}
          oninput={handleConductivityInput}
          class="input-field flex-1"
          step="any"
          min="0.000001"
        />
        <span class="text-secondary text-sm w-12">S/m</span>
      </div>
      <div class="flex flex-wrap gap-1 mt-2">
        {#each mediumPresets.slice(0, 4) as medium (medium.id)}
          <button
            type="button"
            onclick={() => setMedium(medium)}
            class="btn-chip {selectedMedium === medium.id ? 'btn-chip-active' : ''}"
            style={selectedMedium === medium.id ? `background-color: ${medium.color}; color: white;` : ''}
          >
            {medium.nameDE}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Results Section -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <!-- Skin Depth -->
    <div class="result-box">
      <div class="result-label">
        Skin-Depth (delta)
        <InfoTooltip
          title="Skin-Depth"
          short="Tiefe, bei der Amplitude auf 1/e (37%) abfällt"
          detailed="Die Eindringtiefe oder Skin-Depth ist die Tiefe, in der die Feldstärke auf 37% des Oberflaechenwerts abgefallen ist."
        />
      </div>
      <div class="text-2xl font-bold text-blue-500 dark:text-blue-400">
        {skinDepthM > 0 ? (skinDepthM >= 1 ? formatDistance(skinDepthM) : `${formatNumber(skinDepthM * 100, 2)} cm`) : '—'}
      </div>
    </div>

    <!-- Practical Depth -->
    <div class="result-box">
      <div class="result-label">
        Praktische Kommunikationstiefe
        <InfoTooltip
          title="Praktische Tiefe"
          short="Nutzbare Tiefe für Kommunikation (~2.5 delta)"
          detailed="Die praktische Kommunikationstiefe entspricht etwa 2-3 Skin-Depths. Darunter ist das Signal zu stark gedämpft."
        />
      </div>
      <div class="text-2xl font-bold text-green-600 dark:text-green-400">
        {practicalDepthM > 0 ? (practicalDepthM >= 1 ? formatDistance(practicalDepthM) : `${formatNumber(practicalDepthM * 100, 2)} cm`) : '—'}
      </div>
    </div>

    <!-- Signal at 2*delta -->
    <div class="result-box">
      <div class="result-label">Signal bei 2*delta</div>
      <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">
        ~13.5%
      </div>
      <div class="text-xs text-muted">
        e<sup>-2</sup> = 0.135
      </div>
    </div>
  </div>

  <!-- Reference Data (for seawater) -->
  {#if referenceData}
    <div class="p-4 bg-surface-secondary rounded-lg mb-6">
      <div class="text-label mb-2">Referenzdaten ({formatFrequency(referenceData.frequencyHz)})</div>
      <div class="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span class="text-muted">Ref. Skin-Depth:</span>
          <span class="font-medium ml-1">{formatNumber(referenceData.skinDepthM, 1)} m</span>
        </div>
        <div>
          <span class="text-muted">Ref. Prakt. Tiefe:</span>
          <span class="font-medium ml-1">{formatNumber(referenceData.practicalDepthM, 0)} m</span>
        </div>
        <div>
          <span class="text-muted">Hinweis:</span>
          <span class="text-secondary ml-1">{referenceData.notes}</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Chart -->
  <div class="w-full overflow-x-auto">
    <svg
      viewBox="0 0 {width} {height}"
      class="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Skin-Depth Diagramm: Eindringtiefe über Frequenz für verschiedene Medien"
    >
      <defs>
        <filter id="skinMarkerGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Background -->
      <rect x="0" y="0" width={width} height={height} style="fill: var(--color-chart-bg)" />

      <!-- Chart area -->
      <g transform="translate({margin.left}, {margin.top})">
        <!-- Grid lines -->
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

        <!-- Medium curves -->
        {#each mediumPresets.filter(m => m.id !== 'copper' && m.id !== 'aluminum') as medium (medium.id)}
          {#if curvesByMedium[medium.id]}
            <path
              d={lineGenerator(curvesByMedium[medium.id])}
              fill="none"
              stroke={medium.color}
              stroke-width={selectedMedium === medium.id ? 3 : 1.5}
              opacity={selectedMedium === medium.id ? 1 : 0.5}
            />
          {/if}
        {/each}

        <!-- Current marker -->
        {#if skinDepthM > 0.1 && skinDepthM < 1000}
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
          <circle
            cx={markerPos.x}
            cy={markerPos.y}
            r="10"
            class="fill-amber-400"
            filter="url(#skinMarkerGlow)"
          />
          <circle
            cx={markerPos.x}
            cy={markerPos.y}
            r="5"
            class="fill-amber-200"
          />
        {/if}

        <!-- X-axis -->
        <g transform="translate(0, {chartHeight})">
          <line x1="0" y1="0" x2={chartWidth} y2="0" style="stroke: var(--color-chart-axis)" />
          {#each xTickValues as tickVal (tickVal)}
            <g transform="translate({xScale(tickVal)}, 0)">
              <line y2="8" style="stroke: var(--color-chart-axis)" />
              <text y="24" style="fill: var(--color-chart-text-secondary)" text-anchor="middle" font-size="10">
                {formatFrequency(tickVal, 0)}
              </text>
            </g>
          {/each}
          <text
            x={chartWidth / 2}
            y="48"
            style="fill: var(--color-chart-text)"
            text-anchor="middle"
            font-size="13"
            font-weight="500"
          >
            Frequenz (log)
          </text>
        </g>

        <!-- Y-axis -->
        <g>
          <line x1="0" y1="0" x2="0" y2={chartHeight} style="stroke: var(--color-chart-axis)" />
          {#each yTickValues as tickVal (tickVal)}
            <g transform="translate(0, {yScale(tickVal)})">
              <line x2="-8" style="stroke: var(--color-chart-axis)" />
              <text x="-12" style="fill: var(--color-chart-text-secondary)" text-anchor="end" dominant-baseline="middle" font-size="10">
                {tickVal >= 1 ? tickVal : tickVal} m
              </text>
            </g>
          {/each}
          <text
            transform="rotate(-90)"
            x={-chartHeight / 2}
            y="-55"
            style="fill: var(--color-chart-text)"
            text-anchor="middle"
            font-size="13"
            font-weight="500"
          >
            Skin-Depth (m, log)
          </text>
        </g>
      </g>

      <!-- Legend -->
      <g transform="translate({width - margin.right + 10}, {margin.top})">
        <text style="fill: var(--color-chart-text)" font-weight="500" font-size="11">
          Medien
        </text>
        {#each mediumPresets.filter(m => m.id !== 'copper' && m.id !== 'aluminum') as medium, i (medium.id)}
          <g transform="translate(0, {18 + i * 22})">
            <line x1="0" y1="0" x2="20" y2="0" stroke={medium.color} stroke-width="2" />
            <text x="26" y="4" style="fill: var(--color-chart-text-secondary)" font-size="10">
              {medium.nameDE}
            </text>
          </g>
        {/each}
      </g>
    </svg>
  </div>

  <!-- Formula Display -->
  <div class="formula-box mt-4">
    <div class="text-xs text-muted mb-1">Skin-Depth Formel:</div>
    <div class="font-mono text-sm text-primary text-center">
      delta = sqrt(2 / (omega * mu * sigma)) = sqrt(2 / (2*pi*f * mu<sub>0</sub> * sigma))
    </div>
    <div class="text-xs text-muted mt-2 text-center">
      mit mu<sub>0</sub> = 4*pi*10<sup>-7</sup> H/m (Vakuumpermeabilitaet)
    </div>
  </div>

  <!-- Explanation -->
  <div class="mt-4 p-4 bg-surface-secondary rounded-lg text-sm text-secondary">
    <p class="mb-2">
      <strong>U-Boot-Kommunikation:</strong> U-Boote können nur bei sehr niedrigen Frequenzen (ELF/VLF)
      in getauchtem Zustand empfangen. Bei 76 Hz (US Navy ELF) betraegt die Skin-Depth in Seewasser
      ca. 46 m, was eine praktische Empfangstiefe von ~100 m ermöglicht.
    </p>
    <p>
      <strong>Nachteile:</strong> Die extrem niedrige Frequenz bedeutet auch extrem geringe Datenraten
      (typisch &lt; 1 bit/min bei ELF). Daher werden diese Systeme nur für einfache Befehle verwendet.
    </p>
  </div>
</div>

<style>
  .btn-chip-active {
    box-shadow: 0 0 0 2px white, 0 0 0 4px #3b82f6;
  }
</style>
