<script lang="ts">
  /**
   * Abschnittsüberschrift mit erzwungener Hierarchie.
   *
   * `level` bestimmt das gerenderte Element (h2 oder h3) und beendet damit
   * die bisherigen Sprünge von h2 direkt auf h4. Die `id` dient als Anker
   * für das Inhaltsverzeichnis; `anchor` blendet einen Sprunglink ein.
   */
  import type { Snippet } from 'svelte';
  import { slugify } from '$lib/utils/slug';

  interface Props {
    title: string;
    /** 2 = Kapitel, 3 = Unterabschnitt */
    level?: 2 | 3;
    /** Anker-ID; ohne Angabe aus dem Titel abgeleitet */
    id?: string;
    /** Kleine Zeile über der Überschrift */
    eyebrow?: string;
    /** Erläuternder Satz unter der Überschrift */
    description?: string;
    /** Sprunglink „#" beim Überfahren einblenden */
    anchor?: boolean;
    actions?: Snippet;
    class?: string;
  }

  let { title, level = 2, id, eyebrow, description, anchor = true, actions, class: klass = '' }: Props = $props();

  const headingId = $derived(id ?? slugify(title));
</script>

<div class="ui-section-header ui-section-header--l{level} {klass}">
  <div class="ui-section-header__text">
    {#if eyebrow}
      <p class="ui-section-header__eyebrow">{eyebrow}</p>
    {/if}
    <svelte:element this={`h${level}`} id={headingId} class="ui-section-header__title">
      {title}
      {#if anchor}
        <a class="ui-section-header__anchor" href="#{headingId}" aria-label="Direktlink zum Abschnitt {title}">#</a>
      {/if}
    </svelte:element>
    {#if description}
      <p class="ui-section-header__description">{description}</p>
    {/if}
  </div>
  {#if actions}
    <div class="ui-section-header__actions">{@render actions()}</div>
  {/if}
</div>

<style>
  /* Nur Text. Ebene 2 bekommt eine dünne Unterlinie, mehr nicht. */
  .ui-section-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .ui-section-header--l2 {
    margin-top: 1.5rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid var(--color-line-subtle);
  }

  .ui-section-header--l3 {
    margin-top: 1rem;
  }

  .ui-section-header__text {
    min-width: 0;
  }

  .ui-section-header__eyebrow {
    margin: 0 0 0.125rem;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-normal);
    color: var(--color-ink-subtle);
  }

  .ui-section-header__title {
    margin: 0;
    color: var(--color-ink);
    line-height: var(--line-height-tight);
    scroll-margin-top: 3.5rem;
  }

  .ui-section-header--l2 .ui-section-header__title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
  }

  .ui-section-header--l3 .ui-section-header__title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
  }

  .ui-section-header__title:target {
    color: var(--color-brand);
  }

  .ui-section-header__anchor {
    display: inline-flex;
    margin-left: 0.4rem;
    color: var(--color-ink-faint);
    opacity: 0;
    transition: opacity var(--transition-fast);
    vertical-align: middle;
  }

  .ui-section-header__title:hover .ui-section-header__anchor,
  .ui-section-header__anchor:focus-visible {
    opacity: 1;
  }

  .ui-section-header__description {
    margin: 0.25rem 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
    max-width: none;
  }

  .ui-section-header__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: none;
  }
</style>
