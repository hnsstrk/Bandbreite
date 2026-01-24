<script lang="ts">
  import { calculateFSPL, calculateRange } from '$lib/utils/calculations';

  interface Props {
    frequencyHz: number | null;
  }

  let { frequencyHz }: Props = $props();

  // Input state with defaults
  let txPowerDbm = $state(20);
  let rxSensitivityDbm = $state(-90);

  // Derived calculations
  let rangeMeters = $derived(
    frequencyHz !== null && frequencyHz > 0
      ? calculateRange(frequencyHz, txPowerDbm, rxSensitivityDbm)
      : null
  );

  let fsplAtRange = $derived(
    rangeMeters !== null && frequencyHz !== null && frequencyHz > 0
      ? calculateFSPL(rangeMeters, frequencyHz)
      : null
  );

  // Format range with appropriate unit
  function formatRange(meters: number | null): { value: string; unit: string } {
    if (meters === null || !isFinite(meters)) {
      return { value: '—', unit: '' };
    }
    if (meters >= 1000) {
      const km = meters / 1000;
      if (km >= 1000) {
        return { value: km.toExponential(2), unit: 'km' };
      }
      return { value: km.toFixed(2), unit: 'km' };
    }
    return { value: meters.toFixed(2), unit: 'm' };
  }

  let formattedRange = $derived(formatRange(rangeMeters));

  function handleTxPowerInput(e: Event) {
    const target = e.target as HTMLInputElement;
    txPowerDbm = target.value ? parseFloat(target.value) : 0;
  }

  function handleRxSensitivityInput(e: Event) {
    const target = e.target as HTMLInputElement;
    rxSensitivityDbm = target.value ? parseFloat(target.value) : 0;
  }
</script>

<div class="card-compact">
  <div class="calculator-row">
    <!-- TX Power Input -->
    <div class="input-group">
      <label for="tx-power" class="input-label">TX</label>
      <input
        type="number"
        id="tx-power"
        value={txPowerDbm}
        oninput={handleTxPowerInput}
        class="input-field input-narrow"
        step="1"
        aria-label="Sendeleistung in dBm"
      />
      <span class="unit-label">dBm</span>
    </div>

    <!-- RX Sensitivity Input -->
    <div class="input-group">
      <label for="rx-sensitivity" class="input-label">RX</label>
      <input
        type="number"
        id="rx-sensitivity"
        value={rxSensitivityDbm}
        oninput={handleRxSensitivityInput}
        class="input-field input-narrow"
        step="1"
        aria-label="Empfängerempfindlichkeit in dBm"
      />
      <span class="unit-label">dBm</span>
    </div>

    <!-- Arrow -->
    <span class="arrow" aria-hidden="true">&#8594;</span>

    <!-- Result Display (inline) -->
    <div class="result-display">
      {#if frequencyHz !== null && frequencyHz > 0}
        <span class="result-label">Reichweite:</span>
        <span class="result-value">
          {formattedRange.value}
          <span class="result-unit">{formattedRange.unit}</span>
        </span>
        {#if fsplAtRange !== null && isFinite(fsplAtRange)}
          <span class="fspl-info">
            (FSPL: {fsplAtRange.toFixed(1)} dB)
          </span>
        {/if}
      {:else}
        <span class="placeholder">Frequenz eingeben</span>
      {/if}
    </div>

    <!-- Formula (compact) -->
    <div class="formula-display">
      <span>FSPL = 20 log&#8321;&#8320;(d) + 20 log&#8321;&#8320;(f) - 147,55</span>
    </div>
  </div>
</div>

<style>
  .calculator-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
  }

  .input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .input-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    white-space: nowrap;
  }

  .input-field {
    padding: 0.375rem 0.75rem;
  }

  .input-narrow {
    width: 5rem;
  }

  .unit-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  }

  .arrow {
    color: var(--color-text-tertiary);
    font-size: 1.125rem;
    font-weight: 700;
  }

  .result-display {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .result-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
  }

  .result-value {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-accent-primary);
  }

  .result-unit {
    font-size: var(--font-size-sm);
    font-weight: 400;
    color: var(--color-text-tertiary);
  }

  .fspl-info {
    font-size: var(--font-size-sm);
    color: var(--color-text-disabled);
  }

  .placeholder {
    font-size: var(--font-size-sm);
    color: var(--color-text-disabled);
  }

  .formula-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
    font-size: var(--font-size-xs);
    color: var(--color-text-disabled);
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  }
</style>
