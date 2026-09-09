<script lang="ts">
  /**
   * UKW-Seefunk: Einfrequenz- und Zweifrequenzbetrieb. Oben die Lage von
   * Schiffs- und Küstenfrequenz auf der Bandachse, unten das Zeitbild eines
   * Gesprächs. Daten aus $lib/data/maritimeChannels, Logik in
   * MaritimeDuplexModel.ts.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { formatFrequency } from '$lib/utils/formatting';
  import { MARITIME_VHF_CHANNELS, MARITIME_VHF_MAX_HZ, MARITIME_VHF_MIN_HZ } from '$lib/data/maritimeChannels';
  import {
    bandFraction,
    channelInfo,
    coastBandHz,
    isSimultaneous,
    shipBandHz,
    talkSlots,
    MARITIME_MODE_LABELS,
    MARITIME_MODE_NOTES,
    MARITIME_OFFSET_HZ,
    type MaritimeMode
  } from './MaritimeDuplexModel';

  const W = 800;
  const H = 320;
  const PAD = { left: 30, right: 30 };
  const AXIS_W = W - PAD.left - PAD.right;
  /** Bandachse oben, Zeitbild unten */
  const BAND_Y = 96;
  const BAND_H = 26;
  const TIME_TOP = 200;
  const ROW_H = 34;

  let channelId = $state('26');
  let mode = $state<MaritimeMode>('duplex');

  const info = $derived(channelInfo(channelId));
  const activeMode = $derived<MaritimeMode>(info && info.modes.includes(mode) ? mode : (info?.modes[0] ?? 'simplex'));
  const slots = $derived(info ? talkSlots(info.channel, activeMode) : []);
  const ship = shipBandHz();
  const coast = coastBandHz();

  const channelOptions = MARITIME_VHF_CHANNELS.map((entry) => ({
    value: entry.channel,
    label: `Kanal ${entry.channel} — ${entry.duplex ? 'Zweifrequenz' : 'Einfrequenz'}`
  }));
  const modeOptions = $derived((info?.modes ?? []).map((id) => ({ value: id, label: MARITIME_MODE_LABELS[id] })));

  const bx = (hz: number) => PAD.left + bandFraction(hz) * AXIS_W;
  const tx = (fraction: number) => PAD.left + fraction * AXIS_W;
</script>

<WidgetFrame
  title="Seefunk: eine Frequenz oder zwei?"
  description="Oben die Lage von Schiffs- und Küstenfrequenz im UKW-Seefunkband, unten das Zeitbild eines Gesprächs: im Wechselsprechen nacheinander, im Gegensprechen gleichzeitig."
  footnote="Kanalraster 25 kHz, Duplexabstand {formatFrequency(
    MARITIME_OFFSET_HZ,
    1
  )} nach VO Funk Appendix 18. Das Zeitbild ist schematisch — die Sprechdauern sind frei gewählt."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <text x={PAD.left} y="26" class="chart-axis-text">
      UKW-Seefunkband {formatFrequency(MARITIME_VHF_MIN_HZ, 3)} bis {formatFrequency(MARITIME_VHF_MAX_HZ, 3)}
    </text>

    <!-- Bänder -->
    <rect
      x={bx(ship.minHz)}
      y={BAND_Y}
      width={bx(ship.maxHz) - bx(ship.minHz)}
      height={BAND_H}
      fill="var(--color-series-1)"
      opacity="0.3"
    />
    <text
      x={(bx(ship.minHz) + bx(ship.maxHz)) / 2}
      y={BAND_Y + BAND_H + 34}
      text-anchor="middle"
      class="chart-legend-text"
    >
      Schiffsfunkstellen
    </text>
    <rect
      x={bx(coast.minHz)}
      y={BAND_Y}
      width={bx(coast.maxHz) - bx(coast.minHz)}
      height={BAND_H}
      fill="var(--color-series-2)"
      opacity="0.3"
    />
    <text
      x={(bx(coast.minHz) + bx(coast.maxHz)) / 2}
      y={BAND_Y + BAND_H + 34}
      text-anchor="middle"
      class="chart-legend-text"
    >
      Küstenfunkstellen
    </text>

    <line x1={PAD.left} y1={BAND_Y + BAND_H} x2={W - PAD.right} y2={BAND_Y + BAND_H} class="chart-axis-line" />
    {#each [156e6, 157e6, 158e6, 159e6, 160e6, 161e6, 162e6] as tick (tick)}
      <line x1={bx(tick)} y1={BAND_Y + BAND_H} x2={bx(tick)} y2={BAND_Y + BAND_H + 5} class="chart-axis-line" />
      <text x={bx(tick)} y={BAND_Y + BAND_H + 18} text-anchor="middle" class="chart-axis-text">
        {formatFrequency(tick, 0)}
      </text>
    {/each}

    {#if info}
      <!-- Gewählter Kanal -->
      <line
        x1={bx(info.channel.shipTxHz)}
        y1={BAND_Y - 28}
        x2={bx(info.channel.shipTxHz)}
        y2={BAND_Y + BAND_H}
        stroke="var(--color-series-1)"
        stroke-width="3"
      />
      <text x={bx(info.channel.shipTxHz)} y={BAND_Y - 32} text-anchor="middle" class="chart-legend-text">
        Schiff {formatFrequency(info.channel.shipTxHz, 3)}
      </text>
      {#if info.channel.duplex}
        <line
          x1={bx(info.channel.coastTxHz)}
          y1={BAND_Y - 28}
          x2={bx(info.channel.coastTxHz)}
          y2={BAND_Y + BAND_H}
          stroke="var(--color-series-2)"
          stroke-width="3"
        />
        <text x={bx(info.channel.coastTxHz)} y={BAND_Y - 32} text-anchor="middle" class="chart-legend-text">
          Küste {formatFrequency(info.channel.coastTxHz, 3)}
        </text>
        <line
          x1={bx(info.channel.shipTxHz)}
          y1={BAND_Y - 12}
          x2={bx(info.channel.coastTxHz)}
          y2={BAND_Y - 12}
          stroke="var(--color-marker)"
          stroke-width="2"
        />
        <text
          x={(bx(info.channel.shipTxHz) + bx(info.channel.coastTxHz)) / 2}
          y={BAND_Y - 16}
          text-anchor="middle"
          class="chart-legend-text"
        >
          {formatFrequency(info.offsetHz, 1)} Abstand
        </text>
      {/if}

      <!-- Zeitbild -->
      <text x={PAD.left} y={TIME_TOP - 14} class="chart-axis-text">
        Gesprächsablauf — {MARITIME_MODE_LABELS[activeMode]}
      </text>
      {#each ['schiff', 'kueste'] as who, row (who)}
        <text x={PAD.left} y={TIME_TOP + row * ROW_H + 20} class="chart-legend-text">
          {who === 'schiff' ? 'Schiff' : 'Küste'}
        </text>
        <line
          x1={PAD.left + 60}
          y1={TIME_TOP + row * ROW_H + ROW_H - 4}
          x2={W - PAD.right}
          y2={TIME_TOP + row * ROW_H + ROW_H - 4}
          class="chart-grid-line"
        />
      {/each}
      {#each slots as slot, index (index)}
        {@const row = slot.who === 'schiff' ? 0 : 1}
        <rect
          x={tx(slot.startFraction)}
          y={TIME_TOP + row * ROW_H}
          width={tx(slot.endFraction) - tx(slot.startFraction)}
          height={ROW_H - 8}
          fill={slot.who === 'schiff' ? 'var(--color-series-1)' : 'var(--color-series-2)'}
          opacity="0.75"
        />
        <text
          x={(tx(slot.startFraction) + tx(slot.endFraction)) / 2}
          y={TIME_TOP + row * ROW_H + 18}
          text-anchor="middle"
          class="chart-legend-text"
        >
          sendet auf {formatFrequency(slot.frequencyHz, 3)}
        </text>
      {/each}
      <text x={W - PAD.right} y={TIME_TOP + 2 * ROW_H + 22} text-anchor="end" class="chart-axis-text">Zeit →</text>
    {/if}
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Kanaldaten und Betriebsart</caption>
      <tbody>
        <tr><th>Kanal</th><td>{info?.channel.channel ?? '—'}</td></tr>
        <tr><th>Nutzung</th><td>{info?.usageLabel ?? '—'}</td></tr>
        <tr><th>Sendefrequenz Schiff</th><td>{formatFrequency(info?.channel.shipTxHz ?? 0, 3)}</td></tr>
        <tr><th>Sendefrequenz Küste</th><td>{formatFrequency(info?.channel.coastTxHz ?? 0, 3)}</td></tr>
        <tr><th>Duplexabstand</th><td>{formatFrequency(info?.offsetHz ?? 0, 1)}</td></tr>
        <tr><th>Betriebsart</th><td>{MARITIME_MODE_LABELS[activeMode]}</td></tr>
        <tr><th>Gleichzeitig sprechen</th><td>{isSimultaneous(activeMode) ? 'ja' : 'nein'}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Select label="Kanal" bind:value={channelId} options={channelOptions} />
    {#if modeOptions.length > 1}
      <Select
        label="Betriebsart"
        value={activeMode}
        options={modeOptions}
        onchange={(value) => (mode = value as MaritimeMode)}
      />
    {/if}
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Kanal {info?.channel.channel ?? '—'}"
      value={info?.channel.duplex ? 'zwei Frequenzen' : 'eine Frequenz'}
      hint={info?.usageLabel}
      emphasis="hero"
      copyable={false}
    />
    <ResultCard
      label="Schiff sendet auf"
      value={formatFrequency(info?.channel.shipTxHz ?? 0, 3)}
      hint="Küste {formatFrequency(info?.channel.coastTxHz ?? 0, 3)}"
      copyable={false}
    />
    <ResultCard
      label="Duplexabstand"
      value={info?.channel.duplex ? formatFrequency(info.offsetHz, 1) : 'keiner'}
      hint={info?.channel.duplex ? 'Küstenfrequenz liegt höher' : 'beide Seiten auf derselben Frequenz'}
      copyable={false}
    />
    <Callout tone="info" title={MARITIME_MODE_LABELS[activeMode]}>
      {MARITIME_MODE_NOTES[activeMode]}
      {#if info && !info.channel.duplex}
        Deshalb ist gerade der Not- und Anrufkanal ein Einfrequenzkanal: Wer mithört, bekommt beide Seiten mit und weiß,
        ob schon geholfen wird.
      {/if}
    </Callout>
  {/snippet}
</WidgetFrame>
