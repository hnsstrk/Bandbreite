<script lang="ts">
  /**
   * W10 – dB-Spielplatz: Regler dB ↔ Faktor (Leistung und Spannung), Merkregel-Chips
   * und eine Kettenrechnung mit Balken (Mini-Link-Budget). Rechnung in DecibelModel.ts.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { formatNumber, formatNumberAuto } from '$lib/utils/formatting';
  import {
    dbToPowerRatio,
    dbToVoltageRatio,
    accumulateChain,
    chainTotalDbm,
    DECIBEL_LIMITS,
    DECIBEL_RULES,
    DEFAULT_CHAIN,
    TYPICAL_RX_SENSITIVITY_DBM,
    type ChainStage
  } from './DecibelModel';

  const W = 800;
  const H = 230;
  const AXIS_X0 = 60;
  const AXIS_X1 = 780;
  const BAR_H = 22;
  const ROW_GAP = 34;
  const LEVEL_MIN = -120;
  const LEVEL_MAX = 60;

  let db = $state<number>(DECIBEL_LIMITS.default);
  let stages = $state<ChainStage[]>(DEFAULT_CHAIN.map((stage) => ({ ...stage })));

  const powerRatio = $derived(dbToPowerRatio(db));
  const voltageRatio = $derived(dbToVoltageRatio(db));
  const chain = $derived(accumulateChain(stages));
  const total = $derived(chainTotalDbm(stages));

  const xOf = (levelDbm: number) =>
    AXIS_X0 +
    ((Math.max(LEVEL_MIN, Math.min(LEVEL_MAX, levelDbm)) - LEVEL_MIN) / (LEVEL_MAX - LEVEL_MIN)) * (AXIS_X1 - AXIS_X0);

  function applyRule(value: number) {
    db = value;
  }

  function resetChain() {
    stages = DEFAULT_CHAIN.map((stage) => ({ ...stage }));
  }
</script>

<WidgetFrame
  title="Dezibel-Spielplatz"
  description="Balkendiagramm einer Übertragungskette: der Pegel in dBm nach jeder Stufe, Gewinne verlängern den Balken nach rechts, Verluste nach links."
  footnote="Leistung: dB = 10·log₁₀(P₂/P₁). Spannung: dB = 20·log₁₀(U₂/U₁). Absolutpegel dBm beziehen sich auf 1 mW; in der Kette werden dB einfach addiert."
  stacked
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    {#each [-120, -90, -60, -30, 0, 30, 60] as tick (tick)}
      <line x1={xOf(tick)} y1="8" x2={xOf(tick)} y2={H - 26} class="chart-grid-line" />
      <text x={xOf(tick)} y={H - 10} text-anchor="middle" class="chart-axis-text">{tick} dBm</text>
    {/each}
    <line x1={xOf(0)} y1="8" x2={xOf(0)} y2={H - 26} class="chart-axis-line" />
    {#each chain as point, i (point.stage.id)}
      {@const previous = i === 0 ? 0 : chain[i - 1].levelDbm}
      {@const y = 12 + i * ROW_GAP}
      {@const from = Math.min(xOf(previous), xOf(point.levelDbm))}
      {@const to = Math.max(xOf(previous), xOf(point.levelDbm))}
      <rect
        x={from}
        {y}
        width={Math.max(2, to - from)}
        height={BAR_H}
        rx="3"
        fill={point.stage.db >= 0 ? 'var(--color-series-2)' : 'var(--color-series-6)'}
        opacity="0.85"
      />
      <text x={AXIS_X0 + 4} y={y + 15} class="chart-axis-text"
        >{point.stage.label}
        {point.stage.db > 0 ? '+' : ''}{formatNumber(point.stage.db, 0)} dB</text
      >
      <text x={AXIS_X1} y={y + 15} text-anchor="end" class="chart-axis-text" font-weight="600"
        >→ {formatNumber(point.levelDbm, 1)} dBm</text
      >
    {/each}
    <line
      x1={xOf(TYPICAL_RX_SENSITIVITY_DBM)}
      y1="8"
      x2={xOf(TYPICAL_RX_SENSITIVITY_DBM)}
      y2={H - 26}
      stroke="var(--color-series-6)"
      stroke-width="1"
      stroke-dasharray="3,3"
    />
    <text x={xOf(TYPICAL_RX_SENSITIVITY_DBM) + 4} y="18" class="chart-legend-text" fill="var(--color-danger-ink)"
      >Empfindlichkeit {TYPICAL_RX_SENSITIVITY_DBM} dBm</text
    >
    <line x1={xOf(total)} y1="8" x2={xOf(total)} y2={H - 26} class="chart-marker-crosshair" />
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Pegel nach jeder Stufe der Kette</caption>
      <thead><tr><th>Stufe</th><th>Beitrag</th><th>Pegel danach</th></tr></thead>
      <tbody>
        {#each chain as point (point.stage.id)}
          <tr
            ><td>{point.stage.label}</td><td>{formatNumber(point.stage.db, 0)} dB</td><td
              >{formatNumber(point.levelDbm, 1)} dBm</td
            ></tr
          >
        {/each}
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <div class="db-grid">
      <div class="db-column">
        <Slider
          label="Verhältnis in dB"
          bind:value={db}
          min={DECIBEL_LIMITS.min}
          max={DECIBEL_LIMITS.max}
          step={0.5}
          format={(v) => `${v > 0 ? '+' : ''}${formatNumber(v, 1)} dB`}
          unitSymbol="dB"
          ticks={[
            { at: -40, label: '−40' },
            { at: 0, label: '0' },
            { at: 40, label: '+40' }
          ]}
        />
        <div class="db-chips" role="group" aria-label="Merkregeln">
          {#each DECIBEL_RULES as rule (rule.db)}
            <Button
              size="sm"
              variant={db === rule.db ? 'primary' : 'secondary'}
              pressed={db === rule.db}
              onclick={() => applyRule(rule.db)}>{rule.label}</Button
            >
          {/each}
        </div>
      </div>
      <div class="db-column">
        <p class="db-chain-title">Kettenrechnung (Mini-Link-Budget)</p>
        {#each stages as stage (stage.id)}
          <Slider
            label={stage.label}
            bind:value={stage.db}
            min={stage.min}
            max={stage.max}
            step={1}
            format={(v) => `${v > 0 ? '+' : ''}${formatNumber(v, 0)} dB`}
            unitSymbol="dB"
          />
        {/each}
        <Button size="sm" variant="ghost" icon="reset" onclick={resetChain}>Kette zurücksetzen</Button>
      </div>
    </div>
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Leistungsfaktor 10^(dB/10)"
      value={formatNumberAuto(powerRatio)}
      secondary="{db > 0 ? '+' : ''}{formatNumber(db, 1)} dB"
      emphasis="hero"
      copyable={false}
    />
    <ResultCard label="Spannungsfaktor 10^(dB/20)" value={formatNumberAuto(voltageRatio)} copyable={false} />
    <ResultCard
      label="Empfangspegel der Kette"
      value={formatNumber(total, 1)}
      unit="dBm"
      tone={total >= TYPICAL_RX_SENSITIVITY_DBM ? 'success' : 'warning'}
      secondary={total >= TYPICAL_RX_SENSITIVITY_DBM
        ? `über typischer Empfindlichkeit ${TYPICAL_RX_SENSITIVITY_DBM} dBm`
        : `unter ${TYPICAL_RX_SENSITIVITY_DBM} dBm – Reserve fehlt`}
      copyable={false}
    />
  {/snippet}
</WidgetFrame>

<style>
  .db-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.75rem;
  }

  @media (min-width: 720px) {
    .db-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .db-column {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    min-width: 0;
  }

  .db-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .db-chain-title {
    margin: 0;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }
</style>
