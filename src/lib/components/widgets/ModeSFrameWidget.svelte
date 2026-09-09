<script lang="ts">
  /**
   * Modus-S-Antwort DF17 als Bitfeld: Preambel, Formatkennung, ICAO-Adresse,
   * Nachrichtenfeld und Prüfsumme über der Zeitachse des Antwortrahmens.
   * Feldaufteilung und Zeitlagen in ModeSFrameModel.ts (ICAO Annex 10 Vol. IV).
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { formatNumber } from '$lib/utils/formatting';
  import { MODE_S_BIT_US, MODE_S_DATA_BLOCK_START_US, SSR_REPLY_HZ } from './SsrModel';
  import {
    addressSpace,
    fieldTiming,
    frameDurationUs,
    preamblePulses,
    toBinary,
    DF17_FIELDS,
    DF17_FORMAT_NUMBER,
    DF17_TOTAL_BITS,
    MODE_S_BIT_RATE_BPS,
    MODE_S_PULSE_WIDTH_US
  } from './ModeSFrameModel';

  const W = 800;
  const H = 280;
  const PAD = { left: 20, right: 20 };
  const PLOT_W = W - PAD.left - PAD.right;
  /** Zeilen: Gesamtrahmen, Preambel-Ausschnitt, Bitmuster-Ausschnitt */
  const FRAME_Y = 54;
  const FRAME_H = 44;
  const DETAIL_Y = 176;
  const DETAIL_H = 40;
  /** Dauer des gezeigten Bitmuster-Ausschnitts in µs */
  const DETAIL_BITS = 6;
  /** Beispielhafte Bitfolge des Ausschnitts (Pulslagemodulation) */
  const SAMPLE_BITS: (0 | 1)[] = [1, 0, 0, 1, 0, 1];
  const FIELD_COLORS = [
    'var(--color-series-1)',
    'var(--color-series-2)',
    'var(--color-series-3)',
    'var(--color-series-4)',
    'var(--color-series-5)'
  ];

  let selectedId = $state('aa');

  const totalUs = frameDurationUs();
  const selected = $derived(DF17_FIELDS.find((field) => field.id === selectedId) ?? DF17_FIELDS[0]);
  const timing = $derived(fieldTiming(selected));
  const options = DF17_FIELDS.map((field) => ({
    value: field.id,
    label: `${field.label} — ${field.nameDE} (${field.bits} Bit)`
  }));

  /** Zeitpunkt in µs → x-Koordinate des Gesamtrahmens */
  const frameX = (us: number) => PAD.left + (us / totalUs) * PLOT_W;
  /** Zeitpunkt in µs → x-Koordinate des Ausschnitts (0 … 8 µs Preambel) */
  const preambleX = (us: number) => PAD.left + (us / MODE_S_DATA_BLOCK_START_US) * (PLOT_W / 2 - 20);
  const detailStart = PAD.left + PLOT_W / 2 + 20;
  const detailW = PLOT_W / 2 - 20;
  const detailX = (us: number) => detailStart + (us / (DETAIL_BITS * MODE_S_BIT_US)) * detailW;
</script>

<WidgetFrame
  title="Modus-S-Antwort DF17: 112 Bit im Zeitraster"
  description="Antwortrahmen einer ADS-B-Aussendung: acht Mikrosekunden Preambel, danach 112 Bit Datenblock, aufgeteilt in Formatkennung, Fähigkeitskennung, ICAO-Adresse, Nachrichtenfeld und Prüfsumme."
  footnote="Antwortfrequenz {formatNumber(SSR_REPLY_HZ / 1e6, 0)} MHz, {formatNumber(
    MODE_S_BIT_RATE_BPS / 1e6,
    0
  )} Mbit/s in Pulslagemodulation, Impulsbreite {formatNumber(
    MODE_S_PULSE_WIDTH_US,
    1
  )} µs. Quelle: ICAO Annex 10 Vol. IV, §3.1.2.3; Feldbedeutung nach RTCA DO-260B."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <text x={PAD.left} y="24" class="chart-axis-text">
      Rahmen: {formatNumber(totalUs, 0)} µs — Preambel {formatNumber(MODE_S_DATA_BLOCK_START_US, 0)} µs + {formatNumber(
        DF17_TOTAL_BITS,
        0
      )} Bit
    </text>

    <!-- Preambel im Gesamtrahmen -->
    <rect
      x={frameX(0)}
      y={FRAME_Y}
      width={frameX(MODE_S_DATA_BLOCK_START_US) - frameX(0)}
      height={FRAME_H}
      fill="var(--color-series-8)"
      opacity="0.5"
    />

    {#each DF17_FIELDS as field, i (field.id)}
      {@const span = fieldTiming(field)}
      <rect
        x={frameX(span.startUs)}
        y={FRAME_Y}
        width={frameX(span.startUs + span.durationUs) - frameX(span.startUs)}
        height={FRAME_H}
        fill={FIELD_COLORS[i % FIELD_COLORS.length]}
        opacity={field.id === selectedId ? 1 : 0.45}
        stroke="var(--color-line)"
      />
      <text
        x={(frameX(span.startUs) + frameX(span.startUs + span.durationUs)) / 2}
        y={FRAME_Y + FRAME_H / 2 + 4}
        text-anchor="middle"
        class="chart-legend-text"
      >
        {field.label}
      </text>
      {#if frameX(span.startUs + span.durationUs) - frameX(span.startUs) > 60}
        <text
          x={(frameX(span.startUs) + frameX(span.startUs + span.durationUs)) / 2}
          y={FRAME_Y + FRAME_H + 16}
          text-anchor="middle"
          class="chart-axis-text"
        >
          {formatNumber(field.bits, 0)} Bit
        </text>
      {/if}
    {/each}
    <line
      x1={PAD.left}
      y1={FRAME_Y + FRAME_H + 24}
      x2={W - PAD.right}
      y2={FRAME_Y + FRAME_H + 24}
      class="chart-axis-line"
    />
    <text x={PAD.left} y={FRAME_Y + FRAME_H + 38} class="chart-axis-text">0 µs</text>
    <text x={W - PAD.right} y={FRAME_Y + FRAME_H + 38} text-anchor="end" class="chart-axis-text">
      {formatNumber(totalUs, 0)} µs
    </text>

    <!-- Ausschnitt links: Preambel -->
    <text x={PAD.left} y={DETAIL_Y - 14} class="chart-axis-text">Preambel: vier Impulse (Ausschnitt 0–8 µs)</text>
    <line
      x1={preambleX(0)}
      y1={DETAIL_Y + DETAIL_H}
      x2={preambleX(MODE_S_DATA_BLOCK_START_US)}
      y2={DETAIL_Y + DETAIL_H}
      class="chart-axis-line"
    />
    {#each preamblePulses() as pulse (pulse.startUs)}
      <rect
        x={preambleX(pulse.startUs)}
        y={DETAIL_Y}
        width={Math.max(2, preambleX(pulse.widthUs) - preambleX(0))}
        height={DETAIL_H}
        fill="var(--color-series-6)"
      />
      <text x={preambleX(pulse.startUs)} y={DETAIL_Y + DETAIL_H + 16} class="chart-axis-text">
        {formatNumber(pulse.startUs, 1)}
      </text>
    {/each}

    <!-- Ausschnitt rechts: Pulslagemodulation -->
    <text x={detailStart} y={DETAIL_Y - 14} class="chart-axis-text">
      Pulslagemodulation: Eins vorn, Null hinten (je {formatNumber(MODE_S_BIT_US, 0)} µs)
    </text>
    <line
      x1={detailStart}
      y1={DETAIL_Y + DETAIL_H}
      x2={detailStart + detailW}
      y2={DETAIL_Y + DETAIL_H}
      class="chart-axis-line"
    />
    {#each SAMPLE_BITS as bit, i (i)}
      <rect
        x={detailX(i * MODE_S_BIT_US + (bit === 1 ? 0 : MODE_S_BIT_US / 2))}
        y={DETAIL_Y}
        width={detailX(MODE_S_BIT_US / 2) - detailX(0)}
        height={DETAIL_H}
        fill={bit === 1 ? 'var(--color-series-2)' : 'var(--color-series-4)'}
      />
      <line
        x1={detailX(i * MODE_S_BIT_US)}
        y1={DETAIL_Y}
        x2={detailX(i * MODE_S_BIT_US)}
        y2={DETAIL_Y + DETAIL_H + 4}
        class="chart-grid-line"
      />
      <text
        x={detailX((i + 0.5) * MODE_S_BIT_US)}
        y={DETAIL_Y + DETAIL_H + 16}
        text-anchor="middle"
        class="chart-axis-text"
      >
        {bit}
      </text>
    {/each}
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Felder der DF17-Antwort</caption>
      <thead>
        <tr><th>Feld</th><th>Bits</th><th>Lage im Rahmen</th></tr>
      </thead>
      <tbody>
        {#each DF17_FIELDS as field (field.id)}
          {@const span = fieldTiming(field)}
          <tr>
            <td>{field.label} — {field.nameDE}</td>
            <td>{field.startBit} bis {field.startBit + field.bits - 1}</td>
            <td>{formatNumber(span.startUs, 0)} bis {formatNumber(span.startUs + span.durationUs, 0)} µs</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Select label="Feld auswählen" bind:value={selectedId} {options} />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="{selected.label} — {selected.nameDE}"
      value="{formatNumber(selected.bits, 0)} Bit"
      hint="Bit {selected.startBit} bis {selected.startBit + selected.bits - 1}, {formatNumber(
        timing.startUs,
        0
      )} bis {formatNumber(timing.startUs + timing.durationUs, 0)} µs"
      emphasis="hero"
      copyable={false}
    />
    <Callout tone="info" title={selected.nameDE}>
      {selected.purposeDE}
    </Callout>
    <ResultCard
      label="Formatkennung DF17"
      value={toBinary(DF17_FORMAT_NUMBER, 5)}
      hint="binär in den ersten fünf Bit"
      copyable={false}
    />
    <ResultCard
      label="Adressraum der ICAO-Adresse"
      value={formatNumber(addressSpace(), 0)}
      hint="24 Bit, weltweit eindeutig"
      copyable={false}
    />
  {/snippet}
</WidgetFrame>
