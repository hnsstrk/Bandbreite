<script lang="ts">
  /**
   * Not- und Sicherheitsfrequenzen des GMDSS auf Grenz- und Kurzwelle,
   * nach Band gruppiert. Daten aus `data/maritimeChannels.ts`.
   */
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { formatFrequency } from '$lib/utils/formatting';
  import { MARITIME_HF_FREQUENCIES, type MaritimeHfMode } from '$lib/data/maritimeChannels';

  /** Anzeigetexte der Betriebsarten. */
  const MODE_LABELS: Record<MaritimeHfMode, string> = {
    sprechfunk: 'Sprechfunk (Einseitenband)',
    dsc: 'Digitaler Selektivruf',
    nbdp: 'Funkfernschreiben',
    navtex: 'NAVTEX'
  };

  /** Farbliche Einordnung: die DSC-Frequenzen tragen die Alarmierung. */
  function tone(mode: MaritimeHfMode): 'danger' | 'warning' | 'neutral' {
    if (mode === 'dsc') return 'danger';
    if (mode === 'sprechfunk') return 'warning';
    return 'neutral';
  }

  /** Bänder in der Reihenfolge ihres ersten Eintrags. */
  const groups = MARITIME_HF_FREQUENCIES.reduce<{ bandDE: string; entries: typeof MARITIME_HF_FREQUENCIES }[]>(
    (acc, entry) => {
      const found = acc.find((group) => group.bandDE === entry.bandDE);
      if (found) found.entries.push(entry);
      else acc.push({ bandDE: entry.bandDE, entries: [entry] });
      return acc;
    },
    []
  );
</script>

<Card
  title="Not- und Sicherheitsfrequenzen unterhalb des UKW-Bandes"
  subtitle="Grenz- und Kurzwelle nach VO Funk Appendix 15"
>
  <div class="table-scroll">
    <table>
      <caption>
        Jedes Band trägt dieselbe Dreiteilung: eine Frequenz für die digitale Alarmierung, eine für den anschließenden
        Sprechverkehr und eine für das Funkfernschreiben.
      </caption>
      <thead>
        <tr>
          <th scope="col">Band</th>
          <th scope="col">Frequenz</th>
          <th scope="col">Betriebsart</th>
          <th scope="col">Aufgabe</th>
        </tr>
      </thead>
      <tbody>
        {#each groups as group (group.bandDE)}
          {#each group.entries as entry, index (entry.id)}
            <tr>
              {#if index === 0}
                <th scope="row" rowspan={group.entries.length}>{group.bandDE}</th>
              {/if}
              <td class="freq">{formatFrequency(entry.frequencyHz, entry.frequencyHz < 1e6 ? 1 : 3)}</td>
              <td><Badge tone={tone(entry.mode)}>{MODE_LABELS[entry.mode]}</Badge></td>
              <td>{entry.noteDE}</td>
            </tr>
          {/each}
        {/each}
      </tbody>
    </table>
  </div>
</Card>

<style>
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
    padding: 0.5rem 0.75rem 0.5rem 0;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--color-line-subtle);
    color: var(--color-ink-muted);
  }

  thead th,
  tbody th {
    color: var(--color-ink);
    white-space: nowrap;
  }

  .freq {
    font-family: var(--font-mono);
    white-space: nowrap;
    color: var(--color-ink);
  }
</style>
