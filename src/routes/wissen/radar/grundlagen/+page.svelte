<script lang="ts">
  /**
   * Unterkapitel „Radar-Grundlagen": Inhalte in $lib/content/radar/grundlagen.ts,
   * Rendering über den generischen ArticleLayout.
   */
  import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
  import { radarGrundlagenArticle } from '$lib/content/radar';
</script>

<ArticleLayout article={radarGrundlagenArticle} />
