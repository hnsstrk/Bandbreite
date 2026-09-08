<script lang="ts">
  /**
   * Merkregel-Tabelle des Pegelrechners: dB-Stufe, Leistungs- und
   * Spannungsfaktor. Die Zahlen werden gerechnet, nicht abgeschrieben.
   */
  import { formatNumberAuto } from '$lib/utils/formatting';
  import { buildDecibelTable } from '$lib/utils/decibel';

  interface Props {
    /** Aktuell gewähltes Verhältnis in dB — die passende Zeile wird markiert. */
    activeDb?: number;
  }

  let { activeDb }: Props = $props();

  const rows = buildDecibelTable();
</script>

<div class="table-scroll">
  <table class="memo">
    <caption>Merkregeln: dB, Leistungsfaktor und Spannungsfaktor</caption>
    <thead>
      <tr>
        <th scope="col">Pegel</th>
        <th scope="col">Leistung ×</th>
        <th scope="col">Spannung ×</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row (row.db)}
        <tr class:memo__row--active={activeDb === row.db}>
          <th scope="row">{row.db > 0 ? '+' : ''}{row.db} dB</th>
          <td>{formatNumberAuto(row.powerRatio)}</td>
          <td>{formatNumberAuto(row.voltageRatio)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .memo {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-sm);
  }

  .memo caption {
    text-align: left;
    padding-bottom: 0.5rem;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .memo th,
  .memo td {
    padding: 0.375rem 0.75rem;
    text-align: right;
    border-bottom: 1px solid var(--color-line-subtle);
    font-variant-numeric: tabular-nums;
  }

  .memo thead th {
    text-align: right;
    color: var(--color-ink-muted);
    font-weight: var(--font-weight-semibold);
  }

  .memo tbody th {
    text-align: left;
    font-family: var(--font-mono);
  }

  .memo__row--active {
    background-color: var(--color-brand-soft);
    color: var(--color-brand-ink);
  }
</style>
