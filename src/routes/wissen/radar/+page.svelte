<script lang="ts">
  /**
   * Kapitel „Radar-Grundlagen": Inhalte in $lib/content/radar.ts,
   * Rendering über den generischen ArticleLayout (Inhaltsverzeichnis, Lernziele,
   * Abschnitte mit Widgets, Prev/Next, verwandte Themen).
   */
  import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
  import { radarArticle } from '$lib/content/radar';
</script>

<ArticleLayout article={radarArticle} />
