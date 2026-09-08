<script lang="ts">
  /** Detailtafel eines ausgewählten Senders. */
  import { TYPE_NAMES, type Transmitter } from '$lib/data/transmitters';
  import { formatFrequency, formatNumber, formatPowerWatts } from '$lib/utils/formatting';
  import Badge from './Badge.svelte';
  import Button from './Button.svelte';
  import Card from './Card.svelte';
  import { POWER_TYPE_LABELS, STATUS_CONFIG, SUBTYPE_LABELS, formatVerified } from './transmitterDatabase.svelte';

  interface Props {
    transmitter: Transmitter;
    onclose: () => void;
    onSelectFrequency?: (hz: number) => void;
  }

  let { transmitter, onclose, onSelectFrequency }: Props = $props();

  let verified = $derived(formatVerified(transmitter.lastVerified));
</script>

<Card title={transmitter.nameDE} subtitle={TYPE_NAMES[transmitter.type].nameDE} level={3} tone="sunken">
  {#snippet actions()}
    <Button size="sm" variant="ghost" iconOnly icon="close" label="Auswahl aufheben" onclick={onclose} />
  {/snippet}

  <dl class="details">
    <div class="details__item">
      <dt>Frequenz</dt>
      <dd class="details__mono">
        {formatFrequency(transmitter.frequencyHz)}
        {#if transmitter.frequencyHzSecondary}
          <span class="details__secondary">
            sekundär {formatFrequency(transmitter.frequencyHzSecondary)}
          </span>
        {/if}
      </dd>
    </div>

    <div class="details__item">
      <dt>Standort</dt>
      <dd>
        {transmitter.location.name}, {transmitter.location.country}
        {#if transmitter.location.latitude !== undefined && transmitter.location.longitude !== undefined}
          <span class="details__secondary details__mono">
            {formatNumber(transmitter.location.latitude, 4)}° N,
            {formatNumber(transmitter.location.longitude, 4)}° E
          </span>
        {/if}
      </dd>
    </div>

    {#if transmitter.powerWatts}
      <div class="details__item">
        <dt>Sendeleistung</dt>
        <dd>
          {formatPowerWatts(transmitter.powerWatts)}
          {#if transmitter.powerType}
            <span class="details__secondary">{POWER_TYPE_LABELS[transmitter.powerType]}</span>
          {/if}
        </dd>
      </div>
    {/if}

    {#if transmitter.subtype}
      <div class="details__item">
        <dt>Einordnung</dt>
        <dd>{SUBTYPE_LABELS[transmitter.subtype]}</dd>
      </div>
    {/if}

    {#if transmitter.coverage}
      <div class="details__item">
        <dt>Reichweite</dt>
        <dd>{transmitter.coverage}</dd>
      </div>
    {/if}

    {#if transmitter.operator}
      <div class="details__item">
        <dt>Betreiber</dt>
        <dd>{transmitter.operator}</dd>
      </div>
    {/if}

    <div class="details__item">
      <dt>Status</dt>
      <dd>
        <Badge tone={STATUS_CONFIG[transmitter.status].tone} dot>
          {STATUS_CONFIG[transmitter.status].label}
        </Badge>
      </dd>
    </div>

    {#if verified}
      <div class="details__item">
        <dt>Zuletzt geprüft</dt>
        <dd>{verified}</dd>
      </div>
    {/if}
  </dl>

  <p class="details__description">{transmitter.descriptionDE}</p>

  {#if transmitter.notes}
    <p class="details__notes"><strong>Hinweis:</strong> {transmitter.notes}</p>
  {/if}

  {#if onSelectFrequency}
    <Button size="sm" variant="primary" icon="arrow-right" onclick={() => onSelectFrequency?.(transmitter.frequencyHz)}>
      Frequenz übernehmen
    </Button>
  {/if}
</Card>

<style>
  .details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
    gap: 0.75rem;
    margin: 0 0 1rem 0;
  }

  .details__item dt {
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
    margin-bottom: 0.125rem;
  }

  .details__item dd {
    margin: 0;
    color: var(--color-ink);
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .details__mono {
    font-family: var(--font-mono);
  }

  .details__secondary {
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .details__description {
    margin: 0 0 0.75rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
    line-height: var(--line-height-relaxed);
  }

  .details__notes {
    margin: 0 0 0.75rem 0;
    padding: 0.625rem 0.75rem;
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
    background: var(--color-elevated);
    border-radius: var(--radius-control);
  }
</style>
