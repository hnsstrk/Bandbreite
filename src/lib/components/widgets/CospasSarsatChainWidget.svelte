<script lang="ts">
  /**
   * Rettungskette Cospas-Sarsat: 406-MHz-Bake, Satellitensegment, Bodenstation
   * (LUT), Kontrollzentrum (MCC), Rettungsleitstelle (RCC) und Einsatzmittel,
   * als laufende Marke. Rechnung in CospasSarsatModel.ts.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import { AnimationLoop } from '$lib/components/knowledge/animationLoop.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { formatDistance, formatFixed, formatFrequency, formatNumber, formatPercentage } from '$lib/utils/formatting';
  import { wrapLines } from './textWrap';
  import {
    beaconDutyCycle,
    burstsPerHour,
    rescueFraction,
    rescueStartFraction,
    rescueStepAtProgress,
    segmentDopplerHz,
    segmentPeriodS,
    segmentUplinkDelayS,
    BEACON_BURST_SHORT_S,
    BEACON_MAX_HZ,
    BEACON_MIN_HZ,
    HOMING_FREQUENCY_HZ,
    MEOSAR_LOCATION_CONFIDENCE,
    MEOSAR_LOCATION_RADIUS_M,
    MEOSAR_LOCATION_TIME_S,
    RESCUE_STEPS,
    SAR_SEGMENTS,
    type SarSegment
  } from './CospasSarsatModel';

  const W = 800;
  const H = 244;
  const PAD = 12;
  const TRACK_W = W - 2 * PAD;
  const BOX_Y = 48;
  const BOX_H = 58;
  const TEXT_Y = 158;
  /** Ein Durchlauf der Marke in ms */
  const SWEEP_MS = 15_000;
  const STEP_COLORS = [
    'var(--color-series-6)',
    'var(--color-series-1)',
    'var(--color-series-5)',
    'var(--color-series-4)',
    'var(--color-series-3)',
    'var(--color-series-2)'
  ];

  let segmentId = $state<SarSegment>('meosar');
  let intervalS = $state<number>(50);

  const loop = new AnimationLoop();
  $effect(() => loop.attach());

  const progress = $derived((loop.elapsedMs % SWEEP_MS) / SWEEP_MS);
  const cursor = $derived(rescueStepAtProgress(progress));
  const activeStep = $derived(RESCUE_STEPS[cursor.index]);
  const segment = $derived(SAR_SEGMENTS[segmentId]);
  const periodMin = $derived(segmentPeriodS(segmentId) / 60);
  const delayMs = $derived(segmentUplinkDelayS(segmentId) * 1000);
  const dopplerHz = $derived(segmentDopplerHz(segmentId));
  const markerX = $derived(PAD + progress * TRACK_W);

  const boxX = (index: number) => PAD + rescueStartFraction(index) * TRACK_W;
  const boxW = (index: number) => rescueFraction(index) * TRACK_W;

  /** Wozu die Verschiebung im jeweiligen Segment taugt. */
  const DOPPLER_NOTE: Record<SarSegment, string> = {
    leosar: 'Grundlage der Ortung im Überflug',
    meosar: 'geht als Frequenzmessung in die Mehrsatellitenortung ein',
    geosar: 'ruhender Satellit — keine Ortung daraus'
  };

  const segmentOptions = Object.values(SAR_SEGMENTS).map((entry) => ({
    value: entry.id,
    label: entry.label
  }));
</script>

<WidgetFrame
  title="Rettungskette Cospas-Sarsat"
  description="Sechs Glieder nebeneinander: 406-MHz-Bake, Satellit, Bodenstation LUT, Kontrollzentrum MCC, Rettungsleitstelle RCC und Einsatzmittel. Eine laufende Marke wandert durch die Kette und hebt das erreichte Glied hervor."
  playable
  playing={loop.playing}
  reducedMotion={loop.reducedMotion}
  ontoggle={() => loop.toggle()}
  footnote="Die Breite der Glieder ist schematisch und trägt keine Zeitachse. Belegt sind nur Bakenparameter (Cospas-Sarsat C/S T.001: {formatFrequency(
    BEACON_MIN_HZ,
    1
  )} bis {formatFrequency(
    BEACON_MAX_HZ,
    1
  )}, Aussendung rund 0,44 s), die aus der Bahnhöhe folgenden Größen und die MEOSAR-Anforderung an die Ortung. Peilfrequenz {formatFrequency(
    HOMING_FREQUENCY_HZ,
    1
  )} nach ITU RR Appendix 15."
  stacked
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <text x={PAD} y="22" class="chart-axis-text">
      {segment.label} · Bahnhöhe {formatDistance(segment.altitudeM, 0)} · Umlaufzeit {periodMin > 180
        ? `${formatFixed(periodMin / 60, 2)} h`
        : `${formatFixed(periodMin, 1)} min`} · Signallaufzeit im Zenit {formatFixed(delayMs, 2)} ms
    </text>
    <text x={PAD} y="38" class="chart-legend-text">{segment.carriersDE}</text>

    {#each RESCUE_STEPS as step, index (step.id)}
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
      {#each wrapLines(step.shortDE, Math.max(8, Math.round(width / 6)), 2) as line, lineIndex (lineIndex)}
        <text x={x + 10} y={BOX_Y + 38 + lineIndex * 13} class="chart-legend-text">{line}</text>
      {/each}
      {#if index < RESCUE_STEPS.length - 1}
        <path d="M{x + width - 6},{BOX_Y + BOX_H / 2} l-7,-5 v10 Z" fill="var(--color-ink-subtle)" />
      {/if}
    {/each}

    <line
      x1={markerX}
      y1={BOX_Y - 10}
      x2={markerX}
      y2={BOX_Y + BOX_H + 10}
      stroke="var(--color-marker)"
      stroke-width="2"
    />
    <circle cx={markerX} cy={BOX_Y + BOX_H / 2} r="7" fill="var(--color-marker)" />

    <text x={PAD} y={TEXT_Y - 18} class="chart-axis-text" font-weight="600">
      {activeStep.label} — {activeStep.fullNameDE}
    </text>
    {#each wrapLines(activeStep.detailDE, 108, 3) as line, lineIndex (lineIndex)}
      <text x={PAD} y={TEXT_Y + lineIndex * 17} class="chart-legend-text">{line}</text>
    {/each}

    <line x1={PAD} y1={H - 34} x2={W - PAD} y2={H - 34} class="chart-axis-line" />
    <text x={PAD} y={H - 14} class="chart-legend-text">
      Bake: alle {formatNumber(intervalS, 0)} s eine Aussendung von {formatFixed(BEACON_BURST_SHORT_S, 2)} s — {formatNumber(
        burstsPerHour(intervalS),
        0
      )} je Stunde, Tastverhältnis {formatPercentage(beaconDutyCycle(BEACON_BURST_SHORT_S, intervalS) * 100, 2)}
    </text>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Glieder der Rettungskette und Kennwerte des Segments {segment.label}</caption>
      <thead><tr><th>Glied</th><th>Bedeutung</th></tr></thead>
      <tbody>
        {#each RESCUE_STEPS as step (step.id)}
          <tr><td>{step.label}</td><td>{step.fullNameDE}</td></tr>
        {/each}
        <tr><th>Bahnhöhe</th><td>{formatDistance(segment.altitudeM, 0)}</td></tr>
        <tr><th>Umlaufzeit</th><td>{formatFixed(periodMin, 1)} min</td></tr>
        <tr><th>Signallaufzeit im Zenit</th><td>{formatFixed(delayMs, 2)} ms</td></tr>
        <tr><th>Dopplerverschiebung auf 406 MHz</th><td>±{formatFrequency(dopplerHz, 2)}</td></tr>
        <tr><th>Aussendungen je Stunde</th><td>{formatNumber(burstsPerHour(intervalS), 0)}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Select
      label="Satellitensegment"
      value={segmentId}
      options={segmentOptions}
      onchange={(value) => (segmentId = value as SarSegment)}
    />
    <Slider
      label="Sendeabstand der Bake"
      bind:value={intervalS}
      min={40}
      max={60}
      step={1}
      format={(v) => `${formatNumber(v, 0)} s`}
      unitSymbol="s"
      hint="Nennwert 50 s mit Zufallsanteil, damit sich zwei Baken nicht dauerhaft überdecken."
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Dopplerverschiebung auf 406 MHz"
      value="±{formatFrequency(dopplerHz, 2)}"
      hint={DOPPLER_NOTE[segmentId]}
      emphasis="hero"
      tone={segmentId === 'leosar' ? 'success' : 'neutral'}
      copyable={false}
    />
    <ResultCard
      label="Signallaufzeit Bake → Satellit"
      value="{formatFixed(delayMs, 2)} ms"
      hint="im Zenit, {formatDistance(segment.altitudeM, 0)}"
      copyable={false}
    />
    <Callout tone="info" title="Wie hier eine Position entsteht" source={segment.source}>
      {segment.locationDE}
      {segment.latencyDE}
    </Callout>
    <Callout tone="tip" title="Die letzten Kilometer">
      Die Systemanforderung an MEOSAR nennt eine unabhängige Ortung auf {formatDistance(MEOSAR_LOCATION_RADIUS_M, 0)} genau,
      in {formatPercentage(MEOSAR_LOCATION_CONFIDENCE * 100, 0)} der Fälle binnen {formatNumber(
        MEOSAR_LOCATION_TIME_S / 60,
        0
      )} Minuten. Für die Suche vor Ort reicht das nicht: Dort peilt die Einsatzeinheit die Bake auf {formatFrequency(
        HOMING_FREQUENCY_HZ,
        1
      )} an — seit 2009 werden Satellitenalarme nur noch auf 406 MHz ausgewertet, die alte Notfrequenz ist zur reinen Peilhilfe
      geworden.
    </Callout>
  {/snippet}
</WidgetFrame>
