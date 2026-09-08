<script lang="ts">
  /**
   * Detailseite eines Lernpfads: Stufe, Dauer, Fortschritt und die
   * nummerierte Schrittliste mit Lernziel je Schritt.
   */
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import PageHero from '$lib/components/ui/PageHero.svelte';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import LearningMeter from '$lib/components/learning/LearningMeter.svelte';
  import LearningPathSteps from '$lib/components/learning/LearningPathSteps.svelte';
  import { learningProgress } from '$lib/components/learning/learningProgress.svelte';
  import {
    LEVEL_LABELS,
    findLearningPath,
    resolvePathSteps
  } from '$lib/data/learningPaths';

  let { data } = $props();

  // Fortschritt erst nach der Hydration einlesen (siehe learningProgress).
  $effect(() => learningProgress.ensureLoaded());

  const path = $derived(findLearningPath(data.pathId));
  const steps = $derived(resolvePathSteps(path));
  const progress = $derived(learningProgress.progress(data.pathId));
  const isActive = $derived(learningProgress.activePathId === data.pathId);

  async function handleStartClick() {
    if (!path) return;
    learningProgress.startPath(path.id);
    const target = progress.nextHref ?? steps[0]?.href;
    if (target) await goto(target);
  }

  function handleLeaveClick() {
    learningProgress.leave();
  }

  function handleResetClick() {
    learningProgress.reset(data.pathId);
  }
</script>

{#if path}
  <div class="page-content">
    <PageHero
      kicker="Lernpfad"
      title={path.title}
      icon={path.icon}
      lead={path.lead}
      badge={LEVEL_LABELS[path.level]}
      meta={[
        { label: 'Schritte', value: `${steps.length}` },
        { label: 'Dauer', value: `rund ${path.durationMin} Minuten` },
        { label: 'Erledigt', value: `${progress.done} von ${steps.length}` }
      ]}
    >
      <Button variant="primary" icon="play" onclick={handleStartClick}>
        {progress.started ? 'Pfad fortsetzen' : 'Pfad starten'}
      </Button>
      {#if isActive}
        <Button variant="ghost" icon="close" onclick={handleLeaveClick}>Pfad verlassen</Button>
      {/if}
    </PageHero>

    <LearningMeter
      done={progress.done}
      total={steps.length}
      label={`Fortschritt im Lernpfad ${path.title}`}
      showCount
    />

    <section class="page-section" aria-labelledby="schritte">
      <SectionHeader
        title="Die Schritte"
        level={2}
        id="schritte"
        description="Der Reihe nach gedacht — Reihenfolge und Lernziel sind Empfehlung, kein Zwang."
      />
      <LearningPathSteps {path} />
    </section>

    {#if progress.complete}
      <Callout tone="tip" title="Pfad abgeschlossen">
        Alle Schritte sind abgehakt. Weiter geht es mit einem anderen
        <a href="/wissen/lernpfade/">Lernpfad</a> oder direkt in den
        <a href="/rechner/">Rechnern</a>.
      </Callout>
    {/if}

    <Callout tone="info" title="Fortschritt nur in diesem Browser">
      Abgehakte Schritte liegen im lokalen Speicher dieses Browsers und werden nicht übertragen.
      <span class="page-section__action">
        <Button size="sm" variant="secondary" icon="reset" onclick={handleResetClick}>
          Diesen Pfad zurücksetzen
        </Button>
      </span>
    </Callout>

    <RelatedTopics href="/wissen/lernpfade/" />
  </div>
{/if}

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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
</style>
