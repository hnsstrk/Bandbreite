<script lang="ts">
	/**
	 * Generischer Renderer eines Wissen-Kapitels (Bericht 05, §4.3):
	 *
	 *   [ TableOfContents 15rem, sticky ] [ Inhalt: Lesebreite 68ch, Widgets volle Spalte ]
	 *
	 * Ab < 1280 px wandert das Inhaltsverzeichnis als <details> unter den Hero.
	 * Kopf: PageHero + LearningGoals; Fuß: Quellen, Prev/Next, RelatedTopics.
	 */
	import type { KnowledgeArticle } from '$lib/content/types';
	import type { TocItem } from '$lib/components/ui/TableOfContents.svelte';
	import PageHero from '$lib/components/ui/PageHero.svelte';
	import LearningGoals from '$lib/components/ui/LearningGoals.svelte';
	import TableOfContents from '$lib/components/ui/TableOfContents.svelte';
	import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
	import ArticleSection from './ArticleSection.svelte';
	import ArticlePagination from './ArticlePagination.svelte';

	interface Props {
		article: KnowledgeArticle;
	}

	let { article }: Props = $props();

	const tocItems = $derived<TocItem[]>(
		article.sections.flatMap((section) => [
			{ id: section.id, label: section.title, level: 2 as const },
			...(section.children ?? []).map((child) => ({ id: child.id, label: child.title, level: 3 as const }))
		])
	);
</script>

<article class="article">
	<PageHero kicker={article.kicker} title={article.title} lead={article.lead} icon={article.icon} meta={article.meta ?? []} />

	<div class="article__grid">
		<aside class="article__aside">
			<TableOfContents items={tocItems} />
		</aside>

		<div class="article__body">
			<LearningGoals goals={article.goals} class="article__goals" />

			{#each article.sections as section (section.id)}
				<ArticleSection {section} level={2} />
			{/each}

			{#if article.sources?.length}
				<section class="article__sources prose" aria-labelledby="quellen-heading">
					<h2 id="quellen-heading">Quellen</h2>
					<ul>
						{#each article.sources as source (source)}
							<li>{@html source}</li>
						{/each}
					</ul>
				</section>
			{/if}

			<ArticlePagination href={article.href} />
			<RelatedTopics href={article.href} />
		</div>
	</div>
</article>

<style>
	.article {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 0 0.5rem;
	}

	.article__grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.5rem;
		align-items: start;
	}

	@media (min-width: 1280px) {
		.article__grid {
			grid-template-columns: 15rem minmax(0, 1fr);
			gap: 3rem;
		}
	}

	.article__aside {
		min-width: 0;
	}

	.article__body {
		min-width: 0;
	}

	.article__body :global(.article__goals) {
		max-width: var(--container-prose);
	}

	.article__sources {
		margin-top: 2.5rem;
	}

	.article__sources h2 {
		font-size: var(--font-size-lg);
	}
</style>
