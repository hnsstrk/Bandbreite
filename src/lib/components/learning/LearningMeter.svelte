<script lang="ts">
  /**
   * Fortschrittsbalken eines Lernpfads.
   *
   * Ein `role="progressbar"` mit sprechendem `aria-valuetext` — die Zahl
   * „3 von 7 Schritten" steht auch dann zur Verfügung, wenn der Balken selbst
   * nicht wahrnehmbar ist.
   */
  import { formatPercentage } from '$lib/utils/formatting';

  interface Props {
    done: number;
    total: number;
    /** Beschriftung für Screenreader. */
    label?: string;
    /** Zusätzlich sichtbare Beschriftung „3 von 7 Schritten". */
    showCount?: boolean;
    class?: string;
  }

  let {
    done,
    total,
    label = 'Fortschritt im Lernpfad',
    showCount = false,
    class: klass = ''
  }: Props = $props();

  const percent = $derived(total > 0 ? (done / total) * 100 : 0);
  const valueText = $derived(
    `${done} von ${total} Schritten erledigt (${formatPercentage(percent, 0)})`
  );
</script>

<div class="meter {klass}">
  <div
    class="meter__track"
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(percent)}
    aria-valuetext={valueText}
  >
    <span class="meter__fill" style={`width: ${percent}%`}></span>
  </div>
  {#if showCount}
    <p class="meter__count">{done} von {total} Schritten</p>
  {/if}
</div>

<style>
  .meter {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .meter__track {
    height: 0.375rem;
    border-radius: var(--radius-pill);
    background-color: var(--color-line);
    overflow: hidden;
  }

  .meter__fill {
    display: block;
    height: 100%;
    border-radius: var(--radius-pill);
    background-color: var(--color-brand);
    transition: width var(--transition-normal);
  }

  .meter__count {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }
</style>
