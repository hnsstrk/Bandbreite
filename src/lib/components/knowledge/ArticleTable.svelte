<script lang="ts">
  /**
   * Datentabelle eines Wissen-Kapitels. Zellen dürfen Inline-HTML aus dem
   * Projektinhalt enthalten (sub/sup/strong). Scrollt bei Überbreite in sich selbst.
   */
  import type { TableBlock } from '$lib/content/types';

  interface Props {
    block: TableBlock;
  }

  let { block }: Props = $props();

  const isMono = (index: number) => block.monoColumns?.includes(index) ?? false;
</script>

<div class="table-scroll">
  <table class="article-table">
    {#if block.caption}
      <caption>{block.caption}</caption>
    {/if}
    <thead>
      <tr>
        {#each block.columns as column, i (i)}
          <th scope="col">{@html column}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each block.rows as row, r (r)}
        <tr>
          {#each row as cell, c (c)}
            {#if c === 0}
              <th scope="row">{@html cell}</th>
            {:else}
              <td class:mono={isMono(c)}>{@html cell}</td>
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .article-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-sm);
  }

  .article-table caption {
    caption-side: bottom;
    padding-top: 0.5rem;
    text-align: left;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .article-table th,
  .article-table td {
    text-align: left;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--color-line-subtle);
    vertical-align: top;
  }

  .article-table thead th {
    color: var(--color-ink);
    font-weight: var(--font-weight-semibold);
    border-bottom-color: var(--color-line);
    white-space: nowrap;
  }

  .article-table tbody th {
    font-weight: var(--font-weight-medium);
    color: var(--color-ink);
  }

  .article-table td {
    color: var(--color-ink-muted);
  }

  .mono {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
</style>
