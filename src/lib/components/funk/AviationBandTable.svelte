<script lang="ts">
  /**
   * Frequenzbereiche des Flugfunks und der Flugnavigation, nach Aufgabe
   * filterbar. Die Daten stehen in `data/aviationBands.ts`.
   */
  import Panel from './Panel.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import { formatFrequencyRange } from '$lib/data/bands';
  import { formatFrequency } from '$lib/utils/formatting';
  import {
    AVIATION_BANDS,
    AVIATION_GROUP_LABELS,
    aviationBandsByGroup,
    type AviationBandGroup
  } from '$lib/data/aviationBands';

  let group = $state<AviationBandGroup | 'alle'>('alle');

  const options = [
    { value: 'alle', label: `Alle Aufgaben (${AVIATION_BANDS.length})` },
    ...(Object.keys(AVIATION_GROUP_LABELS) as AviationBandGroup[]).map((id) => ({
      value: id,
      label: `${AVIATION_GROUP_LABELS[id]} (${aviationBandsByGroup(id).length})`
    }))
  ];

  const rows = $derived(aviationBandsByGroup(group));

  function handleGroupChange(value: string) {
    group = value as AviationBandGroup | 'alle';
  }
</script>

<Panel title="Frequenzbereiche der Luftfahrt" subtitle="Sprechfunk, Navigation, Überwachung und Datenverbindungen">
  {#snippet actions()}
    <Badge tone="info">{rows.length} Bereiche</Badge>
  {/snippet}

  <div class="filter">
    <Select label="Aufgabe" value={group} {options} onchange={handleGroupChange} />
  </div>

  <div class="table-scroll">
    <table>
      <caption>
        Nennwerte nach ICAO Annex 10 und VO Funk Artikel 5. Ein Bereich kann mehreren Diensten zugewiesen sein.
      </caption>
      <thead>
        <tr>
          <th scope="col">System</th>
          <th scope="col">Frequenzbereich</th>
          <th scope="col">Raster</th>
          <th scope="col">Betriebsart</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as band (band.id)}
          <tr>
            <th scope="row">
              {band.nameDE}
              <span class="desc">{band.descriptionDE}</span>
            </th>
            <td class="freq">
              {band.minHz === band.maxHz
                ? formatFrequency(band.minHz, 0)
                : formatFrequencyRange(band.minHz, band.maxHz)}
            </td>
            <td class="freq">{band.rasterHz > 0 ? formatFrequency(band.rasterHz, 2) : '—'}</td>
            <td>{band.modeDE}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</Panel>

<style>
  .filter {
    max-width: 22rem;
    margin-bottom: 0.5rem;
  }

  .table-scroll {
    overflow-x: auto;
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
  }

  thead th {
    color: var(--color-ink);
    white-space: nowrap;
  }

  tbody th {
    color: var(--color-ink);
    font-weight: var(--font-weight-semibold);
    max-width: 22ch;
  }

  .freq {
    font-family: var(--font-mono);
    white-space: nowrap;
  }

  .desc {
    display: block;
    margin-top: 0.25rem;
    max-width: 40ch;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-normal);
    color: var(--color-ink-subtle);
  }
</style>
