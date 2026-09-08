<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import Callout from '$lib/components/ui/Callout.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import FormulaBlock from '$lib/components/ui/FormulaBlock.svelte';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import BandInfo from '$lib/components/converters/BandInfo.svelte';
  import FrequencyConverter from '$lib/components/converters/FrequencyConverter.svelte';
  import { SPECTRUM_MIN_HZ, SPECTRUM_MAX_GAMMA_HZ } from '$lib/data/spectrum';

  /**
   * Startfrequenz aus `?f=<Hertz>` — darauf zeigt „Wellenlänge berechnen" in
   * der Befehlspalette. Der Konverter selbst ist eine geschützte
   * Kernkomponente; gesetzt wird deshalb nur sein Startwert hier im Wrapper.
   * Beim Prerendern sind Suchparameter gesperrt, daher der `browser`-Zweig.
   */
  const DEFAULT_FREQUENCY_HZ = 100e6;

  function frequencyFromSearch(search: string): number {
    const raw = new URLSearchParams(search).get('f');
    if (!raw) return DEFAULT_FREQUENCY_HZ;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < SPECTRUM_MIN_HZ || value > SPECTRUM_MAX_GAMMA_HZ) {
      return DEFAULT_FREQUENCY_HZ;
    }
    return value;
  }

  function startFrequency(): number {
    return browser ? frequencyFromSearch(page.url.search) : DEFAULT_FREQUENCY_HZ;
  }

  // Der Schlüssel baut den Konverter neu auf, wenn dieselbe Route mit einer
  // anderen Frequenz angesteuert wird; er ändert sich sonst nie.
  let startFrequencyHz = $derived(startFrequency());

  /**
   * Gemeinsamer Wert von Konverter und Bandzuordnung: `BandInfo` zeigt die
   * ITU-, IEEE- und NATO-Bänder zu genau der Frequenz, die im Konverter steht.
   * Der Anfangswert entsteht schon beim Aufbau der Seite, damit der Konverter
   * bei der Hydratation direkt mit der Frequenz aus der URL startet.
   */
  let frequencyHz = $state<number | null>(startFrequency());

  // Vor dem Neuaufbau des Konverters (neue `?f=`) den Startwert übernehmen.
  $effect.pre(() => {
    frequencyHz = startFrequencyHz;
  });
</script>

<div class="page-content">
  <PageHero
    kicker="Konverter"
    title="Frequenz und Wellenlänge"
    icon="wave"
    lead="Zwei Zahlen für dieselbe Welle: Wer eine kennt, kennt die andere — die Lichtgeschwindigkeit verbindet sie."
    meta={[{ label: 'Konstante', value: 'c = 299.792.458 m/s' }]}
  />

  <div class="converter-grid">
    <Card padding="md">
      {#key startFrequencyHz}
        <FrequencyConverter bind:frequencyHz />
      {/key}
    </Card>

    <Card
      title="Bandzuordnung"
      subtitle="In welchen Bändern die eingestellte Frequenz liegt"
      level={2}
      padding="md"
    >
      <BandInfo {frequencyHz} />
    </Card>
  </div>

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

  /* Auf schmalen Viewports untereinander, ab 1024 px nebeneinander. */
  .converter-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    align-items: start;
  }

  @media (min-width: 1024px) {
    .converter-grid {
      grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    }
  }
</style>
