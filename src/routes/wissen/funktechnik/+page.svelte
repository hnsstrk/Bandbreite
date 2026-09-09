<script lang="ts">
  import { getHubChildren, findNode } from '$lib/data/navigation';
  import HubList from '$lib/components/portal/HubList.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';

  const hub = findNode('/wissen/funktechnik/');
  const items = getHubChildren('/wissen/funktechnik/');
</script>

<div class="page-content">
  <header>
    <h1 class="text-heading-1">Funk &amp; Fernmeldetechnik</h1>
    <p class="header-description">{hub?.description}</p>
  </header>

  <HubList {items} label="Unterkapitel" />

  <RelatedTopics href="/wissen/funktechnik/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0 var(--page-gutter, 1rem);
  }

  .header-description {
    margin: 0.25rem 0 0;
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    color: var(--color-ink-muted);
  }
</style>
