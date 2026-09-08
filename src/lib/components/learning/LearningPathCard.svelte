<script lang="ts">
  /**
   * Kachel eines Lernpfads: Stufe, Dauer, Schrittzahl, Fortschritt und der
   * Einstieg. „Starten" führt zum ersten offenen Schritt und setzt den Pfad
   * zugleich aktiv; „Fortsetzen" erscheint, sobald Fortschritt vorliegt.
   */
  import { goto } from '$app/navigation';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import LearningMeter from './LearningMeter.svelte';
  import { learningProgress } from './learningProgress.svelte';
  import {
    LEVEL_LABELS,
    LEVEL_TONES,
    learningPathHref,
    resolvePathSteps,
    type LearningPath
  } from '$lib/data/learningPaths';

  interface Props {
    path: LearningPath;
    /** Überschriftenebene der Kachel. */
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

<Card title={path.title} {level} icon={path.icon} class="path-card">
  {#snippet actions()}
    <Badge tone={LEVEL_TONES[path.level]} srPrefix="Stufe">{LEVEL_LABELS[path.level]}</Badge>
  {/snippet}

  <p class="path-card__lead">{path.lead}</p>

  <dl class="path-card__meta">
    <div>
      <dt>Dauer</dt>
      <dd>rund {path.durationMin} Minuten</dd>
    </div>
    <div>
      <dt>Schritte</dt>
      <dd>{steps.length}</dd>
    </div>
  </dl>

  {#snippet footer()}
    <div class="path-card__footer">
      <LearningMeter done={progress.done} total={steps.length} showCount />
      <div class="path-card__actions">
        <Button size="sm" variant="primary" icon="play" onclick={handleStartClick}>
          {progress.started ? 'Fortsetzen' : 'Starten'}
        </Button>
        <Button size="sm" variant="ghost" href={learningPathHref(path.id)}>Alle Schritte</Button>
      </div>
    </div>
  {/snippet}
</Card>

<style>
  /* Gleich hohe Kacheln: der Fuß mit Balken und Aktionen sitzt unten. */
  :global(.path-card) {
    height: 100%;
  }

  :global(.path-card > .ui-card__body) {
    flex: 1 1 auto;
  }

  .path-card__lead {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
    color: var(--color-ink-muted);
  }

  .path-card__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin: 0.75rem 0 0;
    font-size: var(--font-size-xs);
  }

  .path-card__meta div {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
  }

  .path-card__meta dt {
    color: var(--color-ink-subtle);
  }

  .path-card__meta dd {
    margin: 0;
    color: var(--color-ink);
    font-weight: var(--font-weight-medium);
  }

  .path-card__footer {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .path-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>
