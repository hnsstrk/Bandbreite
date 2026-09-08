<script lang="ts">
  /**
   * Ergebnisse des Radiohorizont-Rechners: Horizont beider Antennen,
   * Gesamtsichtweite und der Vergleich mit dem rein geometrischen Horizont.
   */
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import { formatNumber } from '$lib/utils/formatting';
  import { safeDivide } from '$lib/utils/handlers';

  interface Props {
    /** Horizontdistanz der ersten Antenne in km (mit Refraktion) */
    horizon1Km: number;
    /** Horizontdistanz der zweiten Antenne in km (mit Refraktion) */
    horizon2Km: number;
    /** Summe beider Horizonte in km */
    totalKm: number;
    /** Summe der geometrischen Horizonte (k = 1) in km */
    geometricKm: number;
    /** Vorfaktor der Faustformel d = A·√h für den gewählten k-Faktor */
    factor: number;
    /** Einordnung der Refraktionslage */
    refractionNote: string;
  }

  let { horizon1Km, horizon2Km, totalKm, geometricKm, factor, refractionNote }: Props = $props();

  let gainPercent = $derived(safeDivide(totalKm - geometricKm, geometricKm, 0) * 100);
</script>

<div class="horizon-results">
  <ResultCard
    label="Gesamtsichtweite"
    value={totalKm > 0 ? formatNumber(totalKm, 1) : '—'}
    unit="km"
    secondary="d₁ + d₂"
    hint={refractionNote}
    emphasis="hero"
  />
  <ResultCard
    label="Horizont Antenne 1"
    value={horizon1Km > 0 ? formatNumber(horizon1Km, 1) : '—'}
    unit="km"
    hint="d₁ = {formatNumber(factor, 2)} · √h₁"
  />
  <ResultCard
    label="Horizont Antenne 2"
    value={horizon2Km > 0 ? formatNumber(horizon2Km, 1) : '—'}
    unit="km"
    hint="d₂ = {formatNumber(factor, 2)} · √h₂"
  />
  <ResultCard
    label="Geometrischer Horizont"
    value={geometricKm > 0 ? formatNumber(geometricKm, 1) : '—'}
    unit="km"
    secondary="ohne Refraktion, k = 1"
    hint="d = 3,57 · √h"
  />
  <ResultCard
    label="Zugewinn durch Refraktion"
    value={geometricKm > 0 ? formatNumber(gainPercent, 1) : '—'}
    unit="%"
    tone={gainPercent > 0 ? 'success' : 'neutral'}
    copyable={false}
  />
</div>

<style>
  .horizon-results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    gap: 0.75rem;
  }
</style>
