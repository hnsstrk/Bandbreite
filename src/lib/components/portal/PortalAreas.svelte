<script lang="ts">
  /**
   * Die fünf Bereichskacheln der Portalseite. Jede Karte führt auf den Hub des
   * Bereichs und listet darunter drei bis vier Direkteinstiege.
   */
  import Card from '$lib/components/ui/Card.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { portalAreas } from './portalContent';

  const areas = portalAreas();
</script>

<ul class="portal-areas">
  {#each areas as area (area.id)}
    <li class="portal-areas__cell">
      <Card title={area.label} level={3} icon={area.icon} class="portal-areas__card">
        <p class="portal-areas__text">{area.description}</p>
        <ul class="portal-areas__links">
          {#each area.links as link (link.id)}
            <li>
              <a class="portal-areas__link" href={link.href}>
                <Icon name="chevron-right" size={14} />
                <span>{link.label}</span>
              </a>
            </li>
          {/each}
        </ul>
        {#snippet footer()}
          <a class="portal-areas__hub" href={area.href}>
            {area.label} im Überblick
            <Icon name="arrow-right" size={16} />
          </a>
        {/snippet}
      </Card>
    </li>
  {/each}
</ul>

<style>
  .portal-areas {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
    grid-auto-rows: 1fr;
    gap: 1rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .portal-areas__cell {
    display: flex;
  }

  .portal-areas__cell :global(.portal-areas__card) {
    width: 100%;
  }

  .portal-areas__text {
    margin: 0 0 0.75rem;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
    color: var(--color-ink-muted);
  }

  .portal-areas__links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .portal-areas__link {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    min-height: 2rem;
    font-size: var(--font-size-sm);
    color: var(--color-ink);
    text-decoration: none;
  }

  .portal-areas__link:hover {
    color: var(--color-brand);
    text-decoration: underline;
  }

  .portal-areas__link:focus-visible,
  .portal-areas__hub:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  .portal-areas__hub {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-brand);
    text-decoration: none;
  }

  .portal-areas__hub:hover {
    text-decoration: underline;
  }
</style>
