<script lang="ts">
  /**
   * Aufklappbarer Formelbereich des Frequenzkonverters: λ = c / f samt
   * Umschalter zwischen exakter und gerundeter Lichtgeschwindigkeit.
   */
  interface Props {
    speedOfLightDisplay: string;
    isExactMode: boolean;
    onToggleSpeedOfLight: () => void;
  }

  let { speedOfLightDisplay, isExactMode, onToggleSpeedOfLight }: Props = $props();
</script>

<div id="formula-section" class="formula-section">
  <span class="formula-display">&#955; = c / f</span>

  <!-- Speed of Light Toggle -->
  <button
    type="button"
    onclick={onToggleSpeedOfLight}
    class="speed-toggle"
    title={isExactMode
      ? 'Wechseln zu gerundeter Lichtgeschwindigkeit (3x10^8 m/s)'
      : 'Wechseln zu exakter Lichtgeschwindigkeit'}
  >
    <span class:active={isExactMode}>exakt</span>
    <span class="separator">|</span>
    <span class:active={!isExactMode}>~</span>
  </button>

  <span class="speed-value">(c = {speedOfLightDisplay} m/s)</span>
</div>

<style>
  .formula-section {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border-default);
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }

  .formula-display {
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
    background-color: var(--color-bg-elevated);
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-md);
  }

  .speed-toggle {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-default);
    background-color: var(--color-bg-elevated);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .speed-toggle:hover {
    border-color: var(--color-border-strong);
    background-color: var(--color-bg-surface);
  }

  .speed-toggle span {
    color: var(--color-text-disabled);
  }

  .speed-toggle span.active {
    color: var(--color-accent-primary);
    font-weight: var(--font-weight-semibold);
  }

  .separator {
    color: var(--color-text-disabled);
  }

  .speed-value {
    color: var(--color-text-disabled);
  }
</style>
