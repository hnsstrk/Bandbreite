<script lang="ts">
  /**
   * Wissensseite „Modulation".
   *
   * Aufbau: Lernziele, Inhaltsverzeichnis, sieben Kapitel mit eingebetteten
   * Widgets. Die Texte liegen in `$lib/content/modulation.ts`, die Rechnungen
   * in `$lib/utils/modulationMath.ts`.
   */
  import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import FormulaBlock from '$lib/components/ui/FormulaBlock.svelte';
  import ModulationVisualizer from '$lib/components/widgets/ModulationVisualizer.svelte';
  import ConstellationDiagram from '$lib/components/widgets/ConstellationDiagram.svelte';
  import CarsonCalculator from '$lib/components/widgets/CarsonCalculator.svelte';
  import OfdmWidget from '$lib/components/widgets/OfdmWidget.svelte';
  import { widgetAnchorId } from '$lib/data/widgets';
  import { MODULATIONS } from '$lib/data/modulation';
  import { formatFrequency, formatNumber } from '$lib/utils/formatting';
  import {
    MODULATION_CLASS_LABELS,
    MODULATION_FORMULAS,
    MODULATION_GOALS,
    MODULATION_TEXT,
    MODULATION_TOC
  } from '$lib/content/modulation';
</script>

{#snippet prose(paragraphs: string[])}
  <div class="prose">
    {#each paragraphs as text (text)}
      <p>{text}</p>
    {/each}
  </div>
{/snippet}

<ArticleLayout
  title="Modulation"
  icon="wave"
  lead="Wie eine Nachricht auf einen Träger kommt — von der Amplitudenmodulation des Mittelwellenrundfunks bis zu den Konstellationen des Mobilfunks."
  meta={[
    { label: 'Lesezeit', value: 'rund 12 Minuten' },
    { label: 'Grundlage', value: 'ITU-R SM.328' }
  ]}
  goals={MODULATION_GOALS}
  toc={MODULATION_TOC}
  href="/wissen/modulation/"
>
  <section aria-labelledby="warum-modulieren">
    <SectionHeader title="Warum überhaupt modulieren?" id="warum-modulieren" />
    {@render prose(MODULATION_TEXT.warum)}
    <Callout tone="tip" title="Merksatz">
      Modulation ist immer ein Handel: Bandbreite gegen Sendeleistung gegen Aufwand. Kein Verfahren gewinnt in allen
      drei Punkten.
    </Callout>
  </section>

  <section aria-labelledby="traeger-und-basisband">
    <SectionHeader title="Träger, Basisband, Seitenbänder" id="traeger-und-basisband" />
    {@render prose(MODULATION_TEXT.traeger)}
  </section>

  <section aria-labelledby="analoge-verfahren">
    <SectionHeader title="Analoge Verfahren" id="analoge-verfahren" />
    {@render prose(MODULATION_TEXT.analog)}

    <!-- Sprungziel des Widget-Deep-Links `?w=modulation-visualizer` (siehe data/widgets.ts). -->
    <div
      id={widgetAnchorId('modulation-visualizer')}
      data-widget="modulation-visualizer"
      tabindex="-1"
      class="widget-anchor"
    >
      <h3 class="widget-title">Modulations-Visualisierer</h3>
      <p class="card-intro">
        Verfahren umschalten, Regler bewegen und beobachten, was mit Zeitverlauf und Spektrum geschieht. Alle Kurven
        werden im Browser berechnet.
      </p>
      <ModulationVisualizer initialKind="am" />
    </div>

    <SectionHeader title="Amplitudenmodulation, DSB und SSB" id="amplitudenmodulation" level={3} />
    {@render prose(MODULATION_TEXT.am)}
    <FormulaBlock {...MODULATION_FORMULAS.am} />
    <FormulaBlock {...MODULATION_FORMULAS.amBandwidth} />
    <Callout tone="warning" title="Übermodulation">
      Ab einem Modulationsgrad über 100 % klappt die Hüllkurve um. Das Signal wird verzerrt und belegt weit mehr
      Bandbreite als zugewiesen — im Visualisierer gut zu sehen, wenn der Regler über 100 % steht.
    </Callout>

    <SectionHeader title="Frequenz- und Phasenmodulation" id="frequenz-und-phasenmodulation" level={3} />
    {@render prose(MODULATION_TEXT.fm)}
    <FormulaBlock {...MODULATION_FORMULAS.carson} />

    <!-- Sprungziel des Widget-Deep-Links `?w=carson` (siehe data/widgets.ts). -->
    <div id={widgetAnchorId('carson')} data-widget="carson" tabindex="-1" class="widget-anchor">
      <h3 class="widget-title">Carson-Rechner</h3>
      <CarsonCalculator />
    </div>
  </section>

  <section aria-labelledby="digitale-verfahren">
    <SectionHeader title="Digitale Verfahren" id="digitale-verfahren" />
    {@render prose(MODULATION_TEXT.digital)}

    <SectionHeader title="Das Konstellationsdiagramm" id="konstellation" level={3} />
    {@render prose(MODULATION_TEXT.konstellation)}

    <!-- Sprungziel des Widget-Deep-Links `?w=constellation` (siehe data/widgets.ts). -->
    <div id={widgetAnchorId('constellation')} data-widget="constellation" tabindex="-1" class="widget-anchor">
      <h3 class="widget-title">Konstellation mit Rauschen</h3>
      <p class="card-intro">
        Der Regler verschlechtert den Störabstand. Bei welchem Wert berühren sich die Wolken benachbarter Symbole?
      </p>
      <ConstellationDiagram initialScheme="qpsk" />
    </div>

    <SectionHeader title="Symbolrate, Bitrate, spektrale Effizienz" id="symbolrate-und-bitrate" level={3} />
    {@render prose(MODULATION_TEXT.raten)}
    <FormulaBlock {...MODULATION_FORMULAS.bitrate} />
    <Callout tone="info" title="Zusammenhang mit der Kanalkapazität">
      Wie viel spektrale Effizienz bei gegebenem Störabstand überhaupt möglich ist, beantwortet die
      Shannon-Hartley-Gleichung. Der
      <a href="/rechner/kanalkapazitaet/">Kanalkapazitäts-Rechner</a> zeigt die Grenze für eigene Werte.
    </Callout>
  </section>

  <section aria-labelledby="mehrtraeger-und-spreizung">
    <SectionHeader title="Mehrträger- und Spreizverfahren" id="mehrtraeger-und-spreizung" />
    {@render prose(MODULATION_TEXT.mehrtraeger)}
    <!-- Sprungziel des Widget-Deep-Links `?w=ofdm` (siehe data/widgets.ts). -->
    <div id={widgetAnchorId('ofdm')} data-widget="ofdm" tabindex="-1" class="widget-anchor">
      <p class="card-intro">
        Warum sich Hunderte Unterträger überlappen dürfen, ohne sich zu stören: Auf der Mittenfrequenz jedes Trägers
        haben alle anderen genau eine Nullstelle — solange der Abstand Δf = 1/T_s eingehalten wird.
      </p>
      <OfdmWidget />
    </div>

    <FormulaBlock {...MODULATION_FORMULAS.spreading} />
    <Callout tone="info" title="Beispiel GPS" source="IS-GPS-200">
      Der C/A-Code läuft mit 1,023 Mchip/s, die Navigationsdaten mit 50 Bit/s. Daraus folgt ein Prozessgewinn von rund
      43 dB — der Grund, warum ein Satellitensignal weit unterhalb des Rauschpegels noch auswertbar ist.
    </Callout>
  </section>

  <section aria-labelledby="vergleich">
    <SectionHeader title="Verfahren im Vergleich" id="vergleich" />
    {@render prose(MODULATION_TEXT.vergleich)}

    <div class="prose">
      <div class="table-scroll">
        <table>
          <caption class="sr-only">
            Modulationsverfahren mit Klasse, Bit je Symbol, spektraler Effizienz, typischer Bandbreite und Robustheit
          </caption>
          <thead>
            <tr>
              <th scope="col">Verfahren</th>
              <th scope="col">Klasse</th>
              <th scope="col">Bit/Symbol</th>
              <th scope="col">Bit/s/Hz</th>
              <th scope="col">typische Bandbreite</th>
              <th scope="col">Robustheit</th>
              <th scope="col">Anwendung</th>
            </tr>
          </thead>
          <tbody>
            {#each MODULATIONS as modulation (modulation.id)}
              <tr>
                <th scope="row">{modulation.abbr}</th>
                <td>{MODULATION_CLASS_LABELS[modulation.class]}</td>
                <td>{modulation.bitsPerSymbol > 0 ? modulation.bitsPerSymbol : '—'}</td>
                <td>
                  {modulation.spectralEfficiencyBpsPerHz > 0
                    ? formatNumber(modulation.spectralEfficiencyBpsPerHz, 2)
                    : '—'}
                </td>
                <td>{formatFrequency(modulation.typicalBandwidthHz)}</td>
                <td>{modulation.robustness}</td>
                <td>{modulation.applicationsDE[0]}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </section>
</ArticleLayout>

<style>
  /* Sprungziel der Widget-Deep-Links: kein eigener Rahmen, nur Abstand beim Scrollen. */
  .widget-anchor {
    scroll-margin-top: 5rem;
  }

  .card-intro {
    margin: 0 0 1rem;
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
  }

  .widget-title {
    margin: 0 0 0.5rem;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }
</style>
