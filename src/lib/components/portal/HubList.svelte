<script lang="ts">
  /**
   * Einstiegsliste eines Hubs — Name als Link, Beschreibung daneben, dazwischen
   * eine 1-px-Linie. Ersetzt das frühere Kachelraster: gleiche Information,
   * volle Breite, deutlich weniger Höhe. Ab 64 rem zweispaltig.
   */
  import type { NavNode } from '$lib/data/navigation';

  interface Props {
    items: NavNode[];
    /** Beschriftung der Liste für Screenreader */
    label: string;
    class?: string;
  }

  let { items, label, class: klass = '' }: Props = $props();
</script>

<dl class="hub-list {klass}" aria-label={label}>
  {#each items as item (item.id)}
    <div class="hub-list__row" class:hub-list__row--planned={item.status === 'geplant'}>
      <dt class="hub-list__term">
        {#if item.status === 'geplant'}
          {item.label}
          <span class="hub-list__flag">geplant</span>
        {:else}
          <a href={item.href}>{item.label}</a>
        {/if}
      </dt>
      <dd class="hub-list__desc">{item.description ?? ''}</dd>
    </div>
  {/each}
</dl>

<style>
  .hub-list {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--color-line-subtle);
  }

  @media (min-width: 64rem) {
    .hub-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 2rem;
    }
  }

  .hub-list__row {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.125rem 1rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-line-subtle);
  }

  @media (min-width: 40rem) {
    .hub-list__row {
      grid-template-columns: minmax(9rem, 14rem) minmax(0, 1fr);
      align-items: baseline;
    }
  }

  .hub-list__term {
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .hub-list__term a {
    color: var(--color-ink);
    text-decoration: none;
  }

  .hub-list__term a:hover {
    color: var(--color-brand);
    text-decoration: underline;
  }

  .hub-list__row--planned .hub-list__term,
  .hub-list__row--planned .hub-list__desc {
    color: var(--color-ink-subtle);
  }

  .hub-list__flag {
    font-weight: var(--font-weight-normal);
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .hub-list__desc {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
    color: var(--color-ink-muted);
  }
</style>
