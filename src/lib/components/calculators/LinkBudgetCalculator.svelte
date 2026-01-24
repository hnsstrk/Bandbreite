<script lang="ts">
  import { calculateFSPL } from '$lib/utils/calculations';
  import { convertToHz, wattToDbm, dbmToWatt } from '$lib/utils/conversions';
  import { atmosphericParameters } from '$lib/stores/atmosphericParameters.svelte';
  import { calculateExtendedPathAttenuation } from '$lib/utils/atmosphericAttenuation';

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

    const result = calculateExtendedPathAttenuation(freqGHz, {
      ...atmosphericParameters.allConditions,
      distanceKm: distKm
    });

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

  // Event handlers
  function handleNumberInput(setter: (val: number) => void) {
    return (e: Event) => {
      const target = e.target as HTMLInputElement;
      setter(target.value ? parseFloat(target.value) : 0);
    };
  }
</script>

<div class="bg-slate-800 rounded-xl p-6 shadow-lg">
  <h3 class="text-lg font-semibold text-slate-100 mb-4">Link Budget Kalkulator</h3>

  <!-- Quick Presets -->
  <div class="flex flex-wrap gap-2 mb-6">
    <span class="text-sm text-slate-400 self-center mr-2">Presets:</span>
    {#each linkPresets as preset (preset.name)}
      <button
        type="button"
        onclick={() => applyPreset(preset)}
        class="px-3 py-1 text-xs rounded border border-slate-600 hover:border-blue-500
               bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-blue-400
               transition-colors"
      >
        {preset.name}
      </button>
    {/each}
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- TX Section -->
    <div class="space-y-4">
      <h4 class="text-sm font-semibold text-blue-400 border-b border-slate-700 pb-2">
        TX (Sender)
      </h4>

      <div class="space-y-3">
        <div>
          <label class="block text-xs text-slate-400 mb-1">Sendeleistung</label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              value={txPowerDbm}
              oninput={handleNumberInput((v) => txPowerDbm = v)}
              class="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="1"
            />
            <span class="text-slate-400 text-sm w-12">dBm</span>
          </div>
          <div class="text-xs text-slate-500 mt-1">
            = {dbmToWatt(txPowerDbm) >= 1
              ? `${dbmToWatt(txPowerDbm).toFixed(2)} W`
              : `${(dbmToWatt(txPowerDbm) * 1000).toFixed(2)} mW`}
          </div>
        </div>

        <div>
          <label class="block text-xs text-slate-400 mb-1">Antennengewinn</label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              value={txAntennaGainDbi}
              oninput={handleNumberInput((v) => txAntennaGainDbi = v)}
              class="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.5"
            />
            <span class="text-slate-400 text-sm w-12">dBi</span>
          </div>
        </div>

        <div>
          <label class="block text-xs text-slate-400 mb-1">Kabelverlust</label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              value={txCableLossDb}
              oninput={handleNumberInput((v) => txCableLossDb = v)}
              class="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.1"
              min="0"
            />
            <span class="text-slate-400 text-sm w-12">dB</span>
          </div>
        </div>

        <!-- EIRP Result -->
        <div class="bg-slate-900 rounded-lg p-3 mt-4">
          <div class="text-xs text-slate-400 mb-1">EIRP</div>
          <div class="text-xl font-bold text-blue-400">
            {eirpDbm.toFixed(1)} <span class="text-sm text-slate-400">dBm</span>
          </div>
          <div class="text-xs text-slate-500">
            = {dbmToWatt(eirpDbm) >= 1
              ? `${dbmToWatt(eirpDbm).toFixed(2)} W`
              : `${(dbmToWatt(eirpDbm) * 1000).toFixed(2)} mW`}
          </div>
        </div>
      </div>
    </div>

    <!-- Path Section -->
    <div class="space-y-4">
      <h4 class="text-sm font-semibold text-amber-400 border-b border-slate-700 pb-2">
        Pfad (Path)
      </h4>

      <div class="space-y-3">
        <div>
          <label class="block text-xs text-slate-400 mb-1">Distanz</label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              value={pathLengthM}
              oninput={handleNumberInput((v) => pathLengthM = v)}
              class="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="any"
              min="0"
            />
            <select
              bind:value={pathLengthUnit}
              class="bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="m">m</option>
              <option value="km">km</option>
              <option value="mi">mi</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs text-slate-400 mb-1">Frequenz</label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              value={pathFrequencyHz}
              oninput={handleNumberInput((v) => pathFrequencyHz = v)}
              class="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="any"
              min="0"
            />
            <select
              bind:value={pathFrequencyUnit}
              class="bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MHz">MHz</option>
              <option value="GHz">GHz</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs text-slate-400 mb-1">Sonstige Verluste</label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              value={miscLossDb}
              oninput={handleNumberInput((v) => miscLossDb = v)}
              class="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.5"
              min="0"
            />
            <span class="text-slate-400 text-sm w-12">dB</span>
          </div>
        </div>

        <label class="flex items-center gap-2 text-sm text-slate-400 cursor-pointer mt-2">
          <input
            type="checkbox"
            bind:checked={includeAtmosphericLoss}
            class="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-500
                   focus:ring-blue-500 focus:ring-offset-slate-800"
          />
          Atmosphärische Dämpfung einbeziehen
        </label>

        <!-- Path Loss Results -->
        <div class="bg-slate-900 rounded-lg p-3 mt-4 space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-slate-400">FSPL:</span>
            <span class="text-amber-400 font-mono">{fsplDb.toFixed(1)} dB</span>
          </div>
          {#if includeAtmosphericLoss && atmosphericLossDb > 0}
            <div class="flex justify-between text-xs">
              <span class="text-slate-400">Atmos. Verlust:</span>
              <span class="text-amber-400 font-mono">{atmosphericLossDb.toFixed(1)} dB</span>
            </div>
          {/if}
          {#if miscLossDb > 0}
            <div class="flex justify-between text-xs">
              <span class="text-slate-400">Sonstige:</span>
              <span class="text-amber-400 font-mono">{miscLossDb.toFixed(1)} dB</span>
            </div>
          {/if}
          <div class="flex justify-between border-t border-slate-700 pt-2">
            <span class="text-slate-300 text-sm">Gesamt:</span>
            <span class="text-xl font-bold text-amber-400">{totalPathLossDb.toFixed(1)} dB</span>
          </div>
        </div>
      </div>
    </div>

    <!-- RX Section -->
    <div class="space-y-4">
      <h4 class="text-sm font-semibold text-green-400 border-b border-slate-700 pb-2">
        RX (Empfänger)
      </h4>

      <div class="space-y-3">
        <div>
          <label class="block text-xs text-slate-400 mb-1">Antennengewinn</label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              value={rxAntennaGainDbi}
              oninput={handleNumberInput((v) => rxAntennaGainDbi = v)}
              class="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.5"
            />
            <span class="text-slate-400 text-sm w-12">dBi</span>
          </div>
        </div>

        <div>
          <label class="block text-xs text-slate-400 mb-1">Kabelverlust</label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              value={rxCableLossDb}
              oninput={handleNumberInput((v) => rxCableLossDb = v)}
              class="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.1"
              min="0"
            />
            <span class="text-slate-400 text-sm w-12">dB</span>
          </div>
        </div>

        <div>
          <label class="block text-xs text-slate-400 mb-1">Empfindlichkeit</label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              value={rxSensitivityDbm}
              oninput={handleNumberInput((v) => rxSensitivityDbm = v)}
              class="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="1"
            />
            <span class="text-slate-400 text-sm w-12">dBm</span>
          </div>
        </div>

        <div>
          <label class="block text-xs text-slate-400 mb-1">Fading Margin</label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              value={fadingMarginDb}
              oninput={handleNumberInput((v) => fadingMarginDb = v)}
              class="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="1"
              min="0"
            />
            <span class="text-slate-400 text-sm w-12">dB</span>
          </div>
        </div>

        <!-- RX Results -->
        <div class="bg-slate-900 rounded-lg p-3 mt-4 space-y-2">
          <div class="flex justify-between">
            <span class="text-slate-400 text-sm">Empfangsleistung:</span>
            <span class="text-lg font-bold text-green-400">{receivedPowerDbm.toFixed(1)} dBm</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-slate-400">Empfindlichkeit:</span>
            <span class="text-slate-300 font-mono">{rxSensitivityDbm} dBm</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Final Results -->
  <div class="mt-6 pt-6 border-t border-slate-700">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Link Margin -->
      <div class="bg-slate-900 rounded-lg p-4 text-center">
        <div class="text-slate-400 text-sm mb-1">Link Margin</div>
        <div class="text-2xl font-bold {linkMarginDb >= 0 ? 'text-green-400' : 'text-red-400'}">
          {linkMarginDb >= 0 ? '+' : ''}{linkMarginDb.toFixed(1)} <span class="text-lg text-slate-400">dB</span>
        </div>
        <div class="text-xs text-slate-500 mt-1">Pegel über Empfindlichkeit</div>
      </div>

      <!-- System Margin -->
      <div class="bg-slate-900 rounded-lg p-4 text-center">
        <div class="text-slate-400 text-sm mb-1">System Margin</div>
        <div class="text-2xl font-bold {systemMarginDb >= 0 ? 'text-green-400' : 'text-red-400'}">
          {systemMarginDb >= 0 ? '+' : ''}{systemMarginDb.toFixed(1)} <span class="text-lg text-slate-400">dB</span>
        </div>
        <div class="text-xs text-slate-500 mt-1">Nach Fading Margin ({fadingMarginDb} dB)</div>
      </div>

      <!-- Link Status -->
      <div class="bg-slate-900 rounded-lg p-4 text-center">
        <div class="text-slate-400 text-sm mb-1">Link Status</div>
        <div class="text-xl font-bold {linkViable ? 'text-green-400' : 'text-red-400'}">
          {linkViable ? 'VIABLE' : 'NICHT VIABLE'}
        </div>
        <div class="text-xs {linkViable ? 'text-green-500' : 'text-red-500'} mt-1">
          {linkViable
            ? `Reserve: ${systemMarginDb.toFixed(1)} dB`
            : `Fehlt: ${Math.abs(systemMarginDb).toFixed(1)} dB`}
        </div>
      </div>
    </div>
  </div>

  <!-- Formula Reference -->
  <div class="mt-4 text-xs text-slate-500">
    <p>
      <strong>Link Budget:</strong> P<sub>RX</sub> = P<sub>TX</sub> + G<sub>TX</sub> - L<sub>TX</sub> - L<sub>path</sub> + G<sub>RX</sub> - L<sub>RX</sub>
      &nbsp;&nbsp;|&nbsp;&nbsp;
      <strong>Margin:</strong> M = P<sub>RX</sub> - S<sub>RX</sub> - M<sub>fade</sub>
    </p>
  </div>
</div>
