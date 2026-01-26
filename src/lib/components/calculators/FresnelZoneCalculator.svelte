<script lang="ts">
  import * as d3 from 'd3';
  import { frequencyToWavelength } from '$lib/utils/calculations';
  import { convertToHz } from '$lib/utils/conversions';
  import { FREQUENCY_UNITS, DISTANCE_UNITS } from '$lib/data/units';
  import { formatFrequency, formatDistance, formatNumber } from '$lib/utils/formatting';
  import { parseNumericInput, parseSelectValue, safeDivide, clamp } from '$lib/utils/handlers';
  import InfoTooltip from '$lib/components/ui/InfoTooltip.svelte';

  interface Props {
    width?: number;
    height?: number;
  }

  let { width = 900, height = 400 }: Props = $props();

  // Input state
  let inputFrequency = $state(5.8);
  let inputFrequencyUnit = $state('GHz');
  let totalDistanceKm = $state(10);
  let obstaclePositionKm = $state(5);

  // Chart margins
  const margin = { top: 60, right: 40, bottom: 60, left: 60 };

  // Computed dimensions
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom);

  // Frequency presets
  const frequencyPresets = [
    { label: '900 MHz', hz: 900e6, desc: 'GSM/LTE' },
    { label: '2.4 GHz', hz: 2.4e9, desc: 'WLAN' },
    { label: '5 GHz', hz: 5e9, desc: 'WLAN 5' },
    { label: '5.8 GHz', hz: 5.8e9, desc: 'FPV/ISM' },
    { label: '10 GHz', hz: 10e9, desc: 'Richtfunk' },
    { label: '18 GHz', hz: 18e9, desc: 'Richtfunk' },
  ];

  // Distance presets
  const distancePresets = [1, 2, 5, 10, 20, 50];

  // Current frequency in Hz
  let currentFrequencyHz = $derived(convertToHz(inputFrequency, inputFrequencyUnit));

  // Wavelength in meters
  let wavelengthM = $derived(
    currentFrequencyHz > 0 ? frequencyToWavelength(currentFrequencyHz) : 0
  );

  // Total distance in meters
  let totalDistanceM = $derived(totalDistanceKm * 1000);

  // Obstacle position in meters
  let obstaclePositionM = $derived(obstaclePositionKm * 1000);

  /**
   * Calculate Fresnel zone radius at a specific point
   * r_n = sqrt(n * lambda * d1 * d2 / D)
   * where d1 = distance from TX to point, d2 = distance from point to RX, D = total distance
   */
  function calculateFresnelRadius(
    wavelength: number,
    d1: number,
    d2: number,
    totalDistance: number,
    n: number = 1
  ): number {
    if (wavelength <= 0 || d1 <= 0 || d2 <= 0 || totalDistance <= 0) return 0;
    return Math.sqrt(n * wavelength * d1 * d2 / totalDistance);
  }

  // First Fresnel zone radius at obstacle position
  let fresnelRadius1 = $derived(
    calculateFresnelRadius(
      wavelengthM,
      obstaclePositionM,
      totalDistanceM - obstaclePositionM,
      totalDistanceM,
      1
    )
  );

  // 60% clearance (minimum recommended)
  let clearance60 = $derived(fresnelRadius1 * 0.6);

  // Maximum Fresnel radius (at midpoint)
  let maxFresnelRadius = $derived(
    calculateFresnelRadius(wavelengthM, totalDistanceM / 2, totalDistanceM / 2, totalDistanceM, 1)
  );

  // Second Fresnel zone at obstacle
  let fresnelRadius2 = $derived(
    calculateFresnelRadius(
      wavelengthM,
      obstaclePositionM,
      totalDistanceM - obstaclePositionM,
      totalDistanceM,
      2
    )
  );

  // Generate Fresnel ellipse points for visualization
  function generateFresnelEllipse(n: number, numPoints: number = 100): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= numPoints; i++) {
      const d1 = (i / numPoints) * totalDistanceM;
      const d2 = totalDistanceM - d1;
      const radius = calculateFresnelRadius(wavelengthM, d1, d2, totalDistanceM, n);
      points.push({ x: d1, y: radius });
    }

    // Add bottom half (mirror)
    for (let i = numPoints; i >= 0; i--) {
      const d1 = (i / numPoints) * totalDistanceM;
      const d2 = totalDistanceM - d1;
      const radius = calculateFresnelRadius(wavelengthM, d1, d2, totalDistanceM, n);
      points.push({ x: d1, y: -radius });
    }

    return points;
  }

  // Fresnel zone data
  let fresnel1Data = $derived(generateFresnelEllipse(1));
  let fresnel2Data = $derived(generateFresnelEllipse(2));

  // D3 scales
  let xScale = $derived(
    d3.scaleLinear()
      .domain([0, totalDistanceM])
      .range([0, chartWidth])
  );

  // Y scale based on max Fresnel radius (with padding)
  let yMax = $derived(Math.max(maxFresnelRadius * 1.5, fresnelRadius2 * 1.2, 10));
  let yScale = $derived(
    d3.scaleLinear()
      .domain([-yMax, yMax])
      .range([chartHeight, 0])
  );

  // Line generator for Fresnel zones
  let areaGenerator = $derived(
    d3.line<{ x: number; y: number }>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveLinearClosed)
  );

  // Obstacle position on chart
  let obstacleX = $derived(xScale(obstaclePositionM));

  // Event handlers
  function handleFrequencyInput(e: Event) {
    inputFrequency = parseNumericInput(e, 1);
  }

  function handleFrequencyUnitChange(e: Event) {
    inputFrequencyUnit = parseSelectValue(e);
  }

  function handleDistanceInput(e: Event) {
    totalDistanceKm = clamp(parseNumericInput(e, 1), 0.1, 1000);
    // Keep obstacle position within bounds
    if (obstaclePositionKm > totalDistanceKm) {
      obstaclePositionKm = totalDistanceKm / 2;
    }
  }

  function handleObstaclePositionInput(e: Event) {
    obstaclePositionKm = clamp(parseNumericInput(e, 0.1), 0.01, totalDistanceKm - 0.01);
  }

  function setPresetFrequency(hz: number) {
    inputFrequency = hz >= 1e9 ? hz / 1e9 : hz / 1e6;
    inputFrequencyUnit = hz >= 1e9 ? 'GHz' : 'MHz';
  }

  function setPresetDistance(km: number) {
    totalDistanceKm = km;
    obstaclePositionKm = km / 2;
  }
</script>

<div class="card">
  <h3 class="text-heading-3 mb-4">Fresnel-Zonen Rechner</h3>

  <!-- Input Section -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- Frequency Input -->
    <div class="space-y-2">
      <label for="fresnel-frequency" class="text-label">
        Frequenz
        <InfoTooltip
          title="Betriebsfrequenz"
          short="Frequenz des Richtfunklinks"
          detailed="Hoehere Frequenzen haben kleinere Fresnel-Zonen und benoetigen weniger Freiheit."
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="fresnel-frequency"
          type="number"
          value={inputFrequency}
          oninput={handleFrequencyInput}
          class="input-field flex-1"
          step="any"
          min="0.001"
        />
        <select
          value={inputFrequencyUnit}
          onchange={handleFrequencyUnitChange}
          class="select-field"
          aria-label="Frequenzeinheit"
        >
          {#each FREQUENCY_UNITS as unit (unit.id)}
            <option value={unit.id}>{unit.symbol}</option>
          {/each}
        </select>
      </div>
      <div class="flex flex-wrap gap-1">
        {#each frequencyPresets.slice(0, 3) as preset (preset.hz)}
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

    <!-- Total Distance Input -->
    <div class="space-y-2">
      <label for="fresnel-distance" class="text-label">
        Gesamtdistanz
        <InfoTooltip
          title="Link-Distanz"
          short="Abstand zwischen TX und RX"
          detailed="Die Fresnel-Zone ist am groessten in der Mitte der Strecke."
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="fresnel-distance"
          type="number"
          value={totalDistanceKm}
          oninput={handleDistanceInput}
          class="input-field flex-1"
          step="0.1"
          min="0.1"
        />
        <span class="text-secondary text-sm w-8">km</span>
      </div>
      <div class="flex flex-wrap gap-1">
        {#each distancePresets as dist (dist)}
          <button
            type="button"
            onclick={() => setPresetDistance(dist)}
            class="btn-chip"
          >
            {dist} km
          </button>
        {/each}
      </div>
    </div>

    <!-- Obstacle Position Input -->
    <div class="space-y-2">
      <label for="fresnel-obstacle" class="text-label">
        Hindernis-Position
        <InfoTooltip
          title="Hindernis-Position"
          short="Position entlang der Strecke"
          detailed="Position des zu pruefenden Hindernisses (Baum, Gebaeude, Huegel)."
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="fresnel-obstacle"
          type="number"
          value={obstaclePositionKm}
          oninput={handleObstaclePositionInput}
          class="input-field flex-1"
          step="0.1"
          min="0.01"
          max={totalDistanceKm - 0.01}
        />
        <span class="text-secondary text-sm w-8">km</span>
      </div>
      <div class="flex items-center gap-2 mt-1">
        <input
          type="range"
          value={obstaclePositionKm}
          oninput={handleObstaclePositionInput}
          class="flex-1"
          min="0.01"
          max={totalDistanceKm - 0.01}
          step="0.01"
        />
      </div>
    </div>

    <!-- Wavelength Display -->
    <div class="space-y-2">
      <div class="text-label">Wellenlaenge</div>
      <div class="result-box-inline">
        <span class="text-lg font-bold text-green-600 dark:text-green-400">
          {wavelengthM > 0 ? formatNumber(wavelengthM * 100, 2) : '—'} cm
        </span>
      </div>
    </div>
  </div>

  <!-- Results Section -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <!-- 1st Fresnel Zone Radius -->
    <div class="result-box">
      <div class="result-label">
        1. Fresnel-Zone (r1)
        <InfoTooltip
          title="Erste Fresnel-Zone"
          short="Radius der 1. Fresnel-Zone"
          detailed="Der Bereich, in dem Signale konstruktiv interferieren. Mindestens 60% sollten frei sein."
        />
      </div>
      <div class="text-2xl font-bold text-blue-500 dark:text-blue-400">
        {fresnelRadius1 > 0 ? formatNumber(fresnelRadius1, 2) : '—'} m
      </div>
    </div>

    <!-- 60% Clearance -->
    <div class="result-box">
      <div class="result-label">
        60% Freiheit (min.)
        <InfoTooltip
          title="Mindestfreiheit"
          short="Empfohlene minimale Freiheit"
          detailed="Fuer zuverlaessige Verbindungen sollten mindestens 60% der 1. Fresnel-Zone frei von Hindernissen sein."
        />
      </div>
      <div class="text-2xl font-bold text-green-600 dark:text-green-400">
        {clearance60 > 0 ? formatNumber(clearance60, 2) : '—'} m
      </div>
    </div>

    <!-- Max Fresnel (at midpoint) -->
    <div class="result-box">
      <div class="result-label">Max. Radius (Mitte)</div>
      <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">
        {maxFresnelRadius > 0 ? formatNumber(maxFresnelRadius, 2) : '—'} m
      </div>
    </div>

    <!-- 2nd Fresnel Zone -->
    <div class="result-box">
      <div class="result-label">2. Fresnel-Zone (r2)</div>
      <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
        {fresnelRadius2 > 0 ? formatNumber(fresnelRadius2, 2) : '—'} m
      </div>
    </div>
  </div>

  <!-- Visualization -->
  <div class="w-full overflow-x-auto">
    <svg
      viewBox="0 0 {width} {height}"
      class="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Fresnel-Zonen Visualisierung: Zeigt die 1. und 2. Fresnel-Zone zwischen TX und RX"
    >
      <!-- Background -->
      <rect x="0" y="0" width={width} height={height} style="fill: var(--color-chart-bg)" />

      <!-- Chart area -->
      <g transform="translate({margin.left}, {margin.top})">
        <!-- Ground line -->
        <line
          x1="0"
          y1={yScale(0)}
          x2={chartWidth}
          y2={yScale(0)}
          style="stroke: var(--color-chart-axis)"
          stroke-width="2"
        />

        <!-- 2nd Fresnel Zone (outer, lighter) -->
        <path
          d={areaGenerator(fresnel2Data)}
          fill="rgba(139, 92, 246, 0.15)"
          stroke="#8b5cf6"
          stroke-width="1"
          stroke-dasharray="4,4"
        />

        <!-- 1st Fresnel Zone (inner) -->
        <path
          d={areaGenerator(fresnel1Data)}
          fill="rgba(59, 130, 246, 0.25)"
          stroke="#3b82f6"
          stroke-width="2"
        />

        <!-- 60% clearance zone -->
        {#if fresnel1Data.length > 0}
          {@const clearance60Data = fresnel1Data.map(p => ({ x: p.x, y: p.y * 0.6 }))}
          <path
            d={areaGenerator(clearance60Data)}
            fill="rgba(34, 197, 94, 0.2)"
            stroke="#22c55e"
            stroke-width="1"
            stroke-dasharray="2,2"
          />
        {/if}

        <!-- Direct line of sight -->
        <line
          x1="0"
          y1={yScale(0)}
          x2={chartWidth}
          y2={yScale(0)}
          stroke="#fbbf24"
          stroke-width="2"
          stroke-dasharray="8,4"
        />

        <!-- TX Antenna -->
        <g transform="translate(0, {yScale(0)})">
          <line x1="0" y1="0" x2="0" y2="-20" stroke="#ef4444" stroke-width="3" />
          <polygon points="0,-25 -5,-15 5,-15" fill="#ef4444" />
          <text x="0" y="20" fill="var(--color-chart-text)" font-size="12" font-weight="500" text-anchor="middle">TX</text>
        </g>

        <!-- RX Antenna -->
        <g transform="translate({chartWidth}, {yScale(0)})">
          <line x1="0" y1="0" x2="0" y2="-20" stroke="#22c55e" stroke-width="3" />
          <polygon points="0,-25 -5,-15 5,-15" fill="#22c55e" />
          <text x="0" y="20" fill="var(--color-chart-text)" font-size="12" font-weight="500" text-anchor="middle">RX</text>
        </g>

        <!-- Obstacle position marker -->
        <line
          x1={obstacleX}
          y1={yScale(-yMax)}
          x2={obstacleX}
          y2={yScale(yMax)}
          stroke="#f97316"
          stroke-width="2"
          stroke-dasharray="4,4"
        />

        <!-- Fresnel radius indicators at obstacle -->
        <line
          x1={obstacleX - 5}
          y1={yScale(fresnelRadius1)}
          x2={obstacleX + 5}
          y2={yScale(fresnelRadius1)}
          stroke="#3b82f6"
          stroke-width="2"
        />
        <line
          x1={obstacleX - 5}
          y1={yScale(-fresnelRadius1)}
          x2={obstacleX + 5}
          y2={yScale(-fresnelRadius1)}
          stroke="#3b82f6"
          stroke-width="2"
        />
        <line
          x1={obstacleX}
          y1={yScale(fresnelRadius1)}
          x2={obstacleX}
          y2={yScale(-fresnelRadius1)}
          stroke="#3b82f6"
          stroke-width="1"
          stroke-dasharray="2,2"
        />

        <!-- Radius label -->
        <text
          x={obstacleX + 10}
          y={yScale(fresnelRadius1 / 2)}
          fill="#3b82f6"
          font-size="11"
          font-weight="500"
        >
          r1 = {formatNumber(fresnelRadius1, 1)} m
        </text>

        <!-- Distance labels -->
        <text
          x={obstacleX}
          y={yScale(-yMax) + 15}
          fill="#f97316"
          font-size="10"
          text-anchor="middle"
        >
          d1 = {formatNumber(obstaclePositionKm, 1)} km
        </text>
      </g>

      <!-- Legend -->
      <g transform="translate({margin.left}, 15)">
        <rect x="0" y="0" width="12" height="12" fill="rgba(59, 130, 246, 0.25)" stroke="#3b82f6" />
        <text x="18" y="10" fill="var(--color-chart-text-secondary)" font-size="10">1. Fresnel-Zone</text>

        <rect x="120" y="0" width="12" height="12" fill="rgba(139, 92, 246, 0.15)" stroke="#8b5cf6" stroke-dasharray="2,2" />
        <text x="138" y="10" fill="var(--color-chart-text-secondary)" font-size="10">2. Fresnel-Zone</text>

        <rect x="260" y="0" width="12" height="12" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" stroke-dasharray="2,2" />
        <text x="278" y="10" fill="var(--color-chart-text-secondary)" font-size="10">60% Freiheit</text>

        <line x1="400" y1="6" x2="420" y2="6" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4,2" />
        <text x="428" y="10" fill="var(--color-chart-text-secondary)" font-size="10">Sichtlinie</text>
      </g>
    </svg>
  </div>

  <!-- Formula Display -->
  <div class="formula-box mt-4">
    <div class="text-xs text-muted mb-1">Fresnel-Radius Formel:</div>
    <div class="font-mono text-sm text-primary text-center">
      r<sub>n</sub> = sqrt(n * lambda * d<sub>1</sub> * d<sub>2</sub> / D)
    </div>
    <div class="text-xs text-muted mt-2 text-center">
      d<sub>1</sub> = Abstand TX-Hindernis, d<sub>2</sub> = Abstand Hindernis-RX, D = Gesamtdistanz
    </div>
  </div>

  <!-- Explanation -->
  <div class="mt-4 p-4 bg-surface-secondary rounded-lg text-sm text-secondary">
    <p class="mb-2">
      <strong>Fresnel-Zonen:</strong> Die erste Fresnel-Zone beschreibt den Bereich, in dem sich
      das Signal konstruktiv verstaerkt. Hindernisse in diesem Bereich verursachen Signaldaempfung.
    </p>
    <p class="mb-2">
      <strong>60% Regel:</strong> Fuer eine zuverlaessige Verbindung sollten mindestens 60% der
      ersten Fresnel-Zone frei von Hindernissen sein. Bei 100% Freiheit: kein Verlust durch Fresnel-Effekte.
    </p>
    <p>
      <strong>Praxistipp:</strong> Antennenhöhe = 60% des Fresnel-Radius + Hindernishoehe + Sicherheitsmarge.
    </p>
  </div>
</div>

<style>
  .result-box-inline {
    padding: 0.75rem;
    background-color: var(--color-bg-elevated);
    border-radius: var(--radius-lg);
  }
</style>
