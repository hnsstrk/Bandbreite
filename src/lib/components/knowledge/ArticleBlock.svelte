<script lang="ts">
	/**
	 * Rendert einen einzelnen Inhaltsblock eines Wissen-Kapitels.
	 * Textblöcke bleiben in der Lesebreite (`.prose`), Widgets brechen
	 * über `.article-wide` auf die volle Spaltenbreite aus.
	 */
	import type { ArticleBlock } from '$lib/content/types';
	import FormulaBlock from '$lib/components/ui/FormulaBlock.svelte';
	import Callout from '$lib/components/ui/Callout.svelte';
	import ArticleTable from './ArticleTable.svelte';
	import ArticleCards from './ArticleCards.svelte';
	import { WIDGETS } from './widgetRegistry';

	interface Props {
		block: ArticleBlock;
		/** Überschriftenebene des umgebenden Abschnitts */
		level: 2 | 3;
	}

	let { block, level }: Props = $props();
	const childLevel = $derived((level + 1) as 3 | 4);
</script>

{#if block.type === 'paragraph'}
	<p class="prose">{@html block.html}</p>
{:else if block.type === 'list'}
	{#if block.ordered}
		<ol class="prose">
			{#each block.items as item, i (i)}<li>{@html item}</li>{/each}
		</ol>
	{:else}
		<ul class="prose">
			{#each block.items as item, i (i)}<li>{@html item}</li>{/each}
		</ul>
	{/if}
{:else if block.type === 'formula'}
	<FormulaBlock
		formula={block.formula}
		alt={block.alt}
		label={block.label}
		number={block.number}
		variables={block.variables}
		class="prose"
	/>
{:else if block.type === 'callout'}
	<Callout tone={block.tone} title={block.title} source={block.source} class="prose">
		{@html block.html}
	</Callout>
{:else if block.type === 'table'}
	<ArticleTable {block} />
{:else if block.type === 'definitions'}
	<dl class="prose definitions">
		{#each block.items as item (item.term)}
			<div class="definition">
				<dt>{@html item.term}</dt>
				<dd>{@html item.description}</dd>
			</div>
		{/each}
	</dl>
{:else if block.type === 'cards'}
	<ArticleCards {block} level={childLevel} />
{:else if block.type === 'widget'}
	{@const Widget = WIDGETS[block.id]}
	<div class="article-wide">
		<Widget />
	</div>
{:else if block.type === 'question'}
	<details class="question prose">
		<summary class="question__summary">Verständnisfrage: {@html block.question}</summary>
		<p class="question__answer">{@html block.answer}</p>
	</details>
{/if}

<style>
	.definitions {
		display: grid;
		gap: 0.5rem;
		margin: 1rem 0;
	}

	.definition {
		display: grid;
		grid-template-columns: 8rem minmax(0, 1fr);
		gap: 0.75rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--color-line-subtle);
	}

	.definition dt {
		font-family: var(--font-mono);
		font-weight: var(--font-weight-semibold);
		color: var(--color-ink);
	}

	.definition dd {
		margin: 0;
		color: var(--color-ink-muted);
	}

	.question {
		margin: 1.25rem 0;
		padding: 0.75rem 1rem;
		border: 1px solid var(--color-line);
		border-left: 3px solid var(--color-brand);
		border-radius: var(--radius-control);
		background-color: var(--color-surface);
	}

	.question__summary {
		cursor: pointer;
		font-weight: var(--font-weight-semibold);
		color: var(--color-ink);
	}

	.question__answer {
		margin: 0.625rem 0 0;
	}

	.article-wide {
		width: 100%;
		max-width: none;
	}
</style>
