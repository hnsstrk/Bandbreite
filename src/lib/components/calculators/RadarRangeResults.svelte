<script lang="ts">
  /** Ergebnisse des Radar-Reichweiten-Rechners. */
  import { getDistanceFactor } from '$lib/data/units';
  import { formatDistance, formatNumber, formatPowerDbm, formatWavelength } from '$lib/utils/formatting';
  import { calculateRadarReceivedPowerDbm, type RadarParameters } from '$lib/utils/radar';
  import Badge from '$lib/components/ui/Badge.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import { POWER_SAMPLE_RANGES_M } from './radarRange.svelte';

  interface Props {
    radarParams: RadarParameters;
    maxRangeM: number;
    rxSensitivityDbm: number;
    wavelengthM: number;
  }

  let { radarParams, maxRangeM, rxSensitivityDbm, wavelengthM }: Props = $props();

  /** Untergrenze der Anzeige — darunter ist das Echo praktisch nicht mehr vorhanden. */
  const DISPLAY_FLOOR_DBM = -200;

  let powerAtRanges = $derived(
    POWER_SAMPLE_RANGES_M.map((range) => {
      const power = calculateRadarReceivedPowerDbm(radarParams, range);
      return {
        range,
        power,
        label: formatDistance(range),
        detectable: power >= rxSensitivityDbm
      };
    })
  );

  let maxRangeNmi = $derived(maxRangeM / getDistanceFactor('nmi'));
</script>

<div class="radar-results">
  <ResultCard
    label="Maximale Reichweite"
    value={maxRangeM > 0 ? formatDistance(maxRangeM) : '—'}
    secondary={maxRangeM > 0 ? `= ${formatNumber(maxRangeNmi, 1)} nmi` : undefined}
    hint="Entfernung, bei der das Echo gerade noch die Empfindlichkeitsschwelle erreicht"
    emphasis="hero"
  />

  <ResultCard label="Wellenlänge" value={wavelengthM > 0 ? formatWavelength(wavelengthM) : '—'} hint="λ = c / f" />
</div>

<div class="radar-power">
  <h3 class="radar-power__title">Empfangsleistung über der Entfernung</h3>
  <ul class="radar-power__list">
    {#each powerAtRanges as item (item.range)}
      <li class="radar-power__item">
        <span class="radar-power__range">{item.label}</span>
        <span class="radar-power__value">
          {Number.isFinite(item.power) ? formatPowerDbm(item.power) : `< ${DISPLAY_FLOOR_DBM} dBm`}
        </span>
        <Badge tone={item.detectable ? 'success' : 'danger'} dot srPrefix="Detektierbarkeit">
          {item.detectable ? 'detektierbar' : 'zu schwach'}
        </Badge>
      </li>
    {/each}
  </ul>
</div>

<style>
  .radar-results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
    gap: 0.75rem;
  }

  .radar-power {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .radar-power__title {
    margin: 0;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .radar-power__list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .radar-power__item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--color-sunken);
    border-radius: var(--radius-control);
  }

  .radar-power__range {
    font-weight: var(--font-weight-medium);
    color: var(--color-ink-muted);
    min-width: 4.5rem;
  }

  .radar-power__value {
    font-family: var(--font-mono);
    color: var(--color-ink);
    flex: 1;
  }
</style>
