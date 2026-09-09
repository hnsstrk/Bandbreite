<script lang="ts">
  /**
   * Formeldarstellung — ohne zusätzliche Abhängigkeit.
   *
   * Zwei Wege:
   *  - `math`: fertiges MathML als String (nativ in Chromium, Firefox und
   *    Safari; auswählbar, druckbar, vorlesbar).
   *  - `formula`: Unicode-Klartext (λ = c / f) als einfache Alternative.
   *
   * `math` wird per `{@html}` eingefügt und darf deshalb ausschließlich
   * aus dem Projektcode stammen, niemals aus Benutzereingaben.
   * `alt` ist die gesprochene Fassung und bei `math` verpflichtend.
   */
  interface Variable {
    symbol: string;
    meaning: string;
    unit?: string;
  }

  interface Props {
    /** MathML-Markup, z. B. `<math display="block">…</math>` */
    math?: string;
    /** Klartextformel in Unicode, z. B. „λ = c / f" */
    formula?: string;
    /** Gesprochene Fassung für Screenreader */
    alt?: string;
    /** Bildunterschrift, z. B. „Freiraumdämpfung nach Friis" */
    label?: string;
    /** Nummer zur Referenzierung, z. B. „(1)" */
    number?: string;
    /** Legende der verwendeten Formelzeichen */
    variables?: Variable[];
    class?: string;
  }

  let { math, formula, alt, label, number, variables = [], class: klass = '' }: Props = $props();

  const captionId = $props.id();
  const spoken = $derived(alt ?? formula ?? label ?? '');
</script>

<figure class="ui-formula {klass}" aria-labelledby={label ? captionId : undefined}>
  <div class="ui-formula__body">
    <div class="ui-formula__math" role="math" aria-label={spoken || undefined}>
      {#if math}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html math}
      {:else if formula}
        <span class="ui-formula__text" aria-hidden={spoken ? 'true' : undefined}>{formula}</span>
      {/if}
    </div>
    {#if number}
      <span class="ui-formula__number" aria-hidden="true">{number}</span>
    {/if}
  </div>

  {#if variables.length > 0}
    <dl class="ui-formula__legend">
      {#each variables as variable (variable.symbol)}
        <div class="ui-formula__legend-row">
          <dt>{variable.symbol}</dt>
          <dd>
            {variable.meaning}{#if variable.unit}<span class="ui-formula__unit">in {variable.unit}</span>{/if}
          </dd>
        </div>
      {/each}
    </dl>
  {/if}

  {#if label}
    <figcaption class="ui-formula__caption" id={captionId}>{label}</figcaption>
  {/if}
</figure>

<style>
  .ui-formula {
    margin: 0.75rem 0;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-control);
    background-color: transparent;
  }

  .ui-formula__body {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .ui-formula__math {
    flex: 1 1 auto;
    min-width: 0;
    overflow-x: auto;
    text-align: left;
    font-size: var(--font-size-base);
    color: var(--color-ink);
  }

  .ui-formula__math :global(math) {
    font-size: 1.15em;
  }

  .ui-formula__text {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: var(--font-size-base);
    white-space: nowrap;
  }

  .ui-formula__number {
    flex: none;
    font-size: var(--font-size-sm);
    color: var(--color-ink-faint);
    font-variant-numeric: tabular-nums;
  }

  .ui-formula__legend {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    margin: 0.5rem 0 0;
    padding-top: 0.375rem;
    border-top: 1px solid var(--color-line-subtle);
    font-size: var(--font-size-sm);
  }

  .ui-formula__legend-row {
    display: flex;
    gap: 0.625rem;
    align-items: baseline;
  }

  .ui-formula__legend-row dt {
    flex: none;
    min-width: 2.5rem;
    font-family: var(--font-mono);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .ui-formula__legend-row dd {
    margin: 0;
    color: var(--color-ink-muted);
  }

  .ui-formula__unit {
    margin-left: 0.35rem;
    color: var(--color-ink-subtle);
  }

  .ui-formula__caption {
    margin-top: 0.375rem;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
    text-align: left;
  }
</style>
