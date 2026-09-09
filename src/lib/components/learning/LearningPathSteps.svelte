<script lang="ts">
  /**
   * Schrittliste eines Lernpfads: Nummer, Titel, Lernziel, Status und der
   * Link auf das Kapitel. Der Status steht auch als Text in der Liste, damit
   * er nicht allein an einem Icon hängt.
   */
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { learningProgress } from './learningProgress.svelte';
  import { resolvePathSteps, type LearningPath } from '$lib/data/learningPaths';

  interface Props {
    path: LearningPath;
  }

  let { path }: Props = $props();

  // Fortschritt erst nach der Hydration einlesen (siehe learningProgress).
  $effect(() => learningProgress.ensureLoaded());

  const steps = $derived(resolvePathSteps(path));

  function statusOf(href: string): 'erledigt' | 'begonnen' | 'offen' {
    if (learningProgress.isDone(href, path.id)) return 'erledigt';
    return learningProgress.isVisited(href, path.id) ? 'begonnen' : 'offen';
  }

  function handleToggle(href: string) {
    if (learningProgress.isDone(href, path.id)) learningProgress.markOpen(href, path.id);
    else learningProgress.markDone(href, path.id);
  }
</script>

<ol class="steps">
  {#each steps as step (step.href)}
    {@const status = statusOf(step.href)}
    <li class="steps__item" class:steps__item--done={status === 'erledigt'}>
      <span class="steps__marker" aria-hidden="true">
        {#if status === 'erledigt'}
          <Icon name="check" size={16} />
        {:else}
          {step.position}
        {/if}
      </span>

      <div class="steps__body">
        <p class="steps__head">
          <a class="steps__link" href={step.href}>{step.title}</a>
          {#if step.optional}
            <Badge tone="neutral" variant="outline">optional</Badge>
          {/if}
        </p>
        <p class="steps__goal">{step.goal}</p>
        <p class="steps__meta">
          <span class="steps__status">Status: {status}</span>
          <span aria-hidden="true"> · </span>
          <span>{step.node.label}</span>
        </p>
      </div>

      <div class="steps__action">
        <Button
          size="sm"
          variant={status === 'erledigt' ? 'secondary' : 'ghost'}
          icon="check"
          pressed={status === 'erledigt'}
          label={`Schritt ${step.position} „${step.title}" als erledigt markieren`}
          onclick={() => handleToggle(step.href)}
        >
          Erledigt
        </Button>
      </div>
    </li>
  {/each}
</ol>

<style>
  .steps {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin: 0;
    padding: 0;
    list-style: none;
    counter-reset: none;
    border-top: 1px solid var(--color-line-subtle);
  }

  .steps__item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: baseline;
    gap: 0.25rem 0.75rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-line-subtle);
  }

  .steps__item--done .steps__link {
    color: var(--color-ink-subtle);
  }

  .steps__marker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }

  .steps__body {
    min-width: 0;
  }

  .steps__head {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0;
  }

  .steps__link {
    color: var(--color-ink);
    font-weight: var(--font-weight-semibold);
    text-decoration: none;
  }

  .steps__link:hover {
    color: var(--color-brand);
    text-decoration: underline;
  }

  .steps__goal {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
    color: var(--color-ink-muted);
  }

  .steps__meta {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .steps__action {
    display: flex;
    align-items: center;
  }

  @media (max-width: 40rem) {
    .steps__item {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .steps__action {
      grid-column: 2;
    }
  }
</style>
