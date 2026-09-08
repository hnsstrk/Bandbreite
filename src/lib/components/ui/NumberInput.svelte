<script lang="ts">
	/**
	 * Zahleneingabe mit Einheit, optionalem Schieberegler und Presets.
	 *
	 * `value` ist immer der Wert in der Basiseinheit. Das sichtbare Feld
	 * zeigt ihn in der gewählten Einheit; Feld und Regler schreiben denselben
	 * gebundenen Wert. Die Abbildungs- und Prüflogik liegt in
	 * `numberInput.svelte.ts`.
	 */
	import {
		SLIDER_RESOLUTION,
		clampToRange,
		formatFieldValue,
		fromBaseValue,
		positionToValue,
		roundToStep,
		toBaseValue,
		validateValue,
		valueToPosition,
		type ScaleMode,
		type UnitOption
	} from './numberInput.svelte';

	interface Preset {
		label: string;
		/** Wert in der Basiseinheit */
		value: number;
		hint?: string;
	}

	interface Props {
		label: string;
		/** Wert in der Basiseinheit */
		value: number;
		/** ID der aktiven Einheit aus `units` */
		unit?: string;
		units?: UnitOption[];
		/** Grenzen in der Basiseinheit */
		min?: number;
		max?: number;
		step?: number | 'any';
		/** Schieberegler unter dem Feld einblenden */
		slider?: boolean;
		sliderScale?: ScaleMode;
		presets?: Preset[];
		hint?: string;
		/** Erzwungene Fehlermeldung; sonst wird selbst geprüft */
		error?: string;
		disabled?: boolean;
		id?: string;
		onchange?: (value: number) => void;
		class?: string;
	}

	let {
		label,
		value = $bindable(),
		unit = $bindable(),
		units = [],
		min,
		max,
		step = 'any',
		slider = false,
		sliderScale = 'linear',
		presets = [],
		hint,
		error,
		disabled = false,
		id,
		onchange,
		class: klass = ''
	}: Props = $props();

	const uid = $props.id();
	const fieldId = $derived(id ?? uid);
	const messageId = $derived(`${fieldId}-msg`);
	const unitId = $derived(`${fieldId}-unit`);

	/** Aktive Einheit; ohne `units` wird der Faktor 1 verwendet. */
	const activeUnit = $derived(units.find((u) => u.id === unit) ?? units[0]);
	const factor = $derived(activeUnit?.factor ?? 1);

	/** Freie Texteingabe, damit Zwischenzustände beim Tippen nicht springen. */
	let draft = $state<string | null>(null);

	const displayValue = $derived(draft ?? formatFieldValue(fromBaseValue(value, factor)));

	const validation = $derived(validateValue(value, { min, max, unitSymbol: activeUnit?.symbol }));
	const message = $derived(error ?? validation.message);
	const invalid = $derived(Boolean(message));

	const sliderMin = $derived(min ?? 0);
	const sliderMax = $derived(max ?? 100);
	const sliderPosition = $derived(valueToPosition(value, sliderMin, sliderMax, sliderScale));

	function commit(next: number) {
		const bounded = clampToRange(next, min, max);
		value = bounded;
		onchange?.(bounded);
	}

	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		draft = target.value;
		const parsed = Number.parseFloat(target.value.replace(',', '.'));
		if (Number.isFinite(parsed)) {
			value = toBaseValue(parsed, factor);
			onchange?.(value);
		}
	}

	function handleBlur() {
		draft = null;
		commit(value);
	}

	function handleUnitChange(event: Event) {
		const target = event.currentTarget as HTMLSelectElement;
		unit = target.value;
		draft = null;
	}

	function handleSlider(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		const raw = positionToValue(Number(target.value), sliderMin, sliderMax, sliderScale);
		draft = null;
		commit(sliderScale === 'log' ? raw : roundToStep(raw, step, sliderMin));
	}

	function applyPreset(preset: Preset) {
		draft = null;
		commit(preset.value);
	}
</script>

<div class="ui-number {klass}">
	<div class="ui-number__top">
		<label class="ui-number__label" for={fieldId}>{label}</label>
		{#if presets.length > 0}
			<div class="ui-number__presets" role="group" aria-label="Voreinstellungen für {label}">
				{#each presets as preset (preset.label)}
					<button
						type="button"
						class="btn-chip ui-number__preset"
						aria-pressed={value === preset.value}
						title={preset.hint}
						{disabled}
						onclick={() => applyPreset(preset)}
					>
						{preset.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="ui-number__row">
		<input
			id={fieldId}
			class="ui-number__field"
			type="text"
			inputmode="decimal"
			autocomplete="off"
			value={displayValue}
			{disabled}
			aria-invalid={invalid ? 'true' : undefined}
			aria-describedby={message || hint ? messageId : undefined}
			oninput={handleInput}
			onblur={handleBlur}
		/>
		{#if units.length > 1}
			<label class="sr-only" for={unitId}>Einheit für {label}</label>
			<select
				id={unitId}
				class="ui-number__unit"
				value={activeUnit?.id}
				{disabled}
				onchange={handleUnitChange}
			>
				{#each units as option (option.id)}
					<option value={option.id}>{option.symbol}</option>
				{/each}
			</select>
		{:else if activeUnit}
			<span class="ui-number__unit-static" aria-hidden="true">{activeUnit.symbol}</span>
		{/if}
	</div>

	{#if slider}
		<input
			class="ui-number__slider"
			type="range"
			min="0"
			max={SLIDER_RESOLUTION}
			step="1"
			value={sliderPosition}
			{disabled}
			aria-label="{label} — Schieberegler"
			aria-valuetext="{displayValue}{activeUnit ? ` ${activeUnit.symbol}` : ''}"
			oninput={handleSlider}
		/>
	{/if}

	{#if message}
		<p class="ui-number__message ui-number__message--error" id={messageId} role="alert">
			{message}
		</p>
	{:else if hint}
		<p class="ui-number__message" id={messageId}>{hint}</p>
	{/if}
</div>

<style>
	.ui-number {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		min-width: 0;
	}

	.ui-number__top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	.ui-number__label {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-ink-muted);
	}

	.ui-number__presets {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
	}

	/* Basis kommt aus der globalen .btn-chip-Regel in app.css,
	   inklusive des aria-pressed-Zustands. */
	.ui-number__preset {
		font-family: inherit;
		font-size: var(--text-2xs);
		border-radius: var(--radius-pill);
	}

	.ui-number__row {
		display: flex;
		gap: 0.375rem;
		min-width: 0;
	}

	.ui-number__field,
	.ui-number__unit {
		min-height: 2.75rem;
		padding: 0.5rem 0.75rem;
		background-color: var(--color-input);
		color: var(--color-ink);
		border: 1px solid var(--color-line-strong);
		border-radius: var(--radius-control);
		font-size: var(--font-size-sm);
		transition: border-color var(--transition-fast);
	}

	.ui-number__field {
		flex: 1 1 auto;
		min-width: 0;
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
	}

	.ui-number__field[aria-invalid='true'] {
		border-color: var(--color-danger);
	}

	.ui-number__unit {
		flex: none;
		font-family: inherit;
		cursor: pointer;
	}
	.ui-number__unit-static {
		display: inline-flex;
		align-items: center;
		padding-inline: 0.5rem;
		font-size: var(--font-size-sm);
		color: var(--color-ink-subtle);
	}

	.ui-number__message {
		margin: 0;
		font-size: var(--font-size-xs);
		color: var(--color-ink-subtle);
	}
	.ui-number__message--error {
		color: var(--color-danger-ink);
	}
</style>
