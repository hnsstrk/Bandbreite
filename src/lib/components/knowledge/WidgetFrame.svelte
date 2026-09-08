<script lang="ts">
	/**
	 * Gemeinsamer Rahmen der interaktiven Wissen-Widgets:
	 * Titel, optionaler Play/Pause-Button, Bühne (SVG) mit `role="img"`,
	 * sr-only-Wertetabelle, Bedienelemente und Ergebniskarten.
	 */
	import type { Snippet } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		title: string;
		/** Beschreibung der Grafik (wird `aria-label` der Bühne) */
		description: string;
		level?: 3 | 4;
		/** Play/Pause anzeigen */
		playable?: boolean;
		playing?: boolean;
		/** Hinweis, wenn die Systemeinstellung Bewegung reduziert */
		reducedMotion?: boolean;
		ontoggle?: () => void;
		controls?: Snippet;
		results?: Snippet;
		/** Nur für Screenreader: Tabelle der aktuellen Werte */
		dataTable?: Snippet;
		footnote?: string;
		/** Bühne oben, Regler darunter (statt nebeneinander) */
		stacked?: boolean;
		/** Bühne enthält selbst bedienbare Elemente → kein role="img" */
		interactive?: boolean;
		children: Snippet;
		class?: string;
	}

	let {
		title,
		description,
		level = 3,
		playable = false,
		playing = true,
		reducedMotion = false,
		ontoggle,
		controls,
		results,
		dataTable,
		footnote,
		stacked = false,
		interactive = false,
		children,
		class: klass = ''
	}: Props = $props();

	const headingId = $props.id();
	const tableId = $derived(`${headingId}-werte`);
</script>

<section class="widget {stacked ? 'widget--stacked' : ''} {klass}" aria-labelledby={headingId}>
	<header class="widget__head">
		<svelte:element this={`h${level}`} id={headingId} class="widget__title">{title}</svelte:element>
		{#if playable}
			<Button
				size="sm"
				variant="ghost"
				icon={playing ? 'pause' : 'play'}
				pressed={!playing}
				onclick={ontoggle}
				title={reducedMotion ? 'Animation ist durch die Systemeinstellung reduziert' : undefined}
			>
				{playing ? 'Pause' : 'Abspielen'}
			</Button>
		{/if}
	</header>

	<div class="widget__grid">
		<div class="widget__stage">
			{#if interactive}
				<p class="sr-only">{description}</p>
				<div class="widget__figure">
					{@render children()}
				</div>
			{:else}
				<div class="widget__figure" role="img" aria-label={description} aria-describedby={dataTable ? tableId : undefined}>
					{@render children()}
				</div>
			{/if}
			{#if dataTable}
				<div class="sr-only" id={tableId}>
					{@render dataTable()}
				</div>
			{/if}
		</div>
		{#if controls || results}
			<div class="widget__side">
				{#if controls}
					<div class="widget__controls">{@render controls()}</div>
				{/if}
				{#if results}
					<div class="widget__results">{@render results()}</div>
				{/if}
			</div>
		{/if}
	</div>

	{#if footnote}
		<p class="widget__footnote">{footnote}</p>
	{/if}
</section>

<style>
	.widget {
		margin: 1.5rem 0;
		padding: 1rem 1.125rem 0.875rem;
		border: 1px solid var(--color-line);
		border-radius: var(--radius-card);
		background-color: var(--color-surface);
		box-shadow: var(--shadow-card);
	}

	.widget__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.widget__title {
		margin: 0;
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-ink);
	}

	.widget__grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1rem;
	}

	@media (min-width: 900px) {
		.widget:not(.widget--stacked) .widget__grid {
			grid-template-columns: minmax(0, 3fr) minmax(16rem, 2fr);
		}
	}

	.widget__figure {
		border-radius: var(--radius-control);
		background-color: var(--color-base);
		overflow: hidden;
	}

	.widget__figure :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}

	.widget__side {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		min-width: 0;
	}

	.widget__controls {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.widget__results {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
		gap: 0.5rem;
	}

	.widget__footnote {
		margin: 0.75rem 0 0;
		font-size: var(--font-size-xs);
		color: var(--color-ink-subtle);
	}
</style>
