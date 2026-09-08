<script lang="ts">
	/**
	 * Kanonischer Renderer eines Wissen-Kapitels (Bericht 05, §4.3):
	 *
	 *   [ TableOfContents 15rem, klebrig ] [ Inhalt: Lesebreite 68ch, Widgets volle Spalte ]
	 *
	 * Ab < 1280 px wandert das Inhaltsverzeichnis als <details> unter den Hero.
	 * Kopf: PageHero + LearningGoals; Fuß: Quellen, Prev/Next, RelatedTopics.
	 *
	 * Zwei Betriebsarten:
	 *
	 * 1. **Content-Modell** — `article={…}` (`KnowledgeArticle`); Abschnitte,
	 *    Inhaltsverzeichnis und Quellen entstehen aus den Daten.
	 * 2. **Direktes Markup** — `title`, `lead`, `toc`, `goals`, `href` und ein
	 *    Kind-Snippet. Dafür brauchen die Kapitel, die eigene Widgets zwischen
	 *    die Abschnitte setzen, keine eigene Rastergeometrie mehr.
	 */
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import type { KnowledgeArticle } from '$lib/content/types';
	import { parseWidgetParam, widgetAnchorId } from '$lib/data/widgets';
	import type { TocItem } from '$lib/components/ui/TableOfContents.svelte';
	import type { IconName } from '$lib/components/ui/icons';
	import PageHero from '$lib/components/ui/PageHero.svelte';
	import LearningGoals from '$lib/components/ui/LearningGoals.svelte';
	import TableOfContents from '$lib/components/ui/TableOfContents.svelte';
	import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
	import ArticleSection from './ArticleSection.svelte';
	import ArticlePagination from './ArticlePagination.svelte';

	interface Props {
		/** Kapitel als Datenmodell; schließt `children` aus. */
		article?: KnowledgeArticle;
		/** Abschnitte als Markup, wenn kein `article` übergeben wird. */
		children?: Snippet;
		/** Pfad der Seite mit Schrägstrich am Ende (Kapitelnavigation, Verweise). */
		href?: string;
		title?: string;
		kicker?: string;
		lead?: string;
		icon?: IconName;
		/** Meta-Zeile im Seitenkopf, z. B. „Grundlage" oder „Lesezeit". */
		meta?: { label: string; value: string }[];
		goals?: string[];
		/** Inhaltsverzeichnis im Markup-Betrieb (im Datenbetrieb abgeleitet). */
		toc?: TocItem[];
		sources?: string[];
		/** Vorheriges/nächstes Kapitel am Fuß anzeigen. */
		pagination?: boolean;
	}

	let {
		article,
		children,
		href,
		title,
		kicker,
		lead,
		icon,
		meta,
		goals,
		toc,
		sources,
		pagination = true
	}: Props = $props();

	const heroTitle = $derived(article?.title ?? title ?? '');
	const heroKicker = $derived(article?.kicker ?? kicker ?? 'Wissen');
	const heroLead = $derived(article?.lead ?? lead);
	const heroIcon = $derived(article?.icon ?? icon);
	const heroMeta = $derived(article?.meta ?? meta ?? []);
	const articleGoals = $derived(article?.goals ?? goals ?? []);
	const articleSources = $derived(article?.sources ?? sources ?? []);
	const pageHref = $derived(article?.href ?? href ?? '');

	let articleEl = $state<HTMLElement | null>(null);

	/**
	 * Deep-Link `?w=<widgetId>`: nach dem Einhängen zum Widget scrollen und den
	 * Fokus hineinsetzen. Der Effekt läuft nur im Browser — beim Prerendern
	 * gibt es keine Suchparameter. Das kurze Aufleuchten des Rahmens besorgt
	 * der Baustein selbst (`ArticleBlock`).
	 */
	$effect(() => {
		const id = parseWidgetParam(page.url.searchParams);
		const root = articleEl;
		if (!id || !root) return;

		const target = root.querySelector<HTMLElement>(`#${CSS.escape(widgetAnchorId(id))}`);
		if (!target) return;

		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
		target.focus({ preventScroll: true });
	});

	const tocItems = $derived<TocItem[]>(
		article
			? article.sections.flatMap((section) => [
					{ id: section.id, label: section.title, level: 2 as const },
					...(section.children ?? []).map((child) => ({
						id: child.id,
						label: child.title,
						level: 3 as const
					}))
				])
			: (toc ?? [])
	);
</script>

<article class="article" bind:this={articleEl}>
	<PageHero kicker={heroKicker} title={heroTitle} lead={heroLead} icon={heroIcon} meta={heroMeta} />

	<div class="article__grid">
		<aside class="article__aside">
			<TableOfContents items={tocItems} />
		</aside>

		<div class="article__body" class:article__body--flow={!article}>
			{#if articleGoals.length > 0}
				<LearningGoals goals={articleGoals} class="article__goals" />
			{/if}

			{#if article}
				{#each article.sections as section (section.id)}
					<ArticleSection {section} level={2} />
				{/each}
			{:else if children}
				{@render children()}
			{/if}

			{#if articleSources.length > 0}
				<section class="article__sources prose" aria-labelledby="quellen-heading">
					<h2 id="quellen-heading">Quellen</h2>
					<ul>
						{#each articleSources as source (source)}
							<li>{@html source}</li>
						{/each}
					</ul>
				</section>
			{/if}

			{#if pageHref}
				{#if pagination}
					<ArticlePagination href={pageHref} />
				{/if}
				<RelatedTopics href={pageHref} />
			{/if}
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

	/* Markup-Betrieb: die Abschnitte kommen als Kinder und bringen keine
	   eigene Rastergeometrie mit. */
	.article__body--flow {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.article__body--flow > :global(section) {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		scroll-margin-top: 5rem;
	}

	/* Den Abstand setzt hier der Flex-Zwischenraum, nicht der Abschnitt selbst. */
	.article__body--flow > :global(.article-section) {
		margin-top: 0;
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
