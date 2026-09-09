<script lang="ts">
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import SkinDepthCalculator from '$lib/components/calculators/SkinDepthCalculator.svelte';
</script>

<div class="page-content">
  <PageHero
    title="Skin-Tiefe"
    icon="wave"
    lead="Wie tief ein hochfrequentes Feld in einen Leiter eindringt — die Grundlage für Abschirmung, Leiterquerschnitte und HF-Verluste."
    meta={[
      { label: 'Quelle', value: 'Pozar, Microwave Engineering' },
      { label: 'Gültig', value: 'guter Leiter, σ ≫ ωε' }
    ]}
  />

  <SkinDepthCalculator />

  <RelatedTopics href="/rechner/skin-tiefe/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
