<script lang="ts">
  /**
   * Kettenrechnung des Pegelrechners: eine Liste von Gewinnen und Verlusten
   * mit laufender Summe und Balkendiagramm.
   *
   * Die Summenlogik steht in `$lib/utils/decibel`, die Zeichenmaße in
   * `decibelCalculator.svelte.ts`.
   */
  import ChartFrame from '$lib/components/charts/ChartFrame.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import { formatNumber } from '$lib/utils/formatting';
  import { accumulateChain, chainGainDb, chainLossDb, chainTotalDbm, type ChainStage } from '$lib/utils/decibel';
  import {
    CHAIN_AXIS_LEFT,
    CHAIN_AXIS_RIGHT,
    CHAIN_REFERENCE_DBM,
    CHAIN_ROW_HEIGHT,
    CHAIN_TICKS,
    CHAIN_VIEW_WIDTH,
    chainX
  } from './decibelCalculator.svelte';

  /** Eine Stufe mit den Grenzen ihres Reglers. */
  type Stage = ChainStage & { min: number; max: number };

  interface Props {
    /** Stufen der Kette; wird direkt bearbeitet */
    stages: Stage[];
  }

  let { stages = $bindable() }: Props = $props();

  /** Kopfhöhe über der ersten Zeile und Fußhöhe für die Achse in Pixeln. */
  const HEAD_HEIGHT = 14;
  const FOOT_HEIGHT = 30;
  const BAR_HEIGHT = 20;

  let chain = $derived(accumulateChain(stages));
  let total = $derived(chainTotalDbm(stages));
  let gain = $derived(chainGainDb(stages));
  let loss = $derived(chainLossDb(stages));
  let viewHeight = $derived(HEAD_HEIGHT + stages.length * CHAIN_ROW_HEIGHT + FOOT_HEIGHT);

  function signed(value: number, decimals: number = 1): string {
    return `${value > 0 ? '+' : ''}${formatNumber(value, decimals)}`;
  }
</script>

<div class="chain">
  <ChartFrame
    title="Pegel nach jeder Stufe"
    level={3}
    minWidth={480}
    description="Balkendiagramm einer Übertragungskette: Gewinne verlängern den Balken nach rechts, Verluste nach links; rechts steht der Pegel hinter jeder Stufe."
    footnote="Absolutpegel in dBm beziehen sich auf 1 mW. In der Kette werden Dezibel addiert statt Faktoren multipliziert."
  >
    <svg viewBox="0 0 {CHAIN_VIEW_WIDTH} {viewHeight}" aria-hidden="true">
      {#each CHAIN_TICKS as tick (tick)}
        <line
          x1={chainX(tick)}
          y1={HEAD_HEIGHT - 6}
          x2={chainX(tick)}
          y2={viewHeight - FOOT_HEIGHT}
          class="chart-grid-line"
        />
        <text x={chainX(tick)} y={viewHeight - FOOT_HEIGHT + 18} text-anchor="middle" class="chart-axis-text">
          {tick}
        </text>
      {/each}
      <line x1={chainX(0)} y1={HEAD_HEIGHT - 6} x2={chainX(0)} y2={viewHeight - FOOT_HEIGHT} class="chart-axis-line" />

      {#each chain as point, index (point.stage.id)}
        {@const previous = index === 0 ? 0 : chain[index - 1].levelDbm}
        {@const y = HEAD_HEIGHT + index * CHAIN_ROW_HEIGHT}
        {@const from = Math.min(chainX(previous), chainX(point.levelDbm))}
        {@const to = Math.max(chainX(previous), chainX(point.levelDbm))}
        <rect
          x={from}
          {y}
          width={Math.max(2, to - from)}
          height={BAR_HEIGHT}
          rx="3"
          fill={point.stage.db >= 0 ? 'var(--color-series-2)' : 'var(--color-series-6)'}
          opacity="0.85"
        />
        <text x={CHAIN_AXIS_LEFT + 6} y={y + 14} class="chart-axis-text">
          {point.stage.label}
          {signed(point.stage.db, 0)} dB
        </text>
        <text x={CHAIN_AXIS_RIGHT} y={y + 14} text-anchor="end" class="chart-axis-text" font-weight="600">
          {formatNumber(point.levelDbm, 1)} dBm
        </text>
      {/each}

      <line
        x1={chainX(CHAIN_REFERENCE_DBM)}
        y1={HEAD_HEIGHT - 6}
        x2={chainX(CHAIN_REFERENCE_DBM)}
        y2={viewHeight - FOOT_HEIGHT}
        stroke="var(--color-series-6)"
        stroke-width="1"
        stroke-dasharray="3,3"
      />
      <text x={chainX(CHAIN_REFERENCE_DBM) + 4} y={viewHeight - FOOT_HEIGHT + 18} class="chart-legend-text">
        Empfindlichkeit {CHAIN_REFERENCE_DBM} dBm
      </text>
    </svg>

    {#snippet dataTable()}
      <table>
        <caption>Beitrag und Pegel je Stufe der Kette</caption>
        <thead>
          <tr><th>Stufe</th><th>Beitrag</th><th>Pegel danach</th></tr>
        </thead>
        <tbody>
          {#each chain as point (point.stage.id)}
            <tr>
              <td>{point.stage.label}</td>
              <td>{signed(point.stage.db, 0)} dB</td>
              <td>{formatNumber(point.levelDbm, 1)} dBm</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/snippet}
  </ChartFrame>

  <div class="chain__controls">
    {#each stages as stage (stage.id)}
      <Slider
        label={stage.label}
        bind:value={stage.db}
        min={stage.min}
        max={stage.max}
        step={0.5}
        format={(value) => `${signed(value, 1)} dB`}
        unitSymbol="dB"
      />
    {/each}
  </div>

  <div class="chain__results">
    <ResultCard
      label="Pegel am Ende"
      value={formatNumber(total, 1)}
      unit="dBm"
      tone={total >= CHAIN_REFERENCE_DBM ? 'success' : 'warning'}
      secondary={total >= CHAIN_REFERENCE_DBM
        ? `${formatNumber(total - CHAIN_REFERENCE_DBM, 1)} dB Reserve`
        : `${formatNumber(CHAIN_REFERENCE_DBM - total, 1)} dB fehlen`}
      emphasis="hero"
    />
    <ResultCard label="Summe der Gewinne" value={signed(gain, 1)} unit="dB" copyable={false} />
    <ResultCard label="Summe der Verluste" value={`−${formatNumber(loss, 1)}`} unit="dB" copyable={false} />
  </div>
</div>

<style>
  .chain {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .chain__controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
    gap: 0.75rem 1.25rem;
  }

  .chain__results {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    gap: 0.75rem;
  }
</style>
