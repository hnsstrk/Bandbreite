<script lang="ts">
  import * as d3 from 'd3';
  import { wattToDbm } from '$lib/utils/conversions';
  import { IEEE_BANDS, NATO_BANDS } from '$lib/data/bands';

  interface Props {
    width?: number;
    height?: number;
  }

  interface DataPoint {
    name: string;
    nameDE: string;
    frequencyHz: number;
    powerWatt: number;
    category: 'communication' | 'radar' | 'satellite' | 'iot' | 'industrial';
    labelOffset?: { x: number; y: number }; // Optional label offset for collision avoidance
  }

  // Tooltip state
  let tooltipVisible = $state(false);
  let tooltipX = $state(0);
  let tooltipY = $state(0);
  let tooltipData = $state<DataPoint | null>(null);

  // Container reference for tooltip positioning
  let containerRef: HTMLDivElement | null = $state(null);

  let { width = 1200, height = 600 }: Props = $props();

  // Band display mode toggle: 'ieee' or 'nato'
  let bandMode = $state<'ieee' | 'nato'>('ieee');

  // Category filter toggles
  let showCommunication = $state(true);
  let showRadar = $state(true);
  let showSatellite = $state(true);
  let showIot = $state(true);
  let showIndustrial = $state(true);
  let showIEEEBands = $state(true);

  // Chart margins - increased for dual axes
  const margin = { top: 60, right: 100, bottom: 100, left: 100 };

  // Computed dimensions
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom);

  // Speed of light for wavelength calculation
  const SPEED_OF_LIGHT = 299792458; // m/s

  // Category colors
  const categoryColors = {
    communication: '#3b82f6', // Blue
    radar: '#f97316',          // Orange
    satellite: '#22c55e',      // Green
    iot: '#8b5cf6',            // Purple
    industrial: '#ec4899'      // Pink
  };

  // Communication data points (researched values)
  const communicationPoints: DataPoint[] = [
    { name: 'Bluetooth', nameDE: 'Bluetooth', frequencyHz: 2.4e9, powerWatt: 0.001, category: 'communication' },
    { name: 'WiFi 2.4 GHz', nameDE: 'WLAN 2,4 GHz', frequencyHz: 2.4e9, powerWatt: 0.1, category: 'communication', labelOffset: { x: 0, y: -28 } },
    { name: 'WiFi 5 GHz', nameDE: 'WLAN 5 GHz', frequencyHz: 5e9, powerWatt: 0.2, category: 'communication' },
    { name: 'Cell Phone', nameDE: 'Handy', frequencyHz: 1.8e9, powerWatt: 2, category: 'communication' },
    { name: 'Ham Radio HF', nameDE: 'Amateurfunk KW', frequencyHz: 14e6, powerWatt: 100, category: 'communication' },
    { name: 'Ham Radio VHF', nameDE: 'Amateurfunk VHF', frequencyHz: 145e6, powerWatt: 50, category: 'communication' },
    { name: 'AM Broadcast', nameDE: 'AM Rundfunk', frequencyHz: 1e6, powerWatt: 50000, category: 'communication' },
    { name: 'FM Broadcast', nameDE: 'FM Rundfunk', frequencyHz: 100e6, powerWatt: 100000, category: 'communication' },
    // Mobile base stations (researched: 43 dBm = ~20W typical, 46 dBm = ~40W max)
    { name: '4G/5G Base Station', nameDE: '4G/5G Basisstation', frequencyHz: 2.6e9, powerWatt: 40, category: 'communication' },
    { name: '2G/3G Base Station', nameDE: '2G/3G Basisstation', frequencyHz: 900e6, powerWatt: 20, category: 'communication' },
  ];

  // Radar data points (researched values)
  const radarPoints: DataPoint[] = [
    { name: 'Automotive Radar', nameDE: 'Kfz-Radar', frequencyHz: 77e9, powerWatt: 0.05, category: 'radar' },
    { name: 'Ship Radar', nameDE: 'Schiffsradar', frequencyHz: 9.4e9, powerWatt: 25000, category: 'radar' },
    // Weather and Airport radar have offset to avoid overlap
    { name: 'Weather Radar', nameDE: 'Wetterradar', frequencyHz: 2.8e9, powerWatt: 750000, category: 'radar', labelOffset: { x: -40, y: 0 } },
    { name: 'Airport Radar', nameDE: 'Flughafenradar', frequencyHz: 2.8e9, powerWatt: 1300000, category: 'radar', labelOffset: { x: 40, y: 0 } },
    { name: 'Military Radar', nameDE: 'Militärradar', frequencyHz: 442e6, powerWatt: 32000000, category: 'radar' },
  ];

  // Satellite data points (researched values)
  const satellitePoints: DataPoint[] = [
    // GPS: 25-27W transmit power at L1 (1575.42 MHz)
    { name: 'GPS Satellite', nameDE: 'GPS Satellit', frequencyHz: 1.575e9, powerWatt: 27, category: 'satellite' },
    // Ku-Band satellites: 100-240W per transponder
    { name: 'Ku-Band Sat', nameDE: 'Ku-Band Satellit', frequencyHz: 12e9, powerWatt: 150, category: 'satellite' },
    // Ka-Band satellites: typically higher power
    { name: 'Ka-Band Sat', nameDE: 'Ka-Band Satellit', frequencyHz: 20e9, powerWatt: 200, category: 'satellite' },
    // Satellite uplink earth station (2.5kW typical)
    { name: 'Sat Uplink', nameDE: 'Sat-Bodenstation', frequencyHz: 14e9, powerWatt: 2500, category: 'satellite' },
  ];

  // IoT and RFID data points (researched values)
  const iotPoints: DataPoint[] = [
    // LoRaWAN: 25mW Europe, up to 1W USA
    { name: 'LoRaWAN EU', nameDE: 'LoRaWAN EU', frequencyHz: 868e6, powerWatt: 0.025, category: 'iot' },
    { name: 'LoRaWAN US', nameDE: 'LoRaWAN US', frequencyHz: 915e6, powerWatt: 1, category: 'iot' },
    // UHF RFID: up to 4W EIRP
    { name: 'UHF RFID', nameDE: 'UHF RFID', frequencyHz: 868e6, powerWatt: 2, category: 'iot', labelOffset: { x: 50, y: 0 } },
    // NFC: milliwatts range
    { name: 'NFC', nameDE: 'NFC', frequencyHz: 13.56e6, powerWatt: 0.002, category: 'iot' },
  ];

  // Industrial data points (researched values)
  const industrialPoints: DataPoint[] = [
    // Microwave oven: 700-1000W typical output at 2.45 GHz
    { name: 'Microwave Oven', nameDE: 'Mikrowellenherd', frequencyHz: 2.45e9, powerWatt: 1000, category: 'industrial', labelOffset: { x: 0, y: 28 } },
  ];

  // All data points combined and filtered by category
  let allPoints = $derived([
    ...(showCommunication ? communicationPoints : []),
    ...(showRadar ? radarPoints : []),
    ...(showSatellite ? satellitePoints : []),
    ...(showIot ? iotPoints : []),
    ...(showIndustrial ? industrialPoints : [])
  ]);

  // Frequency range: 100 kHz to 100 GHz (logarithmic)
  const MIN_FREQ = 100e3;   // 100 kHz
  const MAX_FREQ = 100e9;   // 100 GHz

  // Power range: 1 mW to 100 MW (logarithmic)
  const MIN_POWER = 1e-3;   // 1 mW
  const MAX_POWER = 1e8;    // 100 MW

  // Scales
  let xScale = $derived(
    d3.scaleLog()
      .domain([MIN_FREQ, MAX_FREQ])
      .range([0, chartWidth])
  );

  let yScale = $derived(
    d3.scaleLog()
      .domain([MIN_POWER, MAX_POWER])
      .range([chartHeight, 0])
  );

  // Wavelength calculation for top axis
  function freqToWavelength(freqHz: number): number {
    return SPEED_OF_LIGHT / freqHz;
  }

  // Format frequency with SI prefixes
  function formatFrequency(hz: number): string {
    if (hz >= 1e12) return `${(hz / 1e12).toFixed(1)} THz`;
    if (hz >= 1e9) return `${(hz / 1e9).toFixed(0)} GHz`;
    if (hz >= 1e6) return `${(hz / 1e6).toFixed(0)} MHz`;
    if (hz >= 1e3) return `${(hz / 1e3).toFixed(0)} kHz`;
    return `${hz.toFixed(0)} Hz`;
  }

  // Format wavelength with SI prefixes
  function formatWavelength(m: number): string {
    if (m >= 1e3) return `${(m / 1e3).toFixed(0)} km`;
    if (m >= 1) return `${m.toFixed(0)} m`;
    if (m >= 1e-2) return `${(m * 100).toFixed(0)} cm`;
    if (m >= 1e-3) return `${(m * 1000).toFixed(1)} mm`;
    return `${(m * 1e6).toFixed(0)} \u03BCm`;
  }

  // Format power with SI prefixes
  function formatPower(watt: number): string {
    if (watt >= 1e6) return `${(watt / 1e6).toFixed(1)} MW`;
    if (watt >= 1e3) return `${(watt / 1e3).toFixed(0)} kW`;
    if (watt >= 1) return `${watt.toFixed(1)} W`;
    if (watt >= 1e-3) return `${(watt * 1000).toFixed(0)} mW`;
    return `${(watt * 1e6).toFixed(0)} \u03BCW`;
  }

  // Format dBm
  function formatDbm(watt: number): string {
    const dbm = wattToDbm(watt);
    return `${dbm.toFixed(0)} dBm`;
  }

  // X-axis tick values (frequency) - logarithmic spacing
  const xTickValues = [1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11];
  const xTickLabels = ['100 kHz', '1 MHz', '10 MHz', '100 MHz', '1 GHz', '10 GHz', '100 GHz'];

  // Wavelength tick values for top axis (corresponding to frequency ticks)
  let wavelengthTickValues = $derived(xTickValues.map(f => freqToWavelength(f)));

  // Y-axis tick values (power in Watt) - logarithmic spacing
  const yTickValues = [1e-3, 1e-2, 1e-1, 1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8];
  const yTickLabels = ['1 mW', '10 mW', '100 mW', '1 W', '10 W', '100 W', '1 kW', '10 kW', '100 kW', '1 MW', '10 MW', '100 MW'];

  // dBm values for right axis (corresponding to power ticks)
  const yDbmLabels = yTickValues.map(w => `${wattToDbm(w).toFixed(0)} dBm`);

  // Filter bands that are in our frequency range
  let visibleIEEEBands = $derived(
    IEEE_BANDS.filter(band => band.maxHz >= MIN_FREQ && band.minHz <= MAX_FREQ)
  );

  let visibleNATOBands = $derived(
    NATO_BANDS.filter(band => band.maxHz >= MIN_FREQ && band.minHz <= MAX_FREQ)
  );

  // Current visible bands based on toggle
  let visibleBands = $derived(bandMode === 'ieee' ? visibleIEEEBands : visibleNATOBands);

  // Toggle band mode
  function toggleBandMode() {
    bandMode = bandMode === 'ieee' ? 'nato' : 'ieee';
  }

  // Category labels in German
  const categoryLabels: Record<DataPoint['category'], string> = {
    communication: 'Kommunikation',
    radar: 'RADAR',
    satellite: 'Satellit',
    iot: 'IoT/RFID',
    industrial: 'Industrie'
  };

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

    // Ensure tooltip stays within container bounds
    if (x + tooltipWidth > containerRect.width) {
      x = event.clientX - containerRect.left - tooltipWidth - offset;
    }
    if (y + tooltipHeight > containerRect.height) {
      y = event.clientY - containerRect.top - tooltipHeight - offset;
    }

    // Ensure tooltip doesn't go negative
    if (x < 0) x = offset;
    if (y < 0) y = offset;

    tooltipX = x;
    tooltipY = y;
  }

</script>

<div class="power-frequency-chart w-full relative" bind:this={containerRef}>
  <!-- Controls Row -->
  <div class="flex flex-wrap items-center gap-6 mb-4">
    <!-- Band Mode Toggle Switch with Show/Hide -->
    <div class="flex items-center gap-3">
      <span class="text-sm text-slate-400">Frequenzbänder:</span>
      <!-- Show/Hide Bands Toggle -->
      <label class="flex items-center gap-1.5 cursor-pointer">
        <button
          type="button"
          onclick={() => showIEEEBands = !showIEEEBands}
          class="relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 focus:ring-indigo-500
                 {showIEEEBands ? 'bg-indigo-500' : 'bg-slate-600'}"
          role="switch"
          aria-checked={showIEEEBands}
          aria-label="Frequenzbänder anzeigen"
        >
          <span
            class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200
                   {showIEEEBands ? 'translate-x-4' : 'translate-x-0'}"
          ></span>
        </button>
        <span class="text-xs {showIEEEBands ? 'text-indigo-400' : 'text-slate-500'}">Anzeigen</span>
      </label>
      <!-- IEEE/NATO Switch -->
      <div class="flex items-center gap-2 ml-2 pl-2 border-l border-slate-700">
        <span class="text-xs font-medium {bandMode === 'ieee' ? 'text-purple-400' : 'text-slate-500'}">IEEE</span>
        <button
          type="button"
          onclick={toggleBandMode}
          class="relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500
                 {bandMode === 'ieee' ? 'bg-purple-600' : 'bg-green-600'}"
          role="switch"
          aria-checked={bandMode === 'nato'}
          aria-label="Zwischen IEEE und NATO Bändern wechseln"
        >
          <span
            class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200
                   {bandMode === 'nato' ? 'translate-x-[22px]' : 'translate-x-0'}"
          ></span>
        </button>
        <span class="text-xs font-medium {bandMode === 'nato' ? 'text-green-400' : 'text-slate-500'}">NATO</span>
      </div>
    </div>

    <!-- Category Filter Toggles -->
    <div class="flex items-center gap-4">
      <span class="text-sm text-slate-400">Filter:</span>

      <!-- Communication Toggle -->
      <label class="flex items-center gap-1.5 cursor-pointer">
        <button
          type="button"
          onclick={() => showCommunication = !showCommunication}
          class="relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 focus:ring-blue-500
                 {showCommunication ? 'bg-blue-500' : 'bg-slate-600'}"
          role="switch"
          aria-checked={showCommunication}
          aria-label="Kommunikation anzeigen"
        >
          <span
            class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200
                   {showCommunication ? 'translate-x-4' : 'translate-x-0'}"
          ></span>
        </button>
        <span class="text-xs {showCommunication ? 'text-blue-400' : 'text-slate-500'}">Kommunikation</span>
      </label>

      <!-- Radar Toggle -->
      <label class="flex items-center gap-1.5 cursor-pointer">
        <button
          type="button"
          onclick={() => showRadar = !showRadar}
          class="relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 focus:ring-orange-500
                 {showRadar ? 'bg-orange-500' : 'bg-slate-600'}"
          role="switch"
          aria-checked={showRadar}
          aria-label="RADAR anzeigen"
        >
          <span
            class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200
                   {showRadar ? 'translate-x-4' : 'translate-x-0'}"
          ></span>
        </button>
        <span class="text-xs {showRadar ? 'text-orange-400' : 'text-slate-500'}">RADAR</span>
      </label>

      <!-- Satellite Toggle -->
      <label class="flex items-center gap-1.5 cursor-pointer">
        <button
          type="button"
          onclick={() => showSatellite = !showSatellite}
          class="relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 focus:ring-green-500
                 {showSatellite ? 'bg-green-500' : 'bg-slate-600'}"
          role="switch"
          aria-checked={showSatellite}
          aria-label="Satellit anzeigen"
        >
          <span
            class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200
                   {showSatellite ? 'translate-x-4' : 'translate-x-0'}"
          ></span>
        </button>
        <span class="text-xs {showSatellite ? 'text-green-400' : 'text-slate-500'}">Satellit</span>
      </label>

      <!-- IoT Toggle -->
      <label class="flex items-center gap-1.5 cursor-pointer">
        <button
          type="button"
          onclick={() => showIot = !showIot}
          class="relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 focus:ring-purple-500
                 {showIot ? 'bg-purple-500' : 'bg-slate-600'}"
          role="switch"
          aria-checked={showIot}
          aria-label="IoT/RFID anzeigen"
        >
          <span
            class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200
                   {showIot ? 'translate-x-4' : 'translate-x-0'}"
          ></span>
        </button>
        <span class="text-xs {showIot ? 'text-purple-400' : 'text-slate-500'}">IoT/RFID</span>
      </label>

      <!-- Industrial Toggle -->
      <label class="flex items-center gap-1.5 cursor-pointer">
        <button
          type="button"
          onclick={() => showIndustrial = !showIndustrial}
          class="relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 focus:ring-pink-500
                 {showIndustrial ? 'bg-pink-500' : 'bg-slate-600'}"
          role="switch"
          aria-checked={showIndustrial}
          aria-label="Industrie anzeigen"
        >
          <span
            class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200
                   {showIndustrial ? 'translate-x-4' : 'translate-x-0'}"
          ></span>
        </button>
        <span class="text-xs {showIndustrial ? 'text-pink-400' : 'text-slate-500'}">Industrie</span>
      </label>
    </div>
  </div>

  <svg viewBox="0 0 {width} {height}" class="w-full h-auto" preserveAspectRatio="xMidYMid meet">
    <defs>
      <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <!-- Clip path for chart area -->
      <clipPath id="chartClip">
        <rect x="0" y="0" width={chartWidth} height={chartHeight} />
      </clipPath>
    </defs>

    <!-- Background -->
    <rect x="0" y="0" width={width} height={height} style="fill: var(--color-chart-bg)" />

    <g transform="translate({margin.left}, {margin.top})">
      <!-- Band backgrounds (full height, based on toggle selection) -->
      {#if showIEEEBands}
      <g clip-path="url(#chartClip)" opacity="0.18">
        {#each visibleBands as band (band.id)}
          {@const x1 = Math.max(0, xScale(Math.max(MIN_FREQ, band.minHz)))}
          {@const x2 = Math.min(chartWidth, xScale(Math.min(MAX_FREQ, band.maxHz)))}
          {@const bandWidth = x2 - x1}
          {#if bandWidth > 0}
            <rect
              x={x1}
              y="0"
              width={bandWidth}
              height={chartHeight}
              fill={band.color}
            />
            {#if bandWidth > 30}
              <text
                x={x1 + bandWidth / 2}
                y="20"
                text-anchor="middle"
                class="fill-white font-semibold"
                font-size="13"
                style="text-shadow: 0 1px 3px rgba(0,0,0,0.8);"
              >
                {band.name}
              </text>
            {/if}
          {/if}
        {/each}
      </g>
      {/if}

      <!-- Grid lines - vertical (frequency) -->
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

      <!-- Grid lines - horizontal (power) -->
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
          <!-- Invisible hit area for easier hover detection -->
          <circle
            cx={cx}
            cy={cy}
            r="12"
            fill="transparent"
            class="cursor-pointer"
          />
          <!-- Shape based on category -->
          {#if point.category === 'communication'}
            <circle
              cx={cx}
              cy={cy}
              r="5"
              fill={color}
              stroke="#1e293b"
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
              stroke="#1e293b"
              stroke-width="1.5"
              filter="url(#pointGlow)"
              class="pointer-events-none"
            />
          {:else if point.category === 'satellite'}
            <polygon
              points="{cx},{cy - 6} {cx + 5},{cy + 4} {cx - 5},{cy + 4}"
              fill={color}
              stroke="#1e293b"
              stroke-width="1.5"
              filter="url(#pointGlow)"
              class="pointer-events-none"
            />
          {:else if point.category === 'iot'}
            <polygon
              points="{cx},{cy - 5} {cx + 5},{cy} {cx},{cy + 5} {cx - 5},{cy}"
              fill={color}
              stroke="#1e293b"
              stroke-width="1.5"
              filter="url(#pointGlow)"
              class="pointer-events-none"
            />
          {:else if point.category === 'industrial'}
            <circle
              cx={cx}
              cy={cy}
              r="6"
              fill={color}
              stroke="#1e293b"
              stroke-width="1.5"
              filter="url(#pointGlow)"
              class="pointer-events-none"
            />
            <circle
              cx={cx}
              cy={cy}
              r="2"
              fill="#1e293b"
              class="pointer-events-none"
            />
          {/if}
        </g>
      {/each}

      <!-- X-axis bottom (Frequency) -->
      <g transform="translate(0, {chartHeight})">
        <line x1="0" y1="0" x2={chartWidth} y2="0" style="stroke: var(--color-chart-axis)" stroke-width="1" />
        {#each xTickValues as tickVal, i (tickVal)}
          <g transform="translate({xScale(tickVal)}, 0)">
            <line y2="8" style="stroke: var(--color-chart-axis)" />
            <text y="24" text-anchor="middle" style="fill: var(--color-chart-text-secondary)" font-size="11">
              {xTickLabels[i]}
            </text>
          </g>
        {/each}
        <text
          x={chartWidth / 2}
          y="48"
          text-anchor="middle"
          style="fill: var(--color-chart-text)"
          font-size="14"
          font-weight="500"
        >
          Frequenz (Hz)
        </text>
      </g>

      <!-- X-axis top (Wavelength) -->
      <g>
        <line x1="0" y1="0" x2={chartWidth} y2="0" style="stroke: var(--color-chart-axis)" stroke-width="1" />
        {#each xTickValues as tickVal, i (tickVal)}
          {@const wavelength = freqToWavelength(tickVal)}
          <g transform="translate({xScale(tickVal)}, 0)">
            <line y2="-8" style="stroke: var(--color-chart-axis)" />
            <text y="-14" text-anchor="middle" style="fill: var(--color-text-tertiary)" font-size="10">
              {formatWavelength(wavelength)}
            </text>
          </g>
        {/each}
        <text
          x={chartWidth / 2}
          y="-36"
          text-anchor="middle"
          style="fill: var(--color-text-tertiary)"
          font-size="12"
        >
          Wellenlänge (m)
        </text>
      </g>

      <!-- Y-axis left (Power in Watt) -->
      <g>
        <line x1="0" y1="0" x2="0" y2={chartHeight} style="stroke: var(--color-chart-axis)" stroke-width="1" />
        {#each yTickValues as tickVal, i (tickVal)}
          <g transform="translate(0, {yScale(tickVal)})">
            <line x2="-8" style="stroke: var(--color-chart-axis)" />
            <text x="-12" text-anchor="end" dominant-baseline="middle" style="fill: var(--color-chart-text-secondary)" font-size="10">
              {yTickLabels[i]}
            </text>
          </g>
        {/each}
        <text
          transform="rotate(-90)"
          x={-chartHeight / 2}
          y="-70"
          text-anchor="middle"
          style="fill: var(--color-chart-text)"
          font-size="14"
          font-weight="500"
        >
          Leistung (Watt)
        </text>
      </g>

      <!-- Y-axis right (Power in dBm) -->
      <g transform="translate({chartWidth}, 0)">
        <line x1="0" y1="0" x2="0" y2={chartHeight} style="stroke: var(--color-chart-axis)" stroke-width="1" />
        {#each yTickValues as tickVal, i (tickVal)}
          <g transform="translate(0, {yScale(tickVal)})">
            <line x2="8" style="stroke: var(--color-chart-axis)" />
            <text x="12" text-anchor="start" dominant-baseline="middle" style="fill: var(--color-text-tertiary)" font-size="10">
              {yDbmLabels[i]}
            </text>
          </g>
        {/each}
        <text
          transform="rotate(90)"
          x={chartHeight / 2}
          y="-70"
          text-anchor="middle"
          style="fill: var(--color-text-tertiary)"
          font-size="12"
        >
          Leistung (dBm)
        </text>
      </g>

      <!-- Legend -->
      <g transform="translate({chartWidth / 2 - 300}, {chartHeight + 65})">
        <!-- Communication legend -->
        <circle cx="0" cy="0" r="6" fill={categoryColors.communication} stroke="#1e293b" stroke-width="1.5" />
        <text x="12" y="4" style="fill: var(--color-chart-text-secondary)" font-size="11">Kommunikation</text>

        <!-- Radar legend -->
        <rect x="115" y="-6" width="12" height="12" rx="2" fill={categoryColors.radar} stroke="#1e293b" stroke-width="1.5" />
        <text x="132" y="4" style="fill: var(--color-chart-text-secondary)" font-size="11">RADAR</text>

        <!-- Satellite legend -->
        <polygon points="200,-6 206,4 194,4" fill={categoryColors.satellite} stroke="#1e293b" stroke-width="1.5" />
        <text x="214" y="4" style="fill: var(--color-chart-text-secondary)" font-size="11">Satellit</text>

        <!-- IoT legend -->
        <polygon points="285,0 293,-6 301,0 293,6" fill={categoryColors.iot} stroke="#1e293b" stroke-width="1.5" />
        <text x="308" y="4" style="fill: var(--color-chart-text-secondary)" font-size="11">IoT/RFID</text>

        <!-- Industrial legend -->
        <g transform="translate(390, 0)">
          <circle cx="0" cy="0" r="6" fill={categoryColors.industrial} stroke="#1e293b" stroke-width="1.5" />
          <circle cx="0" cy="0" r="2.5" fill="#1e293b" />
        </g>
        <text x="402" y="4" style="fill: var(--color-chart-text-secondary)" font-size="11">Industrie</text>

        <!-- Current band system indicator -->
        <rect x="480" y="-6" width="12" height="12" rx="1" fill={bandMode === 'ieee' ? '#6366f1' : '#22c55e'} opacity="0.5" />
        <text x="498" y="4" style="fill: var(--color-text-tertiary)" font-size="11">{bandMode === 'ieee' ? 'IEEE' : 'NATO'}-Bänder</text>
      </g>
    </g>
  </svg>

  <!-- Tooltip -->
  {#if tooltipVisible && tooltipData}
    <div
      class="absolute z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-3 min-w-[220px] pointer-events-none"
      style="left: {tooltipX}px; top: {tooltipY}px;"
    >
      <!-- Header with name and category color indicator -->
      <div class="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700">
        <span
          class="w-3 h-3 rounded-full flex-shrink-0"
          style="background-color: {categoryColors[tooltipData.category]};"
        ></span>
        <span class="text-white font-semibold text-sm">{tooltipData.nameDE}</span>
      </div>

      <!-- Data rows -->
      <div class="space-y-1.5 text-xs">
        <div class="flex justify-between">
          <span class="text-slate-400">Frequenz:</span>
          <span class="text-slate-200 font-medium">{formatFrequency(tooltipData.frequencyHz)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Leistung:</span>
          <span class="text-slate-200 font-medium">{formatPower(tooltipData.powerWatt)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Leistung (dBm):</span>
          <span class="text-slate-200 font-medium">{formatDbm(tooltipData.powerWatt)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Kategorie:</span>
          <span class="text-slate-200 font-medium">{categoryLabels[tooltipData.category]}</span>
        </div>
      </div>
    </div>
  {/if}
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
