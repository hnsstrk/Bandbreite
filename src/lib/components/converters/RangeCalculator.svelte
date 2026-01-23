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

<div class="bg-slate-800 rounded-lg p-4 shadow-xl">
  <div class="flex flex-wrap items-center gap-4">
    <!-- TX Power Input -->
    <div class="flex items-center gap-2">
      <label for="tx-power" class="text-sm font-medium text-slate-300 whitespace-nowrap">
        TX
      </label>
      <input
        type="number"
        id="tx-power"
        value={txPowerDbm}
        oninput={handleTxPowerInput}
        class="w-20 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        step="1"
      />
      <span class="text-slate-400 text-sm font-mono">dBm</span>
    </div>

    <!-- RX Sensitivity Input -->
    <div class="flex items-center gap-2">
      <label for="rx-sensitivity" class="text-sm font-medium text-slate-300 whitespace-nowrap">
        RX
      </label>
      <input
        type="number"
        id="rx-sensitivity"
        value={rxSensitivityDbm}
        oninput={handleRxSensitivityInput}
        class="w-20 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        step="1"
      />
      <span class="text-slate-400 text-sm font-mono">dBm</span>
    </div>

    <!-- Arrow -->
    <span class="text-slate-400 text-lg font-bold">→</span>

    <!-- Result Display (inline) -->
    <div class="flex items-center gap-3">
      {#if frequencyHz !== null && frequencyHz > 0}
        <span class="text-sm text-slate-400">Reichweite:</span>
        <span class="text-lg font-bold text-blue-400">
          {formattedRange.value}
          <span class="text-sm text-slate-400">{formattedRange.unit}</span>
        </span>
        {#if fsplAtRange !== null && isFinite(fsplAtRange)}
          <span class="text-slate-500 text-sm">
            (FSPL: {fsplAtRange.toFixed(1)} dB)
          </span>
        {/if}
      {:else}
        <span class="text-sm text-slate-500">Frequenz eingeben</span>
      {/if}
    </div>

    <!-- Formula (compact) -->
    <div class="flex items-center gap-2 text-slate-500 text-xs ml-auto">
      <span class="font-mono">FSPL = 20·log₁₀(d) + 20·log₁₀(f) - 147,55</span>
    </div>
  </div>
</div>
