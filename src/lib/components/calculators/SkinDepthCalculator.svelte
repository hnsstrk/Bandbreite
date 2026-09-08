<script lang="ts">
  /**
   * Skin-Tiefe (Eindringtiefe) elektromagnetischer Wellen in leitenden Medien.
   *
   * Materialdaten und Kennlinien liegen in `skinDepth.svelte.ts`, Ergebnisse in
   * `SkinDepthResults.svelte`, das Diagramm in `charts/SkinDepthChart.svelte`.
   */
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import { GOOD_CONDUCTOR_LOSS_TANGENT_MIN } from '$lib/data/constants';
  import { calculateSkinDepth, calculateSkinDepthWithValidity } from '$lib/utils/calculations';
  import { formatDistance, formatFrequency, formatNumber } from '$lib/utils/formatting';
  import {
    UrlStateSync,
    buildShareLink,
    defaultValues,
    hasNonDefaults,
    readParams
  } from '$lib/utils/urlState.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import FormulaBlock from '$lib/components/ui/FormulaBlock.svelte';
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import SkinDepthChart from '$lib/components/charts/SkinDepthChart.svelte';
  import CalculatorActions from './CalculatorActions.svelte';
  import SkinDepthResults from './SkinDepthResults.svelte';
  import {
    CONDUCTIVITY_MAX,
    CONDUCTIVITY_MIN,
    MEDIA,
    PRACTICAL_DEPTH_FACTOR,
    SEAWATER_EXAMPLES,
    SKIN_FREQUENCY_MAX_HZ,
    SKIN_FREQUENCY_MIN_HZ,
    SKIN_FREQUENCY_PRESETS,
    SKIN_PARAMS,
    mediumForConductivity
  } from './skinDepth.svelte';

  interface Props {
    /** Höhe des Diagramms in Pixeln */
    height?: number;
  }

  let { height = 400 }: Props = $props();

  const initial = browser
    ? readParams(page.url.searchParams, SKIN_PARAMS)
    : defaultValues(SKIN_PARAMS);

  let frequencyHz = $state(initial.f);
  let conductivity = $state(initial.sigma);
  let relativePermittivity = $state(initial.eps);

  const sync = new UrlStateSync(SKIN_PARAMS);

  let values = $derived({ f: frequencyHz, sigma: conductivity, eps: relativePermittivity });

  $effect(() => {
    sync.push(values);
    return () => sync.cancel();
  });

  let shareLink = $derived(buildShareLink(page.url.pathname, values, SKIN_PARAMS));
  let canReset = $derived(hasNonDefaults(values, SKIN_PARAMS));

  const MEDIUM_OPTIONS = [
    ...MEDIA.map((medium) => ({ value: medium.id, label: medium.label })),
    { value: 'custom', label: 'Eigener Wert' }
  ];

  let selectedMedium = $derived(mediumForConductivity(conductivity)?.id ?? 'custom');
  let isSeawater = $derived(selectedMedium === 'seawater');

  let skinDepthResult = $derived(
    calculateSkinDepthWithValidity(frequencyHz, conductivity, relativePermittivity)
  );
  let skinDepthM = $derived(skinDepthResult.depthM);

  function handleMediumChange(id: string) {
    const medium = MEDIA.find((entry) => entry.id === id);
    if (!medium) return;
    conductivity = medium.conductivity;
    relativePermittivity = medium.relativePermittivity;
  }

  /**
   * Die Beispielzahlen im Hinweistext werden gerechnet, nicht abgeschrieben —
   * so bleiben sie auch bei einer Korrektur der Materialdaten richtig.
   */
  const seawaterExamples = SEAWATER_EXAMPLES.map((example) => {
    const depth = calculateSkinDepth(example.frequencyHz, example.conductivity);
    return {
      ...example,
      depthText: formatDistance(depth),
      practicalText: formatDistance(depth * PRACTICAL_DEPTH_FACTOR)
    };
  });

  function handleReset() {
    frequencyHz = SKIN_PARAMS.f.default;
    conductivity = SKIN_PARAMS.sigma.default;
    relativePermittivity = SKIN_PARAMS.eps.default;
  }
</script>

<Card title="Skin-Tiefe" subtitle="Eindringtiefe in leitende Medien" icon="wave">
  {#snippet actions()}
    <CalculatorActions {shareLink} {canReset} onreset={handleReset} />
  {/snippet}

  <div class="skin">
    <div class="skin__inputs">
      <NumberInput
        label="Frequenz"
        bind:value={frequencyHz}
        units={[{ id: 'hz', symbol: 'Hz', factor: 1 }]}
        min={SKIN_FREQUENCY_MIN_HZ}
        max={SKIN_FREQUENCY_MAX_HZ}
        slider
        sliderScale="log"
        presets={SKIN_FREQUENCY_PRESETS}
        hint="1 Hz bis 1 GHz — U-Boot-Funk arbeitet im ELF- und VLF-Bereich"
      />

      <div class="skin__medium">
        <Select
          label="Medium"
          value={selectedMedium}
          options={MEDIUM_OPTIONS}
          onchange={handleMediumChange}
          hint="Setzt Leitfähigkeit und relative Permittivität"
        />

        <NumberInput
          label="Leitfähigkeit σ"
          bind:value={conductivity}
          units={[{ id: 'sm', symbol: 'S/m', factor: 1 }]}
          min={CONDUCTIVITY_MIN}
          max={CONDUCTIVITY_MAX}
          slider
          sliderScale="log"
          hint="Seewasser 4 S/m, feuchte Erde 0,1 S/m, Kupfer 5,96 · 10⁷ S/m"
        />
      </div>
    </div>

    <SkinDepthResults {frequencyHz} {skinDepthM} {isSeawater} />

    <FormulaBlock
      formula="δ = √( 2 / (ω · μ · σ) ) = √( 2 / (2π f · μ₀ · σ) )"
      alt="Delta gleich Wurzel aus 2 geteilt durch Omega mal My mal Sigma"
      label="Skin-Tiefe im guten Leiter"
      number="(1)"
      variables={[
        { symbol: 'δ', meaning: 'Skin-Tiefe', unit: 'm' },
        { symbol: 'f', meaning: 'Frequenz', unit: 'Hz' },
        { symbol: 'μ₀', meaning: 'Permeabilität des Vakuums (4π · 10⁻⁷)', unit: 'H/m' },
        { symbol: 'σ', meaning: 'Leitfähigkeit', unit: 'S/m' }
      ]}
    />

    {#if skinDepthM > 0 && !skinDepthResult.isGoodConductor}
      <Callout tone="warning" title="Näherung außerhalb ihres Gültigkeitsbereichs">
        Bei dieser Frequenz ist σ/(ωε) ≈ {formatNumber(skinDepthResult.lossTangent, 1)} und damit
        kleiner als {GOOD_CONDUCTOR_LOSS_TANGENT_MIN}. Die Guter-Leiter-Näherung δ = √(2/(ωμσ))
        setzt σ ≫ ωε voraus; das Medium verhält sich hier eher wie ein verlustbehaftetes
        Dielektrikum, und die tatsächliche Eindringtiefe strebt gegen einen frequenzunabhängigen
        Grenzwert.
      </Callout>
    {/if}

    <SkinDepthChart {frequencyHz} {skinDepthM} {height} />

    <Callout tone="info" title="U-Boot-Kommunikation">
      <p>
        Getauchte U-Boote empfangen nur bei sehr niedrigen Frequenzen. In Seewasser
        (σ = 4 S/m) ergeben sich diese Eindringtiefen:
      </p>
      <ul class="skin__examples">
        {#each seawaterExamples as example (example.frequencyHz)}
          <li>
            <strong>{formatFrequency(example.frequencyHz, 0)}</strong> ({example.label}):
            δ = {example.depthText}, praktisch nutzbar bis etwa {example.practicalText}
          </li>
        {/each}
      </ul>
      <p>
        Der Preis ist die Datenrate: im ELF-Bereich typisch unter 1 bit pro Minute, weshalb nur
        kurze Befehle übertragen werden.
      </p>
    </Callout>
  </div>
</Card>

<style>
  .skin {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .skin__inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
    gap: 1.25rem;
  }

  .skin__medium {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .skin__examples {
    margin: 0.5rem 0;
    padding-inline-start: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
</style>
