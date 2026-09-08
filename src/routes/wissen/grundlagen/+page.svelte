<script lang="ts">
  /**
   * Kapitel-Hub „Grundlagen": Lernziele und Einstiegshinweise aus
   * $lib/content/grundlagen/index.ts, die Kacheln der Unterkapitel aus der
   * Navigations-Registry (`getHubChildren`) — es gibt keine zweite Liste.
   */
  import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
  import ArticleSection from '$lib/components/knowledge/ArticleSection.svelte';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { isIconName } from '$lib/components/ui/icons';
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
      class="prose"
    />
    <ol class="tiles">
      {#each children as child, index (child.id)}
        <li>
          <a class="tile" href={child.href}>
            <span class="tile__step" aria-hidden="true">{index + 1}</span>
            <span class="tile__body">
              <span class="tile__title">
                {#if child.icon && isIconName(child.icon)}
                  <Icon name={child.icon} size={18} />
                {/if}
                {child.label}
              </span>
              <span class="tile__text">{child.description}</span>
            </span>
            <span class="tile__arrow" aria-hidden="true"><Icon name="arrow-right" size={18} /></span>
          </a>
        </li>
      {/each}
    </ol>
  </section>

  {#each grundlagenHub.sections as section (section.id)}
    <ArticleSection {section} level={2} />
  {/each}
</ArticleLayout>

<style>
  .tiles {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.75rem;
    list-style: none;
    margin: 1.25rem 0 0;
    padding: 0;
    counter-reset: none;
  }

  .tile {
    display: grid;
    grid-template-columns: 2.25rem minmax(0, 1fr) 1.5rem;
    align-items: center;
    gap: 0.875rem;
    padding: 1rem 1.125rem;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-card);
    background-color: var(--color-surface);
    text-decoration: none;
    color: inherit;
    transition:
      border-color var(--transition-fast),
      transform var(--transition-fast);
  }

  .tile:hover {
    border-color: var(--color-brand);
    transform: translateY(-2px);
  }

  .tile:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  .tile__step {
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--radius-full);
    background-color: var(--color-brand-soft);
    color: var(--color-brand-ink);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
  }

  .tile__body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .tile__title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .tile__text {
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
    color: var(--color-ink-muted);
  }

  .tile__arrow {
    color: var(--color-ink-subtle);
  }
</style>
