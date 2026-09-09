<script lang="ts">
  import ApplicationOverlay from '$lib/components/charts/ApplicationOverlay.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
</script>

<div class="page-content">
  <PageHero
    title="Anwendungen nach Frequenzband"
    icon="signal"
    lead="Wer wo funkt: die typischen Dienste und Anwendungen über dem Spektrum — von Langwellen-Rundfunk über Mobilfunk bis zu Radar und Satellitenstrecken."
  />

  <Card padding="md">
    <ApplicationOverlay />
  </Card>

  <RelatedTopics href="/spektrum/anwendungen/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
