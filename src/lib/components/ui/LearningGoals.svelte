<script lang="ts">
	/**
	 * Lernziele eines Kapitels — „Nach diesem Kapitel kannst du …".
	 * Rein informativ; die Liste ist eine gewöhnliche Aufzählung mit
	 * Häkchen-Icons, die für Screenreader ausgeblendet sind.
	 */
	import Icon from './Icon.svelte';

	interface Props {
		goals: string[];
		title?: string;
		/** Überschriftenebene des Blocktitels */
		level?: 2 | 3;
		class?: string;
	}

	let {
		goals,
		title = 'Nach diesem Kapitel kannst du …',
		level = 2,
		class: klass = ''
	}: Props = $props();

	const headingId = $props.id();
</script>

<section class="ui-goals {klass}" aria-labelledby={headingId}>
	<svelte:element this={`h${level}`} id={headingId} class="ui-goals__title">
		{title}
	</svelte:element>
	<ul class="ui-goals__list">
		{#each goals as goal (goal)}
			<li class="ui-goals__item">
				<span class="ui-goals__icon" aria-hidden="true"><Icon name="check" size={16} /></span>
				<span>{goal}</span>
			</li>
		{/each}
	</ul>
</section>

<style>
	.ui-goals {
		padding: 1rem 1.125rem;
		border: 1px solid var(--color-line);
		border-radius: var(--radius-control);
		background-color: var(--color-sunken);
	}

	.ui-goals__title {
		margin: 0 0 0.625rem;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-ink);
	}

	.ui-goals__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.ui-goals__item {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-size: var(--font-size-sm);
		line-height: var(--line-height-normal);
		color: var(--color-ink-muted);
	}

	.ui-goals__icon {
		display: inline-flex;
		flex: none;
		margin-top: 0.1rem;
		color: var(--color-success);
	}
</style>
