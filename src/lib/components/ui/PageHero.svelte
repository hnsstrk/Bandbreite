<script lang="ts">
  /**
   * Seitenkopf mit Titel, Einleitung und optionalen Aktionen.
   *
   * Enthält bewusst KEIN Breadcrumb — die Brotkrumennavigation liegt
   * im Layout und wird oberhalb des Heros gerendert.
   */
  import type { Snippet } from 'svelte';
  import Badge from './Badge.svelte';
  import Icon from './Icon.svelte';
  import type { IconName } from './icons';

  interface Props {
    title: string;
    /** Einleitungssatz unter dem Titel */
    lead?: string;
    /** Kleine Zeile über dem Titel, z. B. „Rechner" */
    kicker?: string;
    /** Etikett rechts neben dem Titel, z. B. „Neu" */
    badge?: string;
    badgeTone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
    icon?: IconName;
    /** Kurzangaben unter der Einleitung, z. B. Lesezeit oder Quelle */
    meta?: { label: string; value: string }[];
    /** Aktionen rechts bzw. unter dem Titel (Teilen, Export, Zurücksetzen) */
    children?: Snippet;
    class?: string;
  }

  let {
    title,
    lead,
    kicker,
    badge,
    badgeTone = 'brand',
    icon,
    meta = [],
    children,
    class: klass = ''
  }: Props = $props();
</script>

<header class="ui-hero {klass}">
  <div class="ui-hero__text">
    {#if kicker}
      <p class="ui-hero__kicker">{kicker}</p>
    {/if}
    <h1 class="ui-hero__title">
      {#if icon}
        <span class="ui-hero__icon" aria-hidden="true"><Icon name={icon} size={26} /></span>
      {/if}
      <span>{title}</span>
      {#if badge}
        <Badge tone={badgeTone} size="md">{badge}</Badge>
      {/if}
    </h1>
    {#if lead}
      <p class="ui-hero__lead">{lead}</p>
    {/if}
    {#if meta.length > 0}
      <dl class="ui-hero__meta">
        {#each meta as entry (entry.label)}
          <div class="ui-hero__meta-item">
            <dt>{entry.label}</dt>
            <dd>{entry.value}</dd>
          </div>
        {/each}
      </dl>
    {/if}
  </div>
  {#if children}
    <div class="ui-hero__actions">{@render children()}</div>
  {/if}
</header>

<style>
  .ui-hero {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.5rem;
    flex-wrap: wrap;
    padding-block: 1.5rem 1rem;
  }

  .ui-hero__text {
    min-width: 0;
    max-width: var(--container-prose);
  }

  .ui-hero__kicker {
    margin: 0 0 0.375rem;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-brand);
  }

  .ui-hero__title {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    flex-wrap: wrap;
    margin: 0;
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-tight);
    color: var(--color-ink);
  }

  .ui-hero__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: var(--radius-control);
    background-color: var(--color-brand-soft);
    color: var(--color-brand-ink);
  }

  .ui-hero__lead {
    margin: 0.625rem 0 0;
    font-size: var(--font-size-lg);
    line-height: var(--line-height-relaxed);
    color: var(--color-ink-muted);
  }

  .ui-hero__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin: 0.875rem 0 0;
  }

  .ui-hero__meta-item {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
    font-size: var(--font-size-xs);
  }

  .ui-hero__meta-item dt {
    color: var(--color-ink-subtle);
  }

  .ui-hero__meta-item dd {
    margin: 0;
    color: var(--color-ink);
    font-weight: var(--font-weight-medium);
  }

  .ui-hero__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
</style>
