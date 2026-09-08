<script lang="ts">
  /** Seitenriss einer Funkstrecke mit erster und zweiter Fresnel-Zone. */
  import { curveLinearClosed, line } from 'd3-shape';
  import { scaleLinear } from 'd3-scale';
  import { FRESNEL_CLEARANCE_FRACTION } from '$lib/utils/calculations';
  import { formatDistance, formatNumber } from '$lib/utils/formatting';
  import {
    generateFresnelEllipse,
    type EllipsePoint
  } from '$lib/components/calculators/fresnelZone.svelte';
  import ChartFrame from './ChartFrame.svelte';

  interface Props {
    wavelengthM: number;
    totalDistanceM: number;
    obstaclePositionM: number;
    fresnelRadius1M: number;
    fresnelRadius2M: number;
    maxFresnelRadiusM: number;
    width?: number;
    height?: number;
  }

  let {
    wavelengthM,
    totalDistanceM,
    obstaclePositionM,
    fresnelRadius1M,
    fresnelRadius2M,
    maxFresnelRadiusM,
    width = $bindable(900),
    height = 400
  }: Props = $props();

  const margin = { top: 40, right: 40, bottom: 60, left: 60 } as const;

  /** Luft über der weitesten Zone, damit Beschriftungen Platz haben. */
  const Y_PADDING_FACTOR = 1.5;
  const Y_MIN_METERS = 10;

  let chartWidth = $derived(Math.max(1, width - margin.left - margin.right));
  let chartHeight = $derived(Math.max(1, height - margin.top - margin.bottom));

  let yMax = $derived(
    Math.max(maxFresnelRadiusM * Y_PADDING_FACTOR, fresnelRadius2M * 1.2, Y_MIN_METERS)
  );

  let xScale = $derived(scaleLinear().domain([0, totalDistanceM]).range([0, chartWidth]));
  let yScale = $derived(scaleLinear().domain([-yMax, yMax]).range([chartHeight, 0]));

  let areaGenerator = $derived(
    line<EllipsePoint>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(curveLinearClosed)
  );

  let zone1 = $derived(generateFresnelEllipse(wavelengthM, totalDistanceM, 1));
  let zone2 = $derived(generateFresnelEllipse(wavelengthM, totalDistanceM, 2));
  let clearance = $derived(
    generateFresnelEllipse(wavelengthM, totalDistanceM, 1, FRESNEL_CLEARANCE_FRACTION)
  );

  let obstacleX = $derived(xScale(obstaclePositionM));
</script>

<ChartFrame
  bind:width
  description="Seitenriss der Funkstrecke von Sender zu Empfänger mit erster und zweiter Fresnel-Zone, der 60-Prozent-Marke und der Hindernisposition"
  minWidth={520}
>
  {#snippet legend()}
    <ul class="fresnel-legend">
      <li class="fresnel-legend__item">
        <span class="fresnel-legend__swatch fresnel-legend__swatch--zone1" aria-hidden="true"
        ></span>1. Fresnel-Zone
      </li>
      <li class="fresnel-legend__item">
        <span class="fresnel-legend__swatch fresnel-legend__swatch--zone2" aria-hidden="true"
        ></span>2. Fresnel-Zone
      </li>
      <li class="fresnel-legend__item">
        <span class="fresnel-legend__swatch fresnel-legend__swatch--clear" aria-hidden="true"
        ></span>60 % Freiheit
      </li>
      <li class="fresnel-legend__item">
        <span class="fresnel-legend__swatch fresnel-legend__swatch--los" aria-hidden="true"
        ></span>Sichtlinie
      </li>
    </ul>
  {/snippet}

  <svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <rect class="chart-background" x="0" y="0" {width} {height} />

    <g transform="translate({margin.left}, {margin.top})">
      <path
        d={areaGenerator(zone2)}
        fill="var(--color-series-4)"
        fill-opacity="0.15"
        stroke="var(--color-series-4)"
        stroke-width="1"
        stroke-dasharray="4,4"
      />

      <path
        d={areaGenerator(zone1)}
        fill="var(--color-series-1)"
        fill-opacity="0.25"
        stroke="var(--color-series-1)"
        stroke-width="2"
      />

      <path
        d={areaGenerator(clearance)}
        fill="var(--color-series-2)"
        fill-opacity="0.2"
        stroke="var(--color-series-2)"
        stroke-width="1"
        stroke-dasharray="2,2"
      />

      <!-- Sichtlinie -->
      <line
        x1="0"
        y1={yScale(0)}
        x2={chartWidth}
        y2={yScale(0)}
        stroke="var(--color-marker)"
        stroke-width="2"
        stroke-dasharray="8,4"
      />

      <!-- Sendeantenne -->
      <g transform="translate(0, {yScale(0)})">
        <line x1="0" y1="0" x2="0" y2="-20" stroke="var(--color-series-6)" stroke-width="3" />
        <polygon points="0,-25 -5,-15 5,-15" fill="var(--color-series-6)" />
        <text class="chart-axis-label" x="0" y="20" text-anchor="middle">TX</text>
      </g>

      <!-- Empfangsantenne -->
      <g transform="translate({chartWidth}, {yScale(0)})">
        <line x1="0" y1="0" x2="0" y2="-20" stroke="var(--color-series-2)" stroke-width="3" />
        <polygon points="0,-25 -5,-15 5,-15" fill="var(--color-series-2)" />
        <text class="chart-axis-label" x="0" y="20" text-anchor="middle">RX</text>
      </g>

      <!-- Hindernis -->
      <line
        x1={obstacleX}
        y1={yScale(-yMax)}
        x2={obstacleX}
        y2={yScale(yMax)}
        stroke="var(--color-series-3)"
        stroke-width="2"
        stroke-dasharray="4,4"
      />

      <line
        x1={obstacleX}
        y1={yScale(fresnelRadius1M)}
        x2={obstacleX}
        y2={yScale(-fresnelRadius1M)}
        stroke="var(--color-series-1)"
        stroke-width="1"
        stroke-dasharray="2,2"
      />

      <text
        class="chart-axis-text"
        x={obstacleX + 10}
        y={yScale(fresnelRadius1M / 2)}
        fill="var(--color-series-1)"
      >
        r₁ = {formatNumber(fresnelRadius1M, 1)} m
      </text>

      <text
        class="chart-axis-text"
        x={obstacleX}
        y={yScale(-yMax) + 15}
        text-anchor="middle"
        fill="var(--color-series-3)"
      >
        d₁ = {formatDistance(obstaclePositionM)}
      </text>
    </g>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Kennwerte der Fresnel-Zone</caption>
      <tbody>
        <tr>
          <th scope="row">Streckenlänge</th>
          <td>{formatDistance(totalDistanceM)}</td>
        </tr>
        <tr>
          <th scope="row">Hindernis bei</th>
          <td>{formatDistance(obstaclePositionM)}</td>
        </tr>
        <tr>
          <th scope="row">Radius der 1. Fresnel-Zone am Hindernis</th>
          <td>{formatNumber(fresnelRadius1M, 2)} m</td>
        </tr>
        <tr>
          <th scope="row">Radius der 2. Fresnel-Zone am Hindernis</th>
          <td>{formatNumber(fresnelRadius2M, 2)} m</td>
        </tr>
        <tr>
          <th scope="row">Größter Radius in Streckenmitte</th>
          <td>{formatNumber(maxFresnelRadiusM, 2)} m</td>
        </tr>
      </tbody>
    </table>
  {/snippet}
</ChartFrame>

<style>
  .fresnel-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .fresnel-legend__item {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .fresnel-legend__swatch {
    width: 0.875rem;
    height: 0.875rem;
    border-radius: 2px;
    display: inline-block;
  }

  .fresnel-legend__swatch--zone1 {
    background: color-mix(in srgb, var(--color-series-1) 25%, transparent);
    border: 1px solid var(--color-series-1);
  }

  .fresnel-legend__swatch--zone2 {
    background: color-mix(in srgb, var(--color-series-4) 15%, transparent);
    border: 1px dashed var(--color-series-4);
  }

  .fresnel-legend__swatch--clear {
    background: color-mix(in srgb, var(--color-series-2) 20%, transparent);
    border: 1px dashed var(--color-series-2);
  }

  .fresnel-legend__swatch--los {
    height: 0.1875rem;
    width: 1.25rem;
    background: var(--color-marker);
  }
</style>
