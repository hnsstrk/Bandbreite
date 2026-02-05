<script lang="ts">
  import {
    PROPAGATION_MODES,
    LAYER_VISUALIZATIONS,
    SKIP_ZONE_PARAMS
  } from '$lib/data/propagation';
  import { formatFrequency, formatNumber } from '$lib/utils/formatting';
  import { parseNumericInput, clamp, safeLog } from '$lib/utils/handlers';
  import InfoTooltip from '$lib/components/ui/InfoTooltip.svelte';

  interface Props {
    width?: number;
    height?: number;
  }

  let { width = 900, height = 550 }: Props = $props();

  // State
  let selectedModeId = $state<string>('sky-wave');
  let isNighttime = $state(false);
  let frequencyMHz = $state(14);

  // Chart dimensions
  const margin = { top: 80, right: 180, bottom: 40, left: 60 };
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom);

  // Altitude scale (km to pixels)
  const MAX_ALTITUDE_KM = 450;
  function altitudeToY(altitudeKm: number): number {
    return chartHeight - 60 - (altitudeKm / MAX_ALTITUDE_KM) * (chartHeight - 80);
  }

  // Selected mode
  let selectedMode = $derived(
    PROPAGATION_MODES.find(m => m.id === selectedModeId) || PROPAGATION_MODES[1]
  );

  // Determine recommended mode based on frequency
  let recommendedModeId = $derived.by(() => {
    const freqHz = frequencyMHz * 1e6;
    if (freqHz < 3e6) return 'ground-wave';
    if (freqHz >= 3e6 && freqHz <= 30e6) return 'sky-wave';
    if (freqHz > 30e6 && freqHz <= 150e6) return 'sporadic-e';
    return 'line-of-sight';
  });

  // Visible layers based on day/night
  let visibleLayers = $derived(
    LAYER_VISUALIZATIONS.filter(layer => {
      if (isNighttime) {
        // Night: D-layer disappears, F1 merges with F2
        if (layer.id === 'd-layer') return false;
        if (layer.id === 'f1-layer') return false;
        return layer.nightOpacity > 0;
      }
      return layer.dayOpacity > 0;
    })
  );

  // Night F-layer (merged F1+F2)
  let nightFLayer = $derived({
    id: 'f-layer-night',
    name: 'F-Schicht',
    altitudeMinKm: 150,
    altitudeMaxKm: 400,
    fillColor: 'rgba(59, 130, 246, 0.3)',
    strokeColor: '#3b82f6',
    opacity: 0.8
  });

  // Calculate skip zone for sky wave
  let skipZone = $derived.by(() => {
    if (selectedModeId !== 'sky-wave') return null;
    const reflectionHeight = isNighttime
      ? SKIP_ZONE_PARAMS.reflectionHeightKm.night
      : SKIP_ZONE_PARAMS.reflectionHeightKm.day;
    return {
      minKm: SKIP_ZONE_PARAMS.typicalDeadZoneKm.min,
      maxKm: SKIP_ZONE_PARAMS.typicalDeadZoneKm.max,
      reflectionHeight
    };
  });

  // Mode options for radio buttons
  const modeOptions = [
    { id: 'ground-wave', label: 'Bodenwelle', tooltip: 'Ground Wave - LF/MF' },
    { id: 'sky-wave', label: 'Raumwelle', tooltip: 'Sky Wave - HF' },
    { id: 'line-of-sight', label: 'Sichtverbindung', tooltip: 'Line-of-Sight - VHF/UHF' },
    { id: 'sporadic-e', label: 'Sporadische E', tooltip: 'Sporadic E - VHF' }
  ];

  // Event handlers
  function handleFrequencyInput(e: Event) {
    frequencyMHz = clamp(parseNumericInput(e, 14), 0.03, 3000);
  }

  // Animation unique ID
  const animId = `wave-anim-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class="card">
  <h3 class="text-heading-3 mb-4">Wellenausbreitung</h3>

  <!-- Controls -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <!-- Mode Selection -->
    <div class="space-y-2">
      <div class="text-label">
        Ausbreitungsmodus
        <InfoTooltip
          title="Propagation Mode"
          short="Art der Funkwellenausbreitung"
          detailed="Je nach Frequenz nutzen Funkwellen verschiedene Wege: Bodenwelle (LF/MF), Raumwelle via Ionosphäre (HF), oder direkte Sichtverbindung (VHF/UHF)."
        />
      </div>
      <div class="flex flex-wrap gap-2">
        {#each modeOptions as option (option.id)}
          <label
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors
              {selectedModeId === option.id
                ? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
                : 'bg-surface-secondary hover:bg-surface-tertiary'}
              border {option.id === recommendedModeId ? 'ring-2 ring-amber-400' : ''}"
            title={option.tooltip}
          >
            <input
              type="radio"
              name="propagation-mode"
              value={option.id}
              checked={selectedModeId === option.id}
              onchange={() => { selectedModeId = option.id; }}
              class="sr-only"
            />
            <span class="text-sm">{option.label}</span>
          </label>
        {/each}
      </div>
      {#if recommendedModeId !== selectedModeId}
        <div class="text-xs text-amber-600 dark:text-amber-400">
          Empfohlen für {formatFrequency(frequencyMHz * 1e6, 1)}: {modeOptions.find(m => m.id === recommendedModeId)?.label}
        </div>
      {/if}
    </div>

    <!-- Day/Night Toggle -->
    <div class="space-y-2">
      <div class="text-label">Tageszeit</div>
      <div class="flex items-center gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="daytime-wave"
            checked={!isNighttime}
            onchange={() => { isNighttime = false; }}
            class="radio"
          />
          <span class="text-secondary">Tag</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="daytime-wave"
            checked={isNighttime}
            onchange={() => { isNighttime = true; }}
            class="radio"
          />
          <span class="text-secondary">Nacht</span>
        </label>
      </div>
      <div class="text-xs text-muted">
        {isNighttime ? 'D-Schicht verschwindet, F1/F2 verschmelzen' : 'Alle Ionosphärenschichten aktiv'}
      </div>
    </div>

    <!-- Frequency Slider -->
    <div class="space-y-2">
      <label for="freq-slider" class="text-label">
        Frequenz
        <InfoTooltip
          title="Operating Frequency"
          short="Betriebsfrequenz beeinflusst den Ausbreitungsmodus"
          detailed="LF/MF (<3 MHz): Bodenwelle. HF (3-30 MHz): Raumwelle. VHF/UHF (>30 MHz): Sichtverbindung."
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="freq-slider"
          type="range"
          value={safeLog(frequencyMHz)}
          oninput={(e) => {
            const logVal = parseNumericInput(e, 1.15);
            frequencyMHz = Math.pow(10, logVal);
          }}
          min="-1.5"
          max="3.5"
          step="0.01"
          class="flex-1"
        />
        <span class="text-secondary text-sm w-24 text-right">
          {formatFrequency(frequencyMHz * 1e6, 1)}
        </span>
      </div>
      <input
        type="number"
        value={frequencyMHz.toFixed(2)}
        oninput={handleFrequencyInput}
        class="input-field w-full"
        step="0.1"
        min="0.03"
        max="3000"
        aria-label="Frequenz in MHz"
      />
    </div>
  </div>

  <!-- SVG Visualization -->
  <div class="w-full overflow-x-auto">
    <svg
      viewBox="0 0 {width} {height}"
      class="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Wellenausbreitungsdiagramm: Zeigt {selectedMode.nameDE} mit Ionosphärenschichten, Sender und Empfänger"
    >
      <defs>
        <!-- Sky gradient -->
        <linearGradient id="{animId}-sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:{isNighttime ? '#0f172a' : '#7dd3fc'}" />
          <stop offset="100%" style="stop-color:{isNighttime ? '#1e3a5f' : '#bae6fd'}" />
        </linearGradient>

        <!-- Earth gradient -->
        <linearGradient id="{animId}-earth" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#16a34a" />
          <stop offset="100%" style="stop-color:#15803d" />
        </linearGradient>

        <!-- Animated dash pattern -->
        <pattern id="{animId}-dash" patternUnits="userSpaceOnUse" width="12" height="1">
          <line x1="0" y1="0" x2="6" y2="0" stroke="currentColor" stroke-width="2" />
        </pattern>
      </defs>

      <!-- Sky background -->
      <rect
        x={margin.left}
        y={margin.top}
        width={chartWidth}
        height={chartHeight}
        fill="url(#{animId}-sky)"
      />

      <!-- Stars at night -->
      {#if isNighttime}
        {#each Array(30) as _, i (i)}
          <circle
            cx={margin.left + Math.random() * chartWidth}
            cy={margin.top + Math.random() * (chartHeight * 0.6)}
            r={Math.random() * 1.5 + 0.5}
            fill="white"
            opacity={Math.random() * 0.5 + 0.3}
          />
        {/each}
      {/if}

      <g transform="translate({margin.left}, {margin.top})">
        <!-- Earth curvature arc -->
        <path
          d="M 0 {chartHeight}
             Q {chartWidth / 2} {chartHeight + 40} {chartWidth} {chartHeight}"
          fill="url(#{animId}-earth)"
          stroke="#166534"
          stroke-width="2"
        />

        <!-- Ionospheric layers -->
        {#if isNighttime}
          <!-- Night: Merged F-layer only -->
          {@const yTop = altitudeToY(nightFLayer.altitudeMaxKm)}
          {@const yBottom = altitudeToY(nightFLayer.altitudeMinKm)}
          <rect
            x="0"
            y={yTop}
            width={chartWidth}
            height={yBottom - yTop}
            fill={nightFLayer.fillColor}
            stroke={nightFLayer.strokeColor}
            stroke-width="1"
            stroke-dasharray="4,4"
            opacity={nightFLayer.opacity}
          />
          <text
            x={chartWidth - 10}
            y={(yTop + yBottom) / 2}
            fill={nightFLayer.strokeColor}
            font-size="11"
            text-anchor="end"
            dominant-baseline="middle"
          >
            F-Schicht (150-400 km)
          </text>
          <!-- E-layer remnant at night -->
          {@const eLayer = LAYER_VISUALIZATIONS.find(l => l.id === 'e-layer')}
          {#if eLayer}
            {@const eTop = altitudeToY(eLayer.altitudeMaxKm)}
            {@const eBottom = altitudeToY(eLayer.altitudeMinKm)}
            <rect
              x="0"
              y={eTop}
              width={chartWidth}
              height={eBottom - eTop}
              fill={eLayer.fillColor}
              stroke={eLayer.strokeColor}
              stroke-width="1"
              stroke-dasharray="4,4"
              opacity={eLayer.nightOpacity}
            />
          {/if}
        {:else}
          <!-- Day: All layers -->
          {#each visibleLayers as layer (layer.id)}
            {@const yTop = altitudeToY(layer.altitudeMaxKm)}
            {@const yBottom = altitudeToY(layer.altitudeMinKm)}
            <rect
              x="0"
              y={yTop}
              width={chartWidth}
              height={yBottom - yTop}
              fill={layer.fillColor}
              stroke={layer.strokeColor}
              stroke-width="1"
              stroke-dasharray="4,4"
              opacity={layer.dayOpacity}
            />
            <text
              x={chartWidth - 10}
              y={(yTop + yBottom) / 2}
              fill={layer.strokeColor}
              font-size="10"
              text-anchor="end"
              dominant-baseline="middle"
            >
              {layer.name} ({layer.altitudeMinKm}-{layer.altitudeMaxKm} km)
            </text>
          {/each}
        {/if}

        <!-- Antennas and Propagation Paths -->
        {#if true}
          {@const txX = 60}
          {@const groundY = chartHeight - 10}
          {@const rxX = chartWidth - 60}

          <!-- TX Antenna -->
          <line x1={txX} y1={groundY} x2={txX} y2={groundY - 40} stroke="#dc2626" stroke-width="3" />
          <polygon points="{txX - 8},{groundY - 40} {txX},{groundY - 55} {txX + 8},{groundY - 40}" fill="#dc2626" />
          <text x={txX} y={groundY + 15} fill="var(--color-chart-text)" font-size="11" text-anchor="middle" font-weight="bold">TX</text>

          <!-- RX Antenna -->
          <line x1={rxX} y1={groundY} x2={rxX} y2={groundY - 40} stroke="#16a34a" stroke-width="3" />
          <polygon points="{rxX - 8},{groundY - 40} {rxX},{groundY - 55} {rxX + 8},{groundY - 40}" fill="#16a34a" />
          <text x={rxX} y={groundY + 15} fill="var(--color-chart-text)" font-size="11" text-anchor="middle" font-weight="bold">RX</text>

          <!-- Propagation paths based on mode -->
          {#if selectedModeId === 'ground-wave'}
            <!-- Ground wave follows Earth surface -->
            <path
              d="M {txX} {groundY - 45}
                 Q {chartWidth / 2} {groundY + 20} {rxX} {groundY - 45}"
              fill="none"
              stroke={selectedMode.color}
              stroke-width="3"
              stroke-dasharray="8,4"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="24"
                to="0"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </path>
            <text x={chartWidth / 2} y={groundY + 5} fill={selectedMode.color} font-size="10" text-anchor="middle">
              Bodenwelle folgt Erdoberfläche
            </text>
          {:else if selectedModeId === 'sky-wave'}
            {@const reflectionY = altitudeToY(skipZone?.reflectionHeight ?? 300)}
            {@const hop1X = txX + (rxX - txX) / 3}
            {@const hop2X = txX + (rxX - txX) * 2 / 3}

            <!-- First hop -->
            <path
              d="M {txX} {groundY - 50} Q {(txX + hop1X) / 2} {reflectionY - 30} {hop1X} {groundY - 20}"
              fill="none"
              stroke={selectedMode.color}
              stroke-width="2.5"
              stroke-dasharray="6,3"
            >
              <animate attributeName="stroke-dashoffset" from="18" to="0" dur="1s" repeatCount="indefinite" />
            </path>

            <!-- Second hop -->
            <path
              d="M {hop1X} {groundY - 20} Q {(hop1X + hop2X) / 2} {reflectionY - 30} {hop2X} {groundY - 20}"
              fill="none"
              stroke={selectedMode.color}
              stroke-width="2.5"
              stroke-dasharray="6,3"
            >
              <animate attributeName="stroke-dashoffset" from="18" to="0" dur="1s" repeatCount="indefinite" />
            </path>

            <!-- Third hop to RX -->
            <path
              d="M {hop2X} {groundY - 20} Q {(hop2X + rxX) / 2} {reflectionY - 30} {rxX} {groundY - 50}"
              fill="none"
              stroke={selectedMode.color}
              stroke-width="2.5"
              stroke-dasharray="6,3"
            >
              <animate attributeName="stroke-dashoffset" from="18" to="0" dur="1s" repeatCount="indefinite" />
            </path>

            <!-- Reflection points -->
            <circle cx={(txX + hop1X) / 2} cy={reflectionY} r="5" fill={selectedMode.color} opacity="0.8" />
            <circle cx={(hop1X + hop2X) / 2} cy={reflectionY} r="5" fill={selectedMode.color} opacity="0.8" />
            <circle cx={(hop2X + rxX) / 2} cy={reflectionY} r="5" fill={selectedMode.color} opacity="0.8" />

            <!-- Skip zone / dead zone -->
            {#if skipZone}
              {@const deadZoneWidth = 80}
              <rect
                x={txX + 30}
                y={groundY - 60}
                width={deadZoneWidth}
                height="50"
                fill="rgba(239, 68, 68, 0.2)"
                stroke="#ef4444"
                stroke-dasharray="3,3"
              />
              <text x={txX + 30 + deadZoneWidth / 2} y={groundY - 35} fill="#ef4444" font-size="9" text-anchor="middle">
                Tote Zone
              </text>
            {/if}
          {:else if selectedModeId === 'line-of-sight'}
            {@const horizonY = groundY - 100}
            <!-- Direct line-of-sight path -->
            <line
              x1={txX}
              y1={groundY - 50}
              x2={rxX}
              y2={groundY - 50}
              stroke={selectedMode.color}
              stroke-width="3"
              stroke-dasharray="10,5"
            >
              <animate attributeName="stroke-dashoffset" from="30" to="0" dur="1s" repeatCount="indefinite" />
            </line>

            <!-- Horizon line indicator -->
            <line
              x1="0"
              y1={horizonY}
              x2={chartWidth}
              y2={horizonY}
              stroke="rgba(75, 85, 99, 0.4)"
              stroke-dasharray="4,4"
            />
            <text x={chartWidth / 2} y={horizonY - 8} fill="var(--color-text-muted)" font-size="9" text-anchor="middle">
              Radiohorizont
            </text>
          {:else if selectedModeId === 'sporadic-e'}
            {@const eLayerY = altitudeToY(110)}

            <!-- Sporadic E patches -->
            <ellipse cx={chartWidth * 0.35} cy={eLayerY} rx="40" ry="12" fill="rgba(168, 85, 247, 0.4)" stroke="#a855f7" stroke-width="1" />
            <ellipse cx={chartWidth * 0.65} cy={eLayerY} rx="35" ry="10" fill="rgba(168, 85, 247, 0.4)" stroke="#a855f7" stroke-width="1" />

            <!-- Signal path bouncing off Es patch -->
            <path
              d="M {txX} {groundY - 50} Q {chartWidth * 0.35} {eLayerY - 20} {chartWidth * 0.5} {groundY - 30}
                 Q {chartWidth * 0.65} {eLayerY - 20} {rxX} {groundY - 50}"
              fill="none"
              stroke={selectedMode.color}
              stroke-width="2.5"
              stroke-dasharray="6,3"
            >
              <animate attributeName="stroke-dashoffset" from="18" to="0" dur="1.2s" repeatCount="indefinite" />
            </path>

            <text x={chartWidth * 0.35} y={eLayerY - 18} fill="#a855f7" font-size="9" text-anchor="middle">
              Es-Patch
            </text>
          {/if}
        {/if}

        <!-- Altitude scale -->
        {#each [100, 200, 300, 400] as alt (alt)}
          <line
            x1="0"
            y1={altitudeToY(alt)}
            x2="-5"
            y2={altitudeToY(alt)}
            stroke="var(--color-chart-text-secondary)"
          />
          <text
            x="-10"
            y={altitudeToY(alt)}
            fill="var(--color-chart-text-secondary)"
            font-size="9"
            text-anchor="end"
            dominant-baseline="middle"
          >
            {alt} km
          </text>
        {/each}

        <!-- Y-axis label -->
        <text
          transform="rotate(-90)"
          x={-(chartHeight / 2)}
          y="-45"
          fill="var(--color-chart-text)"
          font-size="11"
          text-anchor="middle"
        >
          Höhe (km)
        </text>
      </g>

      <!-- Legend -->
      <g transform="translate({width - margin.right + 15}, {margin.top})">
        <text fill="var(--color-chart-text)" font-weight="600" font-size="11" y="0">
          {selectedMode.nameDE}
        </text>
        <text fill="var(--color-text-secondary)" font-size="9" y="16">
          {selectedMode.name}
        </text>

        <line x1="0" y1="30" x2="30" y2="30" stroke={selectedMode.color} stroke-width="3" stroke-dasharray="6,3" />
        <text fill="var(--color-text-muted)" font-size="9" x="38" y="34">Signalweg</text>

        <rect x="0" y="50" width="16" height="16" fill={selectedMode.color} opacity="0.3" stroke={selectedMode.color} />
        <text fill="var(--color-text-muted)" font-size="9" x="24" y="62">Aktiver Bereich</text>

        <!-- Mode characteristics -->
        <text fill="var(--color-chart-text)" font-weight="500" font-size="10" y="90">Eigenschaften:</text>
        {#each selectedMode.characteristicsDE.slice(0, 3) as char, i (i)}
          <text fill="var(--color-text-muted)" font-size="8" y={105 + i * 14} x="0">
            - {char.length > 30 ? char.slice(0, 28) + '...' : char}
          </text>
        {/each}

        <!-- Frequency range -->
        <text fill="var(--color-chart-text)" font-weight="500" font-size="10" y="160">Frequenzbereich:</text>
        <text fill="var(--color-text-secondary)" font-size="9" y="175">
          {formatFrequency(selectedMode.frequencyRangeHz.min)} - {formatFrequency(selectedMode.frequencyRangeHz.max)}
        </text>

        <!-- Typical range -->
        <text fill="var(--color-chart-text)" font-weight="500" font-size="10" y="195">Typische Reichweite:</text>
        <text fill="var(--color-text-secondary)" font-size="9" y="210">
          {formatNumber(selectedMode.typicalRangeKm.min, 0)} - {formatNumber(selectedMode.typicalRangeKm.max, 0)} km
        </text>
      </g>
    </svg>
  </div>

  <!-- Explanation -->
  <div class="mt-4 p-4 bg-surface-secondary rounded-lg text-sm text-secondary">
    <p class="mb-2">
      <strong>Bodenwelle:</strong> Folgt der Erdoberfläche, geeignet für LF/MF-Frequenzen bis ca. 300 km.
    </p>
    <p class="mb-2">
      <strong>Raumwelle:</strong> Wird an der Ionosphäre reflektiert, ermöglicht weltweite HF-Kommunikation mit Multi-Hop.
    </p>
    <p class="mb-2">
      <strong>Sichtverbindung:</strong> Direkte Ausbreitung für VHF/UHF, begrenzt durch den Radiohorizont.
    </p>
    <p>
      <strong>Sporadische E:</strong> Temporäre ionisierte Bereiche in der E-Schicht ermöglichen VHF-Überreichweiten.
    </p>
  </div>
</div>
