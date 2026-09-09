<script lang="ts">
  /**
   * Alarmierungskette der BOS: Notruf, Leitstelle, Alarmierung, Einsatzkräfte,
   * Rückmeldung — als laufende Marke. Umschalter zwischen ZVEI-Tonfolge,
   * POCSAG-Funkruf und TETRA-Gruppenruf. Rechnung in BosAlarmChainModel.ts.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import { AnimationLoop } from '$lib/components/knowledge/animationLoop.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { formatFixed, formatNumber } from '$lib/utils/formatting';
  import { wrapLines } from './textWrap';
  import {
    alertSignalDurationS,
    stepAtProgress,
    stepFraction,
    stepStartFraction,
    tetraSlotDurationS,
    ALERT_PATHS,
    CHAIN_STEPS,
    POCSAG_RATES_BPS,
    TETRA_CARRIER_HZ,
    type AlertVariant
  } from './BosAlarmChainModel';

  const W = 800;
  const H = 232;
  const PAD = 12;
  const TRACK_W = W - 2 * PAD;
  /** Oberkante und Höhe der Kettenglieder */
  const BOX_Y = 44;
  const BOX_H = 58;
  /** Erste Zeile des Erklärtextes */
  const TEXT_Y = 150;
  /** Ein Durchlauf der Marke in ms */
  const SWEEP_MS = 14_000;
  const STEP_COLORS = [
    'var(--color-series-1)',
    'var(--color-series-5)',
    'var(--color-series-3)',
    'var(--color-series-2)',
    'var(--color-series-4)'
  ];

  let variant = $state<AlertVariant>('pocsag');
  let rateBps = $state<number>(1200);

  const loop = new AnimationLoop();
  $effect(() => loop.attach());

  const progress = $derived((loop.elapsedMs % SWEEP_MS) / SWEEP_MS);
  const cursor = $derived(stepAtProgress(progress));
  const activeStep = $derived(CHAIN_STEPS[cursor.index]);
  const path = $derived(ALERT_PATHS[variant]);
  const signalS = $derived(alertSignalDurationS(variant, rateBps));
  const markerX = $derived(PAD + progress * TRACK_W);

  const boxX = (index: number) => PAD + stepStartFraction(index) * TRACK_W;
  const boxW = (index: number) => stepFraction(index) * TRACK_W;

  const seconds = (value: number) => `${formatFixed(value, 2)} s`;
  const variantOptions = Object.values(ALERT_PATHS).map((entry) => ({
    value: entry.id,
    label: entry.label
  }));
  const rateOptions = POCSAG_RATES_BPS.map((rate) => ({
    value: String(rate),
    label: `${formatNumber(rate, 0)} bit/s`
  }));
</script>

<WidgetFrame
  title="Alarmierungskette: vom Notruf bis zur Rückmeldung"
  description="Fünf Glieder nebeneinander: Notruf 112, Leitstelle, Alarmierung, Einsatzkräfte und Rückmeldung. Eine laufende Marke wandert durch die Kette; das jeweils erreichte Glied wird hervorgehoben und erklärt."
  playable
  playing={loop.playing}
  reducedMotion={loop.reducedMotion}
  ontoggle={() => loop.toggle()}
  footnote="Die Breite der Glieder ist schematisch und trägt keine Zeitachse — für die Dauer von Abfrage und Ausrücken gibt es keinen allgemeingültigen Wert. Berechnet ist allein die Aussendedauer des Telegramms (ITU-R M.584-2 für POCSAG, TR BOS für die ZVEI-Tonfolge, ETSI EN 300 392-2 für TETRA; dort ist ein Multirahmen als kleinste Signalisierungseinheit angesetzt — Annahme). Rufaufbau- und Netzlaufzeiten sind nicht enthalten."
  stacked
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <text x={PAD} y="22" class="chart-axis-text">
      Schematischer Ablauf ohne Zeitmaßstab · Alarmierungsweg: {path.label}
    </text>

    {#each CHAIN_STEPS as step, index (step.id)}
      {@const x = boxX(index)}
      {@const width = boxW(index)}
      {@const active = index === cursor.index}
      <rect
        {x}
        y={BOX_Y}
        width={width - 4}
        height={BOX_H}
        fill={STEP_COLORS[index % STEP_COLORS.length]}
        opacity={active ? 0.35 : 0.12}
        stroke={active ? 'var(--color-ink)' : 'var(--color-line)'}
        stroke-width={active ? 2 : 1}
        rx="2"
      />
      <text x={x + 10} y={BOX_Y + 22} class="chart-axis-text" font-weight={active ? 600 : 400}>
        {step.label}
      </text>
      <text x={x + 10} y={BOX_Y + 40} class="chart-legend-text">{step.actorDE}</text>
      {#if index < CHAIN_STEPS.length - 1}
        <path d="M{x + width - 6},{BOX_Y + BOX_H / 2} l-7,-5 v10 Z" fill="var(--color-ink-subtle)" />
      {/if}
    {/each}

    <!-- Laufende Marke -->
    <line
      x1={markerX}
      y1={BOX_Y - 10}
      x2={markerX}
      y2={BOX_Y + BOX_H + 10}
      stroke="var(--color-marker)"
      stroke-width="2"
    />
    <circle cx={markerX} cy={BOX_Y + BOX_H / 2} r="7" fill="var(--color-marker)" />

    <!-- Erklärtext des erreichten Glieds -->
    <text x={PAD} y={TEXT_Y - 18} class="chart-axis-text" font-weight="600">
      {activeStep.label} — {activeStep.actorDE}
    </text>
    {#each wrapLines(activeStep.detailDE, 108, 3) as line, lineIndex (lineIndex)}
      <text x={PAD} y={TEXT_Y + lineIndex * 17} class="chart-legend-text">{line}</text>
    {/each}

    <!-- Aussendedauer des Alarmierungstelegramms -->
    <line x1={PAD} y1={H - 34} x2={W - PAD} y2={H - 34} class="chart-axis-line" />
    <text x={PAD} y={H - 14} class="chart-legend-text">
      Aussendedauer des Telegramms: {seconds(signalS)} · {path.carrierDE}
    </text>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Glieder der Alarmierungskette und Kennwerte des Alarmierungswegs</caption>
      <thead><tr><th>Glied</th><th>Beteiligte</th></tr></thead>
      <tbody>
        {#each CHAIN_STEPS as step (step.id)}
          <tr><td>{step.label}</td><td>{step.actorDE}</td></tr>
        {/each}
        <tr><th>Alarmierungsweg</th><td>{path.label}</td></tr>
        <tr><th>Träger</th><td>{path.carrierDE}</td></tr>
        <tr><th>Aussendedauer</th><td>{seconds(signalS)}</td></tr>
        <tr><th>TETRA-Zeitschlitz</th><td>{formatFixed(tetraSlotDurationS() * 1000, 2)} ms</td></tr>
        <tr><th>TETRA-Trägerabstand</th><td>{formatNumber(TETRA_CARRIER_HZ / 1000, 0)} kHz</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Select
      label="Alarmierungsweg"
      value={variant}
      options={variantOptions}
      onchange={(value) => (variant = value as AlertVariant)}
    />
    <Select
      label="Übertragungsrate des Funkrufs"
      value={String(rateBps)}
      options={rateOptions}
      disabled={variant !== 'pocsag'}
      hint={variant === 'pocsag' ? 'ITU-R M.584-2 kennt drei Raten.' : 'Nur beim POCSAG-Funkruf wirksam.'}
      onchange={(value) => (rateBps = Number(value))}
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Aussendedauer des Telegramms"
      value={seconds(signalS)}
      hint={path.payloadDE}
      emphasis="hero"
      tone="success"
      copyable={false}
    />
    <ResultCard label="Träger" value={path.carrierDE} copyable={false} />
    <Callout tone="info" title={path.label} source={path.source}>
      {path.noteDE}
    </Callout>
    <Callout tone="warning" title="Warum hier keine Minutenangaben stehen">
      Wie lange Abfrage, Disposition und Ausrücken dauern, hängt von Leitstelle, Einsatzstichwort und Einheit ab. Für
      diese Glieder gibt es keinen zitierbaren Zahlenwert — die Kette ist deshalb bewusst ohne Zeitachse gezeichnet.
      Berechenbar ist nur, wie lange das Alarmierungstelegramm selbst in der Luft ist.
    </Callout>
  {/snippet}
</WidgetFrame>
