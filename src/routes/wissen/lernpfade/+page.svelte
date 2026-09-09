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
    title="Lernpfade"
    icon="book"
    lead="Geführte Reihenfolgen durch die Kapitel — mit Lernziel je Schritt und gerätelokalem Fortschritt."
  />

  {#if active}
    <Callout tone="info" title={`Aktiver Pfad: ${active.title}`}>
      Beim Aufruf eines Kapitels dieses Pfads erscheint oben eine Leiste mit Schrittzähler und den Schaltflächen für
      zurück, weiter und erledigt.
      <a href={learningPathHref(active.id)}>Alle Schritte ansehen</a>.
    </Callout>
  {/if}

  <section class="page-section" aria-labelledby="alle-pfade">
    <SectionHeader title="Alle Pfade" level={2} id="alle-pfade" />

    <ul class="path-list">
      {#each LEARNING_PATHS as path (path.id)}
        <li>
          <LearningPathCard {path} level={3} />
        </li>
      {/each}
    </ul>
  </section>

  <p class="progress-note">
    Aktiver Pfad und abgehakte Schritte liegen nur im lokalen Speicher dieses Browsers — sie werden nicht übertragen und
    stehen auf anderen Geräten nicht zur Verfügung.
    <Button size="sm" variant="ghost" icon="reset" onclick={handleResetClick}>Fortschritt zurücksetzen</Button>
  </p>

  <RelatedTopics href={HREF} />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .page-section {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .path-list {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--color-line-subtle);
  }

  .progress-note {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-line-subtle);
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }
</style>
