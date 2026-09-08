<script lang="ts">
  /**
   * Ionosphärische Ausbreitung: Schichten, kritische Frequenz, MUF und LUF
   * sowie der Reflexionspfad der eingestellten Frequenz.
   *
   * Kennzahlen und Farben liegen in `ionosphericData.ts`, die Szene in
   * `IonosphericScene.svelte`. Props (`width`, `height`) sind unverändert.
   */
  import { IONOSPHERIC_LAYERS } from '$lib/data/constants';
  import { formatNumber } from '$lib/utils/formatting';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import ChartFrame from './ChartFrame.svelte';
  import IonosphericScene from './IonosphericScene.svelte';
  import {
    BAND_PRESETS,
    FREQUENCY_MAX_MHZ,
    FREQUENCY_MIN_MHZ,
    LAYER_COLORS,
    SOLAR_FLUX_MAX,
    SOLAR_FLUX_MIN,
    TIME_OPTIONS,
    criticalFrequency,
    lowestUsableFrequency,
    maximumUsableFrequency,
    reflectionFor,
    visibleLayers
  } from './ionosphericData';

  interface Props {
    width?: number;
    height?: number;
  }

  let { width = $bindable(900), height = 500 }: Props = $props();

  let frequencyMHz = $state(14);
  let solarFluxIndex = $state(100);
  let isNighttime = $state(false);

  let foF2MHz = $derived(criticalFrequency(solarFluxIndex, isNighttime));
  let mufMHz = $derived(maximumUsableFrequency(foF2MHz));
  let lufMHz = $derived(lowestUsableFrequency(mufMHz, isNighttime));
  let canPropagate = $derived(frequencyMHz >= lufMHz && frequencyMHz <= mufMHz);
  let belowLuf = $derived(frequencyMHz < lufMHz);
  let reflection = $derived(reflectionFor(frequencyMHz, foF2MHz));
  let layers = $derived(visibleLayers(isNighttime));

  function handleTimeChange(value: string) {
    isNighttime = value === 'night';
  }
</script>

<Card title="Ionosphärische Ausbreitung" subtitle="MUF, LUF und Sprungdistanz" icon="satellite">
  <div class="iono">
    <div class="iono__inputs">
      <NumberInput
        label="Frequenz"
        bind:value={frequencyMHz}
        units={[{ id: 'mhz', symbol: 'MHz', factor: 1 }]}
        min={FREQUENCY_MIN_MHZ}
        max={FREQUENCY_MAX_MHZ}
        step={0.1}
        slider
        presets={BAND_PRESETS}
        hint="Kurzwellenbereich 1 bis 30 MHz"
      />

      <NumberInput
        label="Solarer Fluss F10,7"
        bind:value={solarFluxIndex}
        units={[{ id: 'sfu', symbol: 'sfu', factor: 1 }]}
        min={SOLAR_FLUX_MIN}
        max={SOLAR_FLUX_MAX}
        step={1}
        slider
        hint="65 im Minimum, über 200 im Maximum des Sonnenzyklus"
      />

      <Select
        label="Tageszeit"
        value={isNighttime ? 'night' : 'day'}
        options={TIME_OPTIONS}
        onchange={handleTimeChange}
        hint={isNighttime
          ? 'D-Schicht verschwindet, foF2 sinkt deutlich'
          : 'Alle Schichten vorhanden, D-Schicht dämpft niedrige Frequenzen'}
      />
    </div>

    <div class="iono__results">
      <ResultCard
        label="Kritische Frequenz foF2"
        value={formatNumber(foF2MHz, 1)}
        unit="MHz"
        hint="senkrechter Einfall"
      />
      <ResultCard
        label="MUF (3000 km)"
        value={formatNumber(mufMHz, 1)}
        unit="MHz"
        hint="Sekantengesetz MUF = foF2 · sec φ"
      />
      <ResultCard
        label="LUF (Schätzung)"
        value={formatNumber(lufMHz, 1)}
        unit="MHz"
        hint="schematisch, abhängig von D-Schicht und Sendeleistung"
      />
      <ResultCard
        label="Ausbreitung"
        value={canPropagate ? 'möglich' : 'nicht möglich'}
        tone={canPropagate ? 'success' : 'danger'}
        hint={canPropagate
          ? 'Frequenz liegt zwischen LUF und MUF'
          : belowLuf
            ? 'unter der LUF — Absorption in der D-Schicht'
            : 'über der MUF — die Welle durchdringt die Ionosphäre'}
        copyable={false}
      />
    </div>

    <ChartFrame
      bind:width
      description="Seitenriss der Ionosphäre mit D-, E-, F1- und F2-Schicht sowie dem Reflexionspfad der eingestellten Frequenz"
      minWidth={560}
      footnote="Schematische Darstellung; foF2 aus dem solaren Fluss interpoliert"
    >
      {#snippet legend()}
        <ul class="iono__legend">
          {#each IONOSPHERIC_LAYERS as layer (layer.id)}
            {@const active = layers.includes(layer)}
            <li class="iono__legend-item" class:is-inactive={!active}>
              <span class="iono__swatch" style="background: {LAYER_COLORS[layer.id].stroke}" aria-hidden="true"></span>
              <span>{layer.name} ({layer.altitudeMinKm}–{layer.altitudeMaxKm} km)</span>
              {#if !active}<Badge tone="neutral">nachts inaktiv</Badge>{/if}
            </li>
          {/each}
        </ul>
      {/snippet}

      <IonosphericScene {isNighttime} {canPropagate} {belowLuf} {reflection} {width} {height} />

      {#snippet dataTable()}
        <table>
          <caption>Kennzahlen der Ionosphäre</caption>
          <tbody>
            <tr><th scope="row">Frequenz</th><td>{formatNumber(frequencyMHz, 1)} MHz</td></tr>
            <tr><th scope="row">Kritische Frequenz foF2</th><td>{formatNumber(foF2MHz, 1)} MHz</td></tr>
            <tr><th scope="row">MUF</th><td>{formatNumber(mufMHz, 1)} MHz</td></tr>
            <tr><th scope="row">LUF</th><td>{formatNumber(lufMHz, 1)} MHz</td></tr>
            <tr><th scope="row">Reflexionshöhe</th><td>{formatNumber(reflection.altitude, 0)} km</td></tr>
          </tbody>
        </table>
      {/snippet}
    </ChartFrame>

    <div class="iono__notes">
      <Callout tone="info" title="MUF — höchste nutzbare Frequenz">
        Die höchste Frequenz, die von der Ionosphäre noch zum Boden zurückgeworfen wird. Sie steigt mit der
        Sonnenaktivität und mit flacherem Einfallswinkel.
      </Callout>
      <Callout tone="info" title="LUF — niedrigste nutzbare Frequenz">
        Darunter absorbiert die D-Schicht das Signal, bevor es die reflektierenden Schichten erreicht. Nachts
        verschwindet die D-Schicht und die LUF sinkt.
      </Callout>
      <Callout tone="tip" title="Kritische Frequenz foF2">
        Die Frequenz, die bei senkrechtem Einfall gerade noch reflektiert wird. Bei schrägem Einfall gilt das
        Sekantengesetz MUF = foF2 · sec φ; über 3000 km liegt die MUF dadurch etwa dreimal höher.
      </Callout>
    </div>
  </div>
</Card>

<style>
  .iono {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .iono__inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    gap: 1.25rem;
  }

  .iono__results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
    gap: 0.75rem;
  }

  .iono__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .iono__legend-item {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .iono__legend-item.is-inactive {
    opacity: 0.5;
  }

  .iono__swatch {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 2px;
    display: inline-block;
    flex: none;
  }

  .iono__notes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
    gap: 0.75rem;
  }
</style>
