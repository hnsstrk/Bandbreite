<script lang="ts">
	/**
	 * Rendert einen Abschnitt aus `content/funktechnik/types.ts`.
	 *
	 * Überschrift über `SectionHeader` (liefert die Anker-ID für das
	 * Inhaltsverzeichnis), Bausteine über die Komponenten des Design-Systems.
	 * Der Fließtext bleibt in der Lesebreite, Tabellen scrollen in sich selbst.
	 */
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import Callout from '$lib/components/ui/Callout.svelte';
	import FormulaBlock from '$lib/components/ui/FormulaBlock.svelte';
	import type { ArticleSection } from '$lib/content/funktechnik/types';

	interface Props {
		section: ArticleSection;
		class?: string;
	}

	let { section, class: klass = '' }: Props = $props();
</script>

<section class="funk-section {klass}" aria-labelledby={section.id}>
	<SectionHeader
		title={section.title}
		id={section.id}
		level={section.level ?? 2}
		eyebrow={section.eyebrow}
		description={section.description}
	/>

	{#each section.blocks as block, index (index)}
		{#if block.kind === 'p'}
			<p>{block.text}</p>
		{:else if block.kind === 'ul'}
			<ul>
				{#each block.items as item (item)}<li>{item}</li>{/each}
			</ul>
		{:else if block.kind === 'ol'}
			<ol>
				{#each block.items as item (item)}<li>{item}</li>{/each}
			</ol>
		{:else if block.kind === 'dl'}
			<dl class="funk-section__dl">
				{#each block.items as item (item.term)}
					<dt>{item.term}</dt>
					<dd>{item.def}</dd>
				{/each}
			</dl>
		{:else if block.kind === 'callout'}
			<Callout tone={block.tone} title={block.title} source={block.source}>
				{block.text}
			</Callout>
		{:else if block.kind === 'formula'}
			<FormulaBlock
				formula={block.formula}
				alt={block.alt}
				label={block.label}
				number={block.number}
				variables={block.variables ?? []}
			/>
		{:else if block.kind === 'table'}
			<div class="table-scroll">
				<table class="funk-section__table">
					<caption>{block.caption}</caption>
					<thead>
						<tr>
							{#each block.head as cell (cell)}<th scope="col">{cell}</th>{/each}
						</tr>
					</thead>
					<tbody>
						{#each block.rows as row (row[0])}
							<tr>
								{#each row as cell, cellIndex (cellIndex)}
									{#if cellIndex === 0}
										<th scope="row">{cell}</th>
									{:else}
										<td>{cell}</td>
									{/if}
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/each}
</section>

<style>
	.funk-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.funk-section p,
	.funk-section ul,
	.funk-section ol,
	.funk-section__dl {
		margin: 0;
		max-width: var(--container-prose, 68ch);
		color: var(--color-ink-muted);
		line-height: var(--line-height-relaxed);
	}

	.funk-section ul,
	.funk-section ol {
		padding-left: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.funk-section__dl {
		display: grid;
		gap: 0.5rem 1rem;
	}

	.funk-section__dl dt {
		font-weight: var(--font-weight-semibold);
		color: var(--color-ink);
	}

	.funk-section__dl dd {
		margin: 0 0 0.375rem;
		color: var(--color-ink-muted);
		line-height: var(--line-height-relaxed);
	}

	.funk-section__table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--font-size-sm);
	}

	.funk-section__table caption {
		text-align: left;
		padding-bottom: 0.5rem;
		font-size: var(--font-size-xs);
		color: var(--color-ink-subtle);
	}

	.funk-section__table th,
	.funk-section__table td {
		border-bottom: 1px solid var(--color-line-subtle);
		padding: 0.5rem 0.75rem;
		text-align: left;
		vertical-align: top;
		color: var(--color-ink-muted);
	}

	.funk-section__table thead th {
		color: var(--color-ink);
		font-weight: var(--font-weight-semibold);
		border-bottom: 1px solid var(--color-line);
		white-space: nowrap;
	}

	.funk-section__table tbody th {
		color: var(--color-ink);
		font-weight: var(--font-weight-medium);
	}

	@media (min-width: 40rem) {
		.funk-section__dl {
			grid-template-columns: minmax(8rem, 14rem) 1fr;
		}

		.funk-section__dl dd {
			margin-bottom: 0;
		}
	}
</style>
