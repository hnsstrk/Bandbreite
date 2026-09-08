<script lang="ts">
  import {
    calculateDopplerShift,
    calculateRangeResolution,
    calculateUnambiguousRange,
    calculateUnambiguousVelocity
  } from '$lib/utils/radar';
  import { formatDistance, formatFrequency, formatNumber } from '$lib/utils/formatting';
  import { parseNumericInput } from '$lib/utils/handlers';
  import InfoTooltip from '$lib/components/ui/InfoTooltip.svelte';

  interface Props {
    /** Sendefrequenz in Hz */
    frequencyHz: number;
    /** Wellenlänge in m */
    wavelengthM: number;
  }

  let { frequencyHz, wavelengthM }: Props = $props();

  /** Umrechnung km/h → m/s */
  const KMH_TO_MS = 1 / 3.6;

  // Eingaben
  let radialVelocityKmh = $state(100);
  let pulseWidthUs = $state(1);
  let prfHz = $state(1000);

  let dopplerHz = $derived(calculateDopplerShift(radialVelocityKmh * KMH_TO_MS, frequencyHz));
  let rangeResolutionM = $derived(calculateRangeResolution(pulseWidthUs * 1e-6));
  let unambiguousRangeM = $derived(calculateUnambiguousRange(prfHz));
  let unambiguousVelocityMs = $derived(calculateUnambiguousVelocity(prfHz, wavelengthM));

  function handleVelocityInput(e: Event) {
    radialVelocityKmh = parseNumericInput(e, 0);
  }
  function handlePulseWidthInput(e: Event) {
    pulseWidthUs = parseNumericInput(e, 1);
  }
  function handlePrfInput(e: Event) {
    prfHz = parseNumericInput(e, 1000);
  }
</script>

<div class="mt-6">
  <div class="text-label mb-2">Doppler und Pulsparameter</div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="space-y-2">
      <label for="radar-velocity" class="text-label">
        Radialgeschwindigkeit
        <InfoTooltip
          title="Doppler-Verschiebung"
          short="f_d = 2·v·f / c"
          detailed="Ein sich näherndes Ziel erhöht die Echofrequenz um f_d = 2·v_r·f/c (Skolnik, Kap. 3)."
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="radar-velocity"
          type="number"
          value={radialVelocityKmh}
          oninput={handleVelocityInput}
          class="input-field flex-1"
          step="1"
        />
        <span class="text-secondary text-sm w-10">km/h</span>
      </div>
      <div class="text-xs text-muted">
        Doppler: <span class="font-mono">{formatFrequency(Math.abs(dopplerHz), 2)}</span>
      </div>
    </div>

    <div class="space-y-2">
      <label for="radar-pulse-width" class="text-label">
        Pulsdauer (τ)
        <InfoTooltip
          title="Entfernungsauflösung"
          short="ΔR = c·τ / 2"
          detailed="Zwei Ziele sind trennbar, wenn ihre Echos sich nicht überlappen: ΔR = c·τ/2 (ohne Pulskompression)."
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="radar-pulse-width"
          type="number"
          value={pulseWidthUs}
          oninput={handlePulseWidthInput}
          class="input-field flex-1"
          step="0.1"
          min="0.001"
        />
        <span class="text-secondary text-sm w-10">µs</span>
      </div>
      <div class="text-xs text-muted">
        Auflösung: <span class="font-mono">{rangeResolutionM > 0 ? formatDistance(rangeResolutionM) : '—'}</span>
      </div>
    </div>

    <div class="space-y-2">
      <label for="radar-prf" class="text-label">
        Pulswiederholfrequenz (PRF)
        <InfoTooltip
          title="Eindeutigkeit"
          short="R_u = c / (2·PRF), v_u = λ·PRF / 4"
          detailed="Echos jenseits von R_u werden der nächsten Pulsperiode zugeordnet (Entfernungsmehrdeutigkeit). Doppler-Frequenzen über PRF/2 sind mehrdeutig (Geschwindigkeitsmehrdeutigkeit)."
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="radar-prf"
          type="number"
          value={prfHz}
          oninput={handlePrfInput}
          class="input-field flex-1"
          step="100"
          min="1"
        />
        <span class="text-secondary text-sm w-10">Hz</span>
      </div>
      <div class="text-xs text-muted">
        R<sub>u</sub>: <span class="font-mono">{unambiguousRangeM > 0 ? formatDistance(unambiguousRangeM) : '—'}</span>,
        v<sub>u</sub>: <span class="font-mono">±{formatNumber(unambiguousVelocityMs / KMH_TO_MS, 0)} km/h</span>
      </div>
    </div>
  </div>
</div>
