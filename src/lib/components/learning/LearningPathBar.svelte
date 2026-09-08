<script lang="ts">
  /**
   * Pfad-Leiste unterhalb des Kopfbereichs.
   *
   * Sichtbar nur, wenn ein Lernpfad aktiv ist **und** die aktuelle Route ein
   * Schritt dieses Pfads ist. Sie zeigt die Position im Pfad, einen
   * Fortschrittsbalken und die vier Aktionen: zurück, weiter, erledigt,
   * verlassen. Das Betreten eines Schritts wird automatisch vermerkt.
   */
  import { page } from '$app/state';
  import Button from '$lib/components/ui/Button.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import LearningMeter from './LearningMeter.svelte';
  import { learningProgress } from './learningProgress.svelte';
  import { learningPathHref } from '$lib/data/learningPaths';

  // Erst nach der Hydration aus dem Speicher lesen — sonst wiche das
  // Client-Markup vom prerenderten ab.
  $effect(() => learningProgress.ensureLoaded());

  const current = $derived(learningProgress.currentStep(page.url.pathname));

  // Betreten eines Schritts vermerken — markiert ihn als besucht, nicht als
  // erledigt. Der Aufruf ist idempotent und endet deshalb nach einem Durchlauf.
  $effect(() => {
    if (current) learningProgress.visit(current.step.href);
  });

  function handleDoneClick() {
    if (!current) return;
    if (current.done) learningProgress.markOpen(current.step.href);
    else learningProgress.markDone(current.step.href);
  }

  function handleLeaveClick() {
    learningProgress.leave();
  }
</script>

{#if current}
  <nav class="path-bar" aria-label={`Lernpfad ${current.path.title}`}>
    <div class="page-container path-bar__inner">
      <div class="path-bar__text">
        <a class="path-bar__title" href={learningPathHref(current.path.id)}>
          <Icon name={current.path.icon} size={16} />
          <span>Lernpfad „{current.path.title}"</span>
        </a>
        <span class="path-bar__step">
          Schritt {current.number} von {current.total}
          <span class="path-bar__goal"> · {current.step.goal}</span>
        </span>
      </div>

      <LearningMeter
        class="path-bar__meter"
        done={current.progress.done}
        total={current.total}
        label={`Fortschritt im Lernpfad ${current.path.title}`}
      />

      <div class="path-bar__actions">
        <Button
          size="sm"
          variant="ghost"
          icon="chevron-left"
          href={current.prev?.href}
          disabled={!current.prev}
          label="Zum vorherigen Schritt">Zurück</Button
        >
        <Button
          size="sm"
          variant={current.done ? 'secondary' : 'primary'}
          icon="check"
          pressed={current.done}
          onclick={handleDoneClick}
        >
          {current.done ? 'Erledigt' : 'Als erledigt markieren'}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          iconEnd="chevron-right"
          href={current.next?.href}
          disabled={!current.next}
          label="Zum nächsten Schritt">Weiter</Button
        >
        <Button size="sm" variant="ghost" icon="close" onclick={handleLeaveClick}>Pfad verlassen</Button>
      </div>
    </div>
  </nav>
{/if}

<style>
  .path-bar {
    position: sticky;
    /* Direkt unter dem klebenden Kopfbereich (Höhe 44 px + Innenabstand). */
    top: 3.5rem;
    z-index: 30;
    border-bottom: 1px solid var(--color-line);
    background-color: var(--color-elevated);
  }

  .path-bar__inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      'text actions'
      'meter meter';
    align-items: center;
    gap: 0.5rem 1rem;
    padding-block: 0.5rem;
  }

  .path-bar__text {
    grid-area: text;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .path-bar__title {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--color-ink);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    text-decoration: none;
  }

  .path-bar__title:hover {
    color: var(--color-brand);
  }

  .path-bar__step {
    font-size: var(--font-size-xs);
    color: var(--color-ink-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .path-bar__inner :global(.path-bar__meter) {
    grid-area: meter;
  }

  .path-bar__actions {
    grid-area: actions;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Kompakt: auf schmalen Anzeigen entfällt das Lernziel, die Aktionen
     rutschen unter den Text. */
  @media (max-width: 48rem) {
    .path-bar {
      position: static;
    }

    .path-bar__inner {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas:
        'text'
        'meter'
        'actions';
    }

    .path-bar__actions {
      justify-content: flex-start;
    }

    .path-bar__goal {
      display: none;
    }
  }
</style>
