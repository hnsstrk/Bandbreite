<script lang="ts">
  /**
   * Ein Abschnitt eines Wissen-Kapitels: `<section id>` mit SectionHeader
   * (h2 bzw. h3 für Unterabschnitte) und den zugehörigen Blöcken.
   */
  import type { ArticleSection } from '$lib/content/types';
  import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
  import ArticleBlock from './ArticleBlock.svelte';
  import Self from './ArticleSection.svelte';

  interface Props {
    section: ArticleSection;
    level?: 2 | 3;
  }

  let { section, level = 2 }: Props = $props();
</script>

<section class="article-section article-section--l{level}" id={section.id} aria-labelledby="{section.id}-heading">
  <SectionHeader
    title={section.title}
    {level}
    id="{section.id}-heading"
    eyebrow={section.eyebrow}
    description={section.description}
    class="prose"
  />
  <div class="article-section__body">
    {#each section.blocks as block, i (i)}
      <ArticleBlock {block} {level} />
    {/each}
  </div>
  {#if section.children?.length && level === 2}
    {#each section.children as child (child.id)}
      <Self section={child} level={3} />
    {/each}
  {/if}
</section>

<style>
  .article-section {
    scroll-margin-top: 5rem;
  }

  .article-section--l2 {
    margin-top: 2.5rem;
  }

  .article-section--l3 {
    margin-top: 1.75rem;
  }

  .article-section__body {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }
</style>
