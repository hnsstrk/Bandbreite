<script lang="ts">
  import * as d3 from 'd3';
  import { formatNumber } from '$lib/utils/formatting';
  import { parseNumericInput, safeDivide, safeLog, clamp } from '$lib/utils/handlers';
  import InfoTooltip from '$lib/components/ui/InfoTooltip.svelte';

  interface Props {
    width?: number;
    height?: number;
  }

  let { width = 900, height = 400 }: Props = $props();

  // Input state
  let bandwidthMHz = $state(20);
  let snrDb = $state(20);

  // Chart margins
  const margin = { top: 40, right: 120, bottom: 60, left: 80 };

  // Computed dimensions
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom);

  // Modulation schemes with their theoretical spectral efficiency
  const modulationSchemes = [
    { name: 'BPSK', bitsPerSymbol: 1, requiredSnrDb: 6.8, color: '#22c55e' },
    { name: 'QPSK', bitsPerSymbol: 2, requiredSnrDb: 9.8, color: '#3b82f6' },
    { name: '8-PSK', bitsPerSymbol: 3, requiredSnrDb: 14, color: '#8b5cf6' },
    { name: '16-QAM', bitsPerSymbol: 4, requiredSnrDb: 16.5, color: '#f97316' },
    { name: '64-QAM', bitsPerSymbol: 6, requiredSnrDb: 22.5, color: '#ef4444' },
    { name: '256-QAM', bitsPerSymbol: 8, requiredSnrDb: 28.5, color: '#ec4899' },
    { name: '1024-QAM', bitsPerSymbol: 10, requiredSnrDb: 34.5, color: '#6366f1' },
  ];

  // Bandwidth presets
  const bandwidthPresets = [
    { label: 'WiFi 20', mhz: 20, desc: '802.11n/ac' },
    { label: 'WiFi 40', mhz: 40, desc: '802.11n/ac' },
    { label: 'WiFi 80', mhz: 80, desc: '802.11ac' },
    { label: 'WiFi 160', mhz: 160, desc: '802.11ax' },
    { label: 'LTE 10', mhz: 10, desc: 'LTE Band' },
    { label: 'LTE 20', mhz: 20, desc: 'LTE Band' },
    { label: '5G 100', mhz: 100, desc: 'NR n78' },
  ];

  // Convert SNR from dB to linear
  let snrLinear = $derived(Math.pow(10, snrDb / 10));

  // Shannon-Hartley channel capacity in bits per second
  // C = B * log2(1 + SNR)
  let channelCapacityBps = $derived.by(() => {
    if (bandwidthMHz <= 0 || snrLinear <= 0) return 0;
    const bandwidthHz = bandwidthMHz * 1e6;
    return bandwidthHz * safeLog(1 + snrLinear, 2);
  });

  // Spectral efficiency in bits/s/Hz
  let spectralEfficiency = $derived(
    bandwidthMHz > 0 ? channelCapacityBps / (bandwidthMHz * 1e6) : 0
  );

  // Format data rate
  function formatDataRate(bps: number): string {
    if (bps >= 1e9) return `${formatNumber(bps / 1e9, 2)} Gbit/s`;
    if (bps >= 1e6) return `${formatNumber(bps / 1e6, 2)} Mbit/s`;
    if (bps >= 1e3) return `${formatNumber(bps / 1e3, 2)} kbit/s`;
    return `${formatNumber(bps, 0)} bit/s`;
  }

  // Calculate achievable modulation
  let achievableModulation = $derived.by(() => {
    const suitable = modulationSchemes.filter(m => snrDb >= m.requiredSnrDb);
    return suitable.length > 0 ? suitable[suitable.length - 1] : null;
  });

  // Practical data rate (with achievable modulation, assuming 80% efficiency)
  let practicalDataRate = $derived.by(() => {
    if (!achievableModulation || bandwidthMHz <= 0) return 0;
    const symbolRate = bandwidthMHz * 1e6; // Simplified: symbol rate ~ bandwidth
    return symbolRate * achievableModulation.bitsPerSymbol * 0.8; // 80% efficiency
  });

  // D3 scales for chart
  let xScale = $derived(
    d3.scaleLinear()
      .domain([0, 40])
      .range([0, chartWidth])
  );

  let yScale = $derived(
    d3.scaleLinear()
      .domain([0, 15])
      .range([chartHeight, 0])
  );

  // Shannon limit curve data
  let shannonCurveData = $derived.by(() => {
    const points: { snr: number; capacity: number }[] = [];
    for (let snr = 0; snr <= 40; snr += 0.5) {
      const snrLinear = Math.pow(10, snr / 10);
      const capacity = Math.log2(1 + snrLinear);
      points.push({ snr, capacity });
    }
    return points;
  });

  // Line generator
  let lineGenerator = $derived(
    d3.line<{ snr: number; capacity: number }>()
      .x(d => xScale(d.snr))
      .y(d => yScale(d.capacity))
  );

  // Shannon curve path
  let shannonPath = $derived(lineGenerator(shannonCurveData));

  // Marker position
  let markerPos = $derived({
    x: xScale(clamp(snrDb, 0, 40)),
    y: yScale(clamp(spectralEfficiency, 0, 15))
  });

  // X-axis ticks
  const xTickValues = [0, 5, 10, 15, 20, 25, 30, 35, 40];

  // Y-axis ticks
  const yTickValues = [0, 2, 4, 6, 8, 10, 12, 14];

  // Event handlers
  function handleBandwidthInput(e: Event) {
    bandwidthMHz = clamp(parseNumericInput(e, 1), 0.1, 1000);
  }

  function handleSnrInput(e: Event) {
    snrDb = clamp(parseNumericInput(e, 0), -10, 50);
  }

  function setPresetBandwidth(mhz: number) {
    bandwidthMHz = mhz;
  }
</script>

<div class="card">
  <h3 class="text-heading-3 mb-4">Kanalkapazität (Shannon-Hartley)</h3>

  <!-- Input Section -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    <!-- Bandwidth Input -->
    <div class="space-y-2">
      <label for="capacity-bandwidth" class="text-label">
        Bandbreite (B)
        <InfoTooltip
          title="Kanalbandbreite"
          short="Verfügbare Bandbreite des Kanals"
          detailed="Die Bandbreite bestimmt zusammen mit dem SNR die maximale theoretische Datenrate nach Shannon."
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="capacity-bandwidth"
          type="number"
          value={bandwidthMHz}
          oninput={handleBandwidthInput}
          class="input-field flex-1"
          step="any"
          min="0.1"
          max="1000"
        />
        <span class="text-secondary text-sm w-12">MHz</span>
      </div>
      <div class="flex flex-wrap gap-1">
        {#each bandwidthPresets as preset (preset.label)}
          <button
            type="button"
            onclick={() => setPresetBandwidth(preset.mhz)}
            class="btn-chip"
            title={preset.desc}
          >
            {preset.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- SNR Input -->
    <div class="space-y-2">
      <label for="capacity-snr" class="text-label">
        Signal-Rausch-Verhältnis (SNR)
        <InfoTooltip
          title="SNR (Signal-to-Noise Ratio)"
          short="Verhältnis von Signalleistung zu Rauschleistung"
          detailed="Höhere SNR-Werte ermöglichen höherwertige Modulationen und damit höhere Datenraten."
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="capacity-snr"
          type="number"
          value={snrDb}
          oninput={handleSnrInput}
          class="input-field flex-1"
          step="0.5"
          min="-10"
          max="50"
        />
        <span class="text-secondary text-sm w-8">dB</span>
      </div>
      <div class="flex items-center gap-2">
        <input
          type="range"
          value={snrDb}
          oninput={handleSnrInput}
          class="flex-1"
          min="-10"
          max="50"
          step="0.5"
        />
      </div>
      <div class="text-xs text-muted">
        Linear: {formatNumber(snrLinear, 1)}x
      </div>
    </div>
  </div>

  <!-- Results Section -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <!-- Shannon Capacity -->
    <div class="result-box">
      <div class="result-label">
        Shannon-Kapazität
        <InfoTooltip
          title="Theoretische Kanalkapazität"
          short="Maximale fehlerfreie Datenrate nach Shannon"
          detailed="C = B * log2(1 + SNR). Dies ist die theoretische Obergrenze - praktische Systeme erreichen 60-80% davon."
        />
      </div>
      <div class="text-2xl font-bold text-blue-500 dark:text-blue-400">
        {formatDataRate(channelCapacityBps)}
      </div>
    </div>

    <!-- Spectral Efficiency -->
    <div class="result-box">
      <div class="result-label">Spektrale Effizienz</div>
      <div class="text-2xl font-bold text-green-600 dark:text-green-400">
        {formatNumber(spectralEfficiency, 2)} bit/s/Hz
      </div>
    </div>

    <!-- Achievable Modulation -->
    <div class="result-box">
      <div class="result-label">Empfohlene Modulation</div>
      <div class="text-2xl font-bold" style="color: {achievableModulation?.color ?? '#6b7280'}">
        {achievableModulation?.name ?? 'Kein Signal'}
      </div>
      {#if achievableModulation}
        <div class="text-xs text-muted mt-1">
          {achievableModulation.bitsPerSymbol} bit/Symbol, min. {achievableModulation.requiredSnrDb} dB
        </div>
      {/if}
    </div>
  </div>

  <!-- Practical Data Rate -->
  {#if practicalDataRate > 0}
    <div class="p-4 bg-surface-secondary rounded-lg mb-6">
      <div class="text-label mb-1">Praktische Datenrate (mit {achievableModulation?.name})</div>
      <div class="text-xl font-bold text-amber-600 dark:text-amber-400">
        ~{formatDataRate(practicalDataRate)}
      </div>
      <div class="text-xs text-muted">
        Annahme: 80% Effizienz, keine Fehlerkorrektur-Overhead
      </div>
    </div>
  {/if}

  <!-- Chart: Spectral Efficiency vs SNR -->
  <div class="w-full overflow-x-auto">
    <svg
      viewBox="0 0 {width} {height}"
      class="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Shannon-Kapazität Diagramm: Spektrale Effizienz über SNR"
    >
      <defs>
        <filter id="capacityMarkerGlow" x="-50%" y="-50%" width="200%" height="200%">
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

        <!-- Modulation scheme regions -->
        {#each modulationSchemes as mod, i (mod.name)}
          {@const nextMod = modulationSchemes[i + 1]}
          {@const x1 = xScale(mod.requiredSnrDb)}
          {@const x2 = nextMod ? xScale(nextMod.requiredSnrDb) : chartWidth}
          <rect
            x={x1}
            y="0"
            width={x2 - x1}
            height={chartHeight}
            fill={mod.color}
            opacity="0.1"
          />
          <text
            x={(x1 + x2) / 2}
            y={chartHeight - 10}
            fill={mod.color}
            font-size="9"
            text-anchor="middle"
            opacity="0.8"
          >
            {mod.name}
          </text>
        {/each}

        <!-- Shannon limit curve -->
        <path
          d={shannonPath}
          fill="none"
          stroke="#3b82f6"
          stroke-width="3"
        />

        <!-- Current position marker -->
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
          filter="url(#capacityMarkerGlow)"
        />
        <circle
          cx={markerPos.x}
          cy={markerPos.y}
          r="5"
          class="fill-amber-200"
        />

        <!-- X-axis -->
        <g transform="translate(0, {chartHeight})">
          <line x1="0" y1="0" x2={chartWidth} y2="0" style="stroke: var(--color-chart-axis)" />
          {#each xTickValues as tickVal (tickVal)}
            <g transform="translate({xScale(tickVal)}, 0)">
              <line y2="8" style="stroke: var(--color-chart-axis)" />
              <text y="24" style="fill: var(--color-chart-text-secondary)" text-anchor="middle" font-size="11">
                {tickVal}
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
            SNR (dB)
          </text>
        </g>

        <!-- Y-axis -->
        <g>
          <line x1="0" y1="0" x2="0" y2={chartHeight} style="stroke: var(--color-chart-axis)" />
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
            y="-55"
            style="fill: var(--color-chart-text)"
            text-anchor="middle"
            font-size="13"
            font-weight="500"
          >
            Spektrale Effizienz (bit/s/Hz)
          </text>
        </g>
      </g>

      <!-- Legend -->
      <g transform="translate({width - margin.right + 10}, {margin.top})">
        <text style="fill: var(--color-chart-text)" font-weight="500" font-size="11">
          Shannon-Limit
        </text>
        <line x1="0" y1="15" x2="24" y2="15" stroke="#3b82f6" stroke-width="3" />
        <text x="30" y="19" style="fill: var(--color-chart-text-secondary)" font-size="10">
          C = log2(1+SNR)
        </text>
      </g>
    </svg>
  </div>

  <!-- Formula Display -->
  <div class="formula-box mt-4">
    <div class="text-xs text-muted mb-1">Shannon-Hartley Theorem:</div>
    <div class="font-mono text-sm text-primary text-center">
      C = B * log<sub>2</sub>(1 + SNR) = B * log<sub>2</sub>(1 + S/N)
    </div>
    <div class="text-xs text-muted mt-2 text-center">
      wobei SNR<sub>linear</sub> = 10<sup>(SNR<sub>dB</sub>/10)</sup>
    </div>
  </div>

  <!-- Modulation Comparison Table -->
  <div class="mt-4">
    <div class="text-label mb-2">Modulationsvergleich</div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border">
            <th class="text-left py-2 px-2">Modulation</th>
            <th class="text-right py-2 px-2">bit/Symbol</th>
            <th class="text-right py-2 px-2">Min. SNR</th>
            <th class="text-right py-2 px-2">Datenrate bei {bandwidthMHz} MHz</th>
          </tr>
        </thead>
        <tbody>
          {#each modulationSchemes as mod (mod.name)}
            {@const dataRate = bandwidthMHz * 1e6 * mod.bitsPerSymbol * 0.8}
            {@const isAchievable = snrDb >= mod.requiredSnrDb}
            <tr class="border-b border-border/50 {isAchievable ? '' : 'opacity-40'}">
              <td class="py-2 px-2 font-medium" style="color: {mod.color}">{mod.name}</td>
              <td class="text-right py-2 px-2">{mod.bitsPerSymbol}</td>
              <td class="text-right py-2 px-2">{mod.requiredSnrDb} dB</td>
              <td class="text-right py-2 px-2">{formatDataRate(dataRate)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
