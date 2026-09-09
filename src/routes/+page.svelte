<script lang="ts">
  /**
   * Portalseite unter „/" (Entscheidung E1, Variante B).
   *
   * Der Einstieg in alle fünf Bereiche — bewusst kein zweites Spektrum-
   * Dashboard: `/spektrum/` behält seine Kernkomponenten unverändert.
   * Bereiche, Werkzeuge und Lernpfade stehen als dichte Linklisten, nicht als
   * Kachelraster; die Daten stammen aus der Navigations-Registry.
   */
  import PortalAreas from '$lib/components/portal/PortalAreas.svelte';
  import PortalSearch from '$lib/components/portal/PortalSearch.svelte';
  import PortalLearningPaths from '$lib/components/portal/PortalLearningPaths.svelte';
  import PortalTiles from '$lib/components/portal/PortalTiles.svelte';
  import { INTERACTIVE_TILES, toolTiles } from '$lib/components/portal/portalContent';

  const tools = toolTiles();
</script>

<div class="page-content">
  <header class="portal-head">
    <h1 class="text-heading-1">Bandbreite</h1>
    <p class="portal-head__lead">
      Das elektromagnetische Spektrum von 3 Hz bis in den Gammabereich: Visualisierungen, Rechner und ein
      Nachschlagewerk zur Funk- und Fernmeldetechnik.
    </p>
  </header>

  <section class="portal-section" aria-labelledby="suche">
    <h2 id="suche" class="sr-only">Suche</h2>
    <PortalSearch />
  </section>

  <section class="portal-section" aria-labelledby="bereiche">
    <h2 id="bereiche" class="portal-section__heading">Bereiche</h2>
    <PortalAreas />
  </section>

  <section class="portal-section" aria-labelledby="interaktiv-lernen">
    <h2 id="interaktiv-lernen" class="portal-section__heading">Interaktiv lernen</h2>
    <PortalTiles items={INTERACTIVE_TILES} label="Interaktive Kapitel" />
  </section>

  <section class="portal-section" aria-labelledby="werkzeuge">
    <h2 id="werkzeuge" class="portal-section__heading">Werkzeuge</h2>
    <PortalTiles items={tools} label="Rechner und Konverter" />
  </section>

  <PortalLearningPaths />

  <p class="portal-note">
    Alle Zahlen stammen aus benannten Quellen (ITU-R, BNetzA, IARU, 3GPP); Herkunft und Stand stehen unter
    <a href="/service/quellen/">Quellen &amp; Stand</a>. Bandbreite ist eine Lernanwendung und kein amtliches Dokument.
  </p>
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .portal-head__lead {
    margin: 0.25rem 0 0;
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    color: var(--color-ink-muted);
  }

  .portal-section {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .portal-section__heading {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .portal-note {
    margin: 0;
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-line-subtle);
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }

  .portal-note a {
    color: var(--color-brand);
  }
</style>
