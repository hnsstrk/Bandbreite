<script lang="ts">
  import { atmosphericParameters } from '$lib/stores/atmosphericParameters.svelte';
  import { formatAttenuation, type MarkerData } from './attenuationChartData';

  interface Props {
    markerData: MarkerData;
    hasPrecipitation: boolean;
    chartWidth: number;
    chartHeight: number;
  }

  let { markerData, hasPrecipitation, chartWidth, chartHeight }: Props = $props();

  let tooltipWidth = $derived(hasPrecipitation ? 220 : 200);
  let tooltipHeight = $derived(hasPrecipitation ? 150 : 90);
  let tooltipX = $derived(
    markerData.x > chartWidth / 2
      ? markerData.x - tooltipWidth - 15
      : markerData.x + 15
  );
  let tooltipY = $derived(
    markerData.yTotal > chartHeight / 2
      ? markerData.yTotal - tooltipHeight - 10
      : markerData.yTotal + 10
  );
</script>

<g transform="translate({tooltipX}, {tooltipY})" filter="url(#attenuationTooltipShadow)">
  <rect
    x="0"
    y="0"
    width={tooltipWidth}
    height={tooltipHeight}
    rx="6"
    style="fill: var(--color-chart-tooltip-bg); stroke: var(--color-chart-tooltip-border)"
    stroke-width="1"
  />
  <text x="12" y="20" style="fill: var(--color-chart-text)" font-weight="500" font-size="12">
    f = {markerData.frequency.toFixed(2)} GHz
  </text>
  <text x="12" y="38" font-size="11">
    <tspan class="fill-blue-400">O&#x2082;:</tspan>
    <tspan style="fill: var(--color-chart-text)"> {formatAttenuation(markerData.oxygen)} dB/km</tspan>
  </text>
  <text x="12" y="54" font-size="11">
    <tspan class="fill-green-400">H&#x2082;O:</tspan>
    <tspan style="fill: var(--color-chart-text)"> {formatAttenuation(markerData.waterVapor)} dB/km</tspan>
  </text>
  <text x="12" y="72" font-size="11">
    <tspan class="fill-orange-400">Gas Total:</tspan>
    <tspan style="fill: var(--color-chart-text)"> {formatAttenuation(markerData.total)} dB/km</tspan>
  </text>
  {#if hasPrecipitation}
    {#if atmosphericParameters.rainRateMmH > 0}
      <text x="12" y="90" font-size="11">
        <tspan class="fill-cyan-400">Regen:</tspan>
        <tspan style="fill: var(--color-chart-text)"> {formatAttenuation(markerData.rain)} dB/km</tspan>
      </text>
    {/if}
    {#if atmosphericParameters.fogDensityGM3 > 0}
      <text x="12" y={atmosphericParameters.rainRateMmH > 0 ? 106 : 90} font-size="11">
        <tspan class="fill-purple-400">Nebel:</tspan>
        <tspan style="fill: var(--color-chart-text)"> {formatAttenuation(markerData.fog)} dB/km</tspan>
      </text>
    {/if}
    {#if atmosphericParameters.snowRateMmH > 0}
      <text x="12" y={90 + (atmosphericParameters.rainRateMmH > 0 ? 16 : 0) + (atmosphericParameters.fogDensityGM3 > 0 ? 16 : 0)} font-size="11">
        <tspan style="fill: var(--color-text-tertiary)">Schnee:</tspan>
        <tspan style="fill: var(--color-chart-text)"> {formatAttenuation(markerData.snow)} dB/km</tspan>
      </text>
    {/if}
    <text x="12" y={tooltipHeight - 30} font-size="11">
      <tspan class="fill-red-400">Gesamt/km:</tspan>
      <tspan style="fill: var(--color-chart-text)"> {formatAttenuation(markerData.totalAll)} dB/km</tspan>
    </text>
  {/if}
</g>
