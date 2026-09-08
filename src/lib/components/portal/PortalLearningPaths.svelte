<script lang="ts">
  /**
   * Kachelreihe „Lernpfade" auf der Portalseite.
   *
   * Jede Kachel führt auf die Detailseite eines Pfads; Stufe, Dauer und
   * Schrittzahl stehen als Etikett und Kurzangabe darunter. Der Fortschritt
   * selbst steht auf der Übersicht `/wissen/lernpfade/`.
   */
  import Badge from '$lib/components/ui/Badge.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import {
    LEARNING_PATHS,
    LEVEL_LABELS,
    LEVEL_TONES,
    learningPathHref,
    resolvePathSteps
  } from '$lib/data/learningPaths';

  const paths = LEARNING_PATHS.map((path) => ({
    ...path,
    href: learningPathHref(path.id),
    steps: resolvePathSteps(path).length
  }));
</script>

<section class="portal-paths" aria-labelledby="lernpfade">
  <SectionHeader
    title="Lernpfade"
    level={2}
    id="lernpfade"
    description="Geführte Reihenfolgen über mehrere Kapitel — mit Lernziel je Schritt und Fortschrittsanzeige."
  />

  <ul class="portal-paths__grid" aria-label="Lernpfade">
    {#each paths as path (path.id)}
      <li class="portal-paths__cell">
        <Card href={path.href} title={path.title} level={3} icon={path.icon} class="portal-paths__card">
          {#snippet actions()}
            <Badge tone={LEVEL_TONES[path.level]} srPrefix="Stufe">
              {LEVEL_LABELS[path.level]}
            </Badge>
          {/snippet}
          <p class="portal-paths__text">{path.lead}</p>
          <p class="portal-paths__meta">
            {path.steps} Schritte · rund {path.durationMin} Minuten
          </p>
        </Card>
      </li>
    {/each}
  </ul>
</section>

<style>
  .portal-paths {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .portal-paths__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
    grid-auto-rows: 1fr;
    gap: 1rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .portal-paths__cell {
    display: flex;
  }

  .portal-paths__cell :global(.portal-paths__card) {
    width: 100%;
  }

  .portal-paths__text {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
    color: var(--color-ink-muted);
  }

  .portal-paths__meta {
    margin: 0.5rem 0 0;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }
</style>
