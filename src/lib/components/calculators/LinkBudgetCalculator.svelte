<script lang="ts">
  import { calculateFSPL } from "$lib/utils/calculations";
  import { convertToHz } from "$lib/utils/conversions";
  import { atmosphericParameters } from "$lib/stores/atmosphericParameters.svelte";
  import { calculateExtendedPathAttenuation } from "$lib/utils/atmosphericAttenuation";
  import { getDistanceFactor } from "$lib/data/units";
  import {
    LINK_BUDGET_PRESETS,
    type LinkBudgetPreset,
  } from "$lib/data/presets";

  // Components
  import LinkBudgetTxSection from "./LinkBudgetTxSection.svelte";
  import LinkBudgetPathSection from "./LinkBudgetPathSection.svelte";
  import LinkBudgetRxSection from "./LinkBudgetRxSection.svelte";
  import LinkBudgetResults from "./LinkBudgetResults.svelte";

  interface Props {
    frequencyHz?: number | null;
    distanceM?: number | null;
  }

  let { frequencyHz = null, distanceM = null }: Props = $props();

  // ===== TX (Transmitter) Parameters =====
  let txPowerDbm = $state(20); // 20 dBm = 100 mW
  let txAntennaGainDbi = $state(2); // 2 dBi typical for dipole
  let txCableLossDb = $state(1); // 1 dB cable/connector loss

  // ===== Path Parameters =====
  let pathLengthM = $state(1000); // 1 km default
  let pathLengthUnit = $state("m");
  let pathFrequencyHz = $state(2.4e9); // 2.4 GHz default
  let pathFrequencyUnit = $state("GHz");
  let includeAtmosphericLoss = $state(false);

  // ===== RX (Receiver) Parameters =====
  let rxAntennaGainDbi = $state(2); // 2 dBi
  let rxCableLossDb = $state(1); // 1 dB
  let rxSensitivityDbm = $state(-90); // -90 dBm typical

  // ===== Additional Margins =====
  let fadingMarginDb = $state(10); // 10 dB for fading
  let miscLossDb = $state(0); // Additional losses

  // Sync with external props
  $effect(() => {
    if (frequencyHz !== null && frequencyHz > 0) {
      pathFrequencyHz = frequencyHz;
      pathFrequencyUnit = frequencyHz >= 1e9 ? "GHz" : "MHz";
    }
  });

  $effect(() => {
    if (distanceM !== null && distanceM > 0) {
      pathLengthM = distanceM;
      pathLengthUnit = "m";
    }
  });

  // ===== Derived Calculations =====

  // Effective frequency in Hz
  let effectiveFrequencyHz = $derived(
    convertToHz(pathFrequencyHz, pathFrequencyUnit),
  );

  // Effective distance in meters
  let effectiveDistanceM = $derived(
    pathLengthM * getDistanceFactor(pathLengthUnit),
  );

  // EIRP (Effective Isotropic Radiated Power)
  let eirpDbm = $derived(txPowerDbm + txAntennaGainDbi - txCableLossDb);

  // Free Space Path Loss
  let fsplDb = $derived(
    effectiveDistanceM > 0 && effectiveFrequencyHz > 0
      ? calculateFSPL(effectiveDistanceM, effectiveFrequencyHz)
      : 0,
  );

  // Atmospheric Attenuation (optional)
  let atmosphericLossDb = $derived.by(() => {
    if (!includeAtmosphericLoss) return 0;
    if (effectiveFrequencyHz <= 0 || effectiveDistanceM <= 0) return 0;

    const freqGHz = effectiveFrequencyHz / 1e9;
    const distKm = effectiveDistanceM / 1000;

    const result = calculateExtendedPathAttenuation(
      freqGHz,
      atmosphericParameters.allConditions,
      distKm,
    );

    return result.totalAllDb;
  });

  // Total Path Loss
  let totalPathLossDb = $derived(fsplDb + atmosphericLossDb + miscLossDb);

  // Received Power
  let receivedPowerDbm = $derived(
    eirpDbm - totalPathLossDb + rxAntennaGainDbi - rxCableLossDb,
  );

  // Link Margin (before fading margin)
  let linkMarginDb = $derived(receivedPowerDbm - rxSensitivityDbm);

  // System Margin (after fading margin)
  let systemMarginDb = $derived(linkMarginDb - fadingMarginDb);

  // Link viability
  let linkViable = $derived(systemMarginDb >= 0);

  // Quick presets - imported from presets.ts
  const linkPresets = LINK_BUDGET_PRESETS;

  function applyPreset(preset: LinkBudgetPreset) {
    txPowerDbm = preset.txPower;
    txAntennaGainDbi = preset.txGain;
    txCableLossDb = preset.txLoss;
    pathLengthM = preset.distance;
    pathLengthUnit = preset.distUnit;
    pathFrequencyHz = preset.freq;
    pathFrequencyUnit = preset.freqUnit;
    rxAntennaGainDbi = preset.rxGain;
    rxCableLossDb = preset.rxLoss;
    rxSensitivityDbm = preset.rxSens;
    fadingMarginDb = preset.fade;
  }

  // Export link budget data for waterfall chart
  export function getLinkBudgetData() {
    return {
      txPowerDbm,
      txAntennaGainDbi,
      txCableLossDb,
      eirpDbm,
      fsplDb,
      atmosphericLossDb,
      miscLossDb,
      totalPathLossDb,
      rxAntennaGainDbi,
      rxCableLossDb,
      receivedPowerDbm,
      rxSensitivityDbm,
      linkMarginDb,
      fadingMarginDb,
      systemMarginDb,
      linkViable,
    };
  }
</script>

<div class="card">
  <h3 class="text-heading-3 mb-4">Link Budget Kalkulator</h3>

  <!-- Quick Presets -->
  <div class="flex flex-wrap gap-2 mb-6">
    <span class="text-sm text-secondary self-center mr-2">Presets:</span>
    {#each linkPresets as preset (preset.name)}
      <button
        type="button"
        onclick={() => applyPreset(preset)}
        class="btn-chip"
      >
        {preset.name}
      </button>
    {/each}
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- TX Section -->
    <LinkBudgetTxSection
      bind:txPowerDbm
      bind:txAntennaGainDbi
      bind:txCableLossDb
      {eirpDbm}
    />

    <!-- Path Section -->
    <LinkBudgetPathSection
      bind:pathLengthM
      bind:pathLengthUnit
      bind:pathFrequencyHz
      bind:pathFrequencyUnit
      bind:miscLossDb
      bind:includeAtmosphericLoss
      {fsplDb}
      {atmosphericLossDb}
      {totalPathLossDb}
    />

    <!-- RX Section -->
    <LinkBudgetRxSection
      bind:rxAntennaGainDbi
      bind:rxCableLossDb
      bind:rxSensitivityDbm
      bind:fadingMarginDb
      {receivedPowerDbm}
    />
  </div>

  <!-- Final Results -->
  <LinkBudgetResults
    {linkMarginDb}
    {systemMarginDb}
    {fadingMarginDb}
    {linkViable}
  />
</div>

<style>
  /* Styles are now mostly in subcomponents or global */
</style>
