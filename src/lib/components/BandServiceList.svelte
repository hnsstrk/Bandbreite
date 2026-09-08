<script lang="ts">
  /**
   * Dienstliste der Banddetail-Randspalte: Name und Frequenzbereich je Dienst,
   * abgeschnitten nach `max` Einträgen mit Restanzeige.
   */
  import { formatFrequencyRange } from '$lib/data/bands';
  import type { RFApplication } from '$lib/data/applications';

  interface Props {
    applications: RFApplication[];
    max: number;
  }

  let { applications, max }: Props = $props();

  const shown = $derived(applications.slice(0, max));
  const remaining = $derived(Math.max(0, applications.length - max));
</script>

<div class="services-list">
  {#each shown as app (app.id)}
    <div class="service-item">
      <span class="service-name">{app.nameDE}</span>
      <span class="service-freq">{formatFrequencyRange(app.minHz, app.maxHz)}</span>
    </div>
  {/each}
</div>
{#if remaining > 0}
  <span class="more-count">+ {remaining} weitere Dienste</span>
{/if}

<style>
  .services-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .service-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 0.25rem 0.5rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-sm);
    gap: 0.5rem;
  }

  .service-name {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .service-freq {
    font-size: 0.65rem;
    font-family: var(--font-mono);
    color: var(--color-text-muted);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .more-count {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    padding-left: 0.5rem;
  }
</style>
