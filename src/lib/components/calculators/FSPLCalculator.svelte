<script lang="ts">
  /**
   * Rechner für die Freiraumdämpfung (Free Space Path Loss).
   *
   * Eingaben laufen über `NumberInput` (Zahlenfeld, Einheit, logarithmischer
   * Regler und Presets), Ergebnisse über `ResultCard`. Der Zustand steht in
   * der Adresszeile (`?f=…&d=…`) und ist damit teilbar.
   */
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import { calculateFSPL, frequencyToWavelength } from '$lib/utils/calculations';
  import { formatDistance, formatFrequency, formatWavelength } from '$lib/utils/formatting';
  import {
    UrlStateSync,
    buildShareLink,
    defaultValues,
    hasNonDefaults,
    readParams,
    syncParamsOnNavigate
  } from '$lib/utils/urlState.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import FormulaBlock from '$lib/components/ui/FormulaBlock.svelte';
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import FSPLChart from '$lib/components/charts/FSPLChart.svelte';
  import CalculatorActions from './CalculatorActions.svelte';
  import {
    DISTANCE_MAX_M,
    DISTANCE_MIN_M,
    DISTANCE_PRESETS,
    DISTANCE_UNIT_OPTIONS,
    FREQUENCY_MAX_HZ,
    FREQUENCY_MIN_HZ,
    FREQUENCY_PRESETS,
    FREQUENCY_UNIT_OPTIONS,
    FSPL_PARAMS,
    pickDistanceUnit,
    pickFrequencyUnit
  } from './fspl.svelte';

  interface Props {
    /** Höhe des Diagramms in Pixeln */
    height?: number;
  }

  let { height = 450 }: Props = $props();

  /**
   * Beim Prerendern gibt es keine Suchparameter — der Zugriff darauf würde
   * dort einen Fehler auslösen, deshalb der browser-Guard.
   */
  const initial = browser
    ? readParams(page.url.searchParams, FSPL_PARAMS)
    : defaultValues(FSPL_PARAMS);

  let currentFrequencyHz = $state(initial.f);
  let currentDistanceM = $state(initial.d);
  let showMultipleFrequencies = $state(initial.multi);
  let frequencyUnit = $state(pickFrequencyUnit(initial.f));
  let distanceUnit = $state(pickDistanceUnit(initial.d));

  const sync = new UrlStateSync(FSPL_PARAMS);

  // Gleiche Route, andere Parameter (Palette, interne Links, Vor/Zurück):
  // Zustand nachziehen, damit Adresszeile und Felder übereinstimmen.
  syncParamsOnNavigate(FSPL_PARAMS, sync, (next) => {
    currentFrequencyHz = next.f;
    currentDistanceM = next.d;
    showMultipleFrequencies = next.multi;
    frequencyUnit = pickFrequencyUnit(next.f);
    distanceUnit = pickDistanceUnit(next.d);
  });

  let values = $derived({
    f: currentFrequencyHz,
    d: currentDistanceM,
    multi: showMultipleFrequencies
  });

  $effect(() => {
    sync.push(values);
    return () => sync.cancel();
  });

  let shareLink = $derived(buildShareLink(page.url.pathname, values, FSPL_PARAMS));
  let canReset = $derived(hasNonDefaults(values, FSPL_PARAMS));

  let fsplDb = $derived(
    currentFrequencyHz > 0 && currentDistanceM > 0
      ? calculateFSPL(currentDistanceM, currentFrequencyHz)
      : null
  );

  let wavelengthM = $derived(
    currentFrequencyHz > 0 ? frequencyToWavelength(currentFrequencyHz) : null
  );

  let resultHint = $derived(
    `bei ${formatFrequency(currentFrequencyHz)} über ${formatDistance(currentDistanceM)}`
  );

  function handleFrequencyChange(value: number) {
    frequencyUnit = pickFrequencyUnit(value);
  }

  function handleDistanceChange(value: number) {
    distanceUnit = pickDistanceUnit(value);
  }

  function handleComparisonClick() {
    showMultipleFrequencies = !showMultipleFrequencies;
  }

  function handleReset() {
    currentFrequencyHz = FSPL_PARAMS.f.default;
    currentDistanceM = FSPL_PARAMS.d.default;
    showMultipleFrequencies = FSPL_PARAMS.multi.default;
    frequencyUnit = pickFrequencyUnit(FSPL_PARAMS.f.default);
    distanceUnit = pickDistanceUnit(FSPL_PARAMS.d.default);
  }
</script>

<Card title="Freiraumdämpfung" subtitle="Friis-Gleichung für die freie Strecke" icon="wave">
  {#snippet actions()}
    <CalculatorActions {shareLink} {canReset} onreset={handleReset} />
  {/snippet}

  <div class="fspl">
    <div class="fspl__inputs">
      <NumberInput
        label="Frequenz"
        bind:value={currentFrequencyHz}
        bind:unit={frequencyUnit}
        units={FREQUENCY_UNIT_OPTIONS}
        min={FREQUENCY_MIN_HZ}
        max={FREQUENCY_MAX_HZ}
        slider
        sliderScale="log"
        presets={FREQUENCY_PRESETS}
        hint="1 kHz bis 300 GHz"
        onchange={handleFrequencyChange}
      />

      <NumberInput
        label="Distanz"
        bind:value={currentDistanceM}
        bind:unit={distanceUnit}
        units={DISTANCE_UNIT_OPTIONS}
        min={DISTANCE_MIN_M}
        max={DISTANCE_MAX_M}
        slider
        sliderScale="log"
        presets={DISTANCE_PRESETS}
        hint="1 m bis 1000 km"
        onchange={handleDistanceChange}
      />
    </div>

    <div class="fspl__results">
      <ResultCard
        label="Freiraumdämpfung"
        value={fsplDb !== null ? fsplDb.toFixed(2) : '—'}
        unit="dB"
        secondary={resultHint}
        emphasis="hero"
      />
      <ResultCard
        label="Wellenlänge"
        value={wavelengthM !== null ? formatWavelength(wavelengthM) : '—'}
        hint="λ = c / f"
      />
      <ResultCard
        label="Strecke"
        value={currentDistanceM > 0 ? formatDistance(currentDistanceM) : '—'}
        hint="Sichtverbindung ohne Hindernisse"
      />
    </div>

    <FormulaBlock
      formula="FSPL(dB) = 20 · log₁₀(d) + 20 · log₁₀(f) + 20 · log₁₀(4π/c) = 20 · log₁₀(d) + 20 · log₁₀(f) − 147,55"
      alt="FSPL in Dezibel gleich 20 mal Logarithmus zur Basis 10 von d plus 20 mal Logarithmus zur Basis 10 von f minus 147,55"
      label="Freiraumdämpfung nach Friis"
      number="(1)"
      variables={[
        { symbol: 'FSPL', meaning: 'Freiraumdämpfung', unit: 'dB' },
        { symbol: 'd', meaning: 'Streckenlänge', unit: 'm' },
        { symbol: 'f', meaning: 'Frequenz', unit: 'Hz' },
        { symbol: 'c', meaning: 'Lichtgeschwindigkeit', unit: 'm/s' }
      ]}
    />

    <Callout tone="info" title="Was die Zahl bedeutet" source="ITU-R P.525-4">
      Die Freiraumdämpfung wächst mit dem Quadrat von Distanz und Frequenz: doppelte Strecke
      oder doppelte Frequenz kosten jeweils 6 dB. Hindernisse, Reflexionen und Atmosphäre sind
      darin nicht enthalten.
    </Callout>

    <div class="fspl__chart-head">
      <h3 class="fspl__chart-title">FSPL über der Distanz</h3>
      <Button
        size="sm"
        variant="ghost"
        pressed={showMultipleFrequencies}
        onclick={handleComparisonClick}
      >
        Vergleichskurven
      </Button>
    </div>

    <FSPLChart
      {height}
      frequencyHz={currentFrequencyHz}
      distanceM={currentDistanceM}
      {fsplDb}
      {showMultipleFrequencies}
    />
  </div>
</Card>

<style>
  .fspl {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .fspl__inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
    gap: 1.25rem;
  }

  .fspl__results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
    gap: 0.75rem;
  }

  .fspl__chart-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .fspl__chart-title {
    margin: 0;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }
</style>
