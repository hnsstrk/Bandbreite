<script lang="ts">
  /**
   * Kapitel-Hub „Grundlagen": Lernziele und Einstiegshinweise aus
   * $lib/content/grundlagen/index.ts, die Kacheln der Unterkapitel aus der
   * Navigations-Registry (`getHubChildren`) — es gibt keine zweite Liste.
   */
  import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
  import ArticleSection from '$lib/components/knowledge/ArticleSection.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import type { TocItem } from '$lib/components/ui/TableOfContents.svelte';
  import { getHubChildren } from '$lib/data/navigation';
  import { grundlagenHub, GRUNDLAGEN_TILES_ID } from '$lib/content/grundlagen/index';

  const children = getHubChildren(grundlagenHub.href);

  const toc: TocItem[] = [
    { id: GRUNDLAGEN_TILES_ID, label: 'Die drei Kapitel', level: 2 },
    ...grundlagenHub.sections.map((section) => ({
      id: section.id,
      label: section.title,
      level: 2 as const
    }))
  ];
</script>

<ArticleLayout
  href={grundlagenHub.href}
  title={grundlagenHub.title}
  kicker={grundlagenHub.kicker}
  lead={grundlagenHub.lead}
  icon={grundlagenHub.icon}
  meta={grundlagenHub.meta}
  goals={grundlagenHub.goals}
  sources={grundlagenHub.sources}
  {toc}
>
  <section id={GRUNDLAGEN_TILES_ID} aria-labelledby="{GRUNDLAGEN_TILES_ID}-heading">
    <SectionHeader
      title="Die drei Kapitel"
      level={2}
      id="{GRUNDLAGEN_TILES_ID}-heading"
      description="In dieser Reihenfolge bauen sie aufeinander auf."
    />
    <ol class="steps">
      {#each children as child (child.id)}
        <li class="step">
          <a class="step__title" href={child.href}>{child.label}</a>
          <span class="step__text">{child.description}</span>
        </li>
      {/each}
    </ol>
  </section>

  {#each grundlagenHub.sections as section (section.id)}
    <ArticleSection {section} level={2} />
  {/each}
</ArticleLayout>

<style>
  .steps {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
    margin: 0.75rem 0 0;
    padding: 0 0 0 1.5rem;
    border-top: 1px solid var(--color-line-subtle);
  }

  .step {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.125rem 1rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-line-subtle);
  }

  @media (min-width: 40rem) {
    .step {
      grid-template-columns: minmax(9rem, 16rem) minmax(0, 1fr);
      align-items: baseline;
    }
  }

  .step__title {
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
    text-decoration: none;
  }

  .step__title:hover {
    color: var(--color-brand);
    text-decoration: underline;
  }

  .step__text {
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
    color: var(--color-ink-muted);
  }
</style>
