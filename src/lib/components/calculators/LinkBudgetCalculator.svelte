<script lang="ts">
  import { calculateFSPL } from '$lib/utils/calculations';
  import { dbmToWatt } from '$lib/utils/conversions';
  import { atmosphericParameters } from '$lib/stores/atmosphericParameters.svelte';
  import { calculateExtendedPathAttenuation } from '$lib/utils/atmosphericAttenuation';
  import { parseNumericInput } from '$lib/utils/handlers';
  import { formatPowerWatts } from '$lib/utils/formatting';
  import InfoTooltip from '$lib/components/ui/InfoTooltip.svelte';
  import { linkBudgetExplanations, fsplExplanations } from '$lib/data/explanations';

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
  let pathLengthUnit = $state('m');
  let pathFrequencyHz = $state(2.4e9); // 2.4 GHz default
  let pathFrequencyUnit = $state('GHz');
  let includeAtmosphericLoss = $state(false);

  // ===== RX (Receiver) Parameters =====
  let rxAntennaGainDbi = $state(2); // 2 dBi
  let rxCableLossDb = $state(1); // 1 dB
  let rxSensitivityDbm = $state(-90); // -90 dBm typical

  // ===== Additional Margins =====
  let fadingMarginDb = $state(10); // 10 dB for fading
  let miscLossDb = $state(0); // Additional losses

  // Unit conversion factors
  const DISTANCE_FACTORS: Record<string, number> = {
    'm': 1,
    'km': 1000,
    'mi': 1609.344,
  };

  const FREQUENCY_FACTORS: Record<string, number> = {
    'MHz': 1e6,
    'GHz': 1e9,
  };

  // Sync with external props
  $effect(() => {
    if (frequencyHz !== null && frequencyHz > 0) {
      pathFrequencyHz = frequencyHz;
      pathFrequencyUnit = frequencyHz >= 1e9 ? 'GHz' : 'MHz';
    }
  });

  $effect(() => {
    if (distanceM !== null && distanceM > 0) {
      pathLengthM = distanceM;
      pathLengthUnit = 'm';
    }
  });

  // ===== Derived Calculations =====

  // Effective frequency in Hz
  let effectiveFrequencyHz = $derived(
    pathFrequencyHz * (FREQUENCY_FACTORS[pathFrequencyUnit] ?? 1e9)
  );

  // Effective distance in meters
  let effectiveDistanceM = $derived(
    pathLengthM * (DISTANCE_FACTORS[pathLengthUnit] ?? 1)
  );

  // EIRP (Effective Isotropic Radiated Power)
  let eirpDbm = $derived(txPowerDbm + txAntennaGainDbi - txCableLossDb);

  // Free Space Path Loss
  let fsplDb = $derived(
    effectiveDistanceM > 0 && effectiveFrequencyHz > 0
      ? calculateFSPL(effectiveDistanceM, effectiveFrequencyHz)
      : 0
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
      distKm
    );

    return result.totalAllDb;
  });

  // Total Path Loss
  let totalPathLossDb = $derived(fsplDb + atmosphericLossDb + miscLossDb);

  // Received Power
  let receivedPowerDbm = $derived(
    eirpDbm - totalPathLossDb + rxAntennaGainDbi - rxCableLossDb
  );

  // Link Margin (before fading margin)
  let linkMarginDb = $derived(receivedPowerDbm - rxSensitivityDbm);

  // System Margin (after fading margin)
  let systemMarginDb = $derived(linkMarginDb - fadingMarginDb);

  // Link viability
  let linkViable = $derived(systemMarginDb >= 0);

  // Quick presets
  const linkPresets = [
    {
      name: 'WLAN Indoor',
      txPower: 20, txGain: 2, txLoss: 0.5,
      distance: 30, distUnit: 'm',
      freq: 2.4, freqUnit: 'GHz',
      rxGain: 2, rxLoss: 0.5, rxSens: -80,
      fade: 10
    },
    {
      name: 'LoRa Outdoor',
      txPower: 14, txGain: 3, txLoss: 1,
      distance: 5, distUnit: 'km',
      freq: 868, freqUnit: 'MHz',
      rxGain: 3, rxLoss: 1, rxSens: -137,
      fade: 15
    },
    {
      name: 'Point-to-Point 5G',
      txPower: 20, txGain: 15, txLoss: 2,
      distance: 500, distUnit: 'm',
      freq: 28, freqUnit: 'GHz',
      rxGain: 15, rxLoss: 2, rxSens: -85,
      fade: 20
    },
    {
      name: 'Satellitenlink',
      txPower: 30, txGain: 35, txLoss: 3,
      distance: 36000, distUnit: 'km',
      freq: 12, freqUnit: 'GHz',
      rxGain: 40, rxLoss: 1, rxSens: -110,
      fade: 5
    },
  ];

  function applyPreset(preset: typeof linkPresets[0]) {
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
      linkViable
    };
  }

  // Event handlers using centralized utility
  function handleNumberInput(setter: (val: number) => void) {
    return (e: Event) => {
      setter(parseNumericInput(e, 0));
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
    <div class="space-y-4">
      <h4 class="text-sm font-semibold text-blue-600 dark:text-blue-400 border-b border-default pb-2">
        TX (Sender)
      </h4>

      <div class="space-y-3">
        <div>
          <label for="lb-tx-power" class="text-label mb-1">
            Sendeleistung
            <InfoTooltip
              title={linkBudgetExplanations.txPower.title}
              short={linkBudgetExplanations.txPower.short}
              detailed={linkBudgetExplanations.txPower.detailed}
            />
          </label>
          <div class="flex items-center gap-2">
            <input
              id="lb-tx-power"
              type="number"
              value={txPowerDbm}
              oninput={handleNumberInput((v) => txPowerDbm = v)}
              class="input-field flex-1"
              step="1"
            />
            <span class="text-muted text-sm w-12">dBm</span>
          </div>
          <div class="text-xs text-muted mt-1">
            = {formatPowerWatts(dbmToWatt(txPowerDbm))}
          </div>
        </div>

        <div>
          <label for="lb-tx-antenna" class="text-label mb-1">
            Antennengewinn
            <InfoTooltip
              title={linkBudgetExplanations.txAntennaGain.title}
              short={linkBudgetExplanations.txAntennaGain.short}
              detailed={linkBudgetExplanations.txAntennaGain.detailed}
            />
          </label>
          <div class="flex items-center gap-2">
            <input
              id="lb-tx-antenna"
              type="number"
              value={txAntennaGainDbi}
              oninput={handleNumberInput((v) => txAntennaGainDbi = v)}
              class="input-field flex-1"
              step="0.5"
            />
            <span class="text-muted text-sm w-12">dBi</span>
          </div>
        </div>

        <div>
          <label for="lb-tx-cable" class="text-label mb-1">
            Kabelverlust
            <InfoTooltip
              title={linkBudgetExplanations.txCableLoss.title}
              short={linkBudgetExplanations.txCableLoss.short}
              detailed={linkBudgetExplanations.txCableLoss.detailed}
            />
          </label>
          <div class="flex items-center gap-2">
            <input
              id="lb-tx-cable"
              type="number"
              value={txCableLossDb}
              oninput={handleNumberInput((v) => txCableLossDb = v)}
              class="input-field flex-1"
              step="0.1"
              min="0"
            />
            <span class="text-muted text-sm w-12">dB</span>
          </div>
        </div>

        <!-- EIRP Result -->
        <div class="result-box mt-4">
          <div class="result-label">
            EIRP
            <InfoTooltip
              title={linkBudgetExplanations.eirp.title}
              short={linkBudgetExplanations.eirp.short}
              detailed={linkBudgetExplanations.eirp.detailed}
            />
          </div>
          <div class="text-xl font-bold text-blue-600 dark:text-blue-400">
            {eirpDbm.toFixed(1)} <span class="text-sm text-muted">dBm</span>
          </div>
          <div class="text-xs text-muted">
            = {dbmToWatt(eirpDbm) >= 1
              ? `${dbmToWatt(eirpDbm).toFixed(2)} W`
              : `${(dbmToWatt(eirpDbm) * 1000).toFixed(2)} mW`}
          </div>
        </div>
      </div>
    </div>

    <!-- Path Section -->
    <div class="space-y-4">
      <h4 class="text-sm font-semibold text-amber-600 dark:text-amber-400 border-b border-default pb-2">
        Pfad (Path)
      </h4>

      <div class="space-y-3">
        <div>
          <label for="lb-distance" class="text-label mb-1">
            Distanz
            <InfoTooltip
              title={fsplExplanations.distance.title}
              short={fsplExplanations.distance.short}
            />
          </label>
          <div class="flex items-center gap-2">
            <input
              id="lb-distance"
              type="number"
              value={pathLengthM}
              oninput={handleNumberInput((v) => pathLengthM = v)}
              class="input-field flex-1"
              step="any"
              min="0"
            />
            <select
              id="lb-distance-unit"
              bind:value={pathLengthUnit}
              class="select-field"
              aria-label="Distanzeinheit"
            >
              <option value="m">m</option>
              <option value="km">km</option>
              <option value="mi">mi</option>
            </select>
          </div>
        </div>

        <div>
          <label for="lb-frequency" class="text-label mb-1">
            Frequenz
            <InfoTooltip
              title={fsplExplanations.frequency.title}
              short={fsplExplanations.frequency.short}
            />
          </label>
          <div class="flex items-center gap-2">
            <input
              id="lb-frequency"
              type="number"
              value={pathFrequencyHz}
              oninput={handleNumberInput((v) => pathFrequencyHz = v)}
              class="input-field flex-1"
              step="any"
              min="0"
            />
            <select
              id="lb-frequency-unit"
              bind:value={pathFrequencyUnit}
              class="select-field"
              aria-label="Frequenzeinheit"
            >
              <option value="MHz">MHz</option>
              <option value="GHz">GHz</option>
            </select>
          </div>
        </div>

        <div>
          <label for="lb-misc-loss" class="text-label mb-1">Sonstige Verluste</label>
          <div class="flex items-center gap-2">
            <input
              id="lb-misc-loss"
              type="number"
              value={miscLossDb}
              oninput={handleNumberInput((v) => miscLossDb = v)}
              class="input-field flex-1"
              step="0.5"
              min="0"
            />
            <span class="text-muted text-sm w-12">dB</span>
          </div>
        </div>

        <label class="flex items-center gap-2 text-sm text-secondary cursor-pointer mt-2">
          <input
            type="checkbox"
            bind:checked={includeAtmosphericLoss}
            class="checkbox"
          />
          Atmosphärische Dämpfung einbeziehen
        </label>

        <!-- Path Loss Results -->
        <div class="result-box mt-4 space-y-2 text-left">
          <div class="flex justify-between text-xs">
            <span class="text-muted">FSPL:</span>
            <span class="text-amber-600 dark:text-amber-400 font-mono">{fsplDb.toFixed(1)} dB</span>
          </div>
          {#if includeAtmosphericLoss && atmosphericLossDb > 0}
            <div class="flex justify-between text-xs">
              <span class="text-muted">Atmos. Verlust:</span>
              <span class="text-amber-600 dark:text-amber-400 font-mono">{atmosphericLossDb.toFixed(1)} dB</span>
            </div>
          {/if}
          {#if miscLossDb > 0}
            <div class="flex justify-between text-xs">
              <span class="text-muted">Sonstige:</span>
              <span class="text-amber-600 dark:text-amber-400 font-mono">{miscLossDb.toFixed(1)} dB</span>
            </div>
          {/if}
          <div class="flex justify-between border-t border-default pt-2">
            <span class="text-primary text-sm">Gesamt:</span>
            <span class="text-xl font-bold text-amber-600 dark:text-amber-400">{totalPathLossDb.toFixed(1)} dB</span>
          </div>
        </div>
      </div>
    </div>

    <!-- RX Section -->
    <div class="space-y-4">
      <h4 class="text-sm font-semibold text-green-600 dark:text-green-400 border-b border-default pb-2">
        RX (Empfänger)
      </h4>

      <div class="space-y-3">
        <div>
          <label for="lb-rx-antenna" class="text-label mb-1">
            Antennengewinn
            <InfoTooltip
              title={linkBudgetExplanations.rxAntennaGain.title}
              short={linkBudgetExplanations.rxAntennaGain.short}
              detailed={linkBudgetExplanations.rxAntennaGain.detailed}
            />
          </label>
          <div class="flex items-center gap-2">
            <input
              id="lb-rx-antenna"
              type="number"
              value={rxAntennaGainDbi}
              oninput={handleNumberInput((v) => rxAntennaGainDbi = v)}
              class="input-field flex-1"
              step="0.5"
            />
            <span class="text-muted text-sm w-12">dBi</span>
          </div>
        </div>

        <div>
          <label for="lb-rx-cable" class="text-label mb-1">
            Kabelverlust
            <InfoTooltip
              title={linkBudgetExplanations.rxCableLoss.title}
              short={linkBudgetExplanations.rxCableLoss.short}
              detailed={linkBudgetExplanations.rxCableLoss.detailed}
            />
          </label>
          <div class="flex items-center gap-2">
            <input
              id="lb-rx-cable"
              type="number"
              value={rxCableLossDb}
              oninput={handleNumberInput((v) => rxCableLossDb = v)}
              class="input-field flex-1"
              step="0.1"
              min="0"
            />
            <span class="text-muted text-sm w-12">dB</span>
          </div>
        </div>

        <div>
          <label for="lb-rx-sensitivity" class="text-label mb-1">
            Empfindlichkeit
            <InfoTooltip
              title={linkBudgetExplanations.rxSensitivity.title}
              short={linkBudgetExplanations.rxSensitivity.short}
              detailed={linkBudgetExplanations.rxSensitivity.detailed}
            />
          </label>
          <div class="flex items-center gap-2">
            <input
              id="lb-rx-sensitivity"
              type="number"
              value={rxSensitivityDbm}
              oninput={handleNumberInput((v) => rxSensitivityDbm = v)}
              class="input-field flex-1"
              step="1"
            />
            <span class="text-muted text-sm w-12">dBm</span>
          </div>
        </div>

        <div>
          <label for="lb-fading-margin" class="text-label mb-1">
            Fading Margin
            <InfoTooltip
              title={linkBudgetExplanations.fadingMargin.title}
              short={linkBudgetExplanations.fadingMargin.short}
              detailed={linkBudgetExplanations.fadingMargin.detailed}
            />
          </label>
          <div class="flex items-center gap-2">
            <input
              id="lb-fading-margin"
              type="number"
              value={fadingMarginDb}
              oninput={handleNumberInput((v) => fadingMarginDb = v)}
              class="input-field flex-1"
              step="1"
              min="0"
            />
            <span class="text-muted text-sm w-12">dB</span>
          </div>
        </div>

        <!-- RX Results -->
        <div class="result-box mt-4 space-y-2 text-left">
          <div class="flex justify-between">
            <span class="text-muted text-sm">Empfangsleistung:</span>
            <span class="text-lg font-bold text-green-600 dark:text-green-400">{receivedPowerDbm.toFixed(1)} dBm</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-muted">Empfindlichkeit:</span>
            <span class="text-primary font-mono">{rxSensitivityDbm} dBm</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Final Results -->
  <div class="mt-6 pt-6 border-t border-default">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Link Margin -->
      <div class="result-box">
        <div class="result-label">
          Link Margin
          <InfoTooltip
            title={linkBudgetExplanations.linkMargin.title}
            short={linkBudgetExplanations.linkMargin.short}
            detailed={linkBudgetExplanations.linkMargin.detailed}
          />
        </div>
        <div class="text-2xl font-bold {linkMarginDb >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
          {linkMarginDb >= 0 ? '+' : ''}{linkMarginDb.toFixed(1)} <span class="text-lg text-muted">dB</span>
        </div>
        <div class="text-xs text-muted mt-1">Pegel über Empfindlichkeit</div>
      </div>

      <!-- System Margin -->
      <div class="result-box">
        <div class="result-label">
          System Margin
          <InfoTooltip
            title={linkBudgetExplanations.systemGain.title}
            short={linkBudgetExplanations.systemGain.short}
            detailed={linkBudgetExplanations.systemGain.detailed}
          />
        </div>
        <div class="text-2xl font-bold {systemMarginDb >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
          {systemMarginDb >= 0 ? '+' : ''}{systemMarginDb.toFixed(1)} <span class="text-lg text-muted">dB</span>
        </div>
        <div class="text-xs text-muted mt-1">Nach Fading Margin ({fadingMarginDb} dB)</div>
      </div>

      <!-- Link Status -->
      <div class="result-box">
        <div class="result-label">Link Status</div>
        <div class="text-xl font-bold {linkViable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
          {linkViable ? 'VIABLE' : 'NICHT VIABLE'}
        </div>
        <div class="text-xs {linkViable ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'} mt-1">
          {linkViable
            ? `Reserve: ${systemMarginDb.toFixed(1)} dB`
            : `Fehlt: ${Math.abs(systemMarginDb).toFixed(1)} dB`}
        </div>
      </div>
    </div>
  </div>

</div>

<style>
  .border-default {
    border-color: var(--color-border-default);
  }
</style>
