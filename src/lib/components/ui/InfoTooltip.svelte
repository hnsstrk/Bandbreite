<script lang="ts">
  interface Props {
    /** Title shown in the tooltip header */
    title: string;
    /** Short description (always visible in tooltip) */
    short: string;
    /** Detailed explanation (collapsible, optional) - HTML allowed (from trusted source only) */
    detailed?: string;
    /** Size variant */
    size?: 'sm' | 'md';
  }

  let { title, short, detailed, size = 'sm' }: Props = $props();

  let isOpen = $state(false);
  let showDetails = $state(false);
  let containerRef: HTMLElement | null = $state(null);

  function toggleTooltip(e: MouseEvent) {
    e.stopPropagation();
    isOpen = !isOpen;
    if (!isOpen) {
      showDetails = false;
    }
  }

  function closeTooltip() {
    isOpen = false;
    showDetails = false;
  }

  function toggleDetails(e: MouseEvent) {
    e.stopPropagation();
    showDetails = !showDetails;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen) {
      closeTooltip();
    }
  }

  function handleGlobalClick(e: MouseEvent) {
    if (containerRef && !containerRef.contains(e.target as Node)) {
      closeTooltip();
    }
  }

  // Manage global event listeners
  $effect(() => {
    if (isOpen) {
      // Use capture phase for reliable outside click detection
      document.addEventListener('click', handleGlobalClick, true);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  });
</script>

<span class="info-tooltip-container relative inline-block" bind:this={containerRef}>
  <button
    type="button"
    onclick={toggleTooltip}
    class="info-button {size === 'sm' ? 'w-4 h-4 text-xs' : 'w-5 h-5 text-sm'}"
    aria-label="Info: {title}"
    aria-expanded={isOpen}
    aria-haspopup="true"
  >
    i
  </button>

  {#if isOpen}
    <div
      class="tooltip-popup"
      role="tooltip"
      aria-live="polite"
    >
      <div class="tooltip-header">
        <span class="tooltip-title">{title}</span>
        <button
          type="button"
          onclick={closeTooltip}
          class="tooltip-close"
          aria-label="Tooltip schliessen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      <p class="tooltip-short">{short}</p>

      {#if detailed}
        <div class="tooltip-details-section">
          <button
            type="button"
            onclick={toggleDetails}
            class="tooltip-expand-btn"
            aria-expanded={showDetails}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="expand-icon {showDetails ? 'rotate-180' : ''}"
            >
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
            </svg>
            {showDetails ? 'Details ausblenden' : 'Mehr Details'}
          </button>

          {#if showDetails}
            <div class="tooltip-detailed">
              <!-- Content from trusted source (explanations.ts) only -->
              {@html detailed}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</span>

<style>
  .info-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: var(--color-bg-muted, #e5e7eb);
    color: var(--color-text-muted, #6b7280);
    font-weight: 600;
    font-style: italic;
    cursor: pointer;
    border: 1px solid var(--color-border-default, #d1d5db);
    transition: all 0.15s ease;
    font-family: Georgia, serif;
    vertical-align: middle;
    margin-left: 0.25rem;
  }

  .info-button:hover {
    background-color: var(--color-bg-hover, #d1d5db);
    color: var(--color-text-primary, #374151);
  }

  .info-button:focus {
    outline: 2px solid var(--color-focus, #3b82f6);
    outline-offset: 2px;
  }

  .tooltip-popup {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: calc(100% + 8px);
    z-index: 50;
    min-width: 280px;
    max-width: 360px;
    background-color: var(--color-bg-elevated, #ffffff);
    border: 1px solid var(--color-border-default, #e5e7eb);
    border-radius: 0.5rem;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    padding: 0;
    overflow: hidden;
  }

  .tooltip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background-color: var(--color-bg-muted, #f3f4f6);
    border-bottom: 1px solid var(--color-border-default, #e5e7eb);
  }

  .tooltip-title {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--color-text-primary, #111827);
  }

  .tooltip-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border: none;
    background: transparent;
    color: var(--color-text-muted, #6b7280);
    cursor: pointer;
    border-radius: 0.25rem;
  }

  .tooltip-close:hover {
    background-color: var(--color-bg-hover, #e5e7eb);
    color: var(--color-text-primary, #374151);
  }

  .tooltip-short {
    padding: 0.75rem;
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--color-text-secondary, #4b5563);
  }

  .tooltip-details-section {
    border-top: 1px solid var(--color-border-default, #e5e7eb);
  }

  .tooltip-expand-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: none;
    background: transparent;
    color: var(--color-text-accent, #3b82f6);
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
  }

  .tooltip-expand-btn:hover {
    background-color: var(--color-bg-muted, #f3f4f6);
  }

  .expand-icon {
    width: 1rem;
    height: 1rem;
    transition: transform 0.2s ease;
  }

  .expand-icon.rotate-180 {
    transform: rotate(180deg);
  }

  .tooltip-detailed {
    padding: 0.75rem;
    font-size: 0.75rem;
    line-height: 1.6;
    color: var(--color-text-muted, #6b7280);
    background-color: var(--color-bg-subtle, #fafafa);
    border-top: 1px solid var(--color-border-default, #e5e7eb);
  }

  .tooltip-detailed :global(code) {
    font-family: ui-monospace, monospace;
    background-color: var(--color-bg-muted, #f3f4f6);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.7rem;
  }

  .tooltip-detailed :global(strong) {
    color: var(--color-text-primary, #374151);
  }

  .tooltip-detailed :global(p) {
    margin: 0.5rem 0;
  }

  .tooltip-detailed :global(p:first-child) {
    margin-top: 0;
  }

  .tooltip-detailed :global(p:last-child) {
    margin-bottom: 0;
  }

  @media (max-width: 640px) {
    .tooltip-popup {
      min-width: 260px;
      max-width: calc(100vw - 2rem);
      left: auto;
      right: 0;
      transform: none;
    }
  }
</style>
