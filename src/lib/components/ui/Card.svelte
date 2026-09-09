<script lang="ts">
  /**
   * Karte — der Grundbaustein aller Panels.
   *
   * `header` und `footer` sind Snippets; ohne sie rendert die Karte nur
   * ihren Inhalt. Mit `href` wird die gesamte Karte zu einem Link
   * (Variante `interactive`), ansonsten bleibt sie eine `<section>`.
   */
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  import type { IconName } from './icons';

  interface Props {
    /** Überschrift der Karte */
    title?: string;
    /** Kurze Erläuterung unter der Überschrift */
    subtitle?: string;
    /** Überschriftenebene der Kartenüberschrift */
    level?: 2 | 3 | 4;
    tone?: 'default' | 'sunken' | 'outline';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /** Macht die Karte anklickbar und rendert ein `<a>` */
    href?: string;
    /** Icon links neben der Überschrift */
    icon?: IconName;
    /** Gedämpfter Zustand, z. B. für „in Vorbereitung" */
    muted?: boolean;
    /** Aktionen rechts im Kartenkopf */
    actions?: Snippet;
    /** Vollständig eigener Kartenkopf */
    header?: Snippet;
    footer?: Snippet;
    children: Snippet;
    class?: string;
  }

  let {
    title,
    subtitle,
    level = 2,
    tone = 'default',
    padding = 'md',
    href,
    icon,
    muted = false,
    actions,
    header,
    footer,
    children,
    class: klass = ''
  }: Props = $props();

  const headingId = $props.id();
  const hasHead = $derived(Boolean(header || title || actions));
  const classes = $derived(
    [
      'ui-card',
      `ui-card--${tone}`,
      `ui-card--pad-${padding}`,
      href ? 'ui-card--interactive' : '',
      muted ? 'ui-card--muted' : '',
      klass
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

{#snippet head()}
  {#if header}
    <div class="ui-card__head">{@render header()}</div>
  {:else if title || actions}
    <div class="ui-card__head">
      <div class="ui-card__titles">
        {#if title}
          <svelte:element this={`h${level}`} id={headingId} class="ui-card__title">
            {#if icon}<Icon name={icon} size={18} />{/if}
            {title}
          </svelte:element>
        {/if}
        {#if subtitle}
          <p class="ui-card__subtitle">{subtitle}</p>
        {/if}
      </div>
      {#if actions}
        <div class="ui-card__actions">{@render actions()}</div>
      {/if}
    </div>
  {/if}
{/snippet}

{#if href}
  <a {href} class={classes} aria-labelledby={title ? headingId : undefined}>
    {@render head()}
    <div class="ui-card__body">{@render children()}</div>
    {#if footer}
      <div class="ui-card__footer">{@render footer()}</div>
    {/if}
    <span class="ui-card__chevron" aria-hidden="true">
      <Icon name="arrow-right" size={18} />
    </span>
  </a>
{:else}
  <section class={classes} aria-labelledby={title ? headingId : undefined}>
    {#if hasHead}{@render head()}{/if}
    <div class="ui-card__body">{@render children()}</div>
    {#if footer}
      <div class="ui-card__footer">{@render footer()}</div>
    {/if}
  </section>
{/if}

<style>
  /* Datenblatt-Karte: 1-px-Linie, 2 px Radius, 0,75 rem Polster,
     kein Schatten, kein Anheben beim Überfahren. */
  .ui-card {
    display: flex;
    flex-direction: column;
    position: relative;
    border-radius: var(--radius-card);
    background-color: var(--color-surface);
    border: 1px solid var(--color-line);
    box-shadow: none;
    transition: border-color var(--transition-fast);
  }

  .ui-card--sunken,
  .ui-card--outline {
    background-color: transparent;
    box-shadow: none;
    border-color: var(--color-line);
  }

  /* Die Polsterstufen liegen dicht beieinander — ein Datenblatt hat einen
     Innenabstand, keine drei. `none` bleibt erhalten. */
  .ui-card--pad-none {
    padding: 0;
  }
  .ui-card--pad-sm {
    padding: 0.5rem;
  }
  .ui-card--pad-md {
    padding: 0.75rem;
  }
  .ui-card--pad-lg {
    padding: 0.75rem;
  }

  .ui-card--muted {
    opacity: 0.72;
  }

  /* Anklickbare Karte — Akzent und Unterstreichung, kein Anheben. */
  .ui-card--interactive {
    text-decoration: none;
    color: inherit;
    padding-right: 1.75rem;
  }

  .ui-card--interactive:hover {
    border-color: var(--color-brand);
  }

  .ui-card--interactive:hover .ui-card__title {
    color: var(--color-brand);
    text-decoration: underline;
  }

  .ui-card__chevron {
    position: absolute;
    right: 0.5rem;
    top: 0.75rem;
    color: var(--color-ink-faint);
  }

  .ui-card--interactive:hover .ui-card__chevron {
    color: var(--color-brand);
  }

  /* Kopf */
  .ui-card__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .ui-card__titles {
    min-width: 0;
  }

  .ui-card__title {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin: 0;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    line-height: var(--line-height-tight);
    color: var(--color-ink);
  }

  .ui-card__subtitle {
    margin: 0.25rem 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }

  .ui-card__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: none;
  }

  .ui-card__body {
    min-width: 0;
  }

  .ui-card__footer {
    margin-top: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-line-subtle);
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }
</style>
