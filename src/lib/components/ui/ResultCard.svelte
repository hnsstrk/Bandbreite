<script lang="ts">
  /**
   * Ergebnisanzeige eines Rechners: Beschriftung, Wert, Einheit und
   * optionaler Hinweis. Der Wert wird als `aria-live="polite"` gemeldet,
   * damit Änderungen auch ohne Blick auf den Bildschirm ankommen.
   */
  import Icon from './Icon.svelte';

  interface Props {
    label: string;
    value: string | number;
    unit?: string;
    /** Zweitwert, z. B. „= 2,6 nmi" */
    secondary?: string;
    /** Kurzer Hinweis unter dem Wert */
    hint?: string;
    tone?: 'neutral' | 'success' | 'warning' | 'danger';
    emphasis?: 'hero' | 'normal';
    /** Schaltfläche zum Kopieren des Wertes einblenden */
    copyable?: boolean;
    class?: string;
  }

  let {
    label,
    value,
    unit,
    secondary,
    hint,
    tone = 'neutral',
    emphasis = 'normal',
    copyable = true,
    class: klass = ''
  }: Props = $props();

  let copied = $state(false);
  let copyFailed = $state(false);
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  const plainValue = $derived(`${value}${unit ? ` ${unit}` : ''}`);

  async function copyValue() {
    copyFailed = false;
    try {
      await navigator.clipboard.writeText(plainValue);
      copied = true;
    } catch {
      copyFailed = true;
    }
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copied = false;
      copyFailed = false;
    }, 2000);
  }
</script>

<div class="ui-result ui-result--{tone} ui-result--{emphasis} {klass}">
  <div class="ui-result__head">
    <span class="ui-result__label">{label}</span>
    {#if copyable}
      <button type="button" class="ui-result__copy" aria-label="{label} kopieren" onclick={copyValue}>
        <Icon name={copied ? 'check' : 'copy'} size={15} />
      </button>
    {/if}
  </div>

  <p class="ui-result__value" aria-live="polite">
    <span class="ui-result__number">{value}</span>{#if unit}<span class="ui-result__unit">{unit}</span>{/if}
  </p>

  {#if secondary}
    <p class="ui-result__secondary">{secondary}</p>
  {/if}
  {#if hint}
    <p class="ui-result__hint">{hint}</p>
  {/if}

  <span class="sr-only" role="status">
    {#if copied}Wert in die Zwischenablage kopiert.{/if}
    {#if copyFailed}Kopieren nicht möglich.{/if}
  </span>
</div>

<style>
  /* 1-px-Rahmen, keine Fläche; der Ton färbt nur die linke Kante. */
  .ui-result {
    display: flex;
    flex-direction: column;
    gap: 0.0625rem;
    padding: 0.375rem 0.5rem;
    border: 1px solid var(--color-line);
    border-left: 2px solid var(--result-accent, var(--color-line-strong));
    border-radius: var(--radius-sm);
    background-color: transparent;
  }

  .ui-result--success {
    --result-accent: var(--color-success);
  }
  .ui-result--warning {
    --result-accent: var(--color-warning);
  }
  .ui-result--danger {
    --result-accent: var(--color-danger);
  }

  .ui-result__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .ui-result__label {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-normal);
    color: var(--color-ink-subtle);
  }

  .ui-result__copy {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    border: none;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--color-ink-faint);
    cursor: pointer;
    transition: color var(--transition-fast);
  }

  .ui-result__copy:hover {
    color: var(--color-brand);
  }

  .ui-result__value {
    margin: 0;
    font-variant-numeric: tabular-nums;
    line-height: var(--line-height-tight);
    color: var(--color-ink);
  }

  .ui-result__number {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
  }

  .ui-result--hero .ui-result__number {
    font-size: var(--font-size-2xl);
  }

  .ui-result__unit {
    margin-left: 0.3em;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-normal);
    color: var(--color-ink-subtle);
  }

  .ui-result__secondary {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
    font-variant-numeric: tabular-nums;
  }

  .ui-result__hint {
    margin: 0.125rem 0 0;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }
</style>
