<script lang="ts">
  import * as d3 from 'd3';
  import { dbmToWatt } from '$lib/utils/conversions';

  interface Props {
    powerWatt?: number;
    width?: number;
    height?: number;
  }

  interface ReferencePoint {
    name: string;
    dbm: number;
    watt: number;
    category: 'communication' | 'radar';
  }

  let { powerWatt, width = 1200, height = 500 }: Props = $props();

  // Chart margins
  const margin = { top: 40, right: 80, bottom: 80, left: 100 };

  // Computed dimensions
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom);

  // Category colors
  const categoryColors = {
    communication: '#3b82f6', // Blue
    radar: '#f97316'          // Orange
  };

  // Reference points for typical applications - Communication
  const communicationPoints: ReferencePoint[] = [
    { name: 'Bluetooth', dbm: 0, watt: 0.001, category: 'communication' },
    { name: 'WiFi', dbm: 20, watt: 0.1, category: 'communication' },
    { name: 'Handy', dbm: 33, watt: 2, category: 'communication' },
    { name: 'Amateurfunk', dbm: 50, watt: 100, category: 'communication' },
    { name: 'Rundfunk', dbm: 60, watt: 1000, category: 'communication' },
  ];

  // Reference points for RADAR systems
  const radarPoints: ReferencePoint[] = [
    { name: 'Automotive Radar', dbm: 10, watt: 0.01, category: 'radar' },
    { name: 'Schiffsradar', dbm: 74, watt: 25000, category: 'radar' },
    { name: 'Wetterradar', dbm: 84, watt: 250000, category: 'radar' },
    { name: 'Flughafen-Radar', dbm: 90, watt: 1000000, category: 'radar' },
    { name: 'Militärradar', dbm: 100, watt: 10000000, category: 'radar' },
  ];

  // Scales - Extended range for RADAR: -30 dBm to 105 dBm, 1 µW to 100 MW
  let xScale = $derived(
    d3.scaleLinear()
      .domain([-30, 105])
      .range([0, chartWidth])
  );

  let yScale = $derived(
    d3.scaleLog()
      .domain([1e-6, 1e8])  // 1 µW to 100 MW
      .range([chartHeight, 0])
  );

  // Generate curve data points
  let curveData = $derived.by(() => {
    const points: { dbm: number; watt: number }[] = [];
    for (let dbm = -30; dbm <= 105; dbm += 0.5) {
      const watt = dbmToWatt(dbm);
      points.push({ dbm, watt });
    }
    return points;
  });

  let lineGenerator = $derived(
    d3.line<{ dbm: number; watt: number }>()
      .x(d => xScale(d.dbm))
      .y(d => yScale(d.watt))
  );

  let markerPosition = $derived.by(() => {
    if (!powerWatt || powerWatt <= 0) return null;
    const dbm = 10 * Math.log10(powerWatt * 1000);
    if (dbm < -30 || dbm > 105) return null;
    return { x: xScale(dbm), y: yScale(powerWatt), dbm, watt: powerWatt };
  });

  function formatPower(watt: number): string {
    if (watt >= 1000000) return `${(watt / 1000000).toFixed(1)} MW`;
    if (watt >= 1000) return `${(watt / 1000).toFixed(1)} kW`;
    if (watt >= 1) return `${watt.toFixed(2)} W`;
    if (watt >= 0.001) return `${(watt * 1000).toFixed(1)} mW`;
    return `${(watt * 1e6).toFixed(1)} µW`;
  }

  const xTickValues = [-30, -20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const yTickValues = [1e-6, 1e-5, 1e-4, 1e-3, 1e-2, 1e-1, 1, 10, 100, 1000, 1e4, 1e5, 1e6, 1e7, 1e8];
  const yTickLabels = ['1 µW', '10 µW', '100 µW', '1 mW', '10 mW', '100 mW', '1 W', '10 W', '100 W', '1 kW', '10 kW', '100 kW', '1 MW', '10 MW', '100 MW'];
</script>

<div class="power-db-chart w-full">
  <svg viewBox="0 0 {width} {height}" class="w-full h-auto" preserveAspectRatio="xMidYMid meet">
    <defs>
      <filter id="powerGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>

    <rect x="0" y="0" width={width} height={height} class="fill-slate-900" />

    <g transform="translate({margin.left}, {margin.top})">
      {#each xTickValues as tickVal (tickVal)}
        <line x1={xScale(tickVal)} y1="0" x2={xScale(tickVal)} y2={chartHeight} class="stroke-slate-700" stroke-dasharray="4,4" />
      {/each}
      {#each yTickValues as tickVal (tickVal)}
        <line x1="0" y1={yScale(tickVal)} x2={chartWidth} y2={yScale(tickVal)} class="stroke-slate-700" stroke-dasharray="4,4" />
      {/each}

      <path d={lineGenerator(curveData)} fill="none" class="stroke-green-400" stroke-width="3" stroke-linecap="round" />

      <!-- Communication reference points -->
      {#each communicationPoints as ref (ref.name)}
        {@const cx = xScale(ref.dbm)}
        {@const cy = yScale(ref.watt)}
        <g class="reference-point">
          <circle cx={cx} cy={cy} r="7" fill={categoryColors.communication} stroke="#1e293b" stroke-width="2" />
          <text x={cx} y={cy - 14} text-anchor="middle" class="fill-blue-300 text-xs font-medium">{ref.name}</text>
          <text x={cx} y={cy + 22} text-anchor="middle" class="fill-slate-500 text-xs">{formatPower(ref.watt)}</text>
        </g>
      {/each}

      <!-- RADAR reference points -->
      {#each radarPoints as ref (ref.name)}
        {@const cx = xScale(ref.dbm)}
        {@const cy = yScale(ref.watt)}
        <g class="reference-point">
          <rect x={cx - 7} y={cy - 7} width="14" height="14" rx="2" fill={categoryColors.radar} stroke="#1e293b" stroke-width="2" />
          <text x={cx} y={cy - 14} text-anchor="middle" class="fill-orange-300 text-xs font-medium">{ref.name}</text>
          <text x={cx} y={cy + 24} text-anchor="middle" class="fill-slate-500 text-xs">{formatPower(ref.watt)}</text>
        </g>
      {/each}

      <g transform="translate(0, {chartHeight})">
        <line x1="0" y1="0" x2={chartWidth} y2="0" class="stroke-slate-500" />
        {#each xTickValues as tickVal (tickVal)}
          <g transform="translate({xScale(tickVal)}, 0)">
            <line y2="6" class="stroke-slate-500" />
            <text y="20" text-anchor="middle" class="fill-slate-300" font-size="12">{tickVal}</text>
          </g>
        {/each}
        <text x={chartWidth / 2} y="40" text-anchor="middle" class="fill-slate-200" font-size="14" font-weight="500">Leistung (dBm)</text>

        <!-- Legend -->
        <g transform="translate({chartWidth / 2 - 140}, 55)">
          <!-- Communication legend -->
          <circle cx="0" cy="0" r="6" fill={categoryColors.communication} stroke="#1e293b" stroke-width="1.5" />
          <text x="12" y="4" class="fill-slate-300" font-size="12">Kommunikation</text>

          <!-- RADAR legend -->
          <rect x="130" y="-6" width="12" height="12" rx="2" fill={categoryColors.radar} stroke="#1e293b" stroke-width="1.5" />
          <text x="148" y="4" class="fill-slate-300" font-size="12">RADAR</text>
        </g>
      </g>

      <g>
        <line x1="0" y1="0" x2="0" y2={chartHeight} class="stroke-slate-500" />
        {#each yTickValues as tickVal, i (tickVal)}
          <g transform="translate(0, {yScale(tickVal)})">
            <line x2="-6" class="stroke-slate-500" />
            <text x="-10" text-anchor="end" dominant-baseline="middle" class="fill-slate-300" font-size="11">{yTickLabels[i]}</text>
          </g>
        {/each}
        <text transform="rotate(-90)" x={-chartHeight / 2} y="-70" text-anchor="middle" class="fill-slate-200" font-size="14" font-weight="500">Leistung (Watt)</text>
      </g>

      {#if markerPosition}
        <line x1={markerPosition.x} y1="0" x2={markerPosition.x} y2={chartHeight} class="stroke-amber-400" stroke-width="1.5" stroke-dasharray="6,3" opacity="0.8" />
        <line x1="0" y1={markerPosition.y} x2={chartWidth} y2={markerPosition.y} class="stroke-amber-400" stroke-width="1.5" stroke-dasharray="6,3" opacity="0.8" />
        <circle cx={markerPosition.x} cy={markerPosition.y} r="10" class="fill-amber-400" filter="url(#powerGlow)" />
        <circle cx={markerPosition.x} cy={markerPosition.y} r="5" class="fill-amber-200" />
        {@const tooltipX = markerPosition.x > chartWidth / 2 ? markerPosition.x - 130 : markerPosition.x + 15}
        {@const tooltipY = markerPosition.y > chartHeight / 2 ? markerPosition.y - 55 : markerPosition.y + 10}
        <g transform="translate({tooltipX}, {tooltipY})">
          <rect x="0" y="0" width="120" height="45" rx="4" class="fill-slate-800" stroke="#475569" />
          <text x="10" y="18" class="fill-slate-200" font-size="11">P = {formatPower(markerPosition.watt)}</text>
          <text x="10" y="35" class="fill-slate-200" font-size="11">P = {markerPosition.dbm.toFixed(1)} dBm</text>
        </g>
      {/if}

      <text x={chartWidth / 2} y="-15" text-anchor="middle" class="fill-slate-100" font-size="16" font-weight="600">Leistung: Watt - dBm</text>
    </g>
  </svg>
</div>

<style>
  .power-db-chart { container-type: inline-size; }
</style>
