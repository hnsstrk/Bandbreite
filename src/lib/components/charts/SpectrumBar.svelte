<script lang="ts">
  import * as d3 from 'd3';
  import { IEEE_BANDS, NATO_BANDS, CIVILIAN_BANDS, type FrequencyBand } from '$lib/data/bands';

  interface Props {
    frequencyHz?: number;
    showLabels?: boolean;
  }

  let { frequencyHz, showLabels = true }: Props = $props();

  // EM spectrum bands with their frequency ranges (in Hz) and colors
  const emBands = [
    { name: 'Radio', minHz: 3e3, maxHz: 3e8, color: '#3b82f6' },
    { name: 'Microwave', minHz: 3e8, maxHz: 3e11, color: '#22c55e' },
    { name: 'Infrared', minHz: 3e11, maxHz: 4e14, color: '#f97316' },
    { name: 'Visible', minHz: 4e14, maxHz: 8e14, color: 'url(#visibleGradient)' },
    { name: 'Ultraviolet', minHz: 8e14, maxHz: 3e16, color: '#a855f7' },
    { name: 'X-Ray', minHz: 3e16, maxHz: 3e19, color: '#ec4899' },
    { name: 'Gamma', minHz: 3e19, maxHz: 3e21, color: '#ef4444' }
  ];

  // Band display mode
  type BandMode = 'ieee' | 'nato' | 'civilian';
  let bandMode = $state<BandMode>('ieee');

  // Get bands based on mode - filter to visible range
  let activeBands = $derived.by(() => {
    const minVisible = 3e3;
    const maxVisible = 3e12; // Show up to 3 THz for technical bands

    const filterBands = (bands: FrequencyBand[]) =>
      bands.filter(b => b.maxHz >= minVisible && b.minHz <= maxVisible);

    switch (bandMode) {
      case 'ieee': return filterBands(IEEE_BANDS);
      case 'nato': return filterBands(NATO_BANDS);
      case 'civilian': return filterBands(CIVILIAN_BANDS);
    }
  });

  // Spectrum range
  const minFrequency = 3e3;  // 3 kHz
  const maxFrequency = 3e21; // 3 ZHz (beyond gamma)

  // Technical bands range (for lower bar)
  const techMinFreq = 3e3;   // 3 kHz
  const techMaxFreq = 3e12;  // 3 THz

  // Dimensions
  const margin = { top: 8, right: 16, bottom: 24, left: 16 };
  const rowHeight = 32;
  const emHeight = 48;
  const labelWidth = 70;
  const gap = 8;

  let containerWidth = $state(600);
  let containerElement: HTMLDivElement;

  // Reactive width calculation
  let innerWidth = $derived(Math.max(containerWidth - margin.left - margin.right - labelWidth, 100));

  // D3 logarithmic scales
  let xScaleEM = $derived(
    d3.scaleLog()
      .domain([minFrequency, maxFrequency])
      .range([0, innerWidth])
  );

  let xScaleTech = $derived(
    d3.scaleLog()
      .domain([techMinFreq, techMaxFreq])
      .range([0, innerWidth])
  );

  // Calculate EM band rectangles
  let emBandRects = $derived(
    emBands.map(band => {
      const x = xScaleEM(band.minHz);
      const width = xScaleEM(band.maxHz) - xScaleEM(band.minHz);
      return { ...band, x, width };
    })
  );

  // Calculate technical band rectangles
  let techBandRects = $derived(
    activeBands.map(band => {
      const clampedMin = Math.max(band.minHz, techMinFreq);
      const clampedMax = Math.min(band.maxHz, techMaxFreq);
      const x = xScaleTech(clampedMin);
      const width = xScaleTech(clampedMax) - xScaleTech(clampedMin);
      return { ...band, x, width };
    })
  );

  // Marker positions
  let markerPositionEM = $derived(
    frequencyHz && frequencyHz >= minFrequency && frequencyHz <= maxFrequency
      ? xScaleEM(frequencyHz)
      : null
  );

  let markerPositionTech = $derived(
    frequencyHz && frequencyHz >= techMinFreq && frequencyHz <= techMaxFreq
      ? xScaleTech(frequencyHz)
      : null
  );

  // Format frequency for display
  function formatFrequency(hz: number): string {
    if (hz >= 1e18) return `${(hz / 1e18).toFixed(1)} EHz`;
    if (hz >= 1e15) return `${(hz / 1e15).toFixed(1)} PHz`;
    if (hz >= 1e12) return `${(hz / 1e12).toFixed(1)} THz`;
    if (hz >= 1e9) return `${(hz / 1e9).toFixed(1)} GHz`;
    if (hz >= 1e6) return `${(hz / 1e6).toFixed(1)} MHz`;
    if (hz >= 1e3) return `${(hz / 1e3).toFixed(1)} kHz`;
    return `${hz.toFixed(0)} Hz`;
  }

  // ResizeObserver for responsive width
  $effect(() => {
    if (!containerElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidth = entry.contentRect.width;
      }
    });

    resizeObserver.observe(containerElement);

    return () => {
      resizeObserver.disconnect();
    };
  });

  const totalHeight = margin.top + emHeight + gap + rowHeight + margin.bottom + 20;
</script>

<div
  bind:this={containerElement}
  class="w-full bg-slate-800 rounded-lg p-2"
  role="img"
  aria-label="Electromagnetic spectrum visualization"
>
  <!-- Band mode selector -->
  <div class="flex gap-2 mb-3 ml-2">
    <span class="text-slate-400 text-sm">Bänder:</span>
    <button
      class="px-2 py-0.5 text-xs rounded transition-colors {bandMode === 'ieee' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
      onclick={() => bandMode = 'ieee'}
    >
      IEEE
    </button>
    <button
      class="px-2 py-0.5 text-xs rounded transition-colors {bandMode === 'nato' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
      onclick={() => bandMode = 'nato'}
    >
      NATO
    </button>
    <button
      class="px-2 py-0.5 text-xs rounded transition-colors {bandMode === 'civilian' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
      onclick={() => bandMode = 'civilian'}
    >
      Zivil
    </button>
  </div>

  <svg width="100%" height={totalHeight}>
    <defs>
      <!-- Visible light gradient: red to violet -->
      <linearGradient id="visibleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ef4444" />
        <stop offset="20%" stop-color="#f97316" />
        <stop offset="40%" stop-color="#eab308" />
        <stop offset="60%" stop-color="#22c55e" />
        <stop offset="80%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#8b5cf6" />
      </linearGradient>
    </defs>

    <g transform="translate({margin.left}, {margin.top})">
      <!-- Row label: EM Spectrum -->
      <text
        x="0"
        y={emHeight / 2}
        dominant-baseline="middle"
        class="fill-slate-400 text-xs font-medium"
      >
        EM
      </text>

      <!-- EM Spectrum band rectangles -->
      <g transform="translate({labelWidth}, 0)">
        {#each emBandRects as band (band.name)}
          <rect
            x={band.x}
            y="0"
            width={band.width}
            height={emHeight}
            fill={band.color}
            stroke="#1e293b"
            stroke-width="1"
          />

          <!-- Band labels -->
          {#if showLabels && band.width > 30}
            <text
              x={band.x + band.width / 2}
              y={emHeight / 2}
              text-anchor="middle"
              dominant-baseline="middle"
              class="fill-white text-xs font-medium pointer-events-none"
              style="text-shadow: 0 1px 2px rgba(0,0,0,0.8);"
            >
              {band.name}
            </text>
          {/if}
        {/each}

        <!-- EM Frequency marker -->
        {#if markerPositionEM !== null && frequencyHz}
          <line
            x1={markerPositionEM}
            y1="-4"
            x2={markerPositionEM}
            y2={emHeight + 4}
            stroke="#ffffff"
            stroke-width="2"
            stroke-dasharray="4,2"
          />
          <circle
            cx={markerPositionEM}
            cy={emHeight / 2}
            r="4"
            fill="#ffffff"
            stroke="#1e293b"
            stroke-width="1"
          />
        {/if}
      </g>

      <!-- Technical Bands Row -->
      <g transform="translate(0, {emHeight + gap})">
        <!-- Row label -->
        <text
          x="0"
          y={rowHeight / 2}
          dominant-baseline="middle"
          class="fill-slate-400 text-xs font-medium"
        >
          {bandMode === 'ieee' ? 'IEEE' : bandMode === 'nato' ? 'NATO' : 'Zivil'}
        </text>

        <g transform="translate({labelWidth}, 0)">
          <!-- Background -->
          <rect
            x="0"
            y="0"
            width={innerWidth}
            height={rowHeight}
            fill="#1e293b"
            stroke="#334155"
            stroke-width="1"
          />

          <!-- Band rectangles -->
          {#each techBandRects as band (band.id)}
            <rect
              x={band.x}
              y="2"
              width={Math.max(band.width, 2)}
              height={rowHeight - 4}
              fill={band.color}
              opacity="0.85"
              stroke="#0f172a"
              stroke-width="0.5"
            />

            <!-- Band labels -->
            {#if band.width > 20}
              <text
                x={band.x + band.width / 2}
                y={rowHeight / 2}
                text-anchor="middle"
                dominant-baseline="middle"
                class="fill-white text-xs font-medium pointer-events-none"
                style="text-shadow: 0 1px 2px rgba(0,0,0,0.9); font-size: 9px;"
              >
                {band.name}
              </text>
            {/if}
          {/each}

          <!-- Tech Frequency marker -->
          {#if markerPositionTech !== null && frequencyHz}
            <line
              x1={markerPositionTech}
              y1="-4"
              x2={markerPositionTech}
              y2={rowHeight + 4}
              stroke="#fbbf24"
              stroke-width="2"
            />
            <circle
              cx={markerPositionTech}
              cy={rowHeight / 2}
              r="4"
              fill="#fbbf24"
              stroke="#1e293b"
              stroke-width="1"
            />
          {/if}

          <!-- Scale ticks -->
          {#each [1e6, 1e8, 1e9, 1e10, 1e11, 1e12] as tick (tick)}
            {@const tickX = xScaleTech(tick)}
            <line
              x1={tickX}
              y1={rowHeight}
              x2={tickX}
              y2={rowHeight + 4}
              stroke="#64748b"
              stroke-width="1"
            />
            <text
              x={tickX}
              y={rowHeight + 14}
              text-anchor="middle"
              class="fill-slate-500 text-xs"
              style="font-size: 9px;"
            >
              {formatFrequency(tick)}
            </text>
          {/each}
        </g>
      </g>

      <!-- Frequency label if set -->
      {#if frequencyHz}
        <text
          x={labelWidth + innerWidth}
          y={emHeight + gap + rowHeight + 14}
          text-anchor="end"
          class="fill-amber-400 text-xs font-mono"
        >
          {formatFrequency(frequencyHz)}
        </text>
      {/if}
    </g>
  </svg>
</div>
