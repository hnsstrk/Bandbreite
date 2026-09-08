<script lang="ts">
	/**
	 * Eingabe eines Squawk-Codes: vier Oktalziffern A, B, C, D (0000 … 7777)
	 * plus Schnellwahl der Codes mit fester Bedeutung (ICAO Doc 4444).
	 */
	import Select from '$lib/components/ui/Select.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { parseSquawk, SQUAWK_PRESETS } from './SsrModel';

	interface Props {
		/** Vierstelliger Code, Ziffern in der Reihenfolge A B C D */
		code: string;
		disabled?: boolean;
	}

	let { code = $bindable(), disabled = false }: Props = $props();

	const DIGIT_LABELS = ['Ziffer A', 'Ziffer B', 'Ziffer C', 'Ziffer D'] as const;
	const OCTAL_OPTIONS = Array.from({ length: 8 }, (_, value) => ({
		value: String(value),
		label: String(value)
	}));

	const digits = $derived((parseSquawk(code) ?? '0000').split(''));

	function setDigit(index: number, value: string): void {
		const next = [...digits];
		next[index] = value;
		const candidate = next.join('');
		code = parseSquawk(candidate) ?? code;
	}
</script>

<fieldset class="picker" {disabled}>
	<legend class="picker__legend">Squawk-Code (Modus A)</legend>
	<div class="picker__digits">
		{#each DIGIT_LABELS as label, index (label)}
			<Select
				{label}
				size="sm"
				value={digits[index]}
				options={OCTAL_OPTIONS}
				onchange={(value) => setDigit(index, value)}
			/>
		{/each}
	</div>
	<div class="picker__presets">
		{#each SQUAWK_PRESETS as preset (preset.code)}
			<Button
				size="sm"
				variant="ghost"
				pressed={code === preset.code}
				title={preset.meaningDE}
				onclick={() => (code = preset.code)}
			>
				{preset.code}
			</Button>
		{/each}
	</div>
</fieldset>

<style>
	.picker {
		margin: 0;
		padding: 0.625rem 0.75rem 0.75rem;
		border: 1px solid var(--color-line);
		border-radius: var(--radius-control);
	}

	.picker__legend {
		padding: 0 0.25rem;
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-ink-subtle);
	}

	.picker__digits {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.375rem;
	}

	.picker__presets {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-top: 0.5rem;
	}
</style>
