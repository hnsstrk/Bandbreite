<script lang="ts">
  /**
   * Wellenausbreitung: Bodenwelle, Raumwelle, Sichtverbindung und
   * sporadische E-Schicht im Seitenriss.
   *
   * Bedienelemente stehen in `WavePropagationControls.svelte`, die Szene in
   * `WavePropagationScene.svelte`, das Bedienmodell in `wavePropagationData.ts`.
   */
  import Callout from '$lib/components/ui/Callout.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import ChartFrame from './ChartFrame.svelte';
  import WavePropagationControls from './WavePropagationControls.svelte';
  import WavePropagationLegend from './WavePropagationLegend.svelte';
  import WavePropagationScene from './WavePropagationScene.svelte';
  import { modeById, sceneDistances } from './wavePropagationData';
  import { formatNumber } from '$lib/utils/formatting';

  interface Props {
    width?: number;
    height?: number;
  }

  let { width = $bindable(900), height = 550 }: Props = $props();

  let selectedModeId = $state('sky-wave');
  let isNighttime = $state(false);
  let frequencyMHz = $state(14);

  let mode = $derived(modeById(selectedModeId));
  let distances = $derived(sceneDistances(selectedModeId, frequencyMHz, isNighttime));
  /** Beschreibung der toten Zone für Text und Tabelle. */
  let deadZoneLabel = $derived.by(() => {
    if (distances.skipKm === null) return 'keine Reflexion (Frequenz über der MUF)';
    if (distances.skipKm <= distances.groundWaveKm) return 'keine tote Zone (f ≤ foF2)';
    return `${formatNumber(distances.groundWaveKm, 0)} bis ${formatNumber(distances.skipKm, 0)} km`;
  });

  /** Kurzbeschreibung der vier Modi für die Erläuterung unter dem Bild. */
  const EXPLANATIONS = [
    {
      id: 'ground-wave',
      title: 'Bodenwelle',
      text: 'Folgt der Erdoberfläche und trägt im LF- und MF-Bereich bis etwa 300 km — die Reichweite sinkt mit steigender Frequenz.'
    },
    {
      id: 'sky-wave',
      title: 'Raumwelle',
      text: 'Wird an der Ionosphäre reflektiert und ermöglicht im HF-Bereich weltweite Verbindungen über mehrere Sprünge. Zwischen dem Ende der Bodenwelle und dem ersten Aufsetzpunkt der Raumwelle liegt die tote Zone — das Diagramm zeichnet sie aus der Sprungdistanz zur eingestellten Frequenz.'
    },
    {
      id: 'line-of-sight',
      title: 'Sichtverbindung',
      text: 'Direkte Ausbreitung im VHF- und UHF-Bereich, begrenzt durch den Radiohorizont — er liegt wegen der Refraktion etwa 15 % weiter als der optische Horizont.'
    },
    {
      id: 'sporadic-e',
      title: 'Sporadische E-Schicht',
      text: 'Kurzlebige, stark ionisierte Wolken in etwa 110 km Höhe reflektieren zeitweise auch VHF-Signale und erzeugen Überreichweiten.'
    }
  ];
</script>

<Card title="Wellenausbreitung" subtitle="Vier Ausbreitungswege im Vergleich" icon="wave">
  <div class="wave">
    <WavePropagationControls bind:selectedModeId bind:isNighttime bind:frequencyMHz />

    <ChartFrame
      bind:width
      description="Seitenriss der Erdatmosphäre mit Ionosphärenschichten, Sender und Empfänger sowie dem Signalweg des gewählten Ausbreitungsmodus; die Entfernungsachse ist maßstäblich, die Höhen sind stark überhöht"
      minWidth={640}
      footnote="Schichthöhen nach ITU-R P.1239 und P.533. Entfernungen aus dem Ausbreitungsmodell: Sprungdistanz nach dem Sekantengesetz im sphärischen Spiegelmodell (Davies, Ionospheric Radio, §6), Radiohorizont nach ITU-R P.834 für 30 m und 10 m Antennenhöhe, Bodenwellenreichweite als Faustregel nach ITU-R P.368. Die Höhenachse ist gegenüber der Entfernungsachse stark überhöht."
    >
      {#snippet legend()}
        <WavePropagationLegend {selectedModeId} />
      {/snippet}

      <WavePropagationScene {selectedModeId} {isNighttime} {frequencyMHz} {width} {height} />

      {#snippet dataTable()}
        <table>
          <caption>Eigenschaften des gewählten Modus</caption>
          <tbody>
            <tr><th scope="row">Modus</th><td>{mode.nameDE}</td></tr>
            <tr>
              <th scope="row">Frequenzbereich</th>
              <td>{mode.frequencyRangeHz.min} bis {mode.frequencyRangeHz.max} Hz</td>
            </tr>
            <tr>
              <th scope="row">Typische Reichweite</th>
              <td>{mode.typicalRangeKm.min} bis {mode.typicalRangeKm.max} km</td>
            </tr>
            <tr>
              <th scope="row">Tageszeit</th>
              <td>{isNighttime ? 'Nacht' : 'Tag'}</td>
            </tr>
            <tr>
              <th scope="row">Eingestellte Frequenz</th>
              <td>{formatNumber(frequencyMHz, 3)} MHz</td>
            </tr>
            <tr>
              <th scope="row">Bodenwellenreichweite</th>
              <td>{formatNumber(distances.groundWaveKm, 0)} km</td>
            </tr>
            <tr>
              <th scope="row"
                >Sprungdistanz (foF2 {formatNumber(distances.foF2MHz, 1)} MHz, {formatNumber(
                  distances.reflectionHeightKm,
                  0
                )} km)</th
              >
              <td>{distances.skipKm === null ? 'keine Reflexion' : `${formatNumber(distances.skipKm, 0)} km`}</td>
            </tr>
            <tr>
              <th scope="row">Tote Zone</th>
              <td>{deadZoneLabel}</td>
            </tr>
            <tr>
              <th scope="row">Radiohorizont (30 m und 10 m)</th>
              <td>{formatNumber(distances.losKm, 1)} km</td>
            </tr>
          </tbody>
        </table>
      {/snippet}
    </ChartFrame>

    <div class="wave__notes">
      {#each EXPLANATIONS as item (item.id)}
        <Callout tone={item.id === selectedModeId ? 'tip' : 'info'} title={item.title}>
          {item.text}
        </Callout>
      {/each}
    </div>
  </div>
</Card>

<style>
  .wave {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .wave__notes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
    gap: 0.75rem;
  }
</style>
