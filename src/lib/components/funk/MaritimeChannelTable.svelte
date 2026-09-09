<script lang="ts">
  /**
   * Kanaltabelle des UKW-Seefunks nach VO Funk Appendix 18.
   *
   * Reine Darstellung: Die Zeilen kommen gefiltert von außen, damit Filter und
   * Umrechner denselben Zustand teilen.
   */
  import Badge from '$lib/components/ui/Badge.svelte';
  import { formatFrequency } from '$lib/utils/formatting';
  import { MARITIME_USAGE_LABELS, type MaritimeChannel } from '$lib/data/maritimeChannels';

  interface Props {
    rows: MaritimeChannel[];
    /** Kanal, der hervorgehoben wird. */
    highlight?: string;
  }

  let { rows, highlight }: Props = $props();

  /** Kanäle mit Not- oder Sicherheitsaufgabe werden farblich hervorgehoben. */
  function tone(channel: MaritimeChannel): 'danger' | 'warning' | 'neutral' {
    if (channel.usage === 'not-sicherheit') return 'danger';
    if (channel.usage === 'dsc' || channel.usage === 'ais') return 'warning';
    return 'neutral';
  }
</script>

<div class="table-scroll">
  <table>
    <caption>
      Sendefrequenzen im UKW-Seefunkband. Bei Einfrequenzbetrieb senden Schiff und Küste auf derselben Frequenz; bei
      Zweifrequenzbetrieb liegt die Küstenfrequenz 4,6 MHz höher.
    </caption>
    <thead>
      <tr>
        <th scope="col">Kanal</th>
        <th scope="col">Schiff sendet</th>
        <th scope="col">Küste sendet</th>
        <th scope="col">Betrieb</th>
        <th scope="col">Nutzung</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row (row.channel)}
        <tr class:is-active={row.channel === highlight}>
          <th scope="row">
            <Badge tone={tone(row)}>{row.channel}</Badge>
          </th>
          <td class="freq">{formatFrequency(row.shipTxHz, 3)}</td>
          <td class="freq">
            {row.duplex ? formatFrequency(row.coastTxHz, 3) : '— (gleiche Frequenz)'}
          </td>
          <td>{row.duplex ? 'Zweifrequenz' : 'Einfrequenz'}</td>
          <td>
            {MARITIME_USAGE_LABELS[row.usage]}
            {#if row.maxPowerW}
              <span class="limit">höchstens {row.maxPowerW} W</span>
            {/if}
            <span class="note">{row.noteDE}</span>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

{#if rows.length === 0}
  <p class="empty">Kein Kanal passt zu dieser Auswahl.</p>
{/if}

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

  .is-active {
    background-color: var(--color-elevated);
  }

  .freq {
    color: var(--color-ink);
    font-family: var(--font-mono);
    white-space: nowrap;
  }

  .limit {
    display: block;
    font-size: var(--font-size-xs);
    color: var(--color-warning);
  }

  .note {
    display: block;
    margin-top: 0.25rem;
    max-width: 46ch;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .empty {
    margin: 0.5rem 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }
</style>
