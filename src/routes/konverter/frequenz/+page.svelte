<script lang="ts">
  import Callout from '$lib/components/ui/Callout.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import FormulaBlock from '$lib/components/ui/FormulaBlock.svelte';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import FrequencyConverter from '$lib/components/converters/FrequencyConverter.svelte';
</script>

<div class="page-content">
  <PageHero
    kicker="Konverter"
    title="Frequenz und Wellenlänge"
    icon="wave"
    lead="Zwei Zahlen für dieselbe Welle: Wer eine kennt, kennt die andere — die Lichtgeschwindigkeit verbindet sie."
    meta={[{ label: 'Konstante', value: 'c = 299.792.458 m/s' }]}
  />

  <Card padding="md">
    <FrequencyConverter />
  </Card>

  <FormulaBlock
    formula="λ = c / f"
    alt="Lambda gleich c geteilt durch f"
    label="Wellenlänge aus der Frequenz"
    number="(1)"
    variables={[
      { symbol: 'λ', meaning: 'Wellenlänge', unit: 'm' },
      { symbol: 'c', meaning: 'Lichtgeschwindigkeit im Vakuum', unit: 'm/s' },
      { symbol: 'f', meaning: 'Frequenz', unit: 'Hz' }
    ]}
  />

  <Callout tone="tip" title="Zahlen zum Merken">
    300 MHz entsprechen genau 1 m, 3 GHz sind 10 cm und 30 GHz sind 1 cm. Wer die Frequenz in
    Megahertz kennt, teilt 300 durch diesen Wert und erhält die Wellenlänge in Metern — genau
    genug für jede Antennenabschätzung.
  </Callout>

  <Callout tone="info" title="Im Medium wird es kürzer">
    Die Formel gilt für das Vakuum. In einem Medium mit der relativen Permittivität εᵣ läuft die
    Welle langsamer, die Wellenlänge verkürzt sich um den Faktor 1/√εᵣ — deshalb ist ein
    λ/4-Element auf einer Leiterplatte deutlich kürzer als in Luft.
  </Callout>

  <RelatedTopics href="/konverter/frequenz/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
