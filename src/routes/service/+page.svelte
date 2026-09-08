<script lang="ts">
  import { findNode, getHubChildren } from '$lib/data/navigation';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import { isIconName } from '$lib/components/ui/icons';

  const HUB_HREF = '/service/';

  const hub = findNode(HUB_HREF);
  const items = getHubChildren(HUB_HREF);

  /** Nur Namen aus dem Katalog dürfen an `Icon` — sonst kein Icon. */
  function iconFor(name: string | undefined) {
    return name && isIconName(name) ? name : undefined;
  }
</script>

<div class="page-content">
  <PageHero
    kicker="Über dieses Projekt"
    title={hub?.label ?? 'Service'}
    icon="info"
    lead={hub?.description ?? 'Sitemap, Quellenlage und Stand der Daten.'}
  />

  <ul class="hub-grid">
    {#each items as item (item.id)}
      <li class="hub-grid__cell">
        {#if item.status === 'geplant'}
          <Card title={item.label} level={2} icon={iconFor(item.icon)} muted class="hub-card">
            {#snippet actions()}<Badge tone="neutral">geplant</Badge>{/snippet}
            {item.description ?? ''}
          </Card>
        {:else}
          <Card href={item.href} title={item.label} level={2} icon={iconFor(item.icon)} class="hub-card">
            {item.description ?? ''}
          </Card>
        {/if}
      </li>
    {/each}
  </ul>

  <RelatedTopics href={HUB_HREF} />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .hub-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
    grid-auto-rows: 1fr;
    gap: 1rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /* Gleich hohe Kacheln: die Karte füllt ihre Zelle vollständig aus. */
  .hub-grid__cell {
    display: flex;
  }

  .hub-grid__cell :global(.hub-card) {
    width: 100%;
  }
</style>
