<script lang="ts">
  /**
   * Fresnel-Zonen-Rechner: Radius der ersten Zone am Hindernis, 60-Prozent-Marke,
   * größter Radius in Streckenmitte und zweite Zone.
   *
   * Geometrie und Presets liegen in `fresnelZone.svelte.ts`, der Seitenriss in
   * `charts/FresnelZoneDiagram.svelte`.
   */
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import { FRESNEL_CLEARANCE_FRACTION, calculateFresnelRadius, frequencyToWavelength } from '$lib/utils/calculations';
  import { formatNumber, formatWavelength } from '$lib/utils/formatting';
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
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import FresnelZoneDiagram from '$lib/components/charts/FresnelZoneDiagram.svelte';
  import CalculatorActions from './CalculatorActions.svelte';
  import {
    DISTANCE_UNIT_OPTIONS,
    FREQUENCY_UNIT_OPTIONS,
    FRESNEL_DISTANCE_PRESETS,
    FRESNEL_FREQUENCY_MAX_HZ,
    FRESNEL_FREQUENCY_MIN_HZ,
    FRESNEL_FREQUENCY_PRESETS,
    FRESNEL_PARAMS,
    TOTAL_DISTANCE_MAX_M,
    TOTAL_DISTANCE_MIN_M,
    clampObstaclePosition
  } from './fresnelZone.svelte';

  interface Props {
    /** Höhe des Seitenrisses in Pixeln */
    height?: number;
  }

  let { height = 400 }: Props = $props();

  const initial = browser ? readParams(page.url.searchParams, FRESNEL_PARAMS) : defaultValues(FRESNEL_PARAMS);

  let frequencyHz = $state(initial.f);
  let frequencyUnit = $state('GHz');
  let totalDistanceM = $state(initial.d);
  let distanceUnit = $state('km');
  let obstacleRawM = $state(initial.o);

  /** Die Position bleibt immer im Inneren der Strecke, auch wenn diese schrumpft. */
  let obstaclePositionM = $derived(clampObstaclePosition(obstacleRawM, totalDistanceM));

  const sync = new UrlStateSync(FRESNEL_PARAMS);

  // Gleiche Route, andere Parameter: Zustand aus der URL nachziehen.
  syncParamsOnNavigate(FRESNEL_PARAMS, sync, (next) => {
    frequencyHz = next.f;
    totalDistanceM = next.d;
    obstacleRawM = next.o;
  });

  let values = $derived({ f: frequencyHz, d: totalDistanceM, o: obstaclePositionM });

  $effect(() => {
    sync.push(values);
    return () => sync.cancel();
  });

  let shareLink = $derived(buildShareLink(page.url.pathname, values, FRESNEL_PARAMS));
  let canReset = $derived(hasNonDefaults(values, FRESNEL_PARAMS));

  let wavelengthM = $derived(frequencyHz > 0 ? frequencyToWavelength(frequencyHz) : 0);

  let fresnelRadius1M = $derived(
    calculateFresnelRadius(wavelengthM, obstaclePositionM, totalDistanceM - obstaclePositionM, 1)
  );
  let fresnelRadius2M = $derived(
    calculateFresnelRadius(wavelengthM, obstaclePositionM, totalDistanceM - obstaclePositionM, 2)
  );
  let maxFresnelRadiusM = $derived(calculateFresnelRadius(wavelengthM, totalDistanceM / 2, totalDistanceM / 2, 1));
  let clearance60M = $derived(fresnelRadius1M * FRESNEL_CLEARANCE_FRACTION);

  function handleDistanceChange(value: number) {
    obstacleRawM = clampObstaclePosition(obstacleRawM, value);
  }

  function handleReset() {
    frequencyHz = FRESNEL_PARAMS.f.default;
    totalDistanceM = FRESNEL_PARAMS.d.default;
    obstacleRawM = FRESNEL_PARAMS.o.default;
    frequencyUnit = 'GHz';
    distanceUnit = 'km';
  }
</script>

<Card title="Fresnel-Zone" subtitle="Hindernisfreiheit einer Funkstrecke" icon="wave">
  {#snippet actions()}
    <CalculatorActions {shareLink} {canReset} onreset={handleReset} />
  {/snippet}

  <div class="fresnel">
    <div class="fresnel__inputs">
      <NumberInput
        label="Frequenz"
        bind:value={frequencyHz}
        bind:unit={frequencyUnit}
        units={FREQUENCY_UNIT_OPTIONS}
        min={FRESNEL_FREQUENCY_MIN_HZ}
        max={FRESNEL_FREQUENCY_MAX_HZ}
        slider
        sliderScale="log"
        presets={FRESNEL_FREQUENCY_PRESETS}
        hint="30 MHz bis 100 GHz"
      />

      <NumberInput
        label="Streckenlänge D"
        bind:value={totalDistanceM}
        bind:unit={distanceUnit}
        units={DISTANCE_UNIT_OPTIONS}
        min={TOTAL_DISTANCE_MIN_M}
        max={TOTAL_DISTANCE_MAX_M}
        slider
        sliderScale="log"
        presets={FRESNEL_DISTANCE_PRESETS}
        hint="Abstand zwischen Sender und Empfänger"
        onchange={handleDistanceChange}
      />

      <NumberInput
        label="Hindernis bei d₁"
        bind:value={obstacleRawM}
        units={DISTANCE_UNIT_OPTIONS}
        min={0}
        max={totalDistanceM}
        slider
        hint="Abstand des Hindernisses vom Sender"
      />
    </div>

    <div class="fresnel__results">
      <ResultCard
        label="1. Fresnel-Zone r₁"
        value={fresnelRadius1M > 0 ? formatNumber(fresnelRadius1M, 2) : '—'}
        unit="m"
        secondary="am Hindernis"
        emphasis="hero"
      />
      <ResultCard
        label="60 % Freiheit"
        value={clearance60M > 0 ? formatNumber(clearance60M, 2) : '—'}
        unit="m"
        hint="Mindestfreiheit nach ITU-R P.530"
        tone="success"
      />
      <ResultCard
        label="Größter Radius"
        value={maxFresnelRadiusM > 0 ? formatNumber(maxFresnelRadiusM, 2) : '—'}
        unit="m"
        hint="in Streckenmitte"
      />
      <ResultCard
        label="2. Fresnel-Zone r₂"
        value={fresnelRadius2M > 0 ? formatNumber(fresnelRadius2M, 2) : '—'}
        unit="m"
        hint="destruktive Interferenz"
      />
      <ResultCard label="Wellenlänge" value={wavelengthM > 0 ? formatWavelength(wavelengthM) : '—'} hint="λ = c / f" />
    </div>

    <FormulaBlock
      formula="rₙ = √( n · λ · d₁ · d₂ / D )"
      alt="r n gleich Wurzel aus n mal Lambda mal d 1 mal d 2 geteilt durch D"
      label="Radius der n-ten Fresnel-Zone"
      number="(1)"
      variables={[
        { symbol: 'rₙ', meaning: 'Radius der n-ten Zone', unit: 'm' },
        { symbol: 'n', meaning: 'Ordnung der Zone', unit: '—' },
        { symbol: 'λ', meaning: 'Wellenlänge', unit: 'm' },
        { symbol: 'd₁', meaning: 'Abstand Sender–Hindernis', unit: 'm' },
        { symbol: 'd₂', meaning: 'Abstand Hindernis–Empfänger', unit: 'm' },
        { symbol: 'D', meaning: 'Gesamtstrecke d₁ + d₂', unit: 'm' }
      ]}
    />

    <FresnelZoneDiagram
      {wavelengthM}
      {totalDistanceM}
      {obstaclePositionM}
      {fresnelRadius1M}
      {fresnelRadius2M}
      {maxFresnelRadiusM}
      {height}
    />

    <Callout tone="tip" title="Die 60-Prozent-Regel" source="ITU-R P.530-18">
      Bleiben mindestens 60 % der ersten Fresnel-Zone frei, entsteht praktisch kein Zusatzverlust gegenüber der
      Freiraumdämpfung. Als Faustformel für die Antennenhöhe gilt: 60 % des Fresnel-Radius plus Hindernishöhe plus
      Sicherheitsmarge.
    </Callout>
  </div>
</Card>

<style>
  .fresnel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .fresnel__inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
    gap: 1.25rem;
  }

  .fresnel__results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    gap: 0.75rem;
  }
</style>
