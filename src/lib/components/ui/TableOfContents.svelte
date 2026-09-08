<script lang="ts">
	/**
	 * Inhaltsverzeichnis mit Scroll-Spy.
	 *
	 * Auf breiten Viewports steht es als klebrige Spalte neben dem Text,
	 * auf schmalen klappt es als `<details>` unter den Seitenkopf.
	 * Der aktive Eintrag wird über einen IntersectionObserver bestimmt
	 * und mit `aria-current="location"` ausgezeichnet.
	 */
	import { onMount } from 'svelte';

	export interface TocItem {
		/** ID des zugehörigen Überschriften-Elements */
		id: string;
		label: string;
		/** 2 = Kapitel, 3 = Unterabschnitt */
		level: 2 | 3;
	}

	interface Props {
		items: TocItem[];
		title?: string;
		sticky?: boolean;
		/** Breakpoint in Pixeln, ab dem die Spaltenform verwendet wird */
		compactBelow?: number;
		class?: string;
	}

	let {
		items,
		title = 'Auf dieser Seite',
		sticky = true,
		compactBelow = 1280,
		class: klass = ''
	}: Props = $props();

	const headingId = $props.id();

	let activeId = $state<string | null>(null);
	let compact = $state(false);

	onMount(() => {
		const query = window.matchMedia(`(max-width: ${compactBelow - 1}px)`);
		const sync = () => (compact = query.matches);
		sync();
		query.addEventListener('change', sync);

		const visible = new Set<string>();
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) visible.add(entry.target.id);
					else visible.delete(entry.target.id);
				}
				const firstVisible = items.find((item) => visible.has(item.id));
				if (firstVisible) activeId = firstVisible.id;
			},
			{ rootMargin: '-80px 0px -70% 0px', threshold: 0 }
		);

		for (const item of items) {
			const element = document.getElementById(item.id);
			if (element) observer.observe(element);
		}

		return () => {
			query.removeEventListener('change', sync);
			observer.disconnect();
		};
	});
</script>

{#snippet list()}
	<ol class="ui-toc__list">
		{#each items as item (item.id)}
			<li class="ui-toc__entry ui-toc__entry--l{item.level}">
				<a
					class="ui-toc__link"
					href="#{item.id}"
					aria-current={activeId === item.id ? 'location' : undefined}
				>
					{item.label}
				</a>
			</li>
		{/each}
	</ol>
{/snippet}

{#if compact}
	<details class="ui-toc ui-toc--compact {klass}">
		<summary class="ui-toc__summary">{title}</summary>
		{@render list()}
	</details>
{:else}
	<nav
		class="ui-toc {sticky ? 'ui-toc--sticky' : ''} {klass}"
		aria-labelledby={headingId}
	>
		<p class="ui-toc__title" id={headingId}>{title}</p>
		{@render list()}
	</nav>
{/if}

<style>
	.ui-toc {
		font-size: var(--font-size-sm);
	}

	.ui-toc--sticky {
		position: sticky;
		top: 5rem;
		max-height: calc(100vh - 7rem);
		overflow-y: auto;
	}

	.ui-toc--compact {
		border: 1px solid var(--color-line);
		border-radius: var(--radius-control);
		background-color: var(--color-surface);
		padding: 0.5rem 0.875rem;
	}

	.ui-toc__title,
	.ui-toc__summary {
		margin: 0 0 0.5rem;
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-ink-subtle);
	}

	.ui-toc__summary {
		cursor: pointer;
		min-height: 2.25rem;
		display: flex;
		align-items: center;
		margin-bottom: 0;
	}

	.ui-toc--compact[open] .ui-toc__summary {
		margin-bottom: 0.5rem;
	}

	.ui-toc__list {
		list-style: none;
		margin: 0;
		padding: 0;
		border-left: 1px solid var(--color-line);
	}

	.ui-toc__entry--l3 {
		padding-left: 0.75rem;
	}

	.ui-toc__link {
		display: block;
		padding: 0.25rem 0.75rem;
		margin-left: -1px;
		border-left: 2px solid transparent;
		color: var(--color-ink-subtle);
		text-decoration: none;
		line-height: var(--line-height-normal);
		transition: color var(--transition-fast), border-color var(--transition-fast);
	}

	.ui-toc__link:hover {
		color: var(--color-ink);
	}

	.ui-toc__link[aria-current='location'] {
		color: var(--color-brand);
		border-left-color: var(--color-brand);
		font-weight: var(--font-weight-medium);
	}
</style>
