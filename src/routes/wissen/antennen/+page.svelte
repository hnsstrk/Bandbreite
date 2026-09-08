<script lang="ts">
  /**
   * Wissensseite „Antennen".
   *
   * Aufbau: Lernziele, Inhaltsverzeichnis, sieben Kapitel mit drei
   * eingebetteten Widgets. Texte in `$lib/content/antennen.ts`, Rechnungen in
   * `$lib/utils/antennaMath.ts`.
   */
  import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import FormulaBlock from '$lib/components/ui/FormulaBlock.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import AntennaPolarPattern from '$lib/components/widgets/AntennaPolarPattern.svelte';
  import ParabolicGainCalculator from '$lib/components/widgets/ParabolicGainCalculator.svelte';
  import SwrWidget from '$lib/components/widgets/SwrWidget.svelte';
  import { widgetAnchorId } from '$lib/data/widgets';
  import { ANTENNA_TYPES } from '$lib/data/antennas';
  import { formatNumber } from '$lib/utils/formatting';
  import {
    ANTENNA_CATEGORY_LABELS,
    ANTENNA_FORMULAS,
    ANTENNA_GOALS,
    ANTENNA_TEXT,
    ANTENNA_TOC
  } from '$lib/content/antennen';

  /** Gewinnbereich einer Bauform als Text. */
  function gainRange(minDbi: number, maxDbi: number): string {
    if (minDbi === maxDbi) return `${formatNumber(minDbi, 2)} dBi`;
    return `${formatNumber(minDbi, 1)} – ${formatNumber(maxDbi, 1)} dBi`;
  }
</script>

{#snippet prose(paragraphs: string[])}
  <div class="prose">
    {#each paragraphs as text (text)}
      <p>{text}</p>
    {/each}
  </div>
{/snippet}

<ArticleLayout
  kicker="Wissen"
  title="Antennen"
  icon="antenna"
  lead="Gewinn, Richtwirkung, Polarisation und Anpassung — was eine Antenne wirklich tut und wie man ihre Kennwerte selbst ausrechnet."
  meta={[
    { label: 'Lesezeit', value: 'rund 12 Minuten' },
    { label: 'Grundlage', value: 'IEEE Std 145, ITU-R F.699' }
  ]}
  goals={ANTENNA_GOALS}
  toc={ANTENNA_TOC}
  href="/wissen/antennen/"
>
  <section aria-labelledby="isotropstrahler">
    <SectionHeader title="Der isotrope Strahler, dBi und dBd" id="isotropstrahler" />
    {@render prose(ANTENNA_TEXT.isotrop)}
    <FormulaBlock {...ANTENNA_FORMULAS.dbd} />
    <Callout tone="warning" title="Häufige Verwechslung">
      Herstellerangaben nennen den Gewinn mal in dBi, mal in dBd — und gelegentlich ohne Kennzeichnung. Fehlt die
      Einheit, ist meist der größere Wert in dBi gemeint. Für eine ehrliche Leistungsbilanz gehört die Bezugsgröße immer
      dazu.
    </Callout>
  </section>

  <section aria-labelledby="gewinn-und-richtwirkung">
    <SectionHeader title="Gewinn, Richtwirkung, Wirkungsgrad" id="gewinn-und-richtwirkung" />
    {@render prose(ANTENNA_TEXT.gewinn)}
    <FormulaBlock {...ANTENNA_FORMULAS.beamwidth} />

    <SectionHeader title="Reziprozität: senden gleich empfangen" id="reziprozitaet" level={3} />
    {@render prose(ANTENNA_TEXT.reziprozitaet)}
  </section>

  <section aria-labelledby="richtdiagramm">
    <SectionHeader title="Das Richtdiagramm lesen" id="richtdiagramm" />
    {@render prose(ANTENNA_TEXT.richtdiagramm)}

    <!-- Sprungziel des Widget-Deep-Links `?w=antenna-pattern` (siehe data/widgets.ts). -->
    <div id={widgetAnchorId('antenna-pattern')} data-widget="antenna-pattern" tabindex="-1" class="widget-anchor">
      <Card title="Polardiagramm-Generator" level={3} padding="md">
        <p class="card-intro">
          Bauform wählen und die Kennwerte mitlesen. Bei der linearen Gruppe zeigen die Regler, wie Elementzahl, Abstand
          und Phasenschub die Keule formen und schwenken.
        </p>
        <AntennaPolarPattern initialType="dipol" />
      </Card>
    </div>

    <Callout tone="tip" title="Was der Phasenschub bewirkt">
      Ohne Phasenschub steht die Keule quer zur Gruppenachse. Werden die Elemente fortlaufend verzögert gespeist, kippt
      die Keule zur verzögerten Seite — ganz ohne bewegte Teile. Ab einem Elementabstand über λ/2 tauchen zusätzliche
      Hauptkeulen auf, die im Diagramm sofort sichtbar werden.
    </Callout>
  </section>

  <section aria-labelledby="polarisation">
    <SectionHeader title="Polarisation" id="polarisation" />
    {@render prose(ANTENNA_TEXT.polarisation)}
  </section>

  <section aria-labelledby="impedanz-und-anpassung">
    <SectionHeader title="Impedanz, Anpassung und SWR" id="impedanz-und-anpassung" />
    {@render prose(ANTENNA_TEXT.impedanz)}
    <FormulaBlock {...ANTENNA_FORMULAS.swr} />

    <!-- Sprungziel des Widget-Deep-Links `?w=swr` (siehe data/widgets.ts). -->
    <div id={widgetAnchorId('swr')} data-widget="swr" tabindex="-1" class="widget-anchor">
      <Card title="Anpassung im Zusammenhang" level={3} tone="sunken" padding="md">
        <SwrWidget />
      </Card>
    </div>
  </section>

  <section aria-labelledby="apertur-und-fernfeld">
    <SectionHeader title="Apertur, Wirkfläche und Fernfeld" id="apertur-und-fernfeld" />
    {@render prose(ANTENNA_TEXT.apertur)}
    <FormulaBlock {...ANTENNA_FORMULAS.parabolic} />
    <FormulaBlock {...ANTENNA_FORMULAS.aperture} />

    <!-- Sprungziel des Widget-Deep-Links `?w=parabolic-gain` (siehe data/widgets.ts). -->
    <div id={widgetAnchorId('parabolic-gain')} data-widget="parabolic-gain" tabindex="-1" class="widget-anchor">
      <Card title="Parabolantennen-Rechner" level={3} padding="md">
        <p class="card-intro">
          Durchmesser, Frequenz und Wirkungsgrad eingeben — Gewinn, Öffnungswinkel, Wirkfläche und Fernfeldbeginn folgen
          daraus.
        </p>
        <ParabolicGainCalculator />
      </Card>
    </div>

    <Callout tone="info" title="Weiterrechnen">
      Den ermittelten Gewinn übernimmt man direkt in die
      <a href="/rechner/link-budget/">Leistungsbilanz</a>; wie viel der Weg selbst kostet, zeigt der
      <a href="/rechner/fspl/">Freiraumdämpfungs-Rechner</a>.
    </Callout>
  </section>

  <section aria-labelledby="bauformen">
    <SectionHeader title="Bauformen im Überblick" id="bauformen" />
    {@render prose(ANTENNA_TEXT.bauformen)}

    <div class="prose">
      <div class="table-scroll">
        <table>
          <caption class="sr-only">
            Antennenbauformen mit Kategorie, Gewinnbereich, Öffnungswinkel, Fußpunktimpedanz, relativer Bandbreite und
            Polarisation
          </caption>
          <thead>
            <tr>
              <th scope="col">Bauform</th>
              <th scope="col">Kategorie</th>
              <th scope="col">Gewinn</th>
              <th scope="col">Öffnungswinkel</th>
              <th scope="col">Impedanz</th>
              <th scope="col">rel. Bandbreite</th>
              <th scope="col">Polarisation</th>
            </tr>
          </thead>
          <tbody>
            {#each ANTENNA_TYPES as antenna (antenna.id)}
              <tr>
                <th scope="row">{antenna.nameDE}</th>
                <td>{ANTENNA_CATEGORY_LABELS[antenna.category]}</td>
                <td>{gainRange(antenna.gainMinDbi, antenna.gainMaxDbi)}</td>
                <td>
                  {antenna.beamwidthDeg >= 360 ? 'rundstrahlend' : `${formatNumber(antenna.beamwidthDeg, 0)}°`}
                </td>
                <td>
                  {antenna.impedanceOhm > 0 ? `${formatNumber(antenna.impedanceOhm, 0)} Ω` : '—'}
                </td>
                <td>
                  {antenna.relativeBandwidthPercent > 0
                    ? `${formatNumber(antenna.relativeBandwidthPercent, 0)} %`
                    : '—'}
                </td>
                <td>{antenna.polarization}</td>
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
</style>
