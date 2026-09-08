<script lang="ts">
  /**
   * Hervorgehobener Hinweiskasten für Wissens- und Rechnerseiten.
   *
   * Töne: `info` (Standard), `warning`, `tip` und `formula`.
   * Optional aufklappbar; dann wird ein natives `<details>` verwendet,
   * das ohne JavaScript tastaturbedienbar ist.
   */
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  import type { IconName } from './icons';

  interface Props {
    tone?: 'info' | 'warning' | 'tip' | 'formula';
    /** Titelzeile des Kastens */
    title?: string;
    /** Quellenangabe, z. B. „ITU-R P.676-13" */
    source?: string;
    collapsible?: boolean;
    /** Anfangszustand bei `collapsible` */
    open?: boolean;
    children: Snippet;
    class?: string;
  }

  let {
    tone = 'info',
    title,
    source,
    collapsible = false,
    open = $bindable(true),
    children,
    class: klass = ''
  }: Props = $props();

  const ICON_BY_TONE: Record<NonNullable<Props['tone']>, IconName> = {
    info: 'info',
    warning: 'warning',
    tip: 'check',
    formula: 'calculator'
  };

  const LABEL_BY_TONE: Record<NonNullable<Props['tone']>, string> = {
    info: 'Hinweis',
    warning: 'Warnung',
    tip: 'Tipp',
    formula: 'Formel'
  };

  const icon = $derived(ICON_BY_TONE[tone]);
  const srLabel = $derived(LABEL_BY_TONE[tone]);
</script>

{#if collapsible}
  <details class="ui-callout ui-callout--{tone} {klass}" bind:open>
    <summary class="ui-callout__summary">
      <Icon name={icon} size={18} />
      <span class="sr-only">{srLabel}: </span>
      <span class="ui-callout__title">{title ?? srLabel}</span>
      <span class="ui-callout__marker" aria-hidden="true">
        <Icon name="chevron-down" size={16} />
      </span>
    </summary>
    <div class="ui-callout__body">
      {@render children()}
      {#if source}<p class="ui-callout__source">Quelle: {source}</p>{/if}
    </div>
  </details>
{:else}
  <aside class="ui-callout ui-callout--{tone} {klass}" aria-label={title ?? srLabel}>
    <div class="ui-callout__head">
      <Icon name={icon} size={18} />
      <span class="sr-only">{srLabel}: </span>
      {#if title}<span class="ui-callout__title">{title}</span>{/if}
    </div>
    <div class="ui-callout__body">
      {@render children()}
      {#if source}<p class="ui-callout__source">Quelle: {source}</p>{/if}
    </div>
  </aside>
{/if}

<style>
  .ui-callout {
    display: block;
    border: 1px solid var(--callout-line);
    border-left-width: 3px;
    border-radius: var(--radius-control);
    background-color: var(--callout-bg);
    color: var(--callout-ink);
    padding: 0.875rem 1rem;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
  }

  .ui-callout--info {
    --callout-bg: var(--color-info-soft);
    --callout-line: var(--color-info);
    --callout-ink: var(--color-info-ink);
  }

  .ui-callout--warning {
    --callout-bg: var(--color-warning-soft);
    --callout-line: var(--color-warning);
    --callout-ink: var(--color-warning-ink);
  }

  .ui-callout--tip {
    --callout-bg: var(--color-success-soft);
    --callout-line: var(--color-success);
    --callout-ink: var(--color-success-ink);
  }

  .ui-callout--formula {
    --callout-bg: var(--color-sunken);
    --callout-line: var(--color-line-strong);
    --callout-ink: var(--color-ink);
    font-family: var(--font-mono);
  }

  .ui-callout__head,
  .ui-callout__summary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: var(--font-weight-semibold);
  }

  .ui-callout__summary {
    cursor: pointer;
    list-style: none;
  }

  .ui-callout__summary::-webkit-details-marker {
    display: none;
  }

  .ui-callout__marker {
    margin-left: auto;
    display: inline-flex;
    transition: transform var(--transition-fast);
  }

  .ui-callout[open] .ui-callout__marker {
    transform: rotate(180deg);
  }

  .ui-callout__head:not(:empty) + .ui-callout__body,
  .ui-callout__summary + .ui-callout__body {
    margin-top: 0.5rem;
  }

  .ui-callout__body :global(p) {
    margin: 0 0 0.5rem;
  }

  .ui-callout__body :global(p:last-child) {
    margin-bottom: 0;
  }

  .ui-callout__body :global(a) {
    color: inherit;
    text-decoration: underline;
  }

  .ui-callout__source {
    margin-top: 0.5rem;
    font-size: var(--font-size-xs);
    opacity: 0.8;
  }
</style>
