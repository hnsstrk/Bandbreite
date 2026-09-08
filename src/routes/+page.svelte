<script lang="ts">
  /**
   * Portalseite unter „/" (Entscheidung E1, Variante B).
   *
   * Der Einstieg in alle fünf Bereiche — bewusst kein zweites Spektrum-
   * Dashboard: `/spektrum/` behält seine Kernkomponenten unverändert.
   * Bereichskacheln und Werkzeugliste stammen aus der Navigations-Registry.
   */
  import Callout from '$lib/components/ui/Callout.svelte';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import PortalAreas from '$lib/components/portal/PortalAreas.svelte';
  import PortalSearch from '$lib/components/portal/PortalSearch.svelte';
  import PortalTiles from '$lib/components/portal/PortalTiles.svelte';
  import { INTERACTIVE_TILES, toolTiles } from '$lib/components/portal/portalContent';

  const tools = toolTiles();
</script>

<div class="page-content">
  <PageHero
    kicker="Bandbreite"
    title="Das elektromagnetische Spektrum verstehen, rechnen, nachschlagen"
    icon="spectrum"
    lead="Von 3 Hz bis in den Gammabereich: interaktive Visualisierungen, Rechner für die Hochfrequenztechnik und ein Nachschlagewerk zur Funk- und Fernmeldetechnik — alles in einer Anwendung, ohne Anmeldung."
  />

  <section class="portal-section" aria-labelledby="suche">
    <h2 id="suche" class="sr-only">Suche</h2>
    <PortalSearch />
  </section>

  <section class="portal-section" aria-labelledby="bereiche">
    <SectionHeader
      title="Bereiche"
      level={2}
      id="bereiche"
      description="Fünf Einstiege — vom Spektrum über die Werkzeuge bis zu den Datensätzen."
    />
    <PortalAreas />
  </section>

  <section class="portal-section" aria-labelledby="interaktiv-lernen">
    <SectionHeader
      title="Interaktiv lernen"
      level={2}
      id="interaktiv-lernen"
      description="Kapitel mit Reglern und Bühne: Jede Kachel springt direkt zum Widget."
    />
    <PortalTiles items={INTERACTIVE_TILES} label="Interaktive Kapitel" />
  </section>

  <section class="portal-section" aria-labelledby="werkzeuge">
    <SectionHeader
      title="Werkzeuge"
      level={2}
      id="werkzeuge"
      description="Eingabe, Formel, Ergebnis — jeder Rechner hält seinen Zustand in der URL und lässt sich als Link teilen."
    />
    <PortalTiles items={tools} label="Rechner und Konverter" />
  </section>

  <Callout tone="info" title="Quellen und Haftungsausschluss">
    Alle Zahlen stammen aus benannten Quellen — ITU-R-Empfehlungen, BNetzA-Verfügungen, IARU-
    Bandpläne, 3GPP-Spezifikationen und Standardwerke der Radartechnik. Herkunft, Stand und die
    ausdrücklich unsicheren Angaben stehen unter
    <a href="/service/quellen/">Quellen &amp; Stand</a>. Bandbreite ist eine Lernanwendung und
    <strong>kein amtliches Dokument</strong>: Für Frequenzzuteilungen, Not- und Sicherheitsverkehr
    sowie jede rechtlich verbindliche Auskunft gelten allein die Veröffentlichungen der zuständigen
    Verwaltungen.
  </Callout>
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .portal-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
