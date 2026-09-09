<script lang="ts">
  import { InfoTooltipState } from './infoTooltip.svelte';

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

  const tooltip = new InfoTooltipState();

  $effect(() => tooltip.attach());
  $effect(() => tooltip.measure());
</script>

<span class="info-tooltip-container relative inline-block" bind:this={tooltip.containerRef}>
  <button
    type="button"
    bind:this={tooltip.buttonRef}
    onclick={(e) => tooltip.toggle(e)}
    class="info-button {size === 'sm' ? 'h-4 w-4 text-xs' : 'h-5 w-5 text-sm'}"
    aria-label="Info: {title}"
    aria-expanded={tooltip.isOpen}
    aria-haspopup="true"
  >
    i
  </button>

  {#if tooltip.isOpen}
    <div
      class="tooltip-popup"
      class:is-positioned={tooltip.placement !== null}
      role="tooltip"
      aria-live="polite"
      bind:this={tooltip.popupRef}
      style:top={tooltip.placement ? `${tooltip.placement.top}px` : undefined}
      style:left={tooltip.placement ? `${tooltip.placement.left}px` : undefined}
    >
      <div class="tooltip-header">
        <span class="tooltip-title">{title}</span>
        <button type="button" onclick={() => tooltip.close()} class="tooltip-close" aria-label="Tooltip schließen">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3 w-3">
            <path
              d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
            />
          </svg>
        </button>
      </div>

      <p class="tooltip-short">{short}</p>

      {#if detailed}
        <div class="tooltip-details-section">
          <button
            type="button"
            onclick={(e) => tooltip.toggleDetails(e)}
            class="tooltip-expand-btn"
            aria-expanded={tooltip.showDetails}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="expand-icon {tooltip.showDetails ? 'rotate-180' : ''}"
            >
              <path
                fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd"
              />
            </svg>
            {tooltip.showDetails ? 'Details ausblenden' : 'Mehr Details'}
          </button>

          {#if tooltip.showDetails}
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
    background-color: var(--color-bg-muted);
    color: var(--color-text-muted);
    font-weight: 600;
    font-style: italic;
    cursor: pointer;
    border: 1px solid var(--color-border-default);
    transition: all 0.15s ease;
    font-family: Georgia, serif;
    vertical-align: middle;
    margin-left: 0.25rem;
  }

  .info-button:hover {
    background-color: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .info-button:focus {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  .tooltip-popup {
    /* Fixed im Viewport: entgeht `overflow: auto` der Sidebar und anderer Container;
       Position wird per JS gemessen und in den Viewport geklemmt (tooltipPosition.ts). */
    position: fixed;
    top: 0;
    left: 0;
    z-index: 50;
    min-width: min(280px, calc(100vw - 1rem));
    max-width: min(360px, calc(100vw - 1rem));
    /* Unsichtbar bis zur ersten Messung, sonst flackert es kurz oben links */
    visibility: hidden;
    background-color: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: 0.5rem;
    box-shadow:
      0 10px 25px -5px rgba(0, 0, 0, 0.1),
      0 8px 10px -6px rgba(0, 0, 0, 0.1);
    padding: 0;
    overflow: hidden;
  }

  .tooltip-popup.is-positioned {
    visibility: visible;
  }

  .tooltip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background-color: var(--color-bg-muted);
    border-bottom: 1px solid var(--color-border-default);
  }

  .tooltip-title {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--color-text-primary);
  }

  .tooltip-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border: none;
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    border-radius: 0.25rem;
  }

  .tooltip-close:hover {
    background-color: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .tooltip-short {
    padding: 0.75rem;
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
  }

  .tooltip-details-section {
    border-top: 1px solid var(--color-border-default);
  }

  .tooltip-expand-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: none;
    background: transparent;
    color: var(--color-text-accent);
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
  }

  .tooltip-expand-btn:hover {
    background-color: var(--color-bg-muted);
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
    color: var(--color-text-muted);
    background-color: var(--color-bg-subtle);
    border-top: 1px solid var(--color-border-default);
  }

  .tooltip-detailed :global(code) {
    font-family: ui-monospace, monospace;
    background-color: var(--color-bg-muted);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.7rem;
  }

  .tooltip-detailed :global(strong) {
    color: var(--color-text-primary);
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
</style>
