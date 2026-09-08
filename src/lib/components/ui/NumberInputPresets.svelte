<script lang="ts">
	/**
	 * Voreinstellungs-Chips eines {@link NumberInput}.
	 *
	 * Eigene Datei, damit `NumberInput.svelte` unter der 300-Zeilen-Grenze
	 * bleibt; die Basis der Optik kommt aus der globalen `.btn-chip`-Regel in
	 * `app.css`, inklusive des `aria-pressed`-Zustands.
	 */
	import type { NumberPreset } from './numberInput.svelte';

	interface Props {
		/** Bezeichnung des Feldes — sie benennt auch die Gruppe */
		label: string;
		presets: NumberPreset[];
		/** Aktueller Wert in der Basiseinheit, für den gedrückten Zustand */
		value: number;
		disabled?: boolean;
		onselect: (preset: NumberPreset) => void;
	}

	let { label, presets, value, disabled = false, onselect }: Props = $props();
</script>

<div class="ui-number__presets" role="group" aria-label="Voreinstellungen für {label}">
	{#each presets as preset (preset.label)}
		<button
			type="button"
			class="btn-chip ui-number__preset"
			aria-pressed={value === preset.value}
			title={preset.hint}
			{disabled}
			onclick={() => onselect(preset)}
		>
			{preset.label}
		</button>
	{/each}
</div>

<style>
	.ui-number__presets {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
	}

	.ui-number__preset {
		font-family: inherit;
		font-size: var(--text-2xs);
		border-radius: var(--radius-pill);
	}
</style>
