<script lang="ts">
  /**
   * Kanalkapazität nach Shannon-Hartley: C = B · log₂(1 + SNR).
   *
   * Bereiche, Presets und die Kennlinie liegen in `channelCapacity.svelte.ts`,
   * Ergebnisse und Modulationstabelle in `ChannelCapacityResults.svelte`,
   * das Diagramm in `charts/ShannonLimitChart.svelte`.
   */
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import {
    calculateShannonCapacity,
    calculateSpectralEfficiency,
    snrDbToLinear
  } from '$lib/utils/calculations';
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
  import ShannonLimitChart from '$lib/components/charts/ShannonLimitChart.svelte';
  import CalculatorActions from './CalculatorActions.svelte';
  import ChannelCapacityResults from './ChannelCapacityResults.svelte';
  import {
    BANDWIDTH_MAX_HZ,
    BANDWIDTH_MIN_HZ,
    BANDWIDTH_PRESETS,
    BANDWIDTH_UNIT_OPTIONS,
    CAPACITY_PARAMS,
    SNR_MAX_DB,
    SNR_MIN_DB,
    achievableModulation
  } from './channelCapacity.svelte';

  interface Props {
    /** Höhe des Diagramms in Pixeln */
    height?: number;
  }

  let { height = 400 }: Props = $props();

  const initial = browser
    ? readParams(page.url.searchParams, CAPACITY_PARAMS)
    : defaultValues(CAPACITY_PARAMS);

  let bandwidthHz = $state(initial.b);
  let bandwidthUnit = $state('MHz');
  let snrDb = $state(initial.snr);

  const sync = new UrlStateSync(CAPACITY_PARAMS);

  let values = $derived({ b: bandwidthHz, snr: snrDb });

  $effect(() => {
    sync.push(values);
    return () => sync.cancel();
  });

  let shareLink = $derived(buildShareLink(page.url.pathname, values, CAPACITY_PARAMS));
  let canReset = $derived(hasNonDefaults(values, CAPACITY_PARAMS));

  let snrLinear = $derived(snrDbToLinear(snrDb));
  let capacityBps = $derived(calculateShannonCapacity(bandwidthHz, snrDb));
  let spectralEfficiency = $derived(calculateSpectralEfficiency(snrDb));
  let modulation = $derived(achievableModulation(snrDb));

  function handleReset() {
    bandwidthHz = CAPACITY_PARAMS.b.default;
    snrDb = CAPACITY_PARAMS.snr.default;
    bandwidthUnit = 'MHz';
  }
</script>

<Card title="Kanalkapazität" subtitle="Shannon-Hartley-Theorem" icon="signal">
  {#snippet actions()}
    <CalculatorActions {shareLink} {canReset} onreset={handleReset} />
  {/snippet}

  <div class="capacity">
    <div class="capacity__inputs">
      <NumberInput
        label="Bandbreite B"
        bind:value={bandwidthHz}
        bind:unit={bandwidthUnit}
        units={BANDWIDTH_UNIT_OPTIONS}
        min={BANDWIDTH_MIN_HZ}
        max={BANDWIDTH_MAX_HZ}
        slider
        sliderScale="log"
        presets={BANDWIDTH_PRESETS}
        hint="100 kHz bis 1 GHz"
      />

      <NumberInput
        label="Störabstand SNR"
        bind:value={snrDb}
        units={[{ id: 'db', symbol: 'dB', factor: 1 }]}
        min={SNR_MIN_DB}
        max={SNR_MAX_DB}
        step={0.5}
        slider
        hint="Verhältnis von Signal- zu Rauschleistung"
      />
    </div>

    <ChannelCapacityResults
      {bandwidthHz}
      {snrDb}
      {snrLinear}
      {capacityBps}
      {spectralEfficiency}
      {modulation}
    />

    <FormulaBlock
      formula="C = B · log₂(1 + SNR),  SNR = 10^(SNR_dB / 10)"
      alt="C gleich B mal Logarithmus zur Basis 2 von 1 plus SNR; SNR gleich 10 hoch SNR in Dezibel durch 10"
      label="Shannon-Hartley-Theorem"
      number="(1)"
      variables={[
        { symbol: 'C', meaning: 'Kanalkapazität', unit: 'bit/s' },
        { symbol: 'B', meaning: 'Bandbreite', unit: 'Hz' },
        { symbol: 'SNR', meaning: 'Störabstand (linear)', unit: '—' }
      ]}
    />

    <Callout tone="info" title="Theorie und Praxis" source="Shannon 1948">
      Die Shannon-Kapazität ist eine Obergrenze, keine Verheißung: Sie gilt für unbegrenzten
      Codierungsaufwand und beliebig lange Blöcke. Reale Systeme erreichen davon 60 bis 80 %.
      Jede zusätzliche 3 dB Störabstand bringen im hohen SNR-Bereich rund 1 bit/s/Hz.
    </Callout>

    <ShannonLimitChart {snrDb} {spectralEfficiency} {height} />
  </div>
</Card>

<style>
  .capacity {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .capacity__inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
    gap: 1.25rem;
  }
</style>
