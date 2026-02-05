<script lang="ts">
  import { atmosphericParameters } from '$lib/stores/atmosphericParameters.svelte';

  interface Props {
    showPrecipitation: boolean;
    hasPrecipitation: boolean;
  }

  let { showPrecipitation, hasPrecipitation }: Props = $props();

  // Legend Y positions
  let legendY = $derived(hasPrecipitation ? 154 : 89);
  let peakLegendY = $derived(showPrecipitation ? legendY + 155 : legendY + 85);
  let refY = $derived(peakLegendY + 60);
</script>

<!-- Current parameters -->
<text style="fill: var(--color-chart-text-secondary)" font-weight="500" font-size="12" y="0">
  Atmosph&#228;re
</text>
<text style="fill: var(--color-text-tertiary)" font-size="10" y="16">
  T = {atmosphericParameters.temperatureCelsius.toFixed(1)} C
</text>
<text style="fill: var(--color-text-tertiary)" font-size="10" y="30">
  P = {atmosphericParameters.pressureHpa.toFixed(1)} hPa
</text>
<text style="fill: var(--color-text-tertiary)" font-size="10" y="44">
  &#961; = {atmosphericParameters.waterVaporDensity.toFixed(1)} g/m&#179;
</text>

<!-- Precipitation parameters if active -->
{#if hasPrecipitation}
  <text style="fill: var(--color-chart-text-secondary)" font-weight="500" font-size="12" y="82">
    Niederschlag
  </text>
  {#if atmosphericParameters.rainRateMmH > 0}
    <text style="fill: var(--color-text-tertiary)" font-size="10" y="98">
      Regen = {atmosphericParameters.rainRateMmH.toFixed(1)} mm/h
    </text>
  {/if}
  {#if atmosphericParameters.fogDensityGM3 > 0}
    <text style="fill: var(--color-text-tertiary)" font-size="10" y={atmosphericParameters.rainRateMmH > 0 ? 112 : 98}>
      Nebel = {atmosphericParameters.fogDensityGM3.toFixed(2)} g/m&#179;
    </text>
  {/if}
  {#if atmosphericParameters.snowRateMmH > 0}
    <text style="fill: var(--color-text-tertiary)" font-size="10" y={98 + (atmosphericParameters.rainRateMmH > 0 ? 14 : 0) + (atmosphericParameters.fogDensityGM3 > 0 ? 14 : 0)}>
      Schnee = {atmosphericParameters.snowRateMmH.toFixed(1)} mm/h
    </text>
  {/if}
{/if}

<!-- Line legend -->
<text style="fill: var(--color-chart-text-secondary)" font-weight="500" font-size="12" y={legendY}>
  Kurven
</text>

<!-- Oxygen line -->
<g transform="translate(0, {legendY + 15})">
  <line x1="0" y1="0" x2="24" y2="0" stroke="#3b82f6" stroke-width="2" />
  <text x="32" y="4" style="fill: var(--color-text-tertiary)" font-size="10">O2 (Sauerstoff)</text>
</g>

<!-- Water vapor line -->
<g transform="translate(0, {legendY + 33})">
  <line x1="0" y1="0" x2="24" y2="0" stroke="#22c55e" stroke-width="2" />
  <text x="32" y="4" style="fill: var(--color-text-tertiary)" font-size="10">H2O (Wasserdampf)</text>
</g>

<!-- Total gas line -->
<g transform="translate(0, {legendY + 51})">
  <line x1="0" y1="0" x2="24" y2="0" stroke="#f97316" stroke-width="2.5" />
  <text x="32" y="4" style="fill: var(--color-text-tertiary)" font-size="10">Gas Total</text>
</g>

{#if showPrecipitation}
  <!-- Rain line -->
  <g transform="translate(0, {legendY + 69})">
    <line x1="0" y1="0" x2="24" y2="0" stroke="#06b6d4" stroke-width="2" stroke-dasharray="6,3" />
    <text x="32" y="4" style="fill: var(--color-text-tertiary)" font-size="10">Regen (P.838)</text>
  </g>

  <!-- Fog line -->
  <g transform="translate(0, {legendY + 87})">
    <line x1="0" y1="0" x2="24" y2="0" stroke="#a855f7" stroke-width="2" stroke-dasharray="4,4" />
    <text x="32" y="4" style="fill: var(--color-text-tertiary)" font-size="10">Nebel (P.840)</text>
  </g>

  <!-- Snow line -->
  <g transform="translate(0, {legendY + 105})">
    <line x1="0" y1="0" x2="24" y2="0" stroke="#94a3b8" stroke-width="2" stroke-dasharray="2,4" />
    <text x="32" y="4" style="fill: var(--color-text-tertiary)" font-size="10">Schnee</text>
  </g>

  <!-- Total all line -->
  <g transform="translate(0, {legendY + 123})">
    <line x1="0" y1="0" x2="24" y2="0" stroke="#ef4444" stroke-width="3" />
    <text x="32" y="4" style="fill: var(--color-text-tertiary)" font-size="10">Gesamt</text>
  </g>
{/if}

<!-- Absorption peak regions legend -->
<text style="fill: var(--color-chart-text-secondary)" font-weight="500" font-size="12" y={peakLegendY}>
  Absorptionspeaks
</text>

<g transform="translate(0, {peakLegendY + 15})">
  <rect x="0" y="-6" width="14" height="14" fill="#22c55e" opacity="0.3" rx="2" />
  <text x="20" y="4" style="fill: var(--color-text-tertiary)" font-size="9">22/183 GHz (H2O)</text>
</g>

<g transform="translate(0, {peakLegendY + 33})">
  <rect x="0" y="-6" width="14" height="14" fill="#3b82f6" opacity="0.3" rx="2" />
  <text x="20" y="4" style="fill: var(--color-text-tertiary)" font-size="9">60/119 GHz (O2)</text>
</g>

<!-- ITU Reference -->
<text style="fill: var(--color-text-disabled)" font-size="9" y={refY}>
  Referenzen:
</text>
<text style="fill: var(--color-text-disabled)" font-size="8" y={refY + 12}>
  ITU-R P.676-13 (Gas)
</text>
<text style="fill: var(--color-text-disabled)" font-size="8" y={refY + 22}>
  ITU-R P.838-3 (Regen)
</text>
<text style="fill: var(--color-text-disabled)" font-size="8" y={refY + 32}>
  ITU-R P.840-9 (Nebel)
</text>
