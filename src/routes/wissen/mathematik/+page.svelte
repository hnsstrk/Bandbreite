<script lang="ts">
  /**
   * Kapitel „HF-Mathematik": Inhalte in $lib/content/mathematik.ts.
   * Die Seite rechnet nichts selbst (F-07) – alle Beispiele kommen aus $lib/utils.
   */
  import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
  import { mathematikArticle } from '$lib/content/mathematik';
</script>

<ArticleLayout article={mathematikArticle} />
