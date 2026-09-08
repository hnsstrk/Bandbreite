<script lang="ts">
	/**
	 * Kompaktes Status- oder Stichwort-Etikett.
	 *
	 * Die Farbpaarungen nutzen `--color-*-soft` als Fläche und
	 * `--color-*-ink` als Schrift; jede Kombination liegt über 8:1.
	 */
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import type { IconName } from './icons';

	interface Props {
		tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
		variant?: 'soft' | 'solid' | 'outline';
		size?: 'sm' | 'md';
		/** Statuspunkt vor dem Text */
		dot?: boolean;
		icon?: IconName;
		/** Zusätzliche, nur vorgelesene Erläuterung des Status */
		srPrefix?: string;
		children: Snippet;
		class?: string;
	}

	let {
		tone = 'neutral',
		variant = 'soft',
		size = 'sm',
		dot = false,
		icon,
		srPrefix,
		children,
		class: klass = ''
	}: Props = $props();
</script>

<span class="ui-badge ui-badge--{tone} ui-badge--{variant} ui-badge--{size} {klass}">
	{#if srPrefix}<span class="sr-only">{srPrefix}: </span>{/if}
	{#if dot}<span class="ui-badge__dot" aria-hidden="true"></span>{/if}
	{#if icon}<Icon name={icon} size={size === 'sm' ? 12 : 14} />{/if}
	{@render children()}
</span>

<style>
	.ui-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.3em;
		border: 1px solid transparent;
		border-radius: var(--radius-pill);
		font-weight: var(--font-weight-medium);
		line-height: 1.4;
		white-space: nowrap;
	}

	.ui-badge--sm {
		padding: 0.0625rem 0.5rem;
		font-size: var(--font-size-xs);
	}

	.ui-badge--md {
		padding: 0.1875rem 0.6875rem;
		font-size: var(--font-size-sm);
	}

	.ui-badge__dot {
		width: 0.4375rem;
		height: 0.4375rem;
		border-radius: var(--radius-pill);
		background-color: currentColor;
	}

	/* Weiche Fläche (Standard) */
	.ui-badge--soft.ui-badge--neutral {
		background-color: var(--color-neutral-soft);
		color: var(--color-neutral-ink);
	}
	.ui-badge--soft.ui-badge--brand {
		background-color: var(--color-brand-soft);
		color: var(--color-brand-ink);
	}
	.ui-badge--soft.ui-badge--success {
		background-color: var(--color-success-soft);
		color: var(--color-success-ink);
	}
	.ui-badge--soft.ui-badge--warning {
		background-color: var(--color-warning-soft);
		color: var(--color-warning-ink);
	}
	.ui-badge--soft.ui-badge--danger {
		background-color: var(--color-danger-soft);
		color: var(--color-danger-ink);
	}
	.ui-badge--soft.ui-badge--info {
		background-color: var(--color-info-soft);
		color: var(--color-info-ink);
	}

	/* Gefüllt */
	.ui-badge--solid {
		color: var(--color-on-solid);
	}
	.ui-badge--solid.ui-badge--neutral {
		background-color: var(--color-ink-muted);
	}
	.ui-badge--solid.ui-badge--brand {
		background-color: var(--color-brand);
		color: var(--color-brand-on);
	}
	.ui-badge--solid.ui-badge--success {
		background-color: var(--color-success-ink);
	}
	.ui-badge--solid.ui-badge--warning {
		background-color: var(--color-warning-ink);
	}
	.ui-badge--solid.ui-badge--danger {
		background-color: var(--color-danger-ink);
	}
	.ui-badge--solid.ui-badge--info {
		background-color: var(--color-info-ink);
	}

	/* Umrandet */
	.ui-badge--outline {
		background-color: transparent;
		border-color: var(--color-line-strong);
	}
	.ui-badge--outline.ui-badge--neutral {
		color: var(--color-ink-muted);
	}
	.ui-badge--outline.ui-badge--brand {
		color: var(--color-brand);
		border-color: var(--color-brand);
	}
	.ui-badge--outline.ui-badge--success {
		color: var(--color-success-ink);
		border-color: var(--color-success);
	}
	.ui-badge--outline.ui-badge--warning {
		color: var(--color-warning-ink);
		border-color: var(--color-warning);
	}
	.ui-badge--outline.ui-badge--danger {
		color: var(--color-danger-ink);
		border-color: var(--color-danger);
	}
	.ui-badge--outline.ui-badge--info {
		color: var(--color-info-ink);
		border-color: var(--color-info);
	}
</style>
