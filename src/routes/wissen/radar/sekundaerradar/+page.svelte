<script lang="ts">
  /**
   * Unterkapitel „Sekundärradar": Inhalte in $lib/content/radar/sekundaerradar.ts,
   * Rendering über den generischen ArticleLayout.
   */
  import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
  import { radarSekundaerArticle } from '$lib/content/radar';
</script>

<ArticleLayout article={radarSekundaerArticle} />
