<script lang="ts">
  /**
   * Legende des Dämpfungsdiagramms — als HTML unter dem Kopf des
   * {@link ChartFrame}, nicht mehr als SVG-Block im Diagramm.
   */
  import { atmosphericParameters } from '$lib/stores/atmosphericParameters.svelte';
  import type { AttenuationSeries } from './attenuationChartData';

  interface Props {
    /** Nur die tatsächlich gezeichneten Kurven */
    series: AttenuationSeries[];
  }

  let { series }: Props = $props();

  let conditions = $derived([
    { label: 'T', value: `${atmosphericParameters.temperatureCelsius.toFixed(1)} °C` },
    { label: 'P', value: `${atmosphericParameters.pressureHpa.toFixed(1)} hPa` },
    { label: 'ρ', value: `${atmosphericParameters.waterVaporDensity.toFixed(1)} g/m³` },
    ...(atmosphericParameters.rainRateMmH > 0
      ? [{ label: 'Regen', value: `${atmosphericParameters.rainRateMmH.toFixed(1)} mm/h` }]
      : []),
    ...(atmosphericParameters.fogDensityGM3 > 0
      ? [{ label: 'Nebel', value: `${atmosphericParameters.fogDensityGM3.toFixed(2)} g/m³` }]
      : []),
    ...(atmosphericParameters.snowRateMmH > 0
      ? [{ label: 'Schnee', value: `${atmosphericParameters.snowRateMmH.toFixed(1)} mm/h` }]
      : [])
  ]);
</script>

<ul class="att-legend" aria-label="Kurven">
  {#each series as entry (entry.id)}
    <li class="att-legend__item">
      <span
        class="att-legend__swatch"
        style="--swatch-color: {entry.color}; --swatch-dash: {entry.dash ? 'dashed' : 'solid'}"
        aria-hidden="true"
      ></span>
      <span>{entry.label}</span>
      {#if entry.source}
        <span class="att-legend__source">{entry.source}</span>
      {/if}
    </li>
  {/each}
</ul>

<ul class="att-legend att-legend--conditions" aria-label="Atmosphäre">
  {#each conditions as item (item.label)}
    <li class="att-legend__item">
      <span class="att-legend__source">{item.label}</span>
      <span class="att-legend__value">{item.value}</span>
    </li>
  {/each}
</ul>

<style>
  .att-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .att-legend--conditions {
    margin-top: 0.25rem;
  }

  .att-legend__item {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--color-ink-muted);
  }

  .att-legend__swatch {
    width: 1.25rem;
    border-top: 2px var(--swatch-dash) var(--swatch-color);
    display: inline-block;
  }

  .att-legend__source {
    color: var(--color-ink-subtle);
    font-size: var(--text-2xs);
  }

  .att-legend__value {
    font-family: var(--font-mono);
    color: var(--color-ink-muted);
  }
</style>
