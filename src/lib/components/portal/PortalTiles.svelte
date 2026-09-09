<script lang="ts">
  /**
   * Einstiegsliste der Portalseite für Kapitel-Sprungmarken und Werkzeuge:
   * Name als Link, Kurztext daneben, 1-px-Trennlinie dazwischen.
   */
  import type { PortalTile } from './portalContent';

  interface Props {
    items: PortalTile[];
    /** Beschriftung der Liste für Screenreader. */
    label: string;
  }

  let { items, label }: Props = $props();
</script>

<dl class="tiles" aria-label={label}>
  {#each items as item (item.id)}
    <div class="tiles__row">
      <dt class="tiles__term"><a href={item.href}>{item.title}</a></dt>
      <dd class="tiles__text">{item.text}</dd>
    </div>
  {/each}
</dl>

<style>
  .tiles {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--color-line-subtle);
  }

  @media (min-width: 64rem) {
    .tiles {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 2rem;
    }
  }

  .tiles__row {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.125rem 1rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-line-subtle);
  }

  @media (min-width: 40rem) {
    .tiles__row {
      grid-template-columns: minmax(9rem, 14rem) minmax(0, 1fr);
      align-items: baseline;
    }
  }

  .tiles__term {
    font-weight: var(--font-weight-semibold);
  }

  .tiles__term a {
    color: var(--color-ink);
    text-decoration: none;
  }

  .tiles__term a:hover {
    color: var(--color-brand);
    text-decoration: underline;
  }

  .tiles__text {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
    color: var(--color-ink-muted);
  }
</style>
