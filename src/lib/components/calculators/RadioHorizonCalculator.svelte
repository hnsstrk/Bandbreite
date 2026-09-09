<script lang="ts">
  /**
   * Radiohorizont-Rechner: aus zwei Antennenhöhen und dem k-Faktor der
   * effektiven Erde folgen die beiden Horizontdistanzen und die
   * Gesamtsichtweite einer Sichtverbindung.
   *
   * Die Formeln stehen in `$lib/data/propagation`, Bereiche und Presets in
   * `radioHorizon.svelte.ts`.
   */
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import Callout from '$lib/components/ui/Callout.svelte';
  import FormulaBlock from '$lib/components/ui/FormulaBlock.svelte';
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import { formatNumber } from '$lib/utils/formatting';
  import { horizonDistanceKm, horizonFactor, losDistanceKm, K_FACTOR_MAX, K_FACTOR_MIN } from '$lib/data/propagation';
  import {
    UrlStateSync,
    buildShareLink,
    defaultValues,
    hasNonDefaults,
    readParams,
    syncParamsOnNavigate
  } from '$lib/utils/urlState.svelte';
  import CalculatorActions from './CalculatorActions.svelte';
  import PresetChips from './PresetChips.svelte';
  import RadioHorizonDiagram from './RadioHorizonDiagram.svelte';
  import RadioHorizonResults from './RadioHorizonResults.svelte';
  import {
    HEIGHT_MAX_M,
    HEIGHT_MIN_M,
    HEIGHT_PRESETS,
    HEIGHT_UNITS,
    K_FACTOR_TICKS,
    RADIO_HORIZON_PARAMS,
    refractionLabel
  } from './radioHorizon.svelte';
  import type { PresetChip } from './presetChips.svelte';

  const initial = browser
    ? readParams(page.url.searchParams, RADIO_HORIZON_PARAMS)
    : defaultValues(RADIO_HORIZON_PARAMS);

  let height1M = $state(initial.h1);
  let height2M = $state(initial.h2);
  let height1Unit = $state('m');
  let height2Unit = $state('m');
  let kFactor = $state(initial.k);
  let chosen1Id = $state<string | null>(null);
  let chosen2Id = $state<string | null>(null);

  const sync = new UrlStateSync(RADIO_HORIZON_PARAMS);

  syncParamsOnNavigate(RADIO_HORIZON_PARAMS, sync, (next) => {
    height1M = next.h1;
    height2M = next.h2;
    kFactor = next.k;
  });

  let values = $derived({ h1: height1M, h2: height2M, k: kFactor });

  $effect(() => {
    sync.push(values);
    return () => sync.cancel();
  });

  let shareLink = $derived(buildShareLink(page.url.pathname, values, RADIO_HORIZON_PARAMS));
  let canReset = $derived(hasNonDefaults(values, RADIO_HORIZON_PARAMS));

  let horizon1Km = $derived(horizonDistanceKm(height1M, kFactor));
  let horizon2Km = $derived(horizonDistanceKm(height2M, kFactor));
  let totalKm = $derived(losDistanceKm(height1M, height2M, kFactor));
  let geometricKm = $derived(losDistanceKm(height1M, height2M, K_FACTOR_MIN));
  let factor = $derived(horizonFactor(kFactor));

  function handleReset() {
    height1M = RADIO_HORIZON_PARAMS.h1.default;
    height2M = RADIO_HORIZON_PARAMS.h2.default;
    kFactor = RADIO_HORIZON_PARAMS.k.default;
    height1Unit = 'm';
    height2Unit = 'm';
    chosen1Id = null;
    chosen2Id = null;
  }

  function applyPreset1(preset: PresetChip) {
    height1M = preset.value;
    chosen1Id = preset.id;
  }

  function applyPreset2(preset: PresetChip) {
    height2M = preset.value;
    chosen2Id = preset.id;
  }
</script>

<div class="calc">
  <div class="calc__bar">
    <p class="calc__sub">Sichtweite über die gekrümmte Erde</p>
    <CalculatorActions {shareLink} {canReset} onreset={handleReset} />
  </div>
  <div class="horizon">
    <div class="horizon__inputs">
      <div class="horizon__field">
        <NumberInput
          label="Antennenhöhe h₁"
          bind:value={height1M}
          bind:unit={height1Unit}
          units={HEIGHT_UNITS}
          min={HEIGHT_MIN_M}
          max={HEIGHT_MAX_M}
          slider
          sliderScale="log"
          hint="1 m bis 12 km über Grund"
          onchange={() => (chosen1Id = null)}
        />
        <PresetChips
          label="Typische Höhen für Antenne 1"
          presets={HEIGHT_PRESETS}
          value={height1M}
          chosenId={chosen1Id}
          onselect={applyPreset1}
        />
      </div>

      <div class="horizon__field">
        <NumberInput
          label="Antennenhöhe h₂"
          bind:value={height2M}
          bind:unit={height2Unit}
          units={HEIGHT_UNITS}
          min={HEIGHT_MIN_M}
          max={HEIGHT_MAX_M}
          slider
          sliderScale="log"
          hint="Gegenstelle; 0 wäre die Erdoberfläche selbst"
          onchange={() => (chosen2Id = null)}
        />
        <PresetChips
          label="Typische Höhen für Antenne 2"
          presets={HEIGHT_PRESETS}
          value={height2M}
          chosenId={chosen2Id}
          onselect={applyPreset2}
        />
      </div>

      <Slider
        label="k-Faktor der effektiven Erde"
        bind:value={kFactor}
        min={K_FACTOR_MIN}
        max={K_FACTOR_MAX}
        step={0.01}
        format={(value) => formatNumber(value, 2)}
        unitSymbol="k"
        ticks={K_FACTOR_TICKS}
        hint={refractionLabel(kFactor)}
      />
    </div>

    <RadioHorizonResults
      {horizon1Km}
      {horizon2Km}
      {totalKm}
      {geometricKm}
      {factor}
      refractionNote={refractionLabel(kFactor)}
    />

    <FormulaBlock
      formula="d = √(2 · k · R · h)   →   d[km] ≈ 4,12 · √(h[m])   für k = 4/3"
      alt="d gleich Wurzel aus zwei mal k mal R mal h; in Kilometern etwa 4 Komma 12 mal Wurzel aus h in Metern für k gleich vier Drittel"
      label="Horizontdistanz einer Antenne"
      number="(1)"
      variables={[
        { symbol: 'd', meaning: 'Distanz zum Horizont', unit: 'km' },
        { symbol: 'k', meaning: 'Faktor der effektiven Erde', unit: '—' },
        { symbol: 'R', meaning: 'mittlerer Erdradius 6371 km', unit: 'km' },
        { symbol: 'h', meaning: 'Antennenhöhe über Grund', unit: 'm' }
      ]}
    />

    <RadioHorizonDiagram {height1M} {height2M} {horizon1Km} {horizon2Km} {kFactor} />

    <Callout tone="tip" title="Warum 4/3 und nicht 1?" source="ITU-R P.834-9">
      Die Luftdichte nimmt mit der Höhe ab, dadurch krümmt sich der Strahl leicht zur Erde hin. Rechnet man statt mit
      dem echten Erdradius mit dem k-fachen davon, bleibt der Strahl in der Skizze gerade. In der Standardatmosphäre
      gilt k = 4/3, der Radiohorizont liegt damit rund 15 % weiter als der optische. Bei Inversionswetterlagen wächst k,
      bis der Strahl im Extremfall in einem Duct geführt wird — dann sind Reichweiten weit jenseits dieser Formel
      möglich.
    </Callout>
  </div>
</div>

<style>
  .horizon {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .horizon__inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
    gap: 0.75rem;
    align-items: start;
  }

  .horizon__field {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    min-width: 0;
  }

  .calc {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .calc__bar {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.25rem 0.75rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid var(--color-line);
  }

  .calc__sub {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }
</style>
