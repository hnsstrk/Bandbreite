<script lang="ts">
  /**
   * Gegenüberstellung des analogen BOS-Funks und des TETRA-Digitalfunks.
   * Die Zeilen stehen in `BosTimelineModel.ts`.
   */
  import Card from '$lib/components/ui/Card.svelte';
  import { BOS_COMPARISON } from './BosTimelineModel';
</script>

<Card title="Analog und digital im Vergleich" subtitle="Was sich mit dem Digitalfunk geändert hat">
  <div class="table-scroll">
    <table>
      <caption>
        Nur öffentlich veröffentlichte Systemeigenschaften. Rufgruppenpläne, Schlüsselmaterial und Betriebsunterlagen
        der Behörden sind nicht öffentlich und stehen hier bewusst nicht.
      </caption>
      <thead>
        <tr>
          <th scope="col">Merkmal</th>
          <th scope="col">Analoger BOS-Funk</th>
          <th scope="col">BOS-Digitalfunk (TETRA)</th>
        </tr>
      </thead>
      <tbody>
        {#each BOS_COMPARISON as row (row.aspectDE)}
          <tr>
            <th scope="row">{row.aspectDE}</th>
            <td>{row.analogDE}</td>
            <td class="digital">{row.digitalDE}</td>
          </tr>
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

  thead th {
    color: var(--color-ink);
  }

  tbody th {
    color: var(--color-ink);
    white-space: nowrap;
  }

  .digital {
    color: var(--color-ink);
  }
</style>
