<script lang="ts">
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import FresnelZoneCalculator from '$lib/components/calculators/FresnelZoneCalculator.svelte';
</script>

<div class="page-content">
  <PageHero
    kicker="Rechner"
    title="Fresnel-Zone"
    icon="wave"
    lead="Wie viel Platz eine Funkstrecke seitlich braucht — der Radius der ersten Fresnel-Zone und die 60-Prozent-Regel für hindernisfreie Verbindungen."
    meta={[{ label: 'Quelle', value: 'ITU-R P.530-18' }, { label: 'Gültig', value: 'Sichtverbindung' }]}
  />

  <FresnelZoneCalculator />

  <RelatedTopics href="/rechner/fresnel/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
