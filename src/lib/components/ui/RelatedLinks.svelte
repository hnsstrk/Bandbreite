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
          {#if item.icon}
            <span class="ui-related__icon" aria-hidden="true">
              <Icon name={item.icon} size={18} />
            </span>
          {/if}
          <span class="ui-related__text">
            <span class="ui-related__label">
              {item.label}
              {#if external}
                <Icon name="external" size={13} />
                <span class="sr-only">(öffnet in neuem Tab)</span>
              {/if}
            </span>
            {#if item.description}
              <span class="ui-related__description">{item.description}</span>
            {/if}
          </span>
          <span class="ui-related__arrow" aria-hidden="true">
            <Icon name="chevron-right" size={16} />
          </span>
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  .ui-related {
    margin-top: 2rem;
  }

  .ui-related__title {
    margin: 0 0 0.75rem;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .ui-related__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.5rem;
  }

  .ui-related__list--grid {
    grid-template-columns: repeat(var(--related-columns, 2), minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    .ui-related__list--grid {
      grid-template-columns: 1fr;
    }
  }

  .ui-related__item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    height: 100%;
    padding: 0.75rem 0.875rem;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-control);
    background-color: var(--color-surface);
    color: var(--color-ink);
    text-decoration: none;
    transition:
      border-color var(--transition-fast),
      background-color var(--transition-fast);
  }

  .ui-related__item:hover {
    border-color: var(--color-brand);
    background-color: var(--color-elevated);
  }

  .ui-related__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    flex: none;
    border-radius: var(--radius-control);
    background-color: var(--color-brand-soft);
    color: var(--color-brand-ink);
  }

  .ui-related__text {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
    flex: 1 1 auto;
  }

  .ui-related__label {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  .ui-related__description {
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .ui-related__arrow {
    flex: none;
    color: var(--color-ink-faint);
    transition:
      transform var(--transition-fast),
      color var(--transition-fast);
  }

  .ui-related__item:hover .ui-related__arrow {
    color: var(--color-brand);
    transform: translateX(2px);
  }
</style>
