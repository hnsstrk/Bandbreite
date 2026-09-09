<script lang="ts">
  /**
   * Zeile eines Lernpfads: Stufe, Dauer, Schrittzahl, Fortschritt und der
   * Einstieg. „Starten" führt zum ersten offenen Schritt und setzt den Pfad
   * zugleich aktiv; „Fortsetzen" erscheint, sobald Fortschritt vorliegt.
   * Bewusst ohne Karte — eine Datenzeile mit Trennlinie.
   */
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import LearningMeter from './LearningMeter.svelte';
  import { learningProgress } from './learningProgress.svelte';
  import { LEVEL_LABELS, learningPathHref, resolvePathSteps, type LearningPath } from '$lib/data/learningPaths';

  interface Props {
    path: LearningPath;
    /** Überschriftenebene der Zeile. */
    level?: 2 | 3;
  }

  let { path, level = 2 }: Props = $props();

  // Fortschritt erst nach der Hydration einlesen (siehe learningProgress).
  $effect(() => learningProgress.ensureLoaded());

  const steps = $derived(resolvePathSteps(path));
  const progress = $derived(learningProgress.progress(path.id));

  async function handleStartClick() {
    learningProgress.startPath(path.id);
    const target = progress.nextHref ?? steps[0]?.href;
    if (target) await goto(target);
  }
</script>

<div class="path-row">
  <div class="path-row__main">
    <svelte:element this={`h${level}`} class="path-row__title">
      <a href={learningPathHref(path.id)}>{path.title}</a>
    </svelte:element>
    <p class="path-row__lead">{path.lead}</p>
    <p class="path-row__meta">
      {LEVEL_LABELS[path.level]} · {steps.length} Schritte · rund {path.durationMin} Minuten
    </p>
  </div>

  <div class="path-row__side">
    <LearningMeter done={progress.done} total={steps.length} showCount />
    <div class="path-row__actions">
      <Button size="sm" variant="primary" icon="play" onclick={handleStartClick}>
        {progress.started ? 'Fortsetzen' : 'Starten'}
      </Button>
      <Button size="sm" variant="ghost" href={learningPathHref(path.id)}>Alle Schritte</Button>
    </div>
  </div>
</div>

<style>
  .path-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.5rem 1.5rem;
    width: 100%;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--color-line-subtle);
  }

  @media (min-width: 48rem) {
    .path-row {
      grid-template-columns: minmax(0, 1fr) minmax(12rem, 16rem);
      align-items: start;
    }
  }

  .path-row__title {
    margin: 0;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .path-row__title a {
    color: inherit;
    text-decoration: none;
  }

  .path-row__title a:hover {
    color: var(--color-brand);
    text-decoration: underline;
  }

  .path-row__lead {
    margin: 0.125rem 0 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
    color: var(--color-ink-muted);
  }

  .path-row__meta {
    margin: 0.125rem 0 0;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .path-row__side {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .path-row__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>
