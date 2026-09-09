<script lang="ts">
  /**
   * DAB-Gleichwellennetz: zwei Sender auf derselben Frequenz, ein Empfänger
   * dazwischen. Oben die Geometrie, unten die Ankunftszeiten gegen das
   * Schutzintervall. Rechnung in DabSfnModel.ts (ETSI EN 300 401, Tab. 38).
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { formatDistance, formatFrequency, formatNumber, formatPowerDb } from '$lib/utils/formatting';
  import { blockBandwidthHz, computeDabSfn, guardDistanceM, DAB_MODES, DAB_SFN_LIMITS } from './DabSfnModel';

  const W = 800;
  const H = 360;
  const PAD = { left: 70, right: 70 };
  const LINE_W = W - PAD.left - PAD.right;
  /** Höhe der Sendermast-Darstellung und Lage der Grundlinie */
  const MAP_Y = 118;
  const MAST_H = 56;
  /** Zeitachse unten */
  const TIME_Y = 320;
  const BAR_H = 62;

  let modeId = $state('I');
  let spacingM = $state<number>(DAB_SFN_LIMITS.spacingM.default);
  let positionPercent = $state<number>(DAB_SFN_LIMITS.positionPercent.default);

  const mode = $derived(DAB_MODES.find((entry) => entry.id === modeId) ?? DAB_MODES[0]);
  const result = $derived(computeDabSfn(spacingM, positionPercent / 100, mode.guardS));
  const options = DAB_MODES.map((entry) => ({ value: entry.id, label: entry.label }));

  /** Zeitachse: mindestens das Schutzintervall, sonst der größere Wert */
  const timeSpanS = $derived(Math.max(mode.guardS, result.delayS) * 1.35);
  const timeX = (seconds: number) => PAD.left + (seconds / timeSpanS) * LINE_W;
  const receiverX = $derived(PAD.left + (positionPercent / 100) * LINE_W);
  const us = (seconds: number) => `${formatNumber(seconds * 1e6, 0)} µs`;
</script>

<WidgetFrame
  title="Gleichwellennetz: Laufzeitunterschied und Schutzintervall"
  description="Zwei Sender strahlen denselben DAB-Block ab. Oben die Lage des Empfängers zwischen ihnen, unten die Ankunftszeiten beider Signale gegenüber dem Schutzintervall."
  footnote="Schematisch: reale Netze haben mehr als zwei Sender und ungleiche Sendeleistungen. Schutzintervall des {mode.label.split(
    ' ('
  )[0]}: {us(mode.guardS)} — das entspricht einem Wegunterschied von {formatDistance(
    guardDistanceM(mode.guardS),
    1
  )}. Quelle: ETSI EN 300 401, Tab. 38."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <text x={PAD.left} y="24" class="chart-axis-text"
      >Draufsicht: zwei Sender, ein Empfänger auf der Verbindungslinie</text
    >

    <line x1={PAD.left} y1={MAP_Y} x2={W - PAD.right} y2={MAP_Y} class="chart-axis-line" />

    <!-- Sender 1 -->
    <line x1={PAD.left} y1={MAP_Y} x2={PAD.left} y2={MAP_Y - MAST_H} stroke="var(--color-series-1)" stroke-width="4" />
    <circle cx={PAD.left} cy={MAP_Y - MAST_H} r="6" fill="var(--color-series-1)" />
    <text x={PAD.left} y={MAP_Y - MAST_H - 14} text-anchor="middle" class="chart-legend-text">Sender 1</text>
    <!-- Sender 2 -->
    <line
      x1={W - PAD.right}
      y1={MAP_Y}
      x2={W - PAD.right}
      y2={MAP_Y - MAST_H}
      stroke="var(--color-series-2)"
      stroke-width="4"
    />
    <circle cx={W - PAD.right} cy={MAP_Y - MAST_H} r="6" fill="var(--color-series-2)" />
    <text x={W - PAD.right} y={MAP_Y - MAST_H - 14} text-anchor="middle" class="chart-legend-text">Sender 2</text>

    <!-- Empfänger -->
    <path d="M{receiverX},{MAP_Y - 10} l-9,18 l18,0 Z" fill="var(--color-marker)" stroke="var(--color-ink)" />
    <text x={receiverX} y={MAP_Y + 32} text-anchor="middle" class="chart-legend-text">Empfänger</text>

    <line
      x1={PAD.left}
      y1={MAP_Y + 48}
      x2={receiverX}
      y2={MAP_Y + 48}
      stroke="var(--color-series-1)"
      stroke-width="2"
    />
    <text x={(PAD.left + receiverX) / 2} y={MAP_Y + 44} text-anchor="middle" class="chart-axis-text">
      {formatDistance(result.distance1M, 1)}
    </text>
    <line
      x1={receiverX}
      y1={MAP_Y + 66}
      x2={W - PAD.right}
      y2={MAP_Y + 66}
      stroke="var(--color-series-2)"
      stroke-width="2"
    />
    <text x={(receiverX + W - PAD.right) / 2} y={MAP_Y + 62} text-anchor="middle" class="chart-axis-text">
      {formatDistance(result.distance2M, 1)}
    </text>

    <!-- Zeitachse mit Schutzintervall -->
    <text x={PAD.left} y={TIME_Y - BAR_H - 26} class="chart-axis-text">
      Ankunft der Signale, Zeit nach dem ersten Signal
    </text>
    <rect
      x={timeX(0)}
      y={TIME_Y - BAR_H - 12}
      width={timeX(mode.guardS) - timeX(0)}
      height={BAR_H + 12}
      fill="var(--color-success)"
      opacity="0.18"
    />
    <text x={timeX(mode.guardS) - 6} y={TIME_Y - BAR_H - 2} text-anchor="end" class="chart-legend-text">
      Schutzintervall {us(mode.guardS)}
    </text>
    <line
      x1={timeX(mode.guardS)}
      y1={TIME_Y - BAR_H - 12}
      x2={timeX(mode.guardS)}
      y2={TIME_Y}
      stroke="var(--color-success)"
      stroke-width="2"
    />

    <line x1={PAD.left} y1={TIME_Y} x2={W - PAD.right} y2={TIME_Y} class="chart-axis-line" />
    <rect x={timeX(0)} y={TIME_Y - BAR_H} width="10" height={BAR_H} fill="var(--color-series-1)" />
    <text x={timeX(0) + 14} y={TIME_Y - BAR_H + 12} class="chart-legend-text">erstes Signal</text>
    <rect
      x={timeX(result.delayS)}
      y={TIME_Y - BAR_H * 0.72}
      width="10"
      height={BAR_H * 0.72}
      fill={result.withinGuard ? 'var(--color-series-2)' : 'var(--color-series-6)'}
    />
    <text x={timeX(result.delayS) + 14} y={TIME_Y - BAR_H * 0.72 + 12} class="chart-legend-text">
      zweites Signal, {us(result.delayS)} später — {result.withinGuard ? 'trägt bei' : 'stört'}
    </text>
    <text x={W - PAD.right} y={TIME_Y + 18} text-anchor="end" class="chart-axis-text">Zeit →</text>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Aktuelle Werte des Gleichwellennetzes</caption>
      <tbody>
        <tr><th>Übertragungsmodus</th><td>{mode.label}</td></tr>
        <tr><th>Schutzintervall</th><td>{us(mode.guardS)}</td></tr>
        <tr><th>Senderabstand</th><td>{formatDistance(spacingM, 1)}</td></tr>
        <tr><th>Abstand zu Sender 1</th><td>{formatDistance(result.distance1M, 1)}</td></tr>
        <tr><th>Abstand zu Sender 2</th><td>{formatDistance(result.distance2M, 1)}</td></tr>
        <tr><th>Wegunterschied</th><td>{formatDistance(result.pathDifferenceM, 1)}</td></tr>
        <tr><th>Laufzeitunterschied</th><td>{us(result.delayS)}</td></tr>
        <tr><th>Pegelunterschied</th><td>{formatPowerDb(result.levelDifferenceDb, 1)}</td></tr>
        <tr><th>Im Schutzintervall</th><td>{result.withinGuard ? 'ja' : 'nein'}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Select label="Übertragungsmodus" bind:value={modeId} {options} />
    <Slider
      label="Senderabstand"
      bind:value={spacingM}
      min={DAB_SFN_LIMITS.spacingM.min}
      max={DAB_SFN_LIMITS.spacingM.max}
      step={1000}
      format={(v) => formatDistance(v, 1)}
      unitSymbol="m"
    />
    <Slider
      label="Empfänger auf der Strecke"
      bind:value={positionPercent}
      min={DAB_SFN_LIMITS.positionPercent.min}
      max={DAB_SFN_LIMITS.positionPercent.max}
      step={1}
      format={(v) => `${formatNumber(v, 0)} %`}
      unitSymbol="Prozent"
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Laufzeitunterschied"
      value={us(result.delayS)}
      hint="Wegunterschied {formatDistance(result.pathDifferenceM, 1)}"
      emphasis="hero"
      tone={result.withinGuard ? 'success' : 'danger'}
      copyable={false}
    />
    <ResultCard
      label="Schutzintervall entspricht"
      value={formatDistance(guardDistanceM(mode.guardS), 1)}
      hint="{us(mode.guardS)} · c"
      copyable={false}
    />
    <ResultCard
      label={result.withinGuard ? 'Gewinn durch Signaladdition' : 'Überschreitung'}
      value={result.withinGuard ? formatPowerDb(result.combinedGainDb, 1) : formatDistance(-result.marginM, 1)}
      hint={result.withinGuard
        ? `Pegelunterschied ${formatPowerDb(result.levelDifferenceDb, 1)}`
        : 'so weit liegt das Echo hinter dem Schutzintervall'}
      tone={result.withinGuard ? 'success' : 'warning'}
      copyable={false}
    />
    <Callout tone={result.withinGuard ? 'tip' : 'warning'} title="Was das Schutzintervall leistet">
      {mode.noteDE} Ein Block ist {formatFrequency(blockBandwidthHz(mode), 3)} breit ({formatNumber(mode.carriers, 0)} Unterträger
      im Abstand von {formatFrequency(mode.carrierSpacingHz, 0)}). Solange das zweite Signal innerhalb von {us(
        mode.guardS
      )} eintrifft, wertet der Empfänger es als Teil desselben Symbols und gewinnt Pegel; danach fällt es in das nächste Symbol
      und wirkt als Störer.
    </Callout>
  {/snippet}
</WidgetFrame>
