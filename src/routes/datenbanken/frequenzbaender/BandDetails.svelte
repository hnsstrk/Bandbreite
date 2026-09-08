<script lang="ts">
  /** Detailtafel eines ausgewählten Frequenzbandes. */
  import {
    getPropagationModeDescriptionDE,
    type FrequencyBandDetail
  } from '$lib/data/frequencyBands';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { PROPAGATION_CONFIG, bandRange } from './bandCategories.svelte';

  interface Props {
    band: FrequencyBandDetail;
    onclose: () => void;
  }

  let { band, onclose }: Props = $props();

  let config = $derived(PROPAGATION_CONFIG[band.propagationMode]);
</script>

<Card title={band.nameDE} subtitle={band.name} level={2}>
  {#snippet actions()}
    <Button
      size="sm"
      variant="ghost"
      iconOnly
      icon="close"
      label="Details schließen"
      onclick={onclose}
    />
  {/snippet}

  <dl class="bd">
    <div><dt>Frequenzbereich</dt><dd class="bd__mono">{bandRange(band)}</dd></div>
    <div><dt>Wellenlänge</dt><dd class="bd__mono">{band.wavelength}</dd></div>
    <div>
      <dt>System</dt>
      <dd><Badge tone="brand">{band.category.toUpperCase()}</Badge></dd>
    </div>
    <div>
      <dt>Ausbreitungsmodus</dt>
      <dd>
        <span class="bd__mode" style="--mode-color: {config.token}">
          <Icon name={config.icon} size={16} />
          {getPropagationModeDescriptionDE(band.propagationMode)}
        </span>
      </dd>
    </div>
  </dl>

  <h3 class="bd__heading">Ausbreitungseigenschaften</h3>
  <p class="bd__text">{band.propagationDE}</p>

  <h3 class="bd__heading">Anwendungen</h3>
  <ul class="bd__tags">
    {#each band.applicationsDE as application (application)}
      <li><Badge tone="neutral">{application}</Badge></li>
    {/each}
  </ul>

  {#if band.notes}
    <Callout tone="info" title="Hinweis">{band.notes}</Callout>
  {/if}
</Card>

<style>
  .bd {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
    gap: 0.75rem;
    margin: 0 0 1rem 0;
  }

  .bd dt {
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
    margin-bottom: 0.125rem;
  }

  .bd dd {
    margin: 0;
    color: var(--color-ink);
  }

  .bd__mono {
    font-family: var(--font-mono);
  }

  .bd__mode {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.125rem 0.5rem;
    border: 1px solid var(--mode-color);
    border-radius: var(--radius-pill);
    color: var(--mode-color);
  }

  .bd__heading {
    margin: 1rem 0 0.375rem 0;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .bd__text {
    margin: 0 0 0.5rem 0;
    color: var(--color-ink-muted);
    line-height: var(--line-height-relaxed);
  }

  .bd__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin: 0 0 1rem 0;
    padding: 0;
    list-style: none;
  }
</style>
