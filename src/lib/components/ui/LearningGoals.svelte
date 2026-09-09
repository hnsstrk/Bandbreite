<script lang="ts">
  /**
   * Lernziele eines Kapitels — kompakte Liste unter der Überschrift
   * „Lernziele". Kein Kasten, keine Fläche, keine Icons: nur eine
   * Aufzählung im Datenblatt-Stil.
   */
  interface Props {
    goals: string[];
    /** Überschrift der Liste */
    title?: string;
    /** Überschriftenebene des Blocktitels */
    level?: 2 | 3;
    class?: string;
  }

  let { goals, title = 'Lernziele', level = 2, class: klass = '' }: Props = $props();

  const headingId = $props.id();
</script>

<section class="ui-goals {klass}" aria-labelledby={headingId}>
  <svelte:element this={`h${level}`} id={headingId} class="ui-goals__title">
    {title}
  </svelte:element>
  <ul class="ui-goals__list">
    {#each goals as goal (goal)}
      <li class="ui-goals__item">{goal}</li>
    {/each}
  </ul>
</section>

<style>
  .ui-goals {
    margin: 0;
  }

  .ui-goals__title {
    margin: 0 0 0.25rem;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink-subtle);
  }

  .ui-goals__list {
    list-style: disc;
    margin: 0;
    padding-left: 1.125rem;
  }

  .ui-goals__item {
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
    color: var(--color-ink-muted);
  }
</style>
