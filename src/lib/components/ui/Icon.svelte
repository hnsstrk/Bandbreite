<script lang="ts">
	/**
	 * Strich-Icon aus dem zentralen Katalog (`icons.ts`).
	 *
	 * Ohne `label` ist das Icon rein dekorativ und wird vor Screenreadern
	 * verborgen. Mit `label` wird es zur Grafik mit Textalternative.
	 */
	import { ICONS, type IconName } from './icons';

	interface Props {
		/** Name aus dem Icon-Katalog */
		name: IconName;
		/** Kantenlänge in Pixeln */
		size?: number;
		/** Textalternative — nur setzen, wenn das Icon Bedeutung trägt */
		label?: string;
		/** Strichstärke */
		strokeWidth?: number;
		class?: string;
	}

	let { name, size = 20, label, strokeWidth = 1.75, class: klass = '' }: Props = $props();

	const paths = $derived(ICONS[name] ?? []);
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	width={size}
	height={size}
	fill="none"
	stroke="currentColor"
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	class="ui-icon {klass}"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
	focusable="false"
>
	{#each paths as d (d)}
		<path {d} />
	{/each}
</svg>

<style>
	.ui-icon {
		display: inline-block;
		flex: none;
		vertical-align: middle;
	}
</style>
