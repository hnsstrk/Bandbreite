<script lang="ts">
  import AtmosphericInputs from '$lib/components/converters/AtmosphericInputs.svelte';
  import AttenuationChart from '$lib/components/charts/AttenuationChart.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';

  /** Die Absorptionsspitzen, die das Diagramm markiert. */
  const PEAKS = [
    {
      id: 'h2o-22',
      title: 'Wasserdampf bei 22 GHz',
      text: 'Wassermoleküle absorbieren bei 22,235 GHz besonders stark. Der Peak begrenzt Satellitenstrecken und Erdbeobachtung im K-Band und ist zugleich die Grundlage der Radiometrie zur Feuchtemessung.'
    },
    {
      id: 'o2-60',
      title: 'Sauerstoff bei 60 GHz',
      text: 'Sauerstoff erzeugt um 60 GHz einen breiten Absorptionsberg von rund 15 dB/km. Das begrenzt die Reichweite im V-Band drastisch — und macht es dadurch abhörsicher für Kurzstrecken wie WiGig.'
    },
    {
      id: 'windows',
      title: 'Atmosphärische Fenster',
      text: 'Zwischen den Spitzen liegen Fenster geringer Dämpfung, etwa um 35, 94 und 140 GHz. Sie werden bevorzugt für Satellitenkommunikation, Radioastronomie und Millimeterwellenradar genutzt.'
    }
  ];

  /** Wo die Dämpfung in der Praxis den Ausschlag gibt. */
  const PRACTICE = [
    {
      id: 'satellite',
      title: 'Satellitenkommunikation',
      text: 'Im Ka-Band (26 bis 40 GHz) und V-Band (40 bis 75 GHz) gehört die atmosphärische Dämpfung samt Regenreserve in jede Streckenbilanz — bei flachem Elevationswinkel wird der Weg durch die Troposphäre länger.'
    },
    {
      id: 'mmwave',
      title: '5G-Millimeterwellen',
      text: 'Die mmWave-Bänder bei 28 und 39 GHz liegen bewusst zwischen den Absorptionsspitzen. Die Zellgröße begrenzt hier nicht die Atmosphäre, sondern Freiraumdämpfung und Abschattung.'
    }
  ];
</script>

<div class="page-content">
  <PageHero
    kicker="Spektrum"
    title="Atmosphärische Dämpfung"
    icon="wave"
    lead="Wie stark Luft, Wasserdampf und Niederschlag ein Funksignal schwächen — Frequenz für Frequenz, von 1 bis 350 GHz."
    meta={[
      { label: 'Gase', value: 'ITU-R P.676-13' },
      { label: 'Regen', value: 'ITU-R P.838-3' },
      { label: 'Nebel', value: 'ITU-R P.840-9' }
    ]}
  />

  <AtmosphericInputs />

  <Card padding="md">
    <AttenuationChart />
  </Card>

  <section class="info" aria-labelledby="absorptionsspitzen">
    <SectionHeader title="Absorptionsspitzen" level={2} id="absorptionsspitzen" />
    <div class="info__grid">
      {#each PEAKS as peak (peak.id)}
        <Card title={peak.title} level={3} tone="sunken">{peak.text}</Card>
      {/each}
    </div>
  </section>

  <section class="info" aria-labelledby="praktische-bedeutung">
    <SectionHeader
      title="Praktische Bedeutung"
      level={2}
      id="praktische-bedeutung"
      description="Je höher die Frequenz, desto stärker fällt die Atmosphäre ins Gewicht."
    />
    <div class="info__grid">
      {#each PRACTICE as item (item.id)}
        <Card title={item.title} level={3} tone="sunken">{item.text}</Card>
      {/each}
    </div>
  </section>

  <Callout tone="tip" title="Faustregel">
    Unterhalb von 10 GHz bleibt die Gasdämpfung meist unter 0,02 dB/km und ist gegenüber der
    Freiraumdämpfung vernachlässigbar. Ab 20 GHz wird sie relevant, ab 50 GHz dominiert sie
    kurze Strecken.
  </Callout>

  <RelatedTopics href="/spektrum/daempfung/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
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
