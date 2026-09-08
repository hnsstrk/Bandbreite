<script lang="ts">
	/**
	 * Auswahlfeld auf Basis eines nativen `<select>`.
	 *
	 * Nativ, weil das auf Mobilgeräten und mit Screenreadern jede
	 * nachgebaute Listbox schlägt. Gruppierung entsteht automatisch
	 * über `option.group`.
	 */
	export interface SelectOption {
		value: string;
		label: string;
		/** Optionale Gruppe — erzeugt ein `<optgroup>` */
		group?: string;
		disabled?: boolean;
	}

	interface Props {
		/** Sichtbares Label; ohne Angabe muss `label`-Text über `ariaLabel` kommen */
		label?: string;
		value: string;
		options: SelectOption[];
		/** Erste, nicht wählbare Zeile */
		placeholder?: string;
		size?: 'sm' | 'md';
		disabled?: boolean;
		/** Hinweistext unter dem Feld */
		hint?: string;
		/** Fehlermeldung — setzt zusätzlich aria-invalid */
		error?: string;
		id?: string;
		ariaLabel?: string;
		/** Label und Feld nebeneinander statt untereinander */
		inline?: boolean;
		onchange?: (value: string) => void;
		class?: string;
	}

	let {
		label,
		value = $bindable(),
		options,
		placeholder,
		size = 'md',
		disabled = false,
		hint,
		error,
		id,
		ariaLabel,
		inline = false,
		onchange,
		class: klass = ''
	}: Props = $props();

	const uid = $props.id();
	const fieldId = $derived(id ?? uid);
	const messageId = $derived(`${fieldId}-msg`);

	const groups = $derived.by(() => {
		const ordered: { name: string | undefined; items: SelectOption[] }[] = [];
		for (const option of options) {
			const last = ordered[ordered.length - 1];
			if (last && last.name === option.group) {
				last.items.push(option);
			} else {
				ordered.push({ name: option.group, items: [option] });
			}
		}
		return ordered;
	});

	function handleChange(event: Event) {
		const target = event.currentTarget as HTMLSelectElement;
		value = target.value;
		onchange?.(target.value);
	}
</script>

<div class="ui-field {inline ? 'ui-field--inline' : ''} {klass}">
	{#if label}
		<label class="ui-field__label" for={fieldId}>{label}</label>
	{/if}
	<select
		id={fieldId}
		class="ui-select ui-select--{size}"
		{disabled}
		{value}
		aria-label={label ? undefined : ariaLabel}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={hint || error ? messageId : undefined}
		onchange={handleChange}
	>
		{#if placeholder}
			<option value="" disabled selected={value === ''}>{placeholder}</option>
		{/if}
		{#each groups as group (group.name ?? '__ungrouped__')}
			{#if group.name}
				<optgroup label={group.name}>
					{#each group.items as option (option.value)}
						<option value={option.value} disabled={option.disabled}>{option.label}</option>
					{/each}
				</optgroup>
			{:else}
				{#each group.items as option (option.value)}
					<option value={option.value} disabled={option.disabled}>{option.label}</option>
				{/each}
			{/if}
		{/each}
	</select>
	{#if error}
		<p class="ui-field__message ui-field__message--error" id={messageId} role="alert">{error}</p>
	{:else if hint}
		<p class="ui-field__message" id={messageId}>{hint}</p>
	{/if}
</div>

<style>
	.ui-field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		min-width: 0;
	}

	.ui-field--inline {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.ui-field__label {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-ink-muted);
	}

	.ui-select {
		width: 100%;
		min-width: 0;
		background-color: var(--color-input);
		color: var(--color-ink);
		border: 1px solid var(--color-line-strong);
		border-radius: var(--radius-control);
		font-family: inherit;
		cursor: pointer;
		transition: border-color var(--transition-fast);
	}

	.ui-select--sm {
		min-height: 2rem;
		padding: 0.25rem 0.5rem;
		font-size: var(--font-size-xs);
	}

	.ui-select--md {
		min-height: 2.75rem;
		padding: 0.5rem 0.75rem;
		font-size: var(--font-size-sm);
	}

	.ui-select:hover:not(:disabled) {
		border-color: var(--color-brand);
	}

	.ui-select:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.ui-field__message {
		margin: 0;
		font-size: var(--font-size-xs);
		color: var(--color-ink-subtle);
	}

	.ui-field__message--error {
		color: var(--color-danger-ink);
	}
</style>
