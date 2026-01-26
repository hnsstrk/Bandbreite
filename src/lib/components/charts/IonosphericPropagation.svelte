<script lang="ts">
  import {
    IONOSPHERIC_LAYERS,
    IONOSPHERE_PARAMETERS,
    type IonosphericLayer
  } from '$lib/data/constants';
  import { formatFrequency, formatNumber } from '$lib/utils/formatting';
  import { parseNumericInput, clamp } from '$lib/utils/handlers';
  import InfoTooltip from '$lib/components/ui/InfoTooltip.svelte';

  interface Props {
    width?: number;
    height?: number;
  }

  let { width = 900, height = 500 }: Props = $props();

  // Input state
  let frequencyMHz = $state(14);
  let solarFluxIndex = $state(100);
  let isNighttime = $state(false);

  // Chart margins
  const margin = { top: 40, right: 200, bottom: 60, left: 80 };

  // Computed dimensions
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom);

  // Maximum altitude to display (km)
  const MAX_ALTITUDE_KM = 450;

  // Y scale: altitude in km
  function altitudeToY(altitudeKm: number): number {
    return chartHeight - (altitudeKm / MAX_ALTITUDE_KM) * chartHeight;
  }

  // Calculate critical frequency based on solar flux
  // foF2 approximation: increases with solar activity
  let criticalFrequencyMHz = $derived.by(() => {
    const { typicalF2CriticalFrequencyMHz, solarFluxRange } = IONOSPHERE_PARAMETERS;
    const normalizedFlux = (solarFluxIndex - solarFluxRange.min) /
                           (solarFluxRange.max - solarFluxRange.min);
    const foF2 = typicalF2CriticalFrequencyMHz.low +
                 normalizedFlux * (typicalF2CriticalFrequencyMHz.high - typicalF2CriticalFrequencyMHz.low);
    // Reduce at night
    return isNighttime ? foF2 * 0.7 : foF2;
  });

  // Maximum Usable Frequency (MUF) for 3000 km skip
  let mufMHz = $derived(criticalFrequencyMHz * IONOSPHERE_PARAMETERS.mufFactor3000km);

  // Lowest Usable Frequency (LUF)
  let lufMHz = $derived(mufMHz * IONOSPHERE_PARAMETERS.lufFactorTypical);

  // Check if current frequency can propagate
  let canPropagate = $derived(
    frequencyMHz >= lufMHz && frequencyMHz <= mufMHz
  );

  // Visible layers based on day/night
  let visibleLayers = $derived(
    IONOSPHERIC_LAYERS.filter(layer =>
      isNighttime ? layer.nighttimePresent : layer.daytimePresent
    )
  );

  // Layer colors
  const layerColors: Record<string, { fill: string; stroke: string }> = {
    'd-layer': { fill: 'rgba(239, 68, 68, 0.2)', stroke: '#ef4444' },
    'e-layer': { fill: 'rgba(249, 115, 22, 0.2)', stroke: '#f97316' },
    'f1-layer': { fill: 'rgba(34, 197, 94, 0.2)', stroke: '#22c55e' },
    'f2-layer': { fill: 'rgba(59, 130, 246, 0.3)', stroke: '#3b82f6' },
  };

  // Calculate reflection path for visualization
  let reflectionPath = $derived.by(() => {
    if (!canPropagate) return null;

    // Determine which layer reflects (simplified)
    let reflectionAltitude = 300; // F2 default

    if (frequencyMHz < 4) {
      reflectionAltitude = 110; // E layer for lower frequencies
    } else if (frequencyMHz < 10) {
      reflectionAltitude = 200; // F1 layer
    }

    // Skip distance calculation (simplified)
    const skipDistanceKm = 1500 + (frequencyMHz / mufMHz) * 1500;

    return {
      altitude: reflectionAltitude,
      skipDistance: skipDistanceKm
    };
  });

  // Event handlers
  function handleFrequencyInput(e: Event) {
    frequencyMHz = clamp(parseNumericInput(e, 1), 1, 30);
  }

  function handleSolarFluxInput(e: Event) {
    solarFluxIndex = clamp(parseNumericInput(e, 100), 65, 300);
  }

  // Frequency presets
  const frequencyPresets = [
    { label: '80m', mhz: 3.6, band: '3.5-3.8 MHz' },
    { label: '40m', mhz: 7.1, band: '7-7.2 MHz' },
    { label: '20m', mhz: 14.2, band: '14-14.35 MHz' },
    { label: '15m', mhz: 21.2, band: '21-21.45 MHz' },
    { label: '10m', mhz: 28.5, band: '28-29.7 MHz' },
  ];
</script>

<div class="card">
  <h3 class="text-heading-3 mb-4">Ionosphaerische Ausbreitung</h3>

  <!-- Input Section -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <!-- Frequency Input -->
    <div class="space-y-2">
      <label for="iono-frequency" class="text-label">
        Frequenz (HF)
        <InfoTooltip
          title="HF-Frequenz"
          short="Kurzwellenfrequenz fuer Ionosphaerenreflexion"
          detailed="Der HF-Bereich (3-30 MHz) wird von der Ionosphaere reflektiert und ermoeglicht weltweite Kommunikation."
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="iono-frequency"
          type="number"
          value={frequencyMHz}
          oninput={handleFrequencyInput}
          class="input-field flex-1"
          step="0.1"
          min="1"
          max="30"
        />
        <span class="text-secondary text-sm">MHz</span>
      </div>
      <div class="flex flex-wrap gap-1">
        {#each frequencyPresets as preset (preset.mhz)}
          <button
            type="button"
            onclick={() => { frequencyMHz = preset.mhz; }}
            class="btn-chip"
            title={preset.band}
          >
            {preset.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Solar Flux Input -->
    <div class="space-y-2">
      <label for="solar-flux" class="text-label">
        Solar Flux Index (SFI)
        <InfoTooltip
          title="Solar Flux Index"
          short="Mass fuer Sonnenaktivitaet (10.7 cm Flux)"
          detailed="Niedriger SFI (65-80): Sonnenminimum. Hoher SFI (150-300): Sonnenmaximum. Beeinflusst die MUF stark."
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="solar-flux"
          type="range"
          value={solarFluxIndex}
          oninput={handleSolarFluxInput}
          class="flex-1"
          min="65"
          max="300"
        />
        <span class="text-secondary text-sm w-12">{solarFluxIndex}</span>
      </div>
      <div class="text-xs text-muted">
        65=Minimum, 150=Mittel, 300=Maximum
      </div>
    </div>

    <!-- Day/Night Toggle -->
    <div class="space-y-2">
      <div class="text-label">Tageszeit</div>
      <div class="flex items-center gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="daytime"
            checked={!isNighttime}
            onchange={() => { isNighttime = false; }}
            class="radio"
          />
          <span class="text-secondary">Tag</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="daytime"
            checked={isNighttime}
            onchange={() => { isNighttime = true; }}
            class="radio"
          />
          <span class="text-secondary">Nacht</span>
        </label>
      </div>
      <div class="text-xs text-muted">
        {isNighttime ? 'D-Schicht verschwindet, F1/F2 verschmelzen' : 'Alle Schichten aktiv'}
      </div>
    </div>
  </div>

  <!-- Results Section -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <div class="result-box">
      <div class="result-label">Kritische Frequenz (foF2)</div>
      <div class="text-xl font-bold text-blue-500 dark:text-blue-400">
        {formatNumber(criticalFrequencyMHz, 1)} MHz
      </div>
    </div>
    <div class="result-box">
      <div class="result-label">MUF (3000 km)</div>
      <div class="text-xl font-bold text-green-600 dark:text-green-400">
        {formatNumber(mufMHz, 1)} MHz
      </div>
    </div>
    <div class="result-box">
      <div class="result-label">LUF (3000 km)</div>
      <div class="text-xl font-bold text-amber-600 dark:text-amber-400">
        {formatNumber(lufMHz, 1)} MHz
      </div>
    </div>
    <div class="result-box">
      <div class="result-label">Ausbreitung</div>
      <div class="text-xl font-bold {canPropagate ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}">
        {canPropagate ? 'Moeglich' : 'Nicht moeglich'}
      </div>
    </div>
  </div>

  <!-- Ionosphere Visualization -->
  <div class="w-full overflow-x-auto">
    <svg
      viewBox="0 0 {width} {height}"
      class="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Ionosphaeren-Diagramm: Zeigt D-, E-, F1- und F2-Schichten mit Reflexionspfaden"
    >
      <defs>
        <!-- Gradient for sky background -->
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:{isNighttime ? '#1e3a5f' : '#87CEEB'};stop-opacity:1" />
          <stop offset="100%" style="stop-color:{isNighttime ? '#0a1929' : '#4a90c2'};stop-opacity:1" />
        </linearGradient>

        <!-- Ground gradient -->
        <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#8B4513;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#654321;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Sky background -->
      <rect
        x={margin.left}
        y={margin.top}
        width={chartWidth}
        height={chartHeight}
        fill="url(#skyGradient)"
      />

      <!-- Ground -->
      <rect
        x={margin.left}
        y={margin.top + chartHeight - 20}
        width={chartWidth}
        height="20"
        fill="url(#groundGradient)"
      />

      <!-- Chart area -->
      <g transform="translate({margin.left}, {margin.top})">
        <!-- Ionospheric layers -->
        {#each visibleLayers as layer (layer.id)}
          {@const yTop = altitudeToY(layer.altitudeMaxKm)}
          {@const yBottom = altitudeToY(layer.altitudeMinKm)}
          {@const layerHeight = yBottom - yTop}
          {@const colors = layerColors[layer.id]}

          <rect
            x="0"
            y={yTop}
            width={chartWidth}
            height={layerHeight}
            fill={colors.fill}
            stroke={colors.stroke}
            stroke-width="1"
            stroke-dasharray="4,4"
          />

          <!-- Layer label -->
          <text
            x={chartWidth - 10}
            y={yTop + layerHeight / 2}
            fill={colors.stroke}
            font-size="12"
            font-weight="500"
            text-anchor="end"
            dominant-baseline="middle"
          >
            {layer.name} ({layer.altitudeMinKm}-{layer.altitudeMaxKm} km)
          </text>
        {/each}

        <!-- Altitude grid lines -->
        {#each [100, 200, 300, 400] as alt (alt)}
          <line
            x1="0"
            y1={altitudeToY(alt)}
            x2={chartWidth}
            y2={altitudeToY(alt)}
            stroke="rgba(255,255,255,0.2)"
            stroke-dasharray="2,4"
          />
          <text
            x="-10"
            y={altitudeToY(alt)}
            fill="var(--color-chart-text-secondary)"
            font-size="10"
            text-anchor="end"
            dominant-baseline="middle"
          >
            {alt} km
          </text>
        {/each}

        <!-- Reflection path visualization -->
        {#if reflectionPath && canPropagate}
          {@const txX = 50}
          {@const rxX = chartWidth - 50}
          {@const midX = chartWidth / 2}
          {@const groundY = chartHeight - 20}
          {@const reflectionY = altitudeToY(reflectionPath.altitude)}

          <!-- TX antenna -->
          <line
            x1={txX}
            y1={groundY}
            x2={txX}
            y2={groundY - 30}
            stroke="#ef4444"
            stroke-width="3"
          />
          <circle cx={txX} cy={groundY - 35} r="5" fill="#ef4444" />
          <text x={txX} y={groundY + 15} fill="var(--color-chart-text)" font-size="10" text-anchor="middle">TX</text>

          <!-- RX antenna -->
          <line
            x1={rxX}
            y1={groundY}
            x2={rxX}
            y2={groundY - 30}
            stroke="#22c55e"
            stroke-width="3"
          />
          <circle cx={rxX} cy={groundY - 35} r="5" fill="#22c55e" />
          <text x={rxX} y={groundY + 15} fill="var(--color-chart-text)" font-size="10" text-anchor="middle">RX</text>

          <!-- Signal path -->
          <path
            d="M {txX} {groundY - 35} Q {midX} {reflectionY - 20} {rxX} {groundY - 35}"
            fill="none"
            stroke="#fbbf24"
            stroke-width="2"
            stroke-dasharray="6,3"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="18"
              to="0"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>

          <!-- Reflection point -->
          <circle
            cx={midX}
            cy={reflectionY}
            r="6"
            fill="#fbbf24"
            opacity="0.8"
          />

          <!-- Skip distance label -->
          <text
            x={midX}
            y={groundY + 35}
            fill="var(--color-chart-text)"
            font-size="11"
            text-anchor="middle"
          >
            Skip: ~{formatNumber(reflectionPath.skipDistance, 0)} km
          </text>
        {:else if !canPropagate}
          <!-- No propagation indicator -->
          <text
            x={chartWidth / 2}
            y={chartHeight / 2}
            fill="#ef4444"
            font-size="16"
            font-weight="500"
            text-anchor="middle"
          >
            {frequencyMHz < lufMHz ? 'Frequenz unter LUF - zu starke D-Schicht Absorption' : 'Frequenz ueber MUF - keine Reflexion'}
          </text>
        {/if}

        <!-- Y-axis label -->
        <text
          transform="rotate(-90)"
          x={-chartHeight / 2}
          y="-55"
          fill="var(--color-chart-text)"
          font-size="13"
          font-weight="500"
          text-anchor="middle"
        >
          Hoehe (km)
        </text>
      </g>

      <!-- Legend -->
      <g transform="translate({width - margin.right + 20}, {margin.top})">
        <text fill="var(--color-chart-text)" font-weight="500" font-size="12" y="0">
          Ionosphaerenschichten
        </text>

        {#each IONOSPHERIC_LAYERS as layer, i (layer.id)}
          {@const colors = layerColors[layer.id]}
          {@const isVisible = visibleLayers.includes(layer)}
          <g transform="translate(0, {20 + i * 45})" opacity={isVisible ? 1 : 0.4}>
            <rect x="0" y="0" width="16" height="16" fill={colors.fill} stroke={colors.stroke} />
            <text x="24" y="12" fill="var(--color-chart-text-secondary)" font-size="11">
              {layer.name}
            </text>
            <text x="24" y="26" fill="var(--color-text-tertiary)" font-size="9">
              {layer.altitudeMinKm}-{layer.altitudeMaxKm} km
            </text>
            <text x="24" y="38" fill="var(--color-text-tertiary)" font-size="8">
              {isVisible ? (layer.affectsHF ? 'HF-aktiv' : 'Passiv') : 'Nachts inaktiv'}
            </text>
          </g>
        {/each}

        <!-- Current frequency indicator -->
        <g transform="translate(0, 210)">
          <text fill="var(--color-chart-text)" font-weight="500" font-size="12" y="0">
            Aktuelle Frequenz
          </text>
          <text fill="#fbbf24" font-size="14" font-weight="bold" y="20">
            {formatNumber(frequencyMHz, 1)} MHz
          </text>
          <text fill="var(--color-text-tertiary)" font-size="10" y="36">
            LUF: {formatNumber(lufMHz, 1)} MHz
          </text>
          <text fill="var(--color-text-tertiary)" font-size="10" y="50">
            MUF: {formatNumber(mufMHz, 1)} MHz
          </text>
        </g>
      </g>
    </svg>
  </div>

  <!-- Explanation -->
  <div class="mt-4 p-4 bg-surface-secondary rounded-lg text-sm text-secondary">
    <p class="mb-2">
      <strong>MUF (Maximum Usable Frequency):</strong> Hoechste Frequenz, die noch von der Ionosphaere
      reflektiert wird. Hoeher bei hoher Sonnenaktivitaet.
    </p>
    <p class="mb-2">
      <strong>LUF (Lowest Usable Frequency):</strong> Niedrigste nutzbare Frequenz. Tiefere Frequenzen
      werden von der D-Schicht absorbiert.
    </p>
    <p>
      <strong>Kritische Frequenz (foF2):</strong> Frequenz, die bei senkrechtem Einfall gerade noch
      reflektiert wird. Die MUF bei schraegem Einfall ist ca. 3x hoeher.
    </p>
  </div>
</div>
