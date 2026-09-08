<script lang="ts">
	/**
	 * Schieberegler mit Label, Wertanzeige und optionaler logarithmischer Skala.
	 *
	 * Der Regler arbeitet intern immer auf einer festen Positionsskala
	 * (0 … SLIDER_RESOLUTION); die Abbildung auf den physikalischen Wert
	 * liegt in `numberInput.svelte.ts` und ist dort getestet.
	 */
	import { formatLocaleNumber } from '$lib/utils/formatting';
	import {
		SLIDER_RESOLUTION,
		positionToValue,
		valueToPosition,
		roundToStep,
		clampToRange,
		type ScaleMode
	} from './numberInput.svelte';

	interface Props {
		label: string;
		value: number;
		min: number;
		max: number;
		step?: number | 'any';
		scale?: ScaleMode;
		/** Formatiert die Wertanzeige rechts vom Label */
		format?: (value: number) => string;
		/** Skalenmarken unter dem Regler */
		ticks?: { at: number; label: string }[];
		/** Einheit für die Vorlesehilfe, z. B. „GHz" */
		unitSymbol?: string;
		disabled?: boolean;
		/** Label ausblenden (bleibt für Screenreader erhalten) */
		hideLabel?: boolean;
		hint?: string;
		id?: string;
		onchange?: (value: number) => void;
		class?: string;
	}

	let {
		label,
		value = $bindable(),
		min,
		max,
		step = 'any',
		scale = 'linear',
		format = (v: number) => formatLocaleNumber(v, { maxFrac: 3 }),
		ticks = [],
		unitSymbol,
		disabled = false,
		hideLabel = false,
		hint,
		id,
		onchange,
		class: klass = ''
	}: Props = $props();

	const uid = $props.id();
	const fieldId = $derived(id ?? uid);
	const hintId = $derived(`${fieldId}-hint`);

	const position = $derived(valueToPosition(value, min, max, scale));
	const display = $derived(format(value));

	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		const raw = positionToValue(Number(target.value), min, max, scale);
		const stepped = scale === 'log' ? raw : roundToStep(raw, step, min);
		const next = clampToRange(stepped, min, max);
		value = next;
		onchange?.(next);
	}
</script>

<div class="ui-slider {klass}">
	<div class="ui-slider__top">
		<label class="ui-slider__label {hideLabel ? 'sr-only' : ''}" for={fieldId}>{label}</label>
		<output class="ui-slider__value" for={fieldId} aria-live="off">{display}</output>
	</div>
	<input
		id={fieldId}
		type="range"
		min="0"
		max={SLIDER_RESOLUTION}
		step="1"
		value={position}
		{disabled}
		aria-valuetext="{display}{unitSymbol ? ` ${unitSymbol}` : ''}"
		aria-describedby={hint ? hintId : undefined}
		oninput={handleInput}
	/>
	{#if ticks.length > 0}
		<div class="ui-slider__ticks" aria-hidden="true">
			{#each ticks as tick (tick.at)}
				<span
					class="ui-slider__tick"
					style="left: {(valueToPosition(tick.at, min, max, scale) / SLIDER_RESOLUTION) * 100}%"
				>
					{tick.label}
				</span>
			{/each}
		</div>
	{/if}
	{#if hint}
		<p class="ui-slider__hint" id={hintId}>{hint}</p>
	{/if}
</div>

<style>
	.ui-slider {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	.ui-slider__top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.ui-slider__label {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-ink-muted);
	}

	.ui-slider__value {
		font-family: var(--font-mono);
		font-size: var(--font-size-sm);
		font-variant-numeric: tabular-nums;
		color: var(--color-ink);
	}

	.ui-slider__ticks {
		position: relative;
		height: 1rem;
		font-size: var(--text-2xs);
		color: var(--color-ink-faint);
	}

	.ui-slider__tick {
		position: absolute;
		transform: translateX(-50%);
		white-space: nowrap;
	}

	.ui-slider__hint {
		margin: 0;
		font-size: var(--font-size-xs);
		color: var(--color-ink-subtle);
	}
</style>
