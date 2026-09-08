<script lang="ts">
	/**
	 * Schaltfläche des Design-Systems.
	 *
	 * Mit `href` rendert die Komponente ein `<a>`, sonst ein `<button>`.
	 * Alle Farben stammen aus Tokens, die Mindesthöhe erfüllt ab Größe `md`
	 * die 44-px-Empfehlung für Touch-Ziele.
	 */
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import type { IconName } from './icons';

	interface Props {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		/** Rendert einen Link statt einer Schaltfläche */
		href?: string;
		/** Icon vor dem Text */
		icon?: IconName;
		/** Icon nach dem Text */
		iconEnd?: IconName;
		/** Nur-Icon-Schaltfläche — `label` wird dann zur Pflicht */
		iconOnly?: boolean;
		loading?: boolean;
		disabled?: boolean;
		fullWidth?: boolean;
		/** Gedrückt-Zustand für Umschalter und Chips */
		pressed?: boolean;
		type?: 'button' | 'submit' | 'reset';
		/** aria-label, u. a. für reine Icon-Schaltflächen */
		label?: string;
		title?: string;
		target?: string;
		rel?: string;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
		class?: string;
	}

	let {
		variant = 'secondary',
		size = 'md',
		href,
		icon,
		iconEnd,
		iconOnly = false,
		loading = false,
		disabled = false,
		fullWidth = false,
		pressed,
		type = 'button',
		label,
		title,
		target,
		rel,
		onclick,
		children,
		class: klass = ''
	}: Props = $props();

	const iconSize = $derived(size === 'sm' ? 16 : size === 'lg' ? 22 : 18);
	const classes = $derived(
		[
			'ui-btn',
			`ui-btn--${variant}`,
			`ui-btn--${size}`,
			iconOnly ? 'ui-btn--icon-only' : '',
			fullWidth ? 'ui-btn--full' : '',
			klass
		]
			.filter(Boolean)
			.join(' ')
	);
	const linkRel = $derived(rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined));
</script>

{#snippet inner()}
	{#if icon}
		<Icon name={icon} size={iconSize} />
	{/if}
	{#if children}
		<span class="ui-btn__label"
			>{@render children()}</span
		>
	{/if}
	{#if iconEnd}
		<Icon name={iconEnd} size={iconSize} />
	{/if}
{/snippet}

{#if href && !disabled}
	<a
		{href}
		{target}
		rel={linkRel}
		class={classes}
		aria-label={label}
		{title}
		aria-current={pressed ? 'true' : undefined}
	>
		{@render inner()}
	</a>
{:else}
	<button
		{type}
		class={classes}
		disabled={disabled || loading}
		aria-disabled={disabled || loading ? 'true' : undefined}
		aria-busy={loading ? 'true' : undefined}
		aria-pressed={pressed === undefined ? undefined : pressed}
		aria-label={label}
		{title}
		{onclick}
	>
		{@render inner()}
	</button>
{/if}

<style>
	.ui-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		border: 1px solid transparent;
		border-radius: var(--radius-control);
		font-family: inherit;
		font-weight: var(--font-weight-medium);
		line-height: 1.2;
		text-decoration: none;
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			border-color var(--transition-fast),
			color var(--transition-fast);
	}

	.ui-btn:disabled,
	.ui-btn[aria-disabled='true'] {
		cursor: not-allowed;
		opacity: 0.55;
	}

	/* Größen */
	.ui-btn--sm {
		min-height: 2rem;
		padding: 0.25rem 0.625rem;
		font-size: var(--font-size-xs);
	}

	.ui-btn--md {
		min-height: 2.75rem;
		padding: 0.5rem 1rem;
		font-size: var(--font-size-sm);
	}

	.ui-btn--lg {
		min-height: 3rem;
		padding: 0.75rem 1.25rem;
		font-size: var(--font-size-base);
	}

	.ui-btn--icon-only {
		padding-inline: 0;
		aspect-ratio: 1;
	}

	.ui-btn--icon-only.ui-btn--sm {
		width: 2rem;
	}

	.ui-btn--icon-only.ui-btn--md {
		width: 2.75rem;
	}

	.ui-btn--icon-only.ui-btn--lg {
		width: 3rem;
	}

	.ui-btn--full {
		width: 100%;
	}

	/* Varianten */
	.ui-btn--primary {
		background-color: var(--color-brand);
		border-color: var(--color-brand);
		color: var(--color-brand-on);
	}

	.ui-btn--primary:hover:not(:disabled) {
		background-color: var(--color-brand-hover);
		border-color: var(--color-brand-hover);
	}

	.ui-btn--secondary {
		background-color: var(--color-surface);
		border-color: var(--color-line-strong);
		color: var(--color-ink);
	}

	.ui-btn--secondary:hover:not(:disabled) {
		background-color: var(--color-elevated);
	}

	.ui-btn--ghost {
		background-color: transparent;
		color: var(--color-ink-muted);
	}

	.ui-btn--ghost:hover:not(:disabled) {
		background-color: var(--color-elevated);
		color: var(--color-ink);
	}

	.ui-btn--danger {
		background-color: var(--color-danger);
		border-color: var(--color-danger);
		color: var(--color-on-solid);
	}

	.ui-btn--danger:hover:not(:disabled) {
		filter: brightness(0.92);
	}

	/* Gedrückter Zustand (Chips, Umschalter) */
	.ui-btn[aria-pressed='true'],
	.ui-btn[aria-current='true'] {
		background-color: var(--color-brand);
		border-color: var(--color-brand);
		color: var(--color-brand-on);
	}

	.ui-btn__label {
		display: inline-block;
	}

	.ui-btn[aria-busy='true'] .ui-btn__label {
		opacity: 0.7;
	}
</style>
