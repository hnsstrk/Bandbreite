<script lang="ts">
  import { atmosphericParameters } from '$lib/stores/atmosphericParameters.svelte';
  import { formatAttenuationValue, type MarkerData } from './attenuationChartData';

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
    class="chart-tooltip"
    stroke-width="1"
  />
  <text x="12" y="20" class="chart-tooltip-text" font-weight="500" font-size="12">
    f = {markerData.frequency.toFixed(2)} GHz
  </text>
  <text x="12" y="38" font-size="11">
    <tspan style="fill: var(--color-series-1)">O&#x2082;:</tspan>
    <tspan class="chart-tooltip-text"> {formatAttenuationValue(markerData.oxygen)} dB/km</tspan>
  </text>
  <text x="12" y="54" font-size="11">
    <tspan style="fill: var(--color-series-2)">H&#x2082;O:</tspan>
    <tspan class="chart-tooltip-text"> {formatAttenuationValue(markerData.waterVapor)} dB/km</tspan>
  </text>
  <text x="12" y="72" font-size="11">
    <tspan style="fill: var(--color-series-3)">Gas Total:</tspan>
    <tspan class="chart-tooltip-text"> {formatAttenuationValue(markerData.total)} dB/km</tspan>
  </text>
  {#if hasPrecipitation}
    {#if atmosphericParameters.rainRateMmH > 0}
      <text x="12" y="90" font-size="11">
        <tspan style="fill: var(--color-series-5)">Regen:</tspan>
        <tspan class="chart-tooltip-text"> {formatAttenuationValue(markerData.rain)} dB/km</tspan>
      </text>
    {/if}
    {#if atmosphericParameters.fogDensityGM3 > 0}
      <text x="12" y={atmosphericParameters.rainRateMmH > 0 ? 106 : 90} font-size="11">
        <tspan style="fill: var(--color-series-4)">Nebel:</tspan>
        <tspan class="chart-tooltip-text"> {formatAttenuationValue(markerData.fog)} dB/km</tspan>
      </text>
    {/if}
    {#if atmosphericParameters.snowRateMmH > 0}
      <text x="12" y={90 + (atmosphericParameters.rainRateMmH > 0 ? 16 : 0) + (atmosphericParameters.fogDensityGM3 > 0 ? 16 : 0)} font-size="11">
        <tspan style="fill: var(--color-series-8)">Schnee:</tspan>
        <tspan class="chart-tooltip-text"> {formatAttenuationValue(markerData.snow)} dB/km</tspan>
      </text>
    {/if}
    <text x="12" y={tooltipHeight - 30} font-size="11">
      <tspan style="fill: var(--color-series-6)">Gesamt/km:</tspan>
      <tspan class="chart-tooltip-text"> {formatAttenuationValue(markerData.totalAll)} dB/km</tspan>
    </text>
  {/if}
</g>
