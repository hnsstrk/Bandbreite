<script lang="ts">
  /**
   * Bandtabelle des Mobilfunks mit Filtern und Mini-Spektrumsbalken.
   *
   * Der Balken zeigt Uplink und Downlink innerhalb des vom Band belegten
   * Bereichs. Bei TDD fallen beide Richtungen zusammen; das macht den
   * Unterschied zwischen gepaartem und ungepaartem Spektrum sichtbar.
   */
  import Panel from './Panel.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import { MOBILE_BANDS } from '$lib/data/mobileNetworks';
  import { formatFrequency } from '$lib/utils/formatting';
  import { formatFrequencyRange } from '$lib/data/bands';
  import { bandSpan, bandwidthHz, barGeometry, filterBands, technologyOptions } from './mobileBands.svelte';

  let technology = $state('alle');
  let duplex = $state('alle');

  const technologyChoices = [
    { value: 'alle', label: 'Alle Technologien' },
    ...technologyOptions().map((tech) => ({ value: tech, label: tech }))
  ];

  const duplexChoices = [
    { value: 'alle', label: 'FDD und TDD' },
    { value: 'FDD', label: 'Nur FDD (gepaart)' },
    { value: 'TDD', label: 'Nur TDD (ungepaart)' }
  ];

  const bands = $derived(filterBands({ technology, duplex }));
</script>

<Panel title="Bänder in Deutschland und der EU" subtitle="3GPP-Bandnummern mit Uplink und Downlink">
  {#snippet actions()}
    <Badge tone="info">{bands.length} von {MOBILE_BANDS.length}</Badge>
  {/snippet}

  <div class="filters">
    <Select label="Technologie" bind:value={technology} options={technologyChoices} />
    <Select label="Duplexverfahren" bind:value={duplex} options={duplexChoices} />
  </div>

  <ul class="legend">
    <li><span class="chip chip--ul" aria-hidden="true"></span>Uplink (Endgerät sendet)</li>
    <li><span class="chip chip--dl" aria-hidden="true"></span>Downlink (Basisstation sendet)</li>
  </ul>

  <div class="table-scroll">
    <table>
      <caption>
        Frequenzbänder des öffentlichen Mobilfunks. Im Balken liegt der Uplink über dem Downlink; bei TDD nutzen beide
        Richtungen denselben Bereich.
      </caption>
      <thead>
        <tr>
          <th scope="col">Band</th>
          <th scope="col">Bezeichnung</th>
          <th scope="col">Uplink</th>
          <th scope="col">Downlink</th>
          <th scope="col">Duplex</th>
          <th scope="col">Breite je Richtung</th>
          <th scope="col">Lage im Band</th>
        </tr>
      </thead>
      <tbody>
        {#each bands as band (band.id)}
          {@const span = bandSpan(band)}
          {@const ul = barGeometry(band.uplinkMinHz, band.uplinkMaxHz, span)}
          {@const dl = barGeometry(band.downlinkMinHz, band.downlinkMaxHz, span)}
          <tr>
            <th scope="row">{band.band}</th>
            <td>
              {band.nameDE}
              <span class="tech">{band.technologiesDE.join(' · ')}</span>
            </td>
            <td>{formatFrequencyRange(band.uplinkMinHz, band.uplinkMaxHz)}</td>
            <td>{formatFrequencyRange(band.downlinkMinHz, band.downlinkMaxHz)}</td>
            <td>{band.duplex}</td>
            <td>{formatFrequency(bandwidthHz(band), 0)}</td>
            <td class="cell-bar">
              <span
                class="mini"
                role="img"
                aria-label="Uplink {formatFrequencyRange(
                  band.uplinkMinHz,
                  band.uplinkMaxHz
                )}, Downlink {formatFrequencyRange(band.downlinkMinHz, band.downlinkMaxHz)}"
              >
                <span class="mini__dl" style="left: {dl.leftPercent}%; width: {dl.widthPercent}%"></span>
                <span class="mini__ul" style="left: {ul.leftPercent}%; width: {ul.widthPercent}%"></span>
              </span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if bands.length === 0}
    <p class="empty">Keine Bänder passen zu dieser Kombination aus Technologie und Duplexverfahren.</p>
  {/if}
</Panel>

<style>
  .filters {
    display: grid;
    gap: 0.5rem 0.75rem;
    margin-bottom: 0.25rem;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem 1rem;
    list-style: none;
    margin: 0 0 0.75rem;
    padding: 0;
    font-size: var(--font-size-xs);
    color: var(--color-ink-muted);
  }

  .legend li {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .chip {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 2px;
  }

  .chip--ul {
    background-color: var(--color-series-1);
  }
  .chip--dl {
    background-color: var(--color-series-2);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-sm);
  }

  caption {
    text-align: left;
    padding-bottom: 0.5rem;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  th,
  td {
    padding: 0.25rem 0.75rem 0.25rem 0;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--color-line-subtle);
    color: var(--color-ink-muted);
    white-space: nowrap;
  }

  thead th {
    color: var(--color-ink);
  }

  tbody th {
    color: var(--color-ink);
    font-weight: var(--font-weight-semibold);
  }

  .tech {
    display: block;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .cell-bar {
    width: 10rem;
    min-width: 10rem;
  }

  .mini {
    position: relative;
    display: block;
    height: 0.875rem;
    background-color: var(--color-sunken);
    border-radius: 0.25rem;
  }

  .mini__ul,
  .mini__dl {
    position: absolute;
    top: 0;
    bottom: 0;
    border-radius: 2px;
  }

  .mini__ul {
    background-color: var(--color-series-1);
  }

  .mini__dl {
    background-color: var(--color-series-2);
  }

  .empty {
    margin: 0.5rem 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }

  @media (min-width: 48rem) {
    .filters {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
