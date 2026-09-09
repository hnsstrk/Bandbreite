<script lang="ts">
  /**
   * Anpassung auf einen Blick: Stehwellenverhältnis, Reflexionsfaktor,
   * Rückflussdämpfung, reflektierte Leistung und Fehlanpassungsverlust
   * hängen alle am selben Wert und werden hier gemeinsam gezeigt.
   */
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { formatNumber } from '$lib/utils/formatting';
  import { mismatchLossDb, reflectedPowerPercent, reflectionFromVswr, returnLossDb } from '$lib/utils/antennaMath';

  const SWR_MIN = 1;
  const SWR_MAX = 10;
  /** Bis hierher gilt eine Antennenanlage als gut angepasst. */
  const SWR_GOOD = 1.5;
  /** Ab hier schalten viele Sender ihre Leistung zurück. */
  const SWR_CRITICAL = 3;
  /** Breite des Leistungsbalkens in Prozent. */
  const BAR_FULL_PERCENT = 100;

  let vswr = $state(1.5);

  const reflection = $derived(reflectionFromVswr(vswr));
  const returnLoss = $derived(returnLossDb(reflection));
  const reflectedPercent = $derived(reflectedPowerPercent(reflection));
  const mismatchLoss = $derived(mismatchLossDb(reflection));
  const tone = $derived(vswr <= SWR_GOOD ? 'success' : vswr < SWR_CRITICAL ? 'warning' : 'danger');
  const verdict = $derived(
    vswr <= SWR_GOOD
      ? 'gut angepasst'
      : vswr < SWR_CRITICAL
        ? 'brauchbar, aber verbesserungswürdig'
        : 'kritisch — viele Sender regeln hier ab'
  );
</script>

<div class="swr">
  <Slider
    label="Stehwellenverhältnis SWR"
    bind:value={vswr}
    min={SWR_MIN}
    max={SWR_MAX}
    step={0.05}
    format={(value) => `${formatNumber(value, 2)} : 1`}
    ticks={[
      { at: 1, label: '1' },
      { at: 2, label: '2' },
      { at: 5, label: '5' },
      { at: 10, label: '10' }
    ]}
  />

  <div class="verdict">
    <Badge {tone} dot srPrefix="Bewertung">{verdict}</Badge>
  </div>

  <div
    class="bar"
    role="img"
    aria-label={`${formatNumber(reflectedPercent, 1)} Prozent der Leistung werden reflektiert, ${formatNumber(BAR_FULL_PERCENT - reflectedPercent, 1)} Prozent laufen zur Antenne.`}
  >
    <div class="bar__forward" style="width: {BAR_FULL_PERCENT - reflectedPercent}%"></div>
    <div class="bar__reflected" style="width: {reflectedPercent}%"></div>
  </div>
  <p class="legend">
    <span class="key key--forward"></span> abgestrahlt
    <span class="key key--reflected"></span> reflektiert
  </p>

  <div class="results">
    <ResultCard label="Reflexionsfaktor |Γ|" value={formatNumber(reflection, 3)} hint="Γ = (s − 1)/(s + 1)" />
    <ResultCard
      label="Rückflussdämpfung"
      value={Number.isFinite(returnLoss) ? formatNumber(returnLoss, 2) : '∞'}
      unit="dB"
      hint="RL = −20 · log₁₀|Γ|"
    />
    <ResultCard
      label="Reflektierte Leistung"
      value={formatNumber(reflectedPercent, 1)}
      unit="%"
      hint="|Γ|² der hinlaufenden Leistung"
    />
    <ResultCard
      label="Fehlanpassungsverlust"
      value={formatNumber(mismatchLoss, 2)}
      unit="dB"
      hint="−10 · log₁₀(1 − |Γ|²)"
    />
  </div>
</div>

<style>
  .swr {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .verdict {
    display: flex;
    gap: 0.5rem;
  }

  .bar {
    display: flex;
    height: 1.25rem;
    border-radius: var(--radius-pill);
    overflow: hidden;
    border: 1px solid var(--color-line);
  }

  .bar__forward {
    background-color: var(--color-success);
  }

  .bar__reflected {
    background-color: var(--color-danger);
  }

  .legend {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .key {
    display: inline-block;
    width: 0.75rem;
    height: 0.75rem;
    border-radius: var(--radius-sm);
  }

  .key--forward {
    background-color: var(--color-success);
  }

  .key--reflected {
    background-color: var(--color-danger);
    margin-left: 0.75rem;
  }

  .results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: 0.75rem;
  }
</style>
