<script lang="ts">
  /**
   * Weiterführende Verweise am Ende eines Abschnitts oder einer Seite.
   * Externe Ziele (http/https) bekommen automatisch `rel` und ein Icon.
   */
  import Icon from './Icon.svelte';
  import type { IconName } from './icons';

  export interface RelatedLinkItem {
    href: string;
    label: string;
    description?: string;
    icon?: IconName;
  }

  interface Props {
    items: RelatedLinkItem[];
    title?: string;
    /** Überschriftenebene des Blocktitels */
    level?: 2 | 3;
    layout?: 'grid' | 'list';
    columns?: 1 | 2 | 3;
    class?: string;
  }

  let { items, title = 'Weiterführend', level = 2, layout = 'grid', columns = 2, class: klass = '' }: Props = $props();

  const headingId = $props.id();

  function isExternal(href: string): boolean {
    return /^https?:\/\//i.test(href);
  }
</script>

<nav class="ui-related {klass}" aria-labelledby={headingId}>
  <svelte:element this={`h${level}`} id={headingId} class="ui-related__title">
    {title}
  </svelte:element>
  <ul
    class="ui-related__list ui-related__list--{layout}"
    style={layout === 'grid' ? `--related-columns: ${columns}` : undefined}
  >
    {#each items as item (item.href + item.label)}
      {@const external = isExternal(item.href)}
      <li>
        <a
          class="ui-related__item"
          href={item.href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
        >
          <span class="ui-related__label">
            {item.label}
            {#if external}
              <Icon name="external" size={12} />
              <span class="sr-only">(öffnet in neuem Tab)</span>
            {/if}
          </span>
          {#if item.description}
            <span class="ui-related__description">{item.description}</span>
          {/if}
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  /* Eine Überschrift, darunter eine Linkliste mit Trennlinien — keine Karten.
     `layout` und `columns` bleiben als Props gültig, wirken aber nicht mehr. */
  .ui-related {
    margin-top: 1rem;
  }

  .ui-related__title {
    margin: 0 0 0.25rem;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink-subtle);
  }

  .ui-related__list {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--color-line-subtle);
  }

  .ui-related__list > li {
    border-bottom: 1px solid var(--color-line-subtle);
  }

  .ui-related__item {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0 0.5rem;
    padding: 0.25rem 0;
    color: var(--color-brand);
    text-decoration: none;
    font-size: var(--font-size-sm);
  }

  .ui-related__item:hover {
    text-decoration: underline;
  }

  .ui-related__label {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .ui-related__description {
    color: var(--color-ink-subtle);
    font-size: var(--font-size-xs);
  }
</style>
