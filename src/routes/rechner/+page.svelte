<script lang="ts">
  import { findNode, getHubChildren } from '$lib/data/navigation';
  import HubList from '$lib/components/portal/HubList.svelte';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';

  const HUB_HREF = '/rechner/';

  const hub = findNode(HUB_HREF);
  const items = getHubChildren(HUB_HREF);
</script>

<div class="page-content">
  <PageHero
    title={hub?.label ?? 'Rechner'}
    icon="calculator"
    lead={hub?.description ??
      'Sieben Rechner für Funkstrecken, Radar und Material — jeder mit Reglern, Formel und teilbarem Link.'}
  />

  <HubList {items} label="Rechner" />

  <RelatedTopics href={HUB_HREF} />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
