<script lang="ts">
  import { findNode, getHubChildren } from '$lib/data/navigation';
  import HubList from '$lib/components/portal/HubList.svelte';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';

  const HUB_HREF = '/service/';

  const hub = findNode(HUB_HREF);
  const items = getHubChildren(HUB_HREF);
</script>

<div class="page-content">
  <PageHero
    title={hub?.label ?? 'Service'}
    icon="info"
    lead={hub?.description ?? 'Sitemap, Quellenlage und Stand der Daten.'}
  />

  <HubList {items} label="Serviceseiten" />

  <RelatedTopics href={HUB_HREF} />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
