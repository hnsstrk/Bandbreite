<script lang="ts">
  /**
   * Antennengewinn-Rechner für Parabolspiegel: aus Durchmesser, Frequenz und
   * Flächenwirkungsgrad folgen Gewinn, Öffnungswinkel, Wirkfläche und
   * Fernfeldabstand. Die Umkehrung nennt den Durchmesser für einen
   * geforderten Gewinn.
   *
   * Bereiche, Presets und Zeichenmaße liegen in `antennaGain.svelte.ts`,
   * die Formeln in `$lib/utils/antennaMath`.
   */
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import Card from '$lib/components/ui/Card.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import FormulaBlock from '$lib/components/ui/FormulaBlock.svelte';
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import { formatDistance, formatFrequency, formatNumber } from '$lib/utils/formatting';
  import {
    dbiToDbd,
    effectiveApertureM2,
    farFieldDistanceM,
    parabolicBeamwidthDeg,
    parabolicDiameterM,
    parabolicGainDbi,
    wavelengthM
  } from '$lib/utils/antennaMath';
  import {
    UrlStateSync,
    buildShareLink,
    defaultValues,
    hasNonDefaults,
    readParams,
    syncParamsOnNavigate
  } from '$lib/utils/urlState.svelte';
  import AntennaGainDish from './AntennaGainDish.svelte';
  import AntennaGainResults from './AntennaGainResults.svelte';
  import CalculatorActions from './CalculatorActions.svelte';
  import PresetChips from './PresetChips.svelte';
  import {
    ANTENNA_GAIN_PARAMS,
    ANTENNA_PRESETS,
    DIAMETER_MAX_M,
    DIAMETER_MIN_M,
    DIAMETER_UNITS,
    EFFICIENCY_MAX,
    EFFICIENCY_MIN,
    GAIN_FREQUENCY_MAX_HZ,
    GAIN_FREQUENCY_MIN_HZ,
    GAIN_FREQUENCY_PRESETS,
    GAIN_FREQUENCY_UNITS,
    TARGET_GAIN_MAX_DBI,
    TARGET_GAIN_MIN_DBI,
    type AntennaPreset
  } from './antennaGain.svelte';

  const initial = browser ? readParams(page.url.searchParams, ANTENNA_GAIN_PARAMS) : defaultValues(ANTENNA_GAIN_PARAMS);

  let diameterM = $state(initial.d);
  let diameterUnit = $state('m');
  let frequencyHz = $state(initial.f);
  let frequencyUnit = $state('GHz');
  let efficiency = $state(initial.eta);
  let targetGainDbi = $state(initial.g);
  let chosenPresetId = $state<string | null>(null);

  const sync = new UrlStateSync(ANTENNA_GAIN_PARAMS);

  syncParamsOnNavigate(ANTENNA_GAIN_PARAMS, sync, (next) => {
    diameterM = next.d;
    frequencyHz = next.f;
    efficiency = next.eta;
    targetGainDbi = next.g;
  });

  let values = $derived({ d: diameterM, f: frequencyHz, eta: efficiency, g: targetGainDbi });

  $effect(() => {
    sync.push(values);
    return () => sync.cancel();
  });

  let shareLink = $derived(buildShareLink(page.url.pathname, values, ANTENNA_GAIN_PARAMS));
  let canReset = $derived(hasNonDefaults(values, ANTENNA_GAIN_PARAMS));

  let lambdaM = $derived(wavelengthM(frequencyHz));
  let gainDbi = $derived(parabolicGainDbi(diameterM, lambdaM, efficiency));
  let beamwidthDeg = $derived(parabolicBeamwidthDeg(diameterM, lambdaM));
  let apertureM2 = $derived(effectiveApertureM2(gainDbi, lambdaM));
  let farFieldM = $derived(farFieldDistanceM(diameterM, lambdaM));
  let requiredDiameterM = $derived(parabolicDiameterM(targetGainDbi, lambdaM, efficiency));

  function handleInputChange() {
    chosenPresetId = null;
  }

  function applyPreset(preset: AntennaPreset) {
    diameterM = preset.diameterM;
    frequencyHz = preset.frequencyHz;
    efficiency = preset.efficiency;
    chosenPresetId = preset.id;
  }

  function handleReset() {
    diameterM = ANTENNA_GAIN_PARAMS.d.default;
    frequencyHz = ANTENNA_GAIN_PARAMS.f.default;
    efficiency = ANTENNA_GAIN_PARAMS.eta.default;
    targetGainDbi = ANTENNA_GAIN_PARAMS.g.default;
    diameterUnit = 'm';
    frequencyUnit = 'GHz';
    chosenPresetId = null;
  }
</script>

<Card title="Parabolantenne" subtitle="Gewinn, Keulenbreite und Fernfeld" icon="antenna">
  {#snippet actions()}
    <CalculatorActions {shareLink} {canReset} onreset={handleReset} />
  {/snippet}

  <div class="gain">
    <PresetChips
      label="Beispielantennen übernehmen"
      presets={ANTENNA_PRESETS}
      value={diameterM}
      chosenId={chosenPresetId}
      onselect={(preset) => applyPreset(preset as AntennaPreset)}
    />

    <div class="gain__inputs">
      <NumberInput
        label="Spiegeldurchmesser D"
        bind:value={diameterM}
        bind:unit={diameterUnit}
        units={DIAMETER_UNITS}
        min={DIAMETER_MIN_M}
        max={DIAMETER_MAX_M}
        slider
        sliderScale="log"
        hint="5 cm bis 100 m"
        onchange={handleInputChange}
      />
      <NumberInput
        label="Frequenz f"
        bind:value={frequencyHz}
        bind:unit={frequencyUnit}
        units={GAIN_FREQUENCY_UNITS}
        min={GAIN_FREQUENCY_MIN_HZ}
        max={GAIN_FREQUENCY_MAX_HZ}
        slider
        sliderScale="log"
        presets={GAIN_FREQUENCY_PRESETS}
        hint="100 MHz bis 100 GHz"
        onchange={handleInputChange}
      />
      <Slider
        label="Flächenwirkungsgrad η"
        bind:value={efficiency}
        min={EFFICIENCY_MIN}
        max={EFFICIENCY_MAX}
        step={0.01}
        format={(value) => `${formatNumber(value * 100, 0)} %`}
        unitSymbol="Prozent"
        ticks={[
          { at: EFFICIENCY_MIN, label: '30 %' },
          { at: 0.55, label: '55 %' },
          { at: EFFICIENCY_MAX, label: '80 %' }
        ]}
        hint="Erregerabschattung, Randüberstrahlung und Oberflächenfehler kosten Fläche."
        onchange={handleInputChange}
      />
    </div>

    <AntennaGainResults {gainDbi} {beamwidthDeg} {apertureM2} {farFieldM} wavelengthM={lambdaM} {diameterM} />

    <FormulaBlock
      formula="G = η · (π · D / λ)²   ·   θ ≈ 70° · λ / D"
      alt="G gleich eta mal Klammer auf pi mal D geteilt durch Lambda Klammer zu hoch zwei; theta ungefähr 70 Grad mal Lambda geteilt durch D"
      label="Gewinn und Halbwertsbreite einer Kreisapertur"
      number="(1)"
      variables={[
        { symbol: 'G', meaning: 'Gewinn gegenüber dem Kugelstrahler', unit: '—' },
        { symbol: 'η', meaning: 'Flächenwirkungsgrad', unit: '—' },
        { symbol: 'D', meaning: 'Spiegeldurchmesser', unit: 'm' },
        { symbol: 'λ', meaning: 'Wellenlänge', unit: 'm' },
        { symbol: 'θ', meaning: 'Halbwertsöffnungswinkel', unit: 'Grad' }
      ]}
    />

    <AntennaGainDish {diameterM} {beamwidthDeg} {gainDbi} {farFieldM} />

    <section class="gain__reverse" aria-labelledby="gain-umkehrung">
      <h3 class="text-heading-3" id="gain-umkehrung">Umkehrung: Wie groß muss der Spiegel sein?</h3>
      <div class="gain__reverse-grid">
        <Slider
          label="Geforderter Gewinn"
          bind:value={targetGainDbi}
          min={TARGET_GAIN_MIN_DBI}
          max={TARGET_GAIN_MAX_DBI}
          step={0.5}
          format={(value) => `${formatNumber(value, 1)} dBi`}
          unitSymbol="dBi"
          hint="bei {formatFrequency(frequencyHz)} und η = {formatNumber(efficiency * 100, 0)} %"
        />
        <ResultCard
          label="Nötiger Durchmesser"
          value={requiredDiameterM > 0 ? formatDistance(requiredDiameterM, 2) : '—'}
          secondary="= {formatNumber(dbiToDbd(targetGainDbi), 1)} dBd"
          hint="D = (λ / π) · √(G / η)"
          tone={requiredDiameterM > DIAMETER_MAX_M ? 'warning' : 'neutral'}
        />
      </div>
    </section>

    <Callout tone="tip" title="Doppelter Durchmesser, vierfacher Gewinn" source="Balanis, Antenna Theory">
      Der Gewinn wächst mit der Fläche: doppelter Durchmesser bedeutet +6 dB, doppelte Frequenz ebenfalls +6 dB.
      Zugleich halbiert sich die Keulenbreite — große Spiegel müssen entsprechend genau ausgerichtet werden.
    </Callout>
  </div>
</Card>

<style>
  .gain {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .gain__inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
    gap: 1.25rem;
    align-items: end;
  }

  .gain__reverse {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .gain__reverse-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
    gap: 1rem;
    align-items: end;
  }
</style>
