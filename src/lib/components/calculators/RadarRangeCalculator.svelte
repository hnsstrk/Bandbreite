<script lang="ts">
  /**
   * Radar-Reichweiten-Rechner nach der Radargleichung (Skolnik Gl. 1.7).
   *
   * Eingaben, Ergebnisse und Puls-/Dopplerparameter liegen in eigenen
   * Unterkomponenten; die Bereichs- und Preset-Definitionen in
   * `radarRange.svelte.ts`. Der Zustand steht in der Adresszeile.
   */
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import { frequencyToWavelength } from '$lib/utils/calculations';
  import { calculateRadarMaxRange, type RadarParameters } from '$lib/utils/radar';
  import {
    UrlStateSync,
    buildShareLink,
    defaultValues,
    hasNonDefaults,
    readParams,
    syncParamsOnNavigate
  } from '$lib/utils/urlState.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import FormulaBlock from '$lib/components/ui/FormulaBlock.svelte';
  import CalculatorActions from './CalculatorActions.svelte';
  import RadarPulseParameters from './RadarPulseParameters.svelte';
  import RadarRangeInputs from './RadarRangeInputs.svelte';
  import RadarRangeResults from './RadarRangeResults.svelte';
  import { RADAR_PARAMS, type PresetChip } from './radarRange.svelte';

  const initial = browser ? readParams(page.url.searchParams, RADAR_PARAMS) : defaultValues(RADAR_PARAMS);

  let frequencyHz = $state(initial.f);
  let frequencyUnit = $state('GHz');
  let txPowerW = $state(initial.pt);
  let antennaGainDbi = $state(initial.g);
  let rcsM2 = $state(initial.rcs);
  let rxSensitivityDbm = $state(initial.smin);
  let systemLossDb = $state(initial.l);
  let rcsPresetId = $state<string | null>(null);

  const sync = new UrlStateSync(RADAR_PARAMS);

  // Gleiche Route, andere Parameter: Zustand aus der URL nachziehen.
  syncParamsOnNavigate(RADAR_PARAMS, sync, (next) => {
    frequencyHz = next.f;
    txPowerW = next.pt;
    antennaGainDbi = next.g;
    rcsM2 = next.rcs;
    rxSensitivityDbm = next.smin;
    systemLossDb = next.l;
    rcsPresetId = null;
  });

  let values = $derived({
    f: frequencyHz,
    pt: txPowerW,
    g: antennaGainDbi,
    rcs: rcsM2,
    smin: rxSensitivityDbm,
    l: systemLossDb
  });

  $effect(() => {
    sync.push(values);
    return () => sync.cancel();
  });

  let shareLink = $derived(buildShareLink(page.url.pathname, values, RADAR_PARAMS));
  let canReset = $derived(hasNonDefaults(values, RADAR_PARAMS));

  let wavelengthM = $derived(frequencyHz > 0 ? frequencyToWavelength(frequencyHz) : 0);

  let radarParams = $derived<RadarParameters>({
    txPowerW,
    antennaGainDbi,
    wavelengthM,
    rcsM2,
    systemLossDb
  });

  let maxRangeM = $derived(calculateRadarMaxRange(radarParams, rxSensitivityDbm));

  function handleRcsPresetSelect(preset: PresetChip) {
    rcsPresetId = preset.id;
    rcsM2 = preset.value;
  }

  function handleReset() {
    frequencyHz = RADAR_PARAMS.f.default;
    txPowerW = RADAR_PARAMS.pt.default;
    antennaGainDbi = RADAR_PARAMS.g.default;
    rcsM2 = RADAR_PARAMS.rcs.default;
    rxSensitivityDbm = RADAR_PARAMS.smin.default;
    systemLossDb = RADAR_PARAMS.l.default;
    frequencyUnit = 'GHz';
    rcsPresetId = null;
  }
</script>

<Card title="Radar-Reichweite" subtitle="Radargleichung nach Skolnik" icon="radio">
  {#snippet actions()}
    <CalculatorActions {shareLink} {canReset} onreset={handleReset} />
  {/snippet}

  <div class="radar">
    <RadarRangeInputs
      bind:frequencyHz
      bind:frequencyUnit
      bind:txPowerW
      bind:antennaGainDbi
      bind:rcsM2
      bind:rxSensitivityDbm
      bind:systemLossDb
      {rcsPresetId}
      onrcspreset={handleRcsPresetSelect}
    />

    <RadarRangeResults {radarParams} {maxRangeM} {rxSensitivityDbm} {wavelengthM} />

    <FormulaBlock
      formula="Pᵣ = (Pₜ · G² · λ² · σ) / ((4π)³ · R⁴ · L)"
      alt="P r gleich P t mal G Quadrat mal Lambda Quadrat mal Sigma geteilt durch 4 Pi hoch 3 mal R hoch 4 mal L"
      label="Radargleichung"
      number="(1)"
      variables={[
        { symbol: 'Pᵣ', meaning: 'Empfangsleistung des Echos', unit: 'W' },
        { symbol: 'Pₜ', meaning: 'Sendeleistung', unit: 'W' },
        { symbol: 'G', meaning: 'Antennengewinn (linear)', unit: '—' },
        { symbol: 'λ', meaning: 'Wellenlänge', unit: 'm' },
        { symbol: 'σ', meaning: 'Radarquerschnitt', unit: 'm²' },
        { symbol: 'R', meaning: 'Zielentfernung', unit: 'm' },
        { symbol: 'L', meaning: 'Systemverluste (linear)', unit: '—' }
      ]}
    />

    <FormulaBlock
      formula="R_max = ⁴√( (Pₜ · G² · λ² · σ) / ((4π)³ · Pᵣ,min · L) )"
      alt="R max gleich die vierte Wurzel aus P t mal G Quadrat mal Lambda Quadrat mal Sigma geteilt durch 4 Pi hoch 3 mal P r min mal L"
      label="Maximale Reichweite"
      number="(2)"
    />

    <Callout tone="info" title="Warum die vierte Wurzel?">
      Die Echoleistung fällt mit R⁴, weil das Signal zweimal die volle Strecke zurücklegt. Deshalb erfordert eine
      Verdoppelung der Reichweite die sechzehnfache Sendeleistung — und ein 10 dB besserer Empfänger bringt nur den
      Faktor 1,78.
    </Callout>

    <RadarPulseParameters {frequencyHz} {wavelengthM} />

    <Callout tone="tip" title="Anwendungsbeispiele">
      Flugsicherung (L- und S-Band, 200–400 km), Wetterradar (C-Band, 200 km), Marineradar (X-Band, 50–100 km),
      Kfz-Radar (77 GHz, 200 m).
    </Callout>
  </div>
</Card>

<style>
  .radar {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
</style>
