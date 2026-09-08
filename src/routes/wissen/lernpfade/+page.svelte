<script lang="ts">
  /**
   * Übersicht der Lernpfade.
   *
   * Jeder Pfad verkettet vorhandene Kapitel und Rechner zu einer Reihenfolge;
   * die Kacheln zeigen Stufe, Dauer und den eigenen Fortschritt.
   */
  import Button from '$lib/components/ui/Button.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import LearningPathCard from '$lib/components/learning/LearningPathCard.svelte';
  import { learningProgress } from '$lib/components/learning/learningProgress.svelte';
  import { LEARNING_PATHS, learningPathHref } from '$lib/data/learningPaths';

  const HREF = '/wissen/lernpfade/';

  // Fortschritt erst nach der Hydration einlesen (siehe learningProgress).
  $effect(() => learningProgress.ensureLoaded());

  const active = $derived(learningProgress.activePath);

  function handleResetClick() {
    learningProgress.reset();
  }
</script>

<div class="page-content">
  <PageHero
    kicker="Wissen"
    title="Lernpfade"
    icon="book"
    lead="Geführte Reihenfolgen durch die Kapitel: Jeder Pfad nennt für jeden Schritt sein Lernziel und merkt sich, wie weit du gekommen bist."
    meta={[
      { label: 'Pfade', value: `${LEARNING_PATHS.length}` },
      { label: 'Fortschritt', value: 'nur in diesem Browser' }
    ]}
  />

  {#if active}
    <Callout tone="info" title={`Aktiver Pfad: ${active.title}`}>
      Beim Aufruf eines Kapitels dieses Pfads erscheint oben eine Leiste mit Schrittzähler und
      den Schaltflächen für zurück, weiter und erledigt.
      <a href={learningPathHref(active.id)}>Alle Schritte ansehen</a>.
    </Callout>
  {/if}

  <section class="page-section" aria-labelledby="alle-pfade">
    <SectionHeader
      title="Alle Pfade"
      level={2}
      id="alle-pfade"
      description="Vom Einstieg bis zur Vertiefung — Schritte lassen sich einzeln abhaken, optionale Schritte sind gekennzeichnet."
    />

    <ul class="path-grid">
      {#each LEARNING_PATHS as path (path.id)}
        <li class="path-grid__cell">
          <LearningPathCard {path} level={3} />
        </li>
      {/each}
    </ul>
  </section>

  <section class="page-section" aria-labelledby="fortschritt">
    <SectionHeader
      title="Wo der Fortschritt liegt"
      level={2}
      id="fortschritt"
      description="Bandbreite kennt keine Anmeldung."
    />
    <Callout tone="info" title="Nur in diesem Browser gespeichert">
      Aktiver Pfad und abgehakte Schritte liegen im lokalen Speicher dieses Browsers. Sie werden
      nicht übertragen und stehen auf anderen Geräten nicht zur Verfügung; ein geleerter
      Browserspeicher setzt sie zurück.
      <span class="page-section__action">
        <Button size="sm" variant="secondary" icon="reset" onclick={handleResetClick}>
          Fortschritt zurücksetzen
        </Button>
      </span>
    </Callout>
  </section>

  <RelatedTopics href={HREF} />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .page-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .page-section__action {
    display: block;
    margin-top: 0.75rem;
  }

  .path-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
    grid-auto-rows: 1fr;
    gap: 1rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .path-grid__cell {
    display: flex;
  }

  .path-grid__cell :global(.path-card) {
    width: 100%;
  }
</style>
