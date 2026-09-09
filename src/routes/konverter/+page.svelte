<script lang="ts">
  import { findNode, getHubChildren } from '$lib/data/navigation';
  import HubList from '$lib/components/portal/HubList.svelte';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';

  const HUB_HREF = '/konverter/';

  const hub = findNode(HUB_HREF);
  const items = getHubChildren(HUB_HREF);
</script>

<div class="page-content">
  <PageHero
    title={hub?.label ?? 'Konverter'}
    icon="sliders"
    lead={hub?.description ??
      'Einheiten umrechnen: Frequenz und Wellenlänge, Leistung in Watt und Dezibel, Reichweite aus Pegeln.'}
  />

  <HubList {items} label="Konverter" />

  <RelatedTopics href={HUB_HREF} />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
