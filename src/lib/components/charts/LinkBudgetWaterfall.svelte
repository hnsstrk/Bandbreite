<script lang="ts">
  import * as d3 from 'd3';

  interface LinkBudgetData {
    txPowerDbm: number;
    txAntennaGainDbi: number;
    txCableLossDb: number;
    eirpDbm: number;
    fsplDb: number;
    atmosphericLossDb: number;
    miscLossDb: number;
    totalPathLossDb: number;
    rxAntennaGainDbi: number;
    rxCableLossDb: number;
    receivedPowerDbm: number;
    rxSensitivityDbm: number;
    linkMarginDb: number;
    fadingMarginDb: number;
    systemMarginDb: number;
    linkViable: boolean;
  }

  interface Props {
    data: LinkBudgetData | null;
    width?: number;
    height?: number;
  }

  let { data, width = 900, height = 400 }: Props = $props();

  // Chart margins
  const margin = { top: 40, right: 30, bottom: 80, left: 60 };

  // Derived dimensions
  let chartWidth = $derived(width - margin.left - margin.right);
  let chartHeight = $derived(height - margin.top - margin.bottom);

  // Build waterfall steps from data
  let waterfallSteps = $derived.by(() => {
    if (!data) return [];

    const steps: {
      label: string;
      shortLabel: string;
      value: number;
      type: 'start' | 'gain' | 'loss' | 'total' | 'reference';
      cumulative: number;
      barStart: number;
      barEnd: number;
    }[] = [];

    let cumulative = 0;

    // TX Power (starting point)
    cumulative = data.txPowerDbm;
    steps.push({
      label: 'TX Leistung',
      shortLabel: 'TX',
      value: data.txPowerDbm,
      type: 'start',
      cumulative,
      barStart: 0,
      barEnd: cumulative
    });

    // TX Antenna Gain (gain)
    steps.push({
      label: 'TX Ant. Gewinn',
      shortLabel: '+G_TX',
      value: data.txAntennaGainDbi,
      type: 'gain',
      cumulative: cumulative,
      barStart: cumulative,
      barEnd: cumulative + data.txAntennaGainDbi
    });
    cumulative += data.txAntennaGainDbi;

    // TX Cable Loss (loss)
    steps.push({
      label: 'TX Kabelverlust',
      shortLabel: '-L_TX',
      value: data.txCableLossDb,
      type: 'loss',
      cumulative: cumulative,
      barStart: cumulative,
      barEnd: cumulative - data.txCableLossDb
    });
    cumulative -= data.txCableLossDb;

    // FSPL (major loss)
    steps.push({
      label: 'Freiraumdämpfung',
      shortLabel: 'FSPL',
      value: data.fsplDb,
      type: 'loss',
      cumulative: cumulative,
      barStart: cumulative,
      barEnd: cumulative - data.fsplDb
    });
    cumulative -= data.fsplDb;

    // Atmospheric Loss (if present)
    if (data.atmosphericLossDb > 0.1) {
      steps.push({
        label: 'Atmos. Dämpfung',
        shortLabel: 'Atmos.',
        value: data.atmosphericLossDb,
        type: 'loss',
        cumulative: cumulative,
        barStart: cumulative,
        barEnd: cumulative - data.atmosphericLossDb
      });
      cumulative -= data.atmosphericLossDb;
    }

    // Misc Loss (if present)
    if (data.miscLossDb > 0.1) {
      steps.push({
        label: 'Sonstige Verluste',
        shortLabel: 'Sonst.',
        value: data.miscLossDb,
        type: 'loss',
        cumulative: cumulative,
        barStart: cumulative,
        barEnd: cumulative - data.miscLossDb
      });
      cumulative -= data.miscLossDb;
    }

    // RX Antenna Gain (gain)
    steps.push({
      label: 'RX Ant. Gewinn',
      shortLabel: '+G_RX',
      value: data.rxAntennaGainDbi,
      type: 'gain',
      cumulative: cumulative,
      barStart: cumulative,
      barEnd: cumulative + data.rxAntennaGainDbi
    });
    cumulative += data.rxAntennaGainDbi;

    // RX Cable Loss (loss)
    steps.push({
      label: 'RX Kabelverlust',
      shortLabel: '-L_RX',
      value: data.rxCableLossDb,
      type: 'loss',
      cumulative: cumulative,
      barStart: cumulative,
      barEnd: cumulative - data.rxCableLossDb
    });
    cumulative -= data.rxCableLossDb;

    // Received Power (total)
    steps.push({
      label: 'Empfangsleistung',
      shortLabel: 'P_RX',
      value: data.receivedPowerDbm,
      type: 'total',
      cumulative: data.receivedPowerDbm,
      barStart: 0,
      barEnd: data.receivedPowerDbm
    });

    return steps;
  });

  // Calculate Y-axis range
  let yDomain = $derived.by(() => {
    if (!data || waterfallSteps.length === 0) return [-150, 50];

    const allValues = waterfallSteps.flatMap(s => [s.barStart, s.barEnd]);
    allValues.push(data.rxSensitivityDbm);

    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const padding = (maxVal - minVal) * 0.1;

    return [Math.floor(minVal - padding), Math.ceil(maxVal + padding)];
  });

  // X scale (categorical for steps)
  let xScale = $derived(
    d3.scaleBand<number>()
      .domain(waterfallSteps.map((_, i) => i))
      .range([0, chartWidth])
      .padding(0.3)
  );

  // Y scale
  let yScale = $derived(
    d3.scaleLinear()
      .domain(yDomain)
      .range([chartHeight, 0])
  );

  // Y-axis ticks
  let yTicks = $derived.by(() => {
    const [min, max] = yDomain;
    const step = Math.ceil((max - min) / 10 / 10) * 10;
    const ticks: number[] = [];
    for (let v = Math.ceil(min / step) * step; v <= max; v += step) {
      ticks.push(v);
    }
    return ticks;
  });

  // Colors
  const colors = {
    start: '#3b82f6',  // Blue
    gain: '#22c55e',   // Green
    loss: '#ef4444',   // Red
    total: '#8b5cf6',  // Purple
    reference: '#fbbf24' // Amber
  };

  // Tooltip state
  let tooltip = $state<{
    visible: boolean;
    x: number;
    y: number;
    step: typeof waterfallSteps[0] | null;
  }>({ visible: false, x: 0, y: 0, step: null });

  function showTooltip(event: MouseEvent, step: typeof waterfallSteps[0]) {
    tooltip = {
      visible: true,
      x: event.offsetX,
      y: event.offsetY,
      step
    };
  }

  function hideTooltip() {
    tooltip = { ...tooltip, visible: false, step: null };
  }
</script>

<div class="link-budget-waterfall w-full">
  {#if data}
    <svg
      viewBox="0 0 {width} {height}"
      class="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- Background -->
      <rect x="0" y="0" width={width} height={height} style="fill: var(--color-chart-bg)" />

      <!-- Chart area -->
      <g transform="translate({margin.left}, {margin.top})">
        <!-- Grid lines -->
        {#each yTicks as tick (tick)}
          <line
            x1="0"
            y1={yScale(tick)}
            x2={chartWidth}
            y2={yScale(tick)}
            style="stroke: var(--color-chart-grid)"
            stroke-dasharray="4,4"
            stroke-width="0.5"
          />
        {/each}

        <!-- Zero line -->
        <line
          x1="0"
          y1={yScale(0)}
          x2={chartWidth}
          y2={yScale(0)}
          style="stroke: var(--color-chart-axis)"
          stroke-width="1"
        />

        <!-- RX Sensitivity reference line -->
        <line
          x1="0"
          y1={yScale(data.rxSensitivityDbm)}
          x2={chartWidth}
          y2={yScale(data.rxSensitivityDbm)}
          stroke="#f97316"
          stroke-width="2"
          stroke-dasharray="8,4"
        />
        <text
          x={chartWidth + 5}
          y={yScale(data.rxSensitivityDbm)}
          class="fill-orange-400"
          font-size="10"
          dominant-baseline="middle"
        >
          RX Sens.
        </text>

        <!-- Cumulative power line -->
        <path
          d={waterfallSteps.map((step, i) => {
            const x = (xScale(i) ?? 0) + (xScale.bandwidth() / 2);
            const y = yScale(step.type === 'total' ? step.value : (i === 0 ? step.barEnd : step.barEnd));
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ')}
          fill="none"
          stroke="#94a3b8"
          stroke-width="1.5"
          stroke-dasharray="4,2"
          opacity="0.6"
        />

        <!-- Waterfall bars -->
        {#each waterfallSteps as step, i (i)}
          {@const x = xScale(i) ?? 0}
          {@const barWidth = xScale.bandwidth()}
          {@const barY1 = yScale(Math.max(step.barStart, step.barEnd))}
          {@const barY2 = yScale(Math.min(step.barStart, step.barEnd))}
          {@const barHeight = Math.abs(barY2 - barY1)}

          <g
            class="cursor-pointer"
            onmouseenter={(e) => showTooltip(e, step)}
            onmouseleave={hideTooltip}
            onmousemove={(e) => showTooltip(e, step)}
          >
            <!-- Bar -->
            <rect
              x={x}
              y={barY1}
              width={barWidth}
              height={Math.max(barHeight, 2)}
              fill={colors[step.type]}
              opacity="0.9"
              rx="2"
              class="transition-opacity hover:opacity-70"
            />

            <!-- Connector line to next bar -->
            {#if i < waterfallSteps.length - 1 && step.type !== 'total'}
              <line
                x1={x + barWidth}
                y1={yScale(step.barEnd)}
                x2={(xScale(i + 1) ?? 0)}
                y2={yScale(step.barEnd)}
                style="stroke: var(--color-chart-axis)"
                stroke-width="1"
                stroke-dasharray="2,2"
              />
            {/if}

            <!-- Value label on bar -->
            {#if barHeight > 20}
              <text
                x={x + barWidth / 2}
                y={barY1 + barHeight / 2}
                class="fill-white font-medium"
                text-anchor="middle"
                dominant-baseline="middle"
                font-size="10"
              >
                {step.type === 'start' || step.type === 'total'
                  ? `${step.value.toFixed(1)}`
                  : `${step.type === 'gain' ? '+' : '-'}${step.value.toFixed(1)}`}
              </text>
            {/if}
          </g>
        {/each}

        <!-- X-axis labels -->
        <g transform="translate(0, {chartHeight + 10})">
          {#each waterfallSteps as step, i (i)}
            {@const x = (xScale(i) ?? 0) + xScale.bandwidth() / 2}
            <text
              x={x}
              y="0"
              style="fill: var(--color-chart-text-secondary)"
              text-anchor="middle"
              font-size="9"
              transform="rotate(-45 {x} 0)"
            >
              {step.shortLabel}
            </text>
          {/each}
        </g>

        <!-- Y-axis -->
        <g>
          <line x1="0" y1="0" x2="0" y2={chartHeight} style="stroke: var(--color-chart-axis)" stroke-width="1" />
          {#each yTicks as tick (tick)}
            <g transform="translate(0, {yScale(tick)})">
              <line x2="-6" style="stroke: var(--color-chart-axis)" />
              <text x="-10" style="fill: var(--color-chart-text-secondary)" text-anchor="end" dominant-baseline="middle" font-size="10">
                {tick}
              </text>
            </g>
          {/each}
          <text
            transform="rotate(-90)"
            x={-chartHeight / 2}
            y="-45"
            style="fill: var(--color-chart-text)"
            text-anchor="middle"
            font-size="12"
          >
            Pegel (dBm)
          </text>
        </g>

        <!-- Title -->
        <text
          x={chartWidth / 2}
          y="-15"
          style="fill: var(--color-chart-text)"
          text-anchor="middle"
          font-size="14"
          font-weight="600"
        >
          Link Budget Waterfall
        </text>
      </g>

      <!-- Legend -->
      <g transform="translate({width - 100}, {margin.top})">
        <g transform="translate(0, 0)">
          <rect x="0" y="-6" width="12" height="12" fill={colors.start} rx="2" />
          <text x="16" y="3" style="fill: var(--color-text-tertiary)" font-size="9">Start</text>
        </g>
        <g transform="translate(0, 18)">
          <rect x="0" y="-6" width="12" height="12" fill={colors.gain} rx="2" />
          <text x="16" y="3" style="fill: var(--color-text-tertiary)" font-size="9">Gewinn</text>
        </g>
        <g transform="translate(0, 36)">
          <rect x="0" y="-6" width="12" height="12" fill={colors.loss} rx="2" />
          <text x="16" y="3" style="fill: var(--color-text-tertiary)" font-size="9">Verlust</text>
        </g>
        <g transform="translate(0, 54)">
          <rect x="0" y="-6" width="12" height="12" fill={colors.total} rx="2" />
          <text x="16" y="3" style="fill: var(--color-text-tertiary)" font-size="9">Ergebnis</text>
        </g>
        <g transform="translate(0, 72)">
          <line x1="0" y1="0" x2="12" y2="0" stroke="#f97316" stroke-width="2" stroke-dasharray="4,2" />
          <text x="16" y="3" style="fill: var(--color-text-tertiary)" font-size="9">Sensit.</text>
        </g>
      </g>

      <!-- Tooltip -->
      {#if tooltip.visible && tooltip.step}
        {@const tipX = Math.min(tooltip.x + 15, width - 160)}
        {@const tipY = Math.max(10, Math.min(tooltip.y - 60, height - 80))}
        <g transform="translate({tipX}, {tipY})">
          <rect
            x="0"
            y="0"
            width="150"
            height="65"
            rx="4"
            style="fill: var(--color-chart-tooltip-bg); stroke: var(--color-chart-tooltip-border)"
            stroke-width="1"
          />
          <text x="8" y="18" style="fill: var(--color-chart-text)" font-weight="500" font-size="11">
            {tooltip.step.label}
          </text>
          <text x="8" y="36" style="fill: var(--color-text-tertiary)" font-size="10">
            Wert: <tspan fill={colors[tooltip.step.type]} class="font-mono">
              {tooltip.step.type === 'gain' ? '+' : tooltip.step.type === 'loss' ? '-' : ''}
              {tooltip.step.value.toFixed(1)} dB
            </tspan>
          </text>
          <text x="8" y="52" style="fill: var(--color-text-tertiary)" font-size="10">
            Kumulativ: <tspan class="fill-slate-200 font-mono">
              {tooltip.step.barEnd.toFixed(1)} dBm
            </tspan>
          </text>
        </g>
      {/if}
    </svg>
  {:else}
    <div class="flex items-center justify-center h-64 rounded-lg" style="background: var(--color-chart-bg)">
      <p style="color: var(--color-text-tertiary)">Keine Link Budget Daten verfuegbar</p>
    </div>
  {/if}
</div>

<style>
  .link-budget-waterfall {
    container-type: inline-size;
  }
</style>
