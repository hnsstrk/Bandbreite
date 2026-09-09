<script lang="ts">
  /**
   * Zellraster und Frequenzwiederverwendung: Sechseckraster mit wählbarer
   * Clustergröße, Wiederverwendungsabstand D = R·√(3N) und der Näherung des
   * Gleichkanal-Störabstands. Rechnung in CellReuseModel.ts (Rappaport §3.3/3.5).
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { formatDistance, formatNumber, formatPowerDb } from '$lib/utils/formatting';
  import {
    cellGroup,
    channelsPerCell,
    clusterRepresentatives,
    coChannelCirDb,
    hexCells,
    hexCenter,
    hexPoints,
    reuseDistanceM,
    reuseRatio,
    CELL_REUSE_LIMITS,
    CLUSTER_OPTIONS,
    CO_CHANNEL_INTERFERERS
  } from './CellReuseModel';

  const W = 800;
  const H = 420;
  /** Ringe des gezeichneten Rasters und Größe einer Zelle in Pixeln */
  const RINGS = 3;
  const SIZE = 36;
  const ORIGIN = { x: 235, y: 210 };
  /** Beginn der Legendenspalte */
  const LEGEND_X = 500;
  const GROUP_COLORS = [
    'var(--color-series-1)',
    'var(--color-series-2)',
    'var(--color-series-3)',
    'var(--color-series-4)',
    'var(--color-series-5)',
    'var(--color-series-7)',
    'var(--color-series-9)'
  ];

  let clusterId = $state('7');
  let cellRadiusM = $state<number>(CELL_REUSE_LIMITS.cellRadiusM.default);
  let pathLossExponent = $state<number>(CELL_REUSE_LIMITS.pathLossExponent.default);
  let channelCount = $state<number>(CELL_REUSE_LIMITS.channelCount.default);

  const cluster = $derived(CLUSTER_OPTIONS.find((option) => String(option.n) === clusterId) ?? CLUSTER_OPTIONS[3]);
  const reps = $derived(clusterRepresentatives(cluster.i, cluster.j));
  const cells = hexCells(RINGS);
  const cirDb = $derived(coChannelCirDb(cluster.n, pathLossExponent));
  const distanceM = $derived(reuseDistanceM(cellRadiusM, cluster.n));
  const perCell = $derived(channelsPerCell(channelCount, cluster.n));
  /** Gruppe der Mittelzelle — sie wird hervorgehoben */
  const highlighted = $derived(cellGroup(0, 0, cluster.i, cluster.j, reps));
  /** Nächste gleichkanalige Zelle: ein Gittervektor des Clusters */
  const coChannel = $derived(hexCenter(cluster.i, cluster.j, SIZE));

  const options = CLUSTER_OPTIONS.map((option) => ({
    value: String(option.n),
    label: `N = ${option.n} (i = ${option.i}, j = ${option.j})`
  }));

  const color = (group: number) =>
    GROUP_COLORS[((group % GROUP_COLORS.length) + GROUP_COLORS.length) % GROUP_COLORS.length];
</script>

<WidgetFrame
  title="Zellraster und Frequenzwiederverwendung"
  description="Sechseckraster aus Funkzellen. Gleiche Farbe bedeutet gleiche Kanalgruppe; der Abstand zwischen zwei gleichfarbigen Zellen ist der Wiederverwendungsabstand D."
  footnote="Schematisch: reale Zellen sind keine Sechsecke, sondern folgen Gelände und Bebauung. N = i² + i·j + j², D = R·√(3N), C/I ≈ (D/R)^n / {formatNumber(
    CO_CHANNEL_INTERFERERS,
    0
  )} nach Rappaport, Wireless Communications, §3.3 und §3.5."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    {#each cells as cell (`${cell.q}:${cell.r}`)}
      {@const center = hexCenter(cell.q, cell.r, SIZE)}
      {@const group = cellGroup(cell.q, cell.r, cluster.i, cluster.j, reps)}
      <polygon
        points={hexPoints(ORIGIN.x + center.x, ORIGIN.y + center.y, SIZE)}
        fill={color(group)}
        opacity={group === highlighted ? 0.9 : 0.3}
        stroke="var(--color-line)"
      />
      <text x={ORIGIN.x + center.x} y={ORIGIN.y + center.y + 4} text-anchor="middle" class="chart-legend-text">
        {group + 1}
      </text>
    {/each}

    <!-- Zellradius R an der Mittelzelle -->
    <line x1={ORIGIN.x} y1={ORIGIN.y} x2={ORIGIN.x + SIZE} y2={ORIGIN.y} stroke="var(--color-ink)" stroke-width="2" />
    <text x={ORIGIN.x + SIZE / 2} y={ORIGIN.y - 8} text-anchor="middle" class="chart-legend-text">R</text>

    <!-- Wiederverwendungsabstand D zur nächsten gleichkanaligen Zelle -->
    <line
      x1={ORIGIN.x}
      y1={ORIGIN.y}
      x2={ORIGIN.x + coChannel.x}
      y2={ORIGIN.y + coChannel.y}
      stroke="var(--color-marker)"
      stroke-width="3"
    />
    <circle cx={ORIGIN.x + coChannel.x} cy={ORIGIN.y + coChannel.y} r="6" fill="var(--color-marker)" />
    <text x={ORIGIN.x + coChannel.x / 2 + 10} y={ORIGIN.y + coChannel.y / 2 - 8} class="chart-legend-text">
      D = {formatDistance(distanceM, 1)}
    </text>

    <!-- Legende der Kanalgruppen -->
    <text x={LEGEND_X} y="40" class="chart-axis-text">Kanalgruppen im Cluster (N = {formatNumber(cluster.n, 0)})</text>
    {#each reps as _rep, index (index)}
      <rect
        x={LEGEND_X}
        y={54 + index * 26}
        width="18"
        height="18"
        fill={color(index)}
        opacity={index === highlighted ? 0.9 : 0.3}
      />
      <text x={LEGEND_X + 26} y={54 + index * 26 + 14} class="chart-legend-text">
        Gruppe {index + 1} · je {formatNumber(perCell, 0)} Kanäle
      </text>
    {/each}
    <text x={LEGEND_X} y={70 + reps.length * 26 + 14} class="chart-axis-text">
      D/R = √(3N) = {formatNumber(reuseRatio(cluster.n), 2)}
    </text>
    <text x={LEGEND_X} y={70 + reps.length * 26 + 34} class="chart-axis-text">
      C/I ≈ {formatPowerDb(cirDb, 1)} bei Pfadverlustexponent {formatNumber(pathLossExponent, 1)}
    </text>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Aktuelle Werte der Frequenzwiederverwendung</caption>
      <tbody>
        <tr><th>Clustergröße N</th><td>{formatNumber(cluster.n, 0)}</td></tr>
        <tr><th>Zellradius R</th><td>{formatDistance(cellRadiusM, 1)}</td></tr>
        <tr><th>Wiederverwendungsabstand D</th><td>{formatDistance(distanceM, 1)}</td></tr>
        <tr><th>Verhältnis D/R</th><td>{formatNumber(reuseRatio(cluster.n), 2)}</td></tr>
        <tr><th>Pfadverlustexponent</th><td>{formatNumber(pathLossExponent, 1)}</td></tr>
        <tr><th>Gleichkanal-Störabstand C/I</th><td>{formatPowerDb(cirDb, 1)}</td></tr>
        <tr><th>Kanäle im System</th><td>{formatNumber(channelCount, 0)}</td></tr>
        <tr><th>Kanäle je Zelle</th><td>{formatNumber(perCell, 0)}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Select label="Clustergröße N" bind:value={clusterId} {options} />
    <Slider
      label="Zellradius R"
      bind:value={cellRadiusM}
      min={CELL_REUSE_LIMITS.cellRadiusM.min}
      max={CELL_REUSE_LIMITS.cellRadiusM.max}
      step={100}
      format={(v) => formatDistance(v, 1)}
      unitSymbol="m"
    />
    <Slider
      label="Pfadverlustexponent n"
      bind:value={pathLossExponent}
      min={CELL_REUSE_LIMITS.pathLossExponent.min}
      max={CELL_REUSE_LIMITS.pathLossExponent.max}
      step={0.1}
      format={(v) => formatNumber(v, 1)}
    />
    <Slider
      label="Kanäle im System"
      bind:value={channelCount}
      min={CELL_REUSE_LIMITS.channelCount.min}
      max={CELL_REUSE_LIMITS.channelCount.max}
      step={12}
      format={(v) => formatNumber(v, 0)}
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Wiederverwendungsabstand D = R·√(3N)"
      value={formatDistance(distanceM, 1)}
      hint="D/R = {formatNumber(reuseRatio(cluster.n), 2)}"
      emphasis="hero"
      tone="success"
      copyable={false}
    />
    <ResultCard
      label="Gleichkanal-Störabstand C/I"
      value={formatPowerDb(cirDb, 1)}
      hint="{formatNumber(CO_CHANNEL_INTERFERERS, 0)} Störer im ersten Ring"
      tone={cirDb >= 18 ? 'success' : 'warning'}
      copyable={false}
    />
    <ResultCard
      label="Kanäle je Zelle"
      value={formatNumber(perCell, 0)}
      hint="von {formatNumber(channelCount, 0)} im System"
      copyable={false}
    />
    <Callout tone="info" title="Der Handel hinter der Clustergröße">
      {cluster.noteDE} Ein größeres N vergrößert den Abstand gleichkanaliger Zellen und hebt den Störabstand, teilt die Kanäle
      aber auf mehr Zellen auf. Kapazität gewinnt man deshalb nicht über N, sondern über kleinere Zellen: Halber Radius bedeutet
      den vierfachen Wert an Zellen je Fläche — und D schrumpft im gleichen Maß mit.
    </Callout>
  {/snippet}
</WidgetFrame>
