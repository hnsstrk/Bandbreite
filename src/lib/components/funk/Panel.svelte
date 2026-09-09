<script lang="ts">
  /**
   * Flacher Abschnittsrahmen der Funk-Bausteine: Titel, Untertitel und
   * Aktionen in einer Kopfzeile mit Trennlinie — ohne Karte, ohne Innenabstand,
   * damit Tabellen die volle Breite nutzen.
   */
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    subtitle?: string;
    /** Rechts in der Kopfzeile, etwa eine Trefferzahl. */
    actions?: Snippet;
    /** Fußnote unter dem Inhalt. */
    footer?: Snippet;
    children: Snippet;
  }

  let { title, subtitle, actions, footer, children }: Props = $props();

  const panelId = $props.id();
</script>

<section class="panel" aria-labelledby={panelId}>
  <div class="panel__head">
    <h2 id={panelId} class="panel__title">{title}</h2>
    {#if subtitle}<p class="panel__sub">{subtitle}</p>{/if}
    {#if actions}<div class="panel__actions">{@render actions()}</div>{/if}
  </div>

  {@render children()}

  {#if footer}
    <p class="panel__foot">{@render footer()}</p>
  {/if}
</section>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .panel__head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.25rem 0.75rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid var(--color-line);
  }

  .panel__title {
    margin: 0;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .panel__sub {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }

  .panel__actions {
    margin-inline-start: auto;
  }

  .panel__foot {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }
</style>
