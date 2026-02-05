<script lang="ts">
    import * as d3 from "d3";
    import { calculateFSPL } from "$lib/utils/calculations";
    import {
        CHART_DISTANCE_RANGES,
        CHART_FSPL_RANGES,
    } from "$lib/data/spectrum";
    import { formatFrequency } from "$lib/utils/formatting";
    import type { ChartFrequency } from "$lib/data/presets";

    interface Props {
        width?: number;
        height?: number;
        frequencyHz: number;
        distanceM: number;
        fsplDb: number | null;
        showMultipleFrequencies?: boolean;
        chartFrequencies: ChartFrequency[];
    }

    let {
        width = 900,
        height = 450,
        frequencyHz,
        distanceM,
        fsplDb,
        showMultipleFrequencies = true,
        chartFrequencies,
    }: Props = $props();

    // Chart margins
    const margin = { top: 40, right: 100, bottom: 60, left: 70 };

    // Chart dimensions
    let chartWidth = $derived(Math.max(0, width - margin.left - margin.right));
    let chartHeight = $derived(
        Math.max(0, height - margin.top - margin.bottom),
    );

    // Distance range for chart (logarithmic: 1m to 100km)
    const MIN_DISTANCE = CHART_DISTANCE_RANGES.fspl.minM;
    const MAX_DISTANCE = CHART_DISTANCE_RANGES.fspl.maxM;

    // FSPL range for chart
    const MIN_FSPL = CHART_FSPL_RANGES.standard.minDb;
    const MAX_FSPL = CHART_FSPL_RANGES.standard.maxDb;

    // D3 scales
    let xScale = $derived(
        d3
            .scaleLog()
            .domain([MIN_DISTANCE, MAX_DISTANCE])
            .range([0, chartWidth]),
    );

    let yScale = $derived(
        d3.scaleLinear().domain([MIN_FSPL, MAX_FSPL]).range([0, chartHeight]),
    );

    // Generate line data for a specific frequency
    function generateLineData(
        freqHz: number,
    ): { distance: number; fspl: number }[] {
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
        d3
            .line<{ distance: number; fspl: number }>()
            .x((d) => xScale(d.distance))
            .y((d) => yScale(d.fspl)),
    );

    // Chart line paths
    let chartLines = $derived(
        chartFrequencies.map((freq) => ({
            ...freq,
            path: lineGenerator(generateLineData(freq.hz)),
        })),
    );

    // Current frequency line (if different from presets)
    let currentFreqLine = $derived.by(() => {
        if (!frequencyHz || frequencyHz <= 0) return null;
        // Check if current frequency is close to a preset
        // Note: using direct check here as safeDivide logic is handled in calculation
        const isPreset =
            frequencyHz > 0 &&
            chartFrequencies.some(
                (f) => Math.abs(f.hz - frequencyHz) / frequencyHz < 0.05,
            );
        if (isPreset) return null;
        return {
            hz: frequencyHz,
            label: formatFrequency(frequencyHz),
            color: "#fbbf24",
            path: lineGenerator(generateLineData(frequencyHz)),
        };
    });

    // Marker position
    let markerPos = $derived.by(() => {
        if (!fsplDb || distanceM <= 0) return null;
        const x = xScale(
            Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, distanceM)),
        );
        const y = yScale(Math.max(MIN_FSPL, Math.min(MAX_FSPL, fsplDb)));
        return { x, y };
    });

    // X-axis ticks
    const xTickValues = [1, 10, 100, 1000, 10000, 100000];

    // Y-axis ticks
    const yTickValues = [20, 40, 60, 80, 100, 120, 140, 160, 180];
</script>

<div class="w-full overflow-x-auto">
    <svg
        viewBox="0 0 {width} {height}"
        class="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="FSPL Diagramm: Zeigt die Freiraumdämpfung in dB über der Distanz für verschiedene Frequenzen"
    >
        <defs>
            <filter
                id="fsplMarkerGlow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
            >
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        <!-- Background -->
        <rect
            x="0"
            y="0"
            {width}
            {height}
            style="fill: var(--color-chart-bg)"
        />

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
                <g
                    transform="translate({markerPos.x +
                        (markerPos.x > chartWidth / 2
                            ? -80
                            : 10)}, {markerPos.y +
                        (markerPos.y > chartHeight / 2 ? -40 : 10)})"
                >
                    <rect
                        x="0"
                        y="0"
                        width="70"
                        height="32"
                        rx="4"
                        style="fill: var(--color-chart-tooltip-bg); stroke: var(--color-chart-tooltip-border)"
                        stroke-width="1"
                    />
                    <text
                        x="8"
                        y="14"
                        style="fill: var(--color-chart-text)"
                        font-size="10"
                    >
                        {formatFrequency(frequencyHz)}
                    </text>
                    <text
                        x="8"
                        y="26"
                        class="fill-amber-400 font-bold"
                        font-size="11"
                    >
                        {fsplDb?.toFixed(1)} dB
                    </text>
                </g>
            {/if}

            <!-- X-axis (Distance) -->
            <g transform="translate(0, {chartHeight})">
                <line
                    x1="0"
                    y1="0"
                    x2={chartWidth}
                    y2="0"
                    style="stroke: var(--color-chart-axis)"
                    stroke-width="1"
                />
                {#each xTickValues as tickVal (tickVal)}
                    <g transform="translate({xScale(tickVal)}, 0)">
                        <line y2="8" style="stroke: var(--color-chart-axis)" />
                        <text
                            y="24"
                            style="fill: var(--color-chart-text-secondary)"
                            text-anchor="middle"
                            font-size="11"
                        >
                            {tickVal >= 1000
                                ? `${tickVal / 1000} km`
                                : `${tickVal} m`}
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
                    Distanz (log)
                </text>
            </g>

            <!-- Y-axis (FSPL) -->
            <g>
                <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2={chartHeight}
                    style="stroke: var(--color-chart-axis)"
                    stroke-width="1"
                />
                {#each yTickValues as tickVal (tickVal)}
                    <g transform="translate(0, {yScale(tickVal)})">
                        <line x2="-8" style="stroke: var(--color-chart-axis)" />
                        <text
                            x="-12"
                            style="fill: var(--color-chart-text-secondary)"
                            text-anchor="end"
                            dominant-baseline="middle"
                            font-size="11"
                        >
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
                <text
                    style="fill: var(--color-chart-text)"
                    font-weight="500"
                    font-size="11"
                    y="0"
                >
                    Frequenzen
                </text>
                {#each chartFrequencies as freq, i (freq.hz)}
                    <g transform="translate(0, {15 + i * 18})">
                        <line
                            x1="0"
                            y1="0"
                            x2="20"
                            y2="0"
                            stroke={freq.color}
                            stroke-width="2"
                        />
                        <text
                            x="26"
                            y="4"
                            style="fill: var(--color-chart-text-secondary)"
                            font-size="10">{freq.label}</text
                        >
                    </g>
                {/each}
                {#if currentFreqLine}
                    <g
                        transform="translate(0, {15 +
                            chartFrequencies.length * 18})"
                    >
                        <line
                            x1="0"
                            y1="0"
                            x2="20"
                            y2="0"
                            stroke={currentFreqLine.color}
                            stroke-width="3"
                        />
                        <text
                            x="26"
                            y="4"
                            fill="#fbbf24"
                            font-weight="500"
                            font-size="10">Aktuell</text
                        >
                    </g>
                {/if}
            </g>
        {/if}
    </svg>
</div>
