<script lang="ts">
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import FSPLCalculator from '$lib/components/calculators/FSPLCalculator.svelte';

  /**
   * Der Rechner liest seinen Zustand selbst aus der Adresszeile
   * (`/rechner/fspl/?f=<Hertz>&d=<Meter>`) — auch die Deep-Links der
   * Befehlspalette landen dort.
   */
</script>

<div class="page-content">
  <PageHero
    kicker="Rechner"
    title="Freiraumdämpfung"
    icon="wave"
    lead="Wie viel Signal auf dem Weg zwischen zwei Antennen verloren geht — allein durch die Ausbreitung im freien Raum, ohne Hindernisse, Reflexionen oder Atmosphäre."
    meta={[
      { label: 'Quelle', value: 'ITU-R P.525-4' },
      { label: 'Gültig', value: 'Sichtverbindung im Fernfeld' }
    ]}
  />

  <FSPLCalculator />

  <RelatedTopics href="/rechner/fspl/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
