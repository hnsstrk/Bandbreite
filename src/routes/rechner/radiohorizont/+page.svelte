<script lang="ts">
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import RadioHorizonCalculator from '$lib/components/calculators/RadioHorizonCalculator.svelte';
</script>

<div class="page-content">
  <PageHero
    title="Radiohorizont"
    icon="globe"
    lead="Wie weit eine Sichtverbindung über die gekrümmte Erde reicht — Horizontdistanz aus der Antennenhöhe, mit einstellbarem k-Faktor der Refraktion."
    meta={[
      { label: 'Quelle', value: 'ITU-R P.834-9' },
      { label: 'Gültig', value: 'VHF und darüber' }
    ]}
  />

  <RadioHorizonCalculator />

  <RelatedTopics href="/rechner/radiohorizont/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
