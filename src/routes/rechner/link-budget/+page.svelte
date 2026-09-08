<script lang="ts">
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import LinkBudgetCalculator from '$lib/components/calculators/LinkBudgetCalculator.svelte';
</script>

<div class="page-content">
  <PageHero
    kicker="Rechner"
    title="Streckenbilanz"
    icon="antenna"
    lead="Ob eine Funkstrecke trägt: alle Gewinne und Verluste vom Sender bis zum Empfänger, inklusive Freiraumdämpfung, Atmosphäre und Reserve für Schwund."
    meta={[
      { label: 'Quelle', value: 'ITU-R P.525, P.676' },
      { label: 'Ergebnis', value: 'Systemreserve in dB' }
    ]}
  />

  <LinkBudgetCalculator />

  <RelatedTopics href="/rechner/link-budget/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
