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
    applyFieldInput,
    clampToRange,
    formatFieldValue,
    fromBaseValue,
    positionToValue,
    roundToStep,
    validateValue,
    valueToPosition,
    type NumberPreset,
    type ScaleMode,
    type UnitOption
  } from './numberInput.svelte';
  import NumberInputPresets from './NumberInputPresets.svelte';

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
    presets?: NumberPreset[];
    hint?: string;
    /** Erzwungene Fehlermeldung; sonst wird selbst geprüft */
    error?: string;
    disabled?: boolean;
    id?: string;
    /**
     * Wird beim Bestätigen gemeldet — Verlassen des Feldes, Eingabetaste,
     * Schieberegler oder Preset —, nicht bei jedem Tastendruck. Der
     * gebundene Wert folgt der Eingabe trotzdem sofort.
     */
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

  const validation = $derived(validateValue(value, { min, max, unitSymbol: activeUnit?.symbol, factor }));
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

  /**
   * Jeder Tastendruck führt nur den gebundenen Wert nach. `onchange` bleibt
   * dem Bestätigen vorbehalten, sonst wechselt die aufrufende Komponente die
   * Einheit mitten in einer mehrstelligen Eingabe (aus „2400" in MHz würde
   * sonst beim nächsten Zeichen ein Wert in GHz).
   */
  function handleInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    draft = target.value;
    const result = applyFieldInput(target.value, factor, 'typing');
    if (result.value !== null) value = result.value;
  }

  function handleBlur() {
    draft = null;
    commit(value);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    const target = event.currentTarget as HTMLInputElement;
    const result = applyFieldInput(target.value, factor, 'commit');
    if (result.value !== null) value = result.value;
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

  function applyPreset(preset: NumberPreset) {
    draft = null;
    commit(preset.value);
  }
</script>

<div class="ui-number {klass}">
  <div class="ui-number__top">
    <label class="ui-number__label" for={fieldId}>{label}</label>
    {#if presets.length > 0}
      <NumberInputPresets {label} {presets} {value} {disabled} onselect={applyPreset} />
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
      onkeydown={handleKeydown}
    />
    {#if units.length > 1}
      <label class="sr-only" for={unitId}>Einheit für {label}</label>
      <select id={unitId} class="ui-number__unit" value={activeUnit?.id} {disabled} onchange={handleUnitChange}>
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
    <p class="ui-number__message ui-number__message--error" id={messageId} role="status" aria-live="polite">
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
    gap: 0.25rem;
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

  .ui-number__row {
    display: flex;
    gap: 0.375rem;
    min-width: 0;
  }

  .ui-number__field,
  .ui-number__unit {
    min-height: 2rem;
    padding: 0.25rem 0.5rem;
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
