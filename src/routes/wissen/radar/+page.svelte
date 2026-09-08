<script lang="ts">
  /**
   * Kapitel-Hub „Radartechnik": Inhalte in $lib/content/radar/index.ts,
   * Rendering über den generischen ArticleLayout. Die Kacheln der drei
   * Unterkapitel entstehen dort aus `getHubChildren`.
   */
  import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
  import { radarHubArticle } from '$lib/content/radar';
</script>

<ArticleLayout article={radarHubArticle} />
