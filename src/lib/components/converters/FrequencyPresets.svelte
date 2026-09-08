<script lang="ts">
  /**
   * Schnellwahl-Leiste des Frequenzkonverters: Presets links, Formel-Umschalter
   * rechts. Reines Markup — Wert und Einheit setzt der Konverter selbst.
   */
  import type { FrequencyPreset } from '$lib/data/presets';

  interface Props {
    presets: readonly FrequencyPreset[];
    showFormula: boolean;
    onSelect: (hz: number) => void;
    onToggleFormula: () => void;
  }

  let { presets, showFormula, onSelect, onToggleFormula }: Props = $props();
</script>

<!-- Quick Frequency Buttons -->
<div class="quick-actions">
  <span class="quick-label">Quick:</span>
  {#each presets as preset (preset.label)}
    <button
      type="button"
      onclick={() => onSelect(preset.hz)}
      class="btn-preset"
      title="{preset.label} - {preset.descriptionDE ?? preset.description}"
    >
      <span class="preset-value">{preset.label}</span>
      <span class="preset-desc">({preset.descriptionDE ?? preset.description})</span>
    </button>
  {/each}

  <!-- Formula Toggle Button (right-aligned) -->
  <button
    type="button"
    onclick={onToggleFormula}
    class="btn-formula"
    aria-expanded={showFormula}
    aria-controls="formula-section"
  >
    <span class="formula-arrow" class:rotated={showFormula}>&#9660;</span>
    <span>Formel</span>
  </button>
</div>

<style>
  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border-default);
  }

  .quick-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    margin-right: 0.25rem;
  }

  .preset-value {
    font-weight: var(--font-weight-medium);
  }

  .preset-desc {
    color: var(--color-text-disabled);
    margin-left: 0.25rem;
  }

  .btn-formula {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    font-size: var(--font-size-xs);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-default);
    background-color: var(--color-bg-elevated);
    color: var(--color-text-tertiary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .btn-formula:hover {
    border-color: var(--color-border-strong);
    background-color: var(--color-bg-surface);
    color: var(--color-text-secondary);
  }

  .formula-arrow {
    display: inline-block;
    transition: transform var(--transition-fast);
  }

  .formula-arrow.rotated {
    transform: rotate(180deg);
  }
</style>
