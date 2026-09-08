<script lang="ts">
  /**
   * Doppler- und Pulsparameter eines Radars.
   * Die Formeln liegen in `$lib/utils/radar.ts`.
   */
  import {
    calculateDopplerShift,
    calculateRangeResolution,
    calculateUnambiguousRange,
    calculateUnambiguousVelocity
  } from '$lib/utils/radar';
  import { formatDistance, formatFrequency, formatNumber } from '$lib/utils/formatting';
  import Callout from '$lib/components/ui/Callout.svelte';
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';

  interface Props {
    /** Sendefrequenz in Hz */
    frequencyHz: number;
    /** Wellenlänge in m */
    wavelengthM: number;
  }

  let { frequencyHz, wavelengthM }: Props = $props();

  /** Umrechnung km/h → m/s */
  const KMH_TO_MS = 1 / 3.6;

  /** Reglergrenzen */
  const VELOCITY_MIN_KMH = -1500;
  const VELOCITY_MAX_KMH = 1500;
  const PULSE_MIN_US = 0.01;
  const PULSE_MAX_US = 100;
  const PRF_MIN_HZ = 50;
  const PRF_MAX_HZ = 20000;

  // Eingaben
  let radialVelocityKmh = $state(100);
  let pulseWidthUs = $state(1);
  let prfHz = $state(1000);

  let dopplerHz = $derived(calculateDopplerShift(radialVelocityKmh * KMH_TO_MS, frequencyHz));
  let rangeResolutionM = $derived(calculateRangeResolution(pulseWidthUs * 1e-6));
  let unambiguousRangeM = $derived(calculateUnambiguousRange(prfHz));
  let unambiguousVelocityMs = $derived(calculateUnambiguousVelocity(prfHz, wavelengthM));
  let unambiguousVelocityKmh = $derived(unambiguousVelocityMs / KMH_TO_MS);

  let velocityAmbiguous = $derived(
    unambiguousVelocityKmh > 0 && Math.abs(radialVelocityKmh) > unambiguousVelocityKmh
  );
</script>

<section class="pulse" aria-labelledby="radar-pulse-heading">
  <h3 class="pulse__title" id="radar-pulse-heading">Doppler und Pulsparameter</h3>

  <div class="pulse__inputs">
    <NumberInput
      label="Radialgeschwindigkeit"
      bind:value={radialVelocityKmh}
      units={[{ id: 'kmh', symbol: 'km/h', factor: 1 }]}
      min={VELOCITY_MIN_KMH}
      max={VELOCITY_MAX_KMH}
      step={1}
      slider
      hint="Positiv bedeutet Annäherung: f_d = 2 · v · f / c"
    />

    <NumberInput
      label="Pulsdauer τ"
      bind:value={pulseWidthUs}
      units={[{ id: 'us', symbol: 'µs', factor: 1 }]}
      min={PULSE_MIN_US}
      max={PULSE_MAX_US}
      slider
      sliderScale="log"
      hint="Bestimmt die Entfernungsauflösung ΔR = c · τ / 2"
    />

    <NumberInput
      label="Pulswiederholfrequenz PRF"
      bind:value={prfHz}
      units={[{ id: 'hz', symbol: 'Hz', factor: 1 }]}
      min={PRF_MIN_HZ}
      max={PRF_MAX_HZ}
      slider
      sliderScale="log"
      hint="Legt die eindeutige Reichweite R_u = c / (2 · PRF) fest"
    />
  </div>

  <div class="pulse__results">
    <ResultCard
      label="Doppler-Verschiebung"
      value={formatFrequency(Math.abs(dopplerHz), 2)}
      hint="f_d = 2 · v · f / c"
    />
    <ResultCard
      label="Entfernungsauflösung"
      value={rangeResolutionM > 0 ? formatDistance(rangeResolutionM) : '—'}
      hint="ΔR = c · τ / 2, ohne Pulskompression"
    />
    <ResultCard
      label="Eindeutige Reichweite"
      value={unambiguousRangeM > 0 ? formatDistance(unambiguousRangeM) : '—'}
      hint="R_u = c / (2 · PRF)"
    />
    <ResultCard
      label="Eindeutige Geschwindigkeit"
      value={unambiguousVelocityKmh > 0 ? `±${formatNumber(unambiguousVelocityKmh, 0)}` : '—'}
      unit="km/h"
      hint="v_u = λ · PRF / 4"
      tone={velocityAmbiguous ? 'warning' : 'neutral'}
    />
  </div>

  {#if velocityAmbiguous}
    <Callout tone="warning" title="Geschwindigkeitsmehrdeutigkeit">
      Die eingestellte Radialgeschwindigkeit liegt über der eindeutigen Geschwindigkeit
      v_u = λ · PRF / 4. Das Radar misst sie gefaltet — eine höhere PRF schafft Abhilfe,
      verkleinert aber die eindeutige Reichweite.
    </Callout>
  {/if}
</section>

<style>
  .pulse {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .pulse__title {
    margin: 0;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .pulse__inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
    gap: 1.25rem;
  }

  .pulse__results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
    gap: 0.75rem;
  }
</style>
