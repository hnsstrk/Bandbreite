<script lang="ts">
	/**
	 * Gemeinsames Gerüst der Funktechnik-Kapitel.
	 *
	 * Seitenkopf, Lernziele, klebriges Inhaltsverzeichnis in der Randspalte und
	 * die Kartenreihe „Verwandte Themen“ am Ende. Der Fließtext kommt als
	 * Snippet und läuft in der Lesebreite; Widgets brechen mit `.bleed` aus.
	 */
	import type { Snippet } from 'svelte';
	import PageHero from '$lib/components/ui/PageHero.svelte';
	import LearningGoals from '$lib/components/ui/LearningGoals.svelte';
	import TableOfContents from '$lib/components/ui/TableOfContents.svelte';
	import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
	import type { IconName } from '$lib/components/ui/icons';

	interface Props {
		title: string;
		lead: string;
		kicker?: string;
		icon?: IconName;
		meta?: { label: string; value: string }[];
		goals?: string[];
		toc: { id: string; label: string; level: 2 | 3 }[];
		/** Pfad der Seite für „Verwandte Themen“; leer lässt den Block weg. */
		relatedHref?: string;
		children: Snippet;
	}

	let {
		title,
		lead,
		kicker = 'Funk & Fernmeldetechnik',
		icon,
		meta = [],
		goals = [],
		toc,
		relatedHref,
		children
	}: Props = $props();
</script>

<PageHero {title} {lead} {kicker} {icon} {meta} />

<div class="article">
	<aside class="article__aside">
		<TableOfContents items={toc} />
	</aside>

	<div class="article__body">
		{#if goals.length > 0}
			<LearningGoals {goals} />
		{/if}
		{@render children()}
		{#if relatedHref}
			<RelatedTopics href={relatedHref} />
		{/if}
	</div>
</div>

<style>
	.article {
		display: grid;
		gap: 2rem;
		margin-top: 2rem;
		align-items: start;
	}

	.article__body {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
		min-width: 0;
		max-width: 62rem;
	}

	.article__aside {
		order: -1;
	}

	@media (min-width: 80rem) {
		.article {
			grid-template-columns: minmax(0, 1fr) 15rem;
			gap: 3rem;
		}

		.article__aside {
			order: 1;
			position: sticky;
			top: 5rem;
		}
	}
</style>
