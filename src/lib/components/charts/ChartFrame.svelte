<script lang="ts">
	/**
	 * Gemeinsamer Rahmen für alle Diagramme.
	 *
	 * Aufgaben:
	 *  - misst die verfügbare Breite per ResizeObserver und gibt sie als
	 *    gebundenen Wert zurück (`bind:width`),
	 *  - kapselt das horizontale Scrollen, damit nie die ganze Seite
	 *    verrutscht (Mindestbreite liegt am inneren Element),
	 *  - nimmt Titel, Legende, Fußnote und eine sr-only-Datentabelle auf.
	 *
	 * Der Rahmen zeichnet nichts selbst — das Diagramm kommt als `children`.
	 */
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

	interface Props {
		/** Sichtbarer Titel über dem Diagramm */
		title?: string;
		/** Überschriftenebene des Titels */
		level?: 2 | 3 | 4;
		/** Beschreibung, was das Diagramm zeigt (Pflicht für Screenreader) */
		description: string;
		/** Gemessene Innenbreite in Pixeln */
		width?: number;
		/** Mindestbreite des Diagramms; darunter wird gescrollt */
		minWidth?: number;
		/** Legende unter dem Titel */
		legend?: Snippet;
		/** Datentabelle als Textalternative — nur für Screenreader sichtbar */
		dataTable?: Snippet;
		/** Fußnote, z. B. Quellenangabe */
		footnote?: string;
		/** Aktionen rechts im Kopf, z. B. Export */
		actions?: Snippet;
		children: Snippet;
		class?: string;
	}

	let {
		title,
		level = 3,
		description,
		width = $bindable(0),
		minWidth = 500,
		legend,
		dataTable,
		footnote,
		actions,
		children,
		class: klass = ''
	}: Props = $props();

	const headingId = $props.id();
	const tableId = $derived(`${headingId}-tabelle`);

	let scroller = $state<HTMLDivElement | null>(null);

	onMount(() => {
		if (!scroller) return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				width = Math.round(entry.contentRect.width);
			}
		});
		observer.observe(scroller);
		width = Math.round(scroller.getBoundingClientRect().width);
		return () => observer.disconnect();
	});
</script>

<figure class="ui-chart {klass}" aria-labelledby={title ? headingId : undefined}>
	{#if title || actions}
		<div class="ui-chart__head">
			{#if title}
				<svelte:element this={`h${level}`} id={headingId} class="ui-chart__title">
					{title}
				</svelte:element>
			{/if}
			{#if actions}
				<div class="ui-chart__actions">{@render actions()}</div>
			{/if}
		</div>
	{/if}

	{#if legend}
		<div class="ui-chart__legend">{@render legend()}</div>
	{/if}

	<div class="ui-chart__scroller" bind:this={scroller}>
		<div
			class="ui-chart__canvas"
			style="min-width: {minWidth}px"
			role="img"
			aria-label={description}
			aria-describedby={dataTable ? tableId : undefined}
		>
			{@render children()}
		</div>
	</div>

	{#if dataTable}
		<div class="sr-only" id={tableId}>
			{@render dataTable()}
		</div>
	{/if}

	{#if footnote}
		<figcaption class="ui-chart__footnote">{footnote}</figcaption>
	{/if}
</figure>

<style>
	.ui-chart {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 0;
	}

	.ui-chart__head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
	}

	.ui-chart__title {
		margin: 0;
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-ink);
	}

	.ui-chart__actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: none;
	}

	.ui-chart__legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		font-size: var(--font-size-xs);
		color: var(--color-ink-muted);
	}

	/* Nur dieser Bereich scrollt — nie die Seite. */
	.ui-chart__scroller {
		width: 100%;
		max-width: 100%;
		overflow-x: auto;
		position: relative;
		-webkit-overflow-scrolling: touch;
	}

	.ui-chart__canvas {
		width: 100%;
	}

	.ui-chart__canvas :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}

	.ui-chart__footnote {
		font-size: var(--font-size-xs);
		color: var(--color-ink-subtle);
	}
</style>
