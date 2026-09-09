<script lang="ts">
  /**
   * Lernpfade auf der Portalseite als dichte Liste: Titel, Stufe, Schrittzahl
   * und Dauer in einer Zeile. Der Fortschritt steht auf `/wissen/lernpfade/`.
   */
  import { LEARNING_PATHS, LEVEL_LABELS, learningPathHref, resolvePathSteps } from '$lib/data/learningPaths';

  const paths = LEARNING_PATHS.map((path) => ({
    ...path,
    href: learningPathHref(path.id),
    steps: resolvePathSteps(path).length
  }));
</script>

<section class="paths" aria-labelledby="lernpfade">
  <h2 id="lernpfade" class="paths__heading">Lernpfade</h2>
  <p class="paths__lead">Geführte Reihenfolgen über mehrere Kapitel — mit Lernziel je Schritt.</p>

  <dl class="paths__list" aria-label="Lernpfade">
    {#each paths as path (path.id)}
      <div class="paths__row">
        <dt class="paths__term"><a href={path.href}>{path.title}</a></dt>
        <dd class="paths__text">
          {path.lead}
          <span class="paths__meta">
            {LEVEL_LABELS[path.level]} · {path.steps} Schritte · rund {path.durationMin} Minuten
          </span>
        </dd>
      </div>
    {/each}
  </dl>
</section>

<style>
  .paths {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .paths__heading {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .paths__lead {
    margin: 0 0 0.25rem;
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
  }

  .paths__list {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--color-line-subtle);
  }

  .paths__row {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.125rem 1rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-line-subtle);
  }

  @media (min-width: 40rem) {
    .paths__row {
      grid-template-columns: minmax(9rem, 14rem) minmax(0, 1fr);
      align-items: baseline;
    }
  }

  .paths__term {
    font-weight: var(--font-weight-semibold);
  }

  .paths__term a {
    color: var(--color-ink);
    text-decoration: none;
  }

  .paths__term a:hover {
    color: var(--color-brand);
    text-decoration: underline;
  }

  .paths__text {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
    color: var(--color-ink-muted);
  }

  .paths__meta {
    color: var(--color-ink-subtle);
  }
</style>
