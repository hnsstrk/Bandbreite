<script lang="ts">
  /**
   * Die fünf Bereiche der Portalseite als dichte Linkliste: Bereichsname als
   * Überschrift, darunter eine Zeile mit den Direkteinstiegen. Kein Kachelraster
   * — die Liste nutzt die volle Breite und braucht einen Bruchteil der Höhe.
   */
  import { portalAreas } from './portalContent';

  const areas = portalAreas();
</script>

<ul class="areas">
  {#each areas as area (area.id)}
    <li class="areas__row">
      <a class="areas__hub" href={area.href}>{area.label}</a>
      <p class="areas__links">
        {#each area.links as link, index (link.id)}
          {#if index > 0}<span class="areas__sep" aria-hidden="true">·</span>{/if}
          <a href={link.href}>{link.label}</a>
        {/each}
      </p>
    </li>
  {/each}
</ul>

<style>
  .areas {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--color-line-subtle);
  }

  .areas__row {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.125rem 1rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-line-subtle);
  }

  @media (min-width: 40rem) {
    .areas__row {
      grid-template-columns: minmax(8rem, 12rem) minmax(0, 1fr);
      align-items: baseline;
    }
  }

  .areas__hub {
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
    text-decoration: none;
  }

  .areas__hub:hover {
    color: var(--color-brand);
    text-decoration: underline;
  }

  .areas__links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin: 0;
    font-size: var(--font-size-sm);
  }

  .areas__links a {
    color: var(--color-ink-muted);
    text-decoration: none;
  }

  .areas__links a:hover {
    color: var(--color-brand);
    text-decoration: underline;
  }

  .areas__sep {
    color: var(--color-ink-subtle);
  }
</style>
