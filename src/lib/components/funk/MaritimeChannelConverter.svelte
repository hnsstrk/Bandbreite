<script lang="ts">
  /**
   * Seefunk-Kanalumrechner: Kanalbezeichnung ↔ Frequenz für das UKW-Band nach
   * VO Funk Appendix 18, mit Filter nach Nutzungsart.
   *
   * Die Kanaltabelle und die Nachschlagefunktionen stehen in
   * `data/maritimeChannels.ts`; hier sitzt nur die Bedienung.
   */
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import MaritimeChannelTable from './MaritimeChannelTable.svelte';
  import { FREQUENCY_UNITS } from '$lib/data/units';
  import { formatFrequency } from '$lib/utils/formatting';
  import {
    MARITIME_DUPLEX_OFFSET_HZ,
    MARITIME_USAGE_LABELS,
    MARITIME_VHF_CHANNELS,
    MARITIME_VHF_MAX_HZ,
    MARITIME_VHF_MIN_HZ,
    findMaritimeChannel,
    maritimeChannelsByUsage,
    maritimeChannelsForFrequency,
    maritimeUsageCounts,
    type MaritimeUsage
  } from '$lib/data/maritimeChannels';

  /** Voreinstellung: der Not- und Anrufkanal. */
  const DEFAULT_CHANNEL = '16';

  /** Voreinstellung der Frequenzabfrage: Kanal 70 (digitaler Selektivruf). */
  const DEFAULT_FREQUENCY_HZ = 156_525_000;

  const MHZ_UNITS = FREQUENCY_UNITS.filter((unit) => ['MHz', 'kHz'].includes(unit.id));

  let usage = $state<MaritimeUsage | 'alle'>('alle');
  let channelId = $state(DEFAULT_CHANNEL);
  let frequencyHz = $state(DEFAULT_FREQUENCY_HZ);
  let frequencyUnit = $state('MHz');

  const usageOptions = [
    { value: 'alle', label: `Alle Nutzungen (${MARITIME_VHF_CHANNELS.length})` },
    ...maritimeUsageCounts()
      .filter((entry) => entry.count > 0)
      .map((entry) => ({ value: entry.id, label: `${entry.label} (${entry.count})` }))
  ];

  const filtered = $derived(maritimeChannelsByUsage(usage));

  const channelOptions = $derived(filtered.map((entry) => ({ value: entry.channel, label: `Kanal ${entry.channel}` })));

  const channel = $derived(findMaritimeChannel(channelId));
  const hits = $derived(maritimeChannelsForFrequency(frequencyHz));

  /** Wechselt der Filter, bleibt der gewählte Kanal nur, wenn er noch passt. */
  function handleUsageChange(value: string) {
    usage = value as MaritimeUsage | 'alle';
    const stillVisible = maritimeChannelsByUsage(usage).some((entry) => entry.channel === channelId);
    if (!stillVisible) channelId = maritimeChannelsByUsage(usage)[0]?.channel ?? DEFAULT_CHANNEL;
  }

  function reset() {
    usage = 'alle';
    channelId = DEFAULT_CHANNEL;
    frequencyHz = DEFAULT_FREQUENCY_HZ;
  }

  /** Lesbare Trefferliste der Frequenzabfrage. */
  const hitLabel = $derived(
    hits.length === 0
      ? 'kein Kanal'
      : hits
          .map((hit) => `Kanal ${hit.channel.channel} (${hit.direction === 'schiff' ? 'Schiff' : 'Küste'})`)
          .join(' · ')
  );
</script>

<Card title="Seefunk-Kanal und Frequenz umrechnen" subtitle="UKW-Seefunkband nach VO Funk Appendix 18">
  {#snippet actions()}
    <Badge tone="info">{filtered.length} Kanäle</Badge>
  {/snippet}

  <div class="fields">
    <Select
      label="Nutzung"
      value={usage}
      options={usageOptions}
      onchange={handleUsageChange}
      hint="Schränkt die Kanalliste und die Tabelle ein."
    />
    <Select label="Kanal" bind:value={channelId} options={channelOptions} />
    <NumberInput
      label="Frequenz nachschlagen"
      bind:value={frequencyHz}
      bind:unit={frequencyUnit}
      units={MHZ_UNITS}
      min={MARITIME_VHF_MIN_HZ}
      max={MARITIME_VHF_MAX_HZ}
      step="any"
    />
  </div>

  <div class="results">
    <ResultCard
      label="Schiffsfunkstelle sendet"
      value={channel ? formatFrequency(channel.shipTxHz, 3) : '—'}
      secondary={channel ? `Kanal ${channel.channel}` : undefined}
      hint={channel?.maxPowerW ? `höchstens ${channel.maxPowerW} W` : 'höchstens 25 W'}
    />
    <ResultCard
      label="Küstenfunkstelle sendet"
      value={channel ? formatFrequency(channel.coastTxHz, 3) : '—'}
      secondary={channel?.duplex
        ? `Zweifrequenzbetrieb, Ablage ${formatFrequency(MARITIME_DUPLEX_OFFSET_HZ, 1)}`
        : 'Einfrequenzbetrieb — dieselbe Frequenz'}
    />
    <ResultCard
      label="Kanal bei {formatFrequency(frequencyHz, 3)}"
      value={hitLabel}
      secondary={hits.length > 0 ? MARITIME_USAGE_LABELS[hits[0].channel.usage] : undefined}
      hint={hits.length === 0 ? 'außerhalb des Rasters oder unbelegt' : undefined}
    />
  </div>

  {#if channel}
    <p class="note">{channel.noteDE}</p>
  {/if}

  <div class="actions">
    <Button icon="reset" variant="secondary" onclick={reset}>Zurücksetzen</Button>
  </div>

  <MaritimeChannelTable rows={filtered} highlight={channel?.channel} />
</Card>

<style>
  .fields,
  .results {
    display: grid;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .note {
    margin: 0 0 1rem;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
    color: var(--color-ink-muted);
  }

  .actions {
    margin-bottom: 1rem;
  }

  @media (min-width: 48rem) {
    .fields {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      align-items: end;
    }

    .results {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>
