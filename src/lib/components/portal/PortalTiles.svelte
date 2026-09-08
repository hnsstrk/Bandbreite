<script lang="ts">
  /**
   * Kachelraster der Portalseite für Kapitel-Sprungmarken und Werkzeuge.
   * Die Karten sind vollständig anklickbar (`Card` mit `href`).
   */
  import Card from '$lib/components/ui/Card.svelte';
  import type { PortalTile } from './portalContent';

  interface Props {
    items: PortalTile[];
    /** Überschriftenebene der Kacheln — passend zum umgebenden Abschnitt. */
    level?: 2 | 3 | 4;
    /** Beschriftung des Rasters für Screenreader. */
    label: string;
  }

  let { items, level = 3, label }: Props = $props();
</script>

<ul class="portal-tiles" aria-label={label}>
  {#each items as item (item.id)}
    <li class="portal-tiles__cell">
      <Card href={item.href} title={item.title} {level} icon={item.icon} class="portal-tiles__card">
        <p class="portal-tiles__text">{item.text}</p>
      </Card>
    </li>
  {/each}
</ul>

<style>
  .portal-tiles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
    grid-auto-rows: 1fr;
    gap: 1rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .portal-tiles__cell {
    display: flex;
  }

  .portal-tiles__cell :global(.portal-tiles__card) {
    width: 100%;
  }

  .portal-tiles__text {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
    color: var(--color-ink-muted);
  }
</style>
