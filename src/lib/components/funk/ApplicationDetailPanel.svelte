<script lang="ts">
  /**
   * Detailtafel eines Eintrags der Funkdienst-Datenbank: Frequenzlage,
   * Bandzuordnung nach ITU und IEEE, Wellenlänge und weiterführende Links.
   */
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { formatFrequency, formatWavelength } from '$lib/utils/formatting';
  import { formatFrequencyRange } from '$lib/data/bands';
  import type { RFApplication } from '$lib/data/applications';
  import { applicationDetail, widthHz } from './applicationFilter.svelte';

  interface Props {
    application: RFApplication;
  }

  let { application }: Props = $props();

  const detail = $derived(applicationDetail(application));
</script>

<div class="detail">
  <div class="detail__head">
    <h3>{application.nameDE}</h3>
    <Badge tone="brand">{detail.categoryLabel}</Badge>
    <Badge tone="neutral">{detail.regionLabel}</Badge>
  </div>

  <p>{application.descriptionDE}</p>
  {#if application.notes}
    <p class="detail__notes">{application.notes}</p>
  {/if}

  <dl>
    <div>
      <dt>Frequenzbereich</dt>
      <dd>{formatFrequencyRange(application.minHz, application.maxHz)}</dd>
    </div>
    <div>
      <dt>Bandbreite</dt>
      <dd>{formatFrequency(widthHz(application), 0)}</dd>
    </div>
    <div>
      <dt>Mittenfrequenz</dt>
      <dd>{formatFrequency(detail.centerHz, 3)}</dd>
    </div>
    <div>
      <dt>Wellenlänge (Mitte)</dt>
      <dd>{formatWavelength(detail.wavelengthM)}</dd>
    </div>
    <div>
      <dt>ITU-Band</dt>
      <dd>{detail.ituBands.length > 0 ? detail.ituBands.join(', ') : '—'}</dd>
    </div>
    <div>
      <dt>IEEE-Band</dt>
      <dd>{detail.ieeeBands.length > 0 ? detail.ieeeBands.join(', ') : '—'}</dd>
    </div>
    {#if application.standard}
      <div>
        <dt>Standard</dt>
        <dd>{application.standard}</dd>
      </div>
    {/if}
  </dl>

  <div class="detail__actions">
    <Button href="/spektrum/?f={Math.round(detail.centerHz)}" iconEnd="arrow-right" size="sm">
      Im Spektrum öffnen
    </Button>
    <Button href="/rechner/fspl/?f={Math.round(detail.centerHz)}" iconEnd="arrow-right" size="sm" variant="ghost">
      Freiraumdämpfung rechnen
    </Button>
    <Button href="/datenbanken/frequenzbaender/" iconEnd="arrow-right" size="sm" variant="ghost">
      Bänder nachschlagen
    </Button>
  </div>
</div>

<style>
  .detail {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background-color: var(--color-sunken);
    border: 1px solid var(--color-line-subtle);
    border-radius: var(--radius-card);
  }

  .detail__head {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  h3 {
    margin: 0;
    font-size: var(--font-size-base);
    color: var(--color-ink);
  }

  p {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
    color: var(--color-ink-muted);
  }

  .detail__notes {
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  dl {
    display: grid;
    gap: 0.5rem 1.5rem;
    margin: 0;
    grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  }

  dt {
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  dd {
    margin: 0;
    font-size: var(--font-size-sm);
    font-family: var(--font-mono);
    color: var(--color-ink);
  }

  .detail__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>
