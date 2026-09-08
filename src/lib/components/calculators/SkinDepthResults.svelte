<script lang="ts">
  /** Ergebnisse des Skin-Tiefen-Rechners inklusive Referenzdaten für Seewasser. */
  import { SEAWATER_PENETRATION } from '$lib/data/constants';
  import { formatDistance, formatFrequency, formatNumber, formatPercentage } from '$lib/utils/formatting';
  import { safeDivide } from '$lib/utils/handlers';
  import Callout from '$lib/components/ui/Callout.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import { PRACTICAL_DEPTH_FACTOR, SIGNAL_AT_TWO_DEPTHS } from './skinDepth.svelte';

  interface Props {
    frequencyHz: number;
    skinDepthM: number;
    /** Nur für Seewasser gibt es Referenzwerte */
    isSeawater: boolean;
  }

  let { frequencyHz, skinDepthM, isSeawater }: Props = $props();

  /** Referenzwerte gelten nur, wenn die Frequenz nah genug an einer Stützstelle liegt. */
  const REFERENCE_TOLERANCE = 0.5;

  let practicalDepthM = $derived(skinDepthM * PRACTICAL_DEPTH_FACTOR);

  let referenceData = $derived.by(() => {
    if (!isSeawater || frequencyHz <= 0) return null;
    const closest = SEAWATER_PENETRATION.reduce((prev, curr) =>
      Math.abs(curr.frequencyHz - frequencyHz) < Math.abs(prev.frequencyHz - frequencyHz) ? curr : prev
    );
    const relative = safeDivide(Math.abs(closest.frequencyHz - frequencyHz), frequencyHz, 1);
    return relative < REFERENCE_TOLERANCE ? closest : null;
  });
</script>

<div class="skin-results">
  <ResultCard
    label="Skin-Tiefe δ"
    value={skinDepthM > 0 ? formatDistance(skinDepthM) : '—'}
    secondary="Amplitude auf 1/e ≈ 37 % gefallen"
    emphasis="hero"
  />
  <ResultCard
    label="Praktische Kommunikationstiefe"
    value={practicalDepthM > 0 ? formatDistance(practicalDepthM) : '—'}
    hint="etwa 2,5 Skin-Tiefen"
  />
  <ResultCard
    label="Signal bei 2 δ"
    value={formatPercentage(SIGNAL_AT_TWO_DEPTHS, 1, true)}
    hint="e⁻² = 0,135"
    copyable={false}
  />
</div>

{#if referenceData}
  <Callout tone="tip" title="Referenzwerte bei {formatFrequency(referenceData.frequencyHz)}">
    Skin-Tiefe {formatNumber(referenceData.skinDepthM, 1)} m, praktische Tiefe
    {formatNumber(referenceData.practicalDepthM, 0)} m. {referenceData.notes}
  </Callout>
{/if}

<style>
  .skin-results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
    gap: 0.75rem;
  }
</style>
