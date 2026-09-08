<script lang="ts">
  /**
   * Bandplan-Visualisierer für den Amateurfunk.
   *
   * Jedes Band ist ein Balken, jedes Segment eine Betriebsartengruppe nach
   * dem IARU-Region-1-Bandplan. Der Klassenumschalter blendet die Bänder aus,
   * die einer Zeugnisklasse nicht offenstehen, und rechnet die Leistungsgrenze
   * um. Segmente sind Schaltflächen; die Auswahl erscheint in der Tafel unten.
   */
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import ModeLegend from './ModeLegend.svelte';
  import { formatFrequency, formatLocaleNumber, formatWavelength } from '$lib/utils/formatting';
  import { formatFrequencyRange } from '$lib/data/bands';
  import type { AmateurBand, LicenseClassDE } from '$lib/data/amateurBands';
  import {
    BAND_STATUS_LABELS,
    CLASS_LABELS,
    MODE_LABELS,
    bandWavelengthM,
    bandsForClass,
    openingHint,
    placeSegments,
    powerLimitFor,
    powerSubrangeTexts
  } from './amateurBandplan.svelte';

  /** Nachkommastellen der Leistungsanzeige (6,1 W ERP, 9,14 W ERP). */
  const POWER_DECIMALS = 2;

  let licenseClass = $state<LicenseClassDE | 'alle'>('alle');
  let selected = $state<{ bandId: string; index: number } | null>(null);

  const filterOptions: (LicenseClassDE | 'alle')[] = ['alle', 'A', 'E', 'N'];
  const bands = $derived(bandsForClass(licenseClass));
  const selectedBand = $derived(selected ? (bands.find((band) => band.id === selected!.bandId) ?? null) : null);
  const selectedSegment = $derived(selectedBand && selected ? (selectedBand.segments[selected.index] ?? null) : null);

  function label(option: LicenseClassDE | 'alle'): string {
    return option === 'alle' ? 'Alle Klassen' : CLASS_LABELS[option];
  }

  const activeClass = $derived<LicenseClassDE>(licenseClass === 'alle' ? 'A' : licenseClass);

  const selectedSubranges = $derived(selectedBand ? powerSubrangeTexts(selectedBand, activeClass) : []);

  function powerText(band: AmateurBand): string {
    const limit = powerLimitFor(band, activeClass);
    if (!limit) return '—';
    return `${formatLocaleNumber(limit.value, { maxFrac: POWER_DECIMALS })} ${limit.unit}`;
  }

  function select(bandId: string, index: number) {
    selected = selected && selected.bandId === bandId && selected.index === index ? null : { bandId, index };
  }
</script>

<Card title="Bandplan Region 1" subtitle="Bänder, Segmente und Leistungsgrenzen nach Zeugnisklasse">
  {#snippet actions()}
    <Badge tone="info">{bands.length} Bänder</Badge>
  {/snippet}

  <div class="toolbar" role="group" aria-label="Zeugnisklasse wählen">
    {#each filterOptions as option (option)}
      <Button
        size="sm"
        variant={licenseClass === option ? 'primary' : 'secondary'}
        pressed={licenseClass === option}
        onclick={() => (licenseClass = option)}
      >
        {label(option)}
      </Button>
    {/each}
  </div>

  <p class="note">
    {#if licenseClass === 'N'}
      Klasse N: Einstiegsklasse seit Juni 2024 — 10 W ERP auf 10 m, 6,1 W ERP (≙ 10 W EIRP) auf 2 m und 70 cm.
    {:else if licenseClass === 'E'}
      Klasse E: 100 W PEP auf 160 m, 80 m, 15 m und 10 m, 75 W PEP auf 2 m bis 23 cm, 5 W PEP ab 13 cm.
    {:else if licenseClass === 'A'}
      Klasse A: 750 W PEP bis 23 cm, 75 W PEP ab 13 cm, in einzelnen Bändern abweichend begrenzt.
    {:else}
      Alle Bänder mit der Leistungsgrenze der Klasse A. Zum Vergleich eine Klasse wählen.
    {/if}
  </p>

  <ModeLegend />

  <ul class="bands">
    {#each bands as band (band.id)}
      {@const placed = placeSegments(band)}
      <li class="band">
        <div class="band__head">
          <h4>{band.nameDE}</h4>
          <span class="band__range">{formatFrequencyRange(band.minHz, band.maxHz)}</span>
          <span class="band__meta">λ ≈ {formatWavelength(bandWavelengthM(band))}</span>
          <span class="band__meta">{powerText(band)}</span>
          {#if band.status !== 'primaer'}
            <Badge tone={band.status === 'duldung' ? 'warning' : 'neutral'}>
              {BAND_STATUS_LABELS[band.status]}
            </Badge>
          {/if}
        </div>

        <div class="band__track">
          {#each placed as entry, index (entry.segment.minHz)}
            <button
              type="button"
              class="seg seg--{entry.segment.mode}"
              class:seg--active={selected?.bandId === band.id && selected?.index === index}
              style="left: {entry.leftPercent}%; width: {entry.widthPercent}%"
              aria-pressed={selected?.bandId === band.id && selected?.index === index}
              onclick={() => select(band.id, index)}
            >
              <span class="sr-only">
                {band.nameDE}, {entry.modeLabel},
                {formatFrequencyRange(entry.segment.minHz, entry.segment.maxHz)}:
                {entry.segment.labelDE}
              </span>
            </button>
          {/each}
        </div>
      </li>
    {/each}
  </ul>

  <div class="detail" role="status">
    {#if selectedBand && selectedSegment}
      <p class="detail__title">
        {selectedBand.nameDE} · {MODE_LABELS[selectedSegment.mode]}
      </p>
      <p>
        {formatFrequencyRange(selectedSegment.minHz, selectedSegment.maxHz)} —
        {selectedSegment.labelDE}
      </p>
      <p class="detail__hint">{openingHint(selectedBand)}</p>
      {#if selectedBand.licenseNote}
        <p class="detail__hint">{selectedBand.licenseNote}</p>
      {/if}
      {#if selectedSubranges.length > 0}
        <ul class="detail__list">
          {#each selectedSubranges as text (text)}
            <li>{text}</li>
          {/each}
        </ul>
      {/if}
      <p class="detail__source">
        Bandmitte {formatFrequency((selectedBand.minHz + selectedBand.maxHz) / 2)} · Quelle: {selectedBand.sourceRef ??
          selectedBand.source}
      </p>
    {:else}
      <p class="detail__hint">Ein Segment auswählen, um Betriebsart, Grenzen und eine Ausbreitungsregel zu sehen.</p>
    {/if}
  </div>
</Card>

<style>
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .note {
    margin: 0 0 1rem;
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
  }

  .detail__list {
    margin: 0.25rem 0 0;
    padding-left: 1.1rem;
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
  }

  .bands {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .band__head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .band__head h4 {
    margin: 0;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
    min-width: 3.5rem;
  }

  .band__range {
    font-family: var(--font-mono);
    font-size: var(--font-size-xs);
    color: var(--color-ink-muted);
  }

  .band__meta {
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .band__track {
    position: relative;
    height: 1.5rem;
    background-color: var(--color-sunken);
    border: 1px solid var(--color-line-subtle);
    border-radius: 0.25rem;
  }

  .seg {
    position: absolute;
    top: 2px;
    bottom: 2px;
    padding: 0;
    border: none;
    border-radius: 2px;
    cursor: pointer;
    background-color: var(--color-series-8);
  }

  .seg--active {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 1px;
  }

  .seg--cw {
    background-color: var(--color-series-1);
  }
  .seg--digital-schmal {
    background-color: var(--color-series-2);
  }
  .seg--digital-breit {
    background-color: var(--color-series-5);
  }
  .seg--bake {
    background-color: var(--color-series-7);
  }
  .seg--ssb {
    background-color: var(--color-series-3);
  }
  .seg--allmode {
    background-color: var(--color-series-4);
  }
  .seg--fm {
    background-color: var(--color-series-6);
  }
  .seg--satellit {
    background-color: var(--color-series-9);
  }
  .seg--atv {
    background-color: var(--color-series-8);
  }

  .detail {
    margin-top: 1rem;
    padding-top: 0.875rem;
    border-top: 1px solid var(--color-line-subtle);
    min-height: 5rem;
  }

  .detail p {
    margin: 0 0 0.25rem;
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
  }

  .detail__title {
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .detail__hint,
  .detail__source {
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }
</style>
