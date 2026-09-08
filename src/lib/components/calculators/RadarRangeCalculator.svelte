<script lang="ts">
  import { frequencyToWavelength } from '$lib/utils/calculations';
  import { convertToHz, wattToDbm } from '$lib/utils/conversions';
  import { FREQUENCY_UNITS, getDistanceFactor } from '$lib/data/units';
  import { RCS_REFERENCE } from '$lib/data/constants';
  import { formatDistance, formatNumber } from '$lib/utils/formatting';
  import { parseNumericInput, parseSelectValue } from '$lib/utils/handlers';
  import {
    calculateRadarMaxRange,
    calculateRadarReceivedPowerDbm,
    type RadarParameters
  } from '$lib/utils/radar';
  import InfoTooltip from '$lib/components/ui/InfoTooltip.svelte';
  import RadarPulseParameters from './RadarPulseParameters.svelte';

  interface Props {
    frequencyHz?: number | null;
  }

  let { frequencyHz = null }: Props = $props();

  // Input state
  let inputFrequency = $state(9.4);
  let inputFrequencyUnit = $state('GHz');
  let txPowerWatts = $state(1000);
  let antennaGainDbi = $state(30);
  let rcsM2 = $state(1);
  let rxSensitivityDbm = $state(-90);
  let systemLossDb = $state(0);

  // RCS-Presets aus der zentralen Referenztabelle (Skolnik) – einzige Quelle für RCS-Werte
  const rcsPresets = RCS_REFERENCE.map((r) => ({ label: r.nameDE, value: r.rcsM2, desc: r.descriptionDE }));
  const QUICK_RCS_IDS = ['human', 'car', 'airliner', 'fighter'];
  const quickRcsPresets = QUICK_RCS_IDS.map((id) => RCS_REFERENCE.find((r) => r.id === id))
    .filter((r) => r !== undefined)
    .map((r) => ({ label: r.nameDE, value: r.rcsM2, desc: r.descriptionDE }));

  // Frequency presets for radar applications
  const frequencyPresets = [
    { label: 'L-Band', hz: 1.3e9, desc: 'Flugsicherung' },
    { label: 'S-Band', hz: 2.9e9, desc: 'Wetter/ATC' },
    { label: 'C-Band', hz: 5.5e9, desc: 'Wetterradar' },
    { label: 'X-Band', hz: 9.4e9, desc: 'Marine/Wetter' },
    { label: 'Ku-Band', hz: 15e9, desc: 'Satellit' },
    { label: 'K-Band', hz: 24.125e9, desc: 'Geschwindigkeit' },
    { label: 'Ka-Band', hz: 35e9, desc: 'Militär' },
    { label: '77 GHz', hz: 77e9, desc: 'Kfz-Radar' },
  ];

  // Current frequency in Hz
  let currentFrequencyHz = $derived(
    frequencyHz ?? convertToHz(inputFrequency, inputFrequencyUnit)
  );

  // Wavelength in meters
  let wavelengthM = $derived(
    currentFrequencyHz > 0 ? frequencyToWavelength(currentFrequencyHz) : 0
  );

  // Convert antenna gain from dBi to linear
  let antennaGainLinear = $derived(Math.pow(10, antennaGainDbi / 10));

  // Convert TX power to dBm for display
  let txPowerDbm = $derived(wattToDbm(txPowerWatts));

  // Radarparameter für die Utilities in $lib/utils/radar.ts
  let radarParams = $derived<RadarParameters>({
    txPowerW: txPowerWatts,
    antennaGainDbi,
    wavelengthM,
    rcsM2,
    systemLossDb
  });

  // Maximale Reichweite (Skolnik Gl. 1.7 inkl. Systemverluste L)
  let maxRangeM = $derived(calculateRadarMaxRange(radarParams, rxSensitivityDbm));

  // Power at various ranges for display
  let powerAtRanges = $derived([
    { range: 1000, power: calculateRadarReceivedPowerDbm(radarParams, 1000), label: '1 km' },
    { range: 10000, power: calculateRadarReceivedPowerDbm(radarParams, 10000), label: '10 km' },
    { range: 50000, power: calculateRadarReceivedPowerDbm(radarParams, 50000), label: '50 km' },
    { range: 100000, power: calculateRadarReceivedPowerDbm(radarParams, 100000), label: '100 km' },
  ]);

  // Event handlers
  function handleFrequencyInput(e: Event) {
    inputFrequency = parseNumericInput(e, 0);
  }

  function handleFrequencyUnitChange(e: Event) {
    inputFrequencyUnit = parseSelectValue(e);
  }

  function handleTxPowerInput(e: Event) {
    txPowerWatts = parseNumericInput(e, 1);
  }

  function handleGainInput(e: Event) {
    antennaGainDbi = parseNumericInput(e, 0);
  }

  function handleRcsInput(e: Event) {
    rcsM2 = parseNumericInput(e, 0.01);
  }

  function handleSensitivityInput(e: Event) {
    rxSensitivityDbm = parseNumericInput(e, -100);
  }

  function handleSystemLossInput(e: Event) {
    systemLossDb = Math.max(0, parseNumericInput(e, 0));
  }

  function setPresetFrequency(hz: number) {
    inputFrequency = hz / 1e9;
    inputFrequencyUnit = 'GHz';
  }

  function setPresetRcs(value: number) {
    rcsM2 = value;
  }

  // Sync with external frequencyHz prop
  $effect(() => {
    if (frequencyHz !== null && frequencyHz !== undefined && frequencyHz > 0) {
      if (frequencyHz >= 1e9) {
        inputFrequency = frequencyHz / 1e9;
        inputFrequencyUnit = 'GHz';
      } else if (frequencyHz >= 1e6) {
        inputFrequency = frequencyHz / 1e6;
        inputFrequencyUnit = 'MHz';
      } else {
        inputFrequency = frequencyHz;
        inputFrequencyUnit = 'Hz';
      }
    }
  });
</script>

<div class="card">
  <h3 class="text-heading-3 mb-4">Radar-Reichweiten-Rechner</h3>

  <!-- Input Section -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
    <!-- Frequency Input -->
    <div class="space-y-2">
      <label for="radar-frequency-input" class="text-label">
        Frequenz
        <InfoTooltip
          title="Radarfrequenz"
          short="Betriebsfrequenz des Radarsystems"
          detailed="Höhere Frequenzen ermöglichen bessere Aufloesung, aber geringere Reichweite. X-Band (9.4 GHz) ist typisch für Marine-Radar."
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="radar-frequency-input"
          type="number"
          value={inputFrequency}
          oninput={handleFrequencyInput}
          class="input-field flex-1"
          step="any"
          min="0"
        />
        <select
          value={inputFrequencyUnit}
          onchange={handleFrequencyUnitChange}
          class="select-field"
          aria-label="Frequenzeinheit"
        >
          {#each FREQUENCY_UNITS as unit (unit.id)}
            <option value={unit.id}>{unit.symbol}</option>
          {/each}
        </select>
      </div>
      <div class="flex flex-wrap gap-1">
        {#each frequencyPresets.slice(0, 4) as preset (preset.hz)}
          <button
            type="button"
            onclick={() => setPresetFrequency(preset.hz)}
            class="btn-chip"
            title={preset.desc}
          >
            {preset.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- TX Power Input -->
    <div class="space-y-2">
      <label for="radar-tx-power" class="text-label">
        Sendeleistung (Pt)
        <InfoTooltip
          title="Sendeleistung"
          short="Spitzen-Sendeleistung des Radars"
          detailed="Typische Werte: Marineradar 10-100 kW, Wetterradar 250-1000 kW, Kfz-Radar 0.001-1 W"
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="radar-tx-power"
          type="number"
          value={txPowerWatts}
          oninput={handleTxPowerInput}
          class="input-field flex-1"
          step="any"
          min="0.001"
        />
        <span class="text-secondary text-sm w-8">W</span>
      </div>
      <div class="text-xs text-muted">
        = {formatNumber(txPowerDbm, 1)} dBm
      </div>
    </div>

    <!-- Antenna Gain Input -->
    <div class="space-y-2">
      <label for="radar-gain" class="text-label">
        Antennengewinn (G)
        <InfoTooltip
          title="Antennengewinn"
          short="Gewinn der Radarantenne in dBi"
          detailed="Parabol-Antennen: 30-50 dBi. Phased Arrays: 25-40 dBi. Kfz-Radar: 10-20 dBi."
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="radar-gain"
          type="number"
          value={antennaGainDbi}
          oninput={handleGainInput}
          class="input-field flex-1"
          step="0.1"
          min="0"
          max="60"
        />
        <span class="text-secondary text-sm w-8">dBi</span>
      </div>
      <div class="text-xs text-muted">
        Linear: {formatNumber(antennaGainLinear, 1)}x
      </div>
    </div>

    <!-- RCS Input -->
    <div class="space-y-2">
      <label for="radar-rcs" class="text-label">
        Radarquerschnitt (RCS/sigma)
        <InfoTooltip
          title="Radar Cross Section"
          short="Effektive Reflexionsflaeche des Ziels"
          detailed="Haengt von Größe, Form und Material des Ziels ab. Stealth-Flugzeuge haben sehr geringe RCS (0.001-0.1 m2)."
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="radar-rcs"
          type="number"
          value={rcsM2}
          oninput={handleRcsInput}
          class="input-field flex-1"
          step="any"
          min="0.0001"
        />
        <span class="text-secondary text-sm w-8">m2</span>
      </div>
      <div class="flex flex-wrap gap-1 mt-1">
        {#each quickRcsPresets as preset (preset.label)}
          <button
            type="button"
            onclick={() => setPresetRcs(preset.value)}
            class="btn-chip"
            title={preset.desc}
          >
            {preset.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- RX Sensitivity Input -->
    <div class="space-y-2">
      <label for="radar-sensitivity" class="text-label">
        Empfindlichkeit (min. Pr)
        <InfoTooltip
          title="Empfängerempfindlichkeit"
          short="Minimale detektierbare Signalleistung"
          detailed="Typische Werte: -90 bis -110 dBm. Bestimmt durch Rauschzahl und Bandbreite des Empfängers."
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="radar-sensitivity"
          type="number"
          value={rxSensitivityDbm}
          oninput={handleSensitivityInput}
          class="input-field flex-1"
          step="1"
          max="-30"
        />
        <span class="text-secondary text-sm w-12">dBm</span>
      </div>
    </div>

    <!-- System Loss Input -->
    <div class="space-y-2">
      <label for="radar-system-loss" class="text-label">
        Systemverluste (L)
        <InfoTooltip
          title="Systemverluste"
          short="Summe aller Verluste in Sender, Empfänger und Antennensystem"
          detailed="Wellenleiter-, Duplexer-, Signalverarbeitungs- und Strahlformverluste. Typisch 3–10 dB (Skolnik). L steht im Nenner der Radargleichung."
        />
      </label>
      <div class="flex items-center gap-2">
        <input
          id="radar-system-loss"
          type="number"
          value={systemLossDb}
          oninput={handleSystemLossInput}
          class="input-field flex-1"
          step="0.5"
          min="0"
          max="30"
        />
        <span class="text-secondary text-sm w-8">dB</span>
      </div>
    </div>

    <!-- Wavelength Display -->
    <div class="space-y-2">
      <div class="text-label">Wellenlänge</div>
      <div class="result-box-inline">
        <span class="text-lg font-bold text-green-600 dark:text-green-400">
          {wavelengthM > 0 ? formatNumber(wavelengthM * 1000, 2) : '—'} mm
        </span>
      </div>
    </div>
  </div>

  <!-- Results Section -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    <!-- Max Range Result -->
    <div class="result-box">
      <div class="result-label">
        Maximale Reichweite
        <InfoTooltip
          title="Maximale Radarreichweite"
          short="Maximale Entfernung zur Zieldetektion"
          detailed="Berechnet aus der Radargleichung bei minimaler Empfangsleistung."
        />
      </div>
      <div class="text-3xl font-bold text-blue-500 dark:text-blue-400">
        {maxRangeM > 0 ? formatDistance(maxRangeM) : '—'}
      </div>
      {#if maxRangeM > 0}
        <div class="text-sm text-muted mt-1">
          = {formatNumber(maxRangeM / getDistanceFactor('nmi'), 1)} nmi
        </div>
      {/if}
    </div>

    <!-- Power at Various Ranges -->
    <div class="result-box">
      <div class="result-label">Empfangsleistung bei Distanz</div>
      <div class="grid grid-cols-2 gap-2 mt-2">
        {#each powerAtRanges as item (item.range)}
          <div class="text-sm">
            <span class="text-muted">{item.label}:</span>
            <span class="font-medium {item.power >= rxSensitivityDbm ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}">
              {Number.isFinite(item.power) ? formatNumber(item.power, 1) + ' dBm' : '< -200 dBm'}
            </span>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Extended RCS Presets -->
  <div class="mb-6">
    <div class="text-label mb-2">RCS-Presets (Radarquerschnitt)</div>
    <div class="flex flex-wrap gap-2">
      {#each rcsPresets as preset (preset.label)}
        <button
          type="button"
          onclick={() => setPresetRcs(preset.value)}
          class="btn-chip {rcsM2 === preset.value ? 'btn-chip-active' : ''}"
          title="{preset.desc} ({preset.value} m2)"
        >
          {preset.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Formula Display -->
  <div class="formula-box">
    <div class="text-xs text-muted mb-2">Radargleichung:</div>
    <div class="font-mono text-sm text-primary text-center">
      P<sub>r</sub> = (P<sub>t</sub> * G<sup>2</sup> * lambda<sup>2</sup> * sigma) / ((4pi)<sup>3</sup> * R<sup>4</sup> * L)
    </div>
    <div class="text-xs text-muted mt-2 text-center">
      R<sub>max</sub> = ((P<sub>t</sub> * G<sup>2</sup> * lambda<sup>2</sup> * sigma) / ((4pi)<sup>3</sup> * P<sub>r,min</sub> * L))<sup>1/4</sup>
    </div>
  </div>

  <!-- Doppler / Puls-Parameter (Utilities in $lib/utils/radar.ts) -->
  <RadarPulseParameters frequencyHz={currentFrequencyHz} {wavelengthM} />

  <!-- Explanation -->
  <div class="mt-4 p-4 bg-surface-secondary rounded-lg text-sm text-secondary">
    <p class="mb-2">
      <strong>Hinweis:</strong> Die Radargleichung beschreibt die Beziehung zwischen Sendeleistung,
      Antennengewinn, Ziel-RCS und Reichweite. Die R<sup>4</sup>-Abhängigkeit bedeutet, dass eine
      Verdoppelung der Reichweite eine 16-fache Erhöhung der Sendeleistung erfordert.
    </p>
    <p>
      <strong>Anwendungsbeispiele:</strong> Flugsicherungsradar (L/S-Band, 200-400 km),
      Wetterradar (C-Band, 200 km), Marine-Radar (X-Band, 50-100 km),
      Kfz-Radar (77 GHz, 200 m).
    </p>
  </div>
</div>

<style>
  .btn-chip-active {
    background-color: #2563eb;
    color: white;
  }

  .result-box-inline {
    padding: 0.75rem;
    background-color: var(--color-bg-elevated);
    border-radius: var(--radius-lg);
  }
</style>
