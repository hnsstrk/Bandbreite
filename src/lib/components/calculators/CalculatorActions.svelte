<script lang="ts">
  /**
   * Aktionsleiste jedes Rechners: „Link kopieren" und „Zurücksetzen".
   *
   * Der Link enthält den vollständigen Eingabezustand als Suchparameter,
   * damit ein Ergebnis teilbar ist. „Zurücksetzen" ist nur aktiv, solange
   * überhaupt etwas vom Standard abweicht.
   */
  import Button from '$lib/components/ui/Button.svelte';
  import { copyToClipboard } from '$lib/utils/urlState.svelte';

  interface Props {
    /** Vollständiger, teilbarer Link zum aktuellen Zustand */
    shareLink: string;
    /** Deaktiviert „Zurücksetzen", wenn alles auf Standard steht */
    canReset?: boolean;
    onreset: () => void;
    class?: string;
  }

  let { shareLink, canReset = true, onreset, class: klass = '' }: Props = $props();

  /** Wie lange die Rückmeldung „Kopiert" stehen bleibt (ms) */
  const FEEDBACK_MS = 2000;

  let status = $state<'idle' | 'copied' | 'failed'>('idle');
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  async function handleCopyClick() {
    const ok = await copyToClipboard(shareLink);
    status = ok ? 'copied' : 'failed';
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => (status = 'idle'), FEEDBACK_MS);
  }

  function handleResetClick() {
    onreset();
  }
</script>

<div class="calc-actions {klass}">
  <Button size="sm" icon="share" onclick={handleCopyClick}>Link kopieren</Button>
  <Button
    size="sm"
    variant="ghost"
    icon="reset"
    disabled={!canReset}
    onclick={handleResetClick}
  >
    Zurücksetzen
  </Button>
  <span class="calc-actions__status" role="status" aria-live="polite">
    {#if status === 'copied'}Link kopiert{:else if status === 'failed'}Kopieren nicht möglich{/if}
  </span>
</div>

<style>
  .calc-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .calc-actions__status {
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
    min-height: 1em;
  }
</style>
