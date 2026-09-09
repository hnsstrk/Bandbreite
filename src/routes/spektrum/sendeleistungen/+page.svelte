<script lang="ts">
  import PowerDbChart from '$lib/components/charts/PowerDbChart.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';

  /** Größenordnungen der Sendeleistung, wie sie im Diagramm auftreten. */
  const POWER_CLASSES = [
    {
      id: 'high',
      title: 'Megawatt: Rundfunk und Radar',
      text: 'Langwellen- und Mittelwellensender sowie Flugsicherungs- und Wetterradare arbeiten mit Spitzenleistungen bis in den Megawattbereich — nötig, weil die Echoleistung eines Radars mit R⁴ fällt.'
    },
    {
      id: 'mid',
      title: 'Watt bis Kilowatt: Mobilfunk und Amateurfunk',
      text: 'Mobilfunk-Basisstationen liegen bei 20 bis 40 W je Sektor, Amateurfunk auf Kurzwelle bei 100 W. In dieser Klasse entscheidet der Antennengewinn mehr über die Reichweite als die Leistung.'
    },
    {
      id: 'low',
      title: 'Milliwatt: WLAN, Bluetooth und IoT',
      text: 'Bluetooth sendet mit 1 mW, LoRaWAN in Europa mit 25 mW, WLAN mit 100 bis 200 mW. Hier begrenzt nicht die Physik, sondern die Regulierung — und die Batterie.'
    }
  ];
</script>

<div class="page-content">
  <PageHero
    title="Sendeleistungen im Spektrum"
    icon="antenna"
    lead="Zwölf Zehnerpotenzen Leistung über sechs Zehnerpotenzen Frequenz: wo Bluetooth, Mobilfunk, Rundfunk und Radar im Diagramm liegen."
    meta={[
      { label: 'Achsen', value: 'Frequenz und Wellenlänge, Watt und dBm' },
      { label: 'Darstellung', value: 'beide Achsen logarithmisch' }
    ]}
  />

  <Card padding="md">
    <PowerDbChart />
  </Card>

  <section class="info" aria-labelledby="groessenordnungen">
    <SectionHeader
      title="Größenordnungen"
      level={2}
      id="groessenordnungen"
      description="Die X-Achse zeigt unten die Frequenz und oben die Wellenlänge, die Y-Achse links Watt und rechts dBm."
    />
    <div class="info__grid">
      {#each POWER_CLASSES as item (item.id)}
        <Card title={item.title} level={3} tone="sunken">{item.text}</Card>
      {/each}
    </div>
  </section>

  <RelatedTopics href="/spektrum/sendeleistungen/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
    gap: 1rem;
  }
</style>
