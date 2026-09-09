<script lang="ts">
  /**
   * FDD und TDD im Zeit-Frequenz-Bild: oben zwei Blöcke mit Duplexabstand,
   * unten ein Träger mit Slot-Muster und Schutzzeit. Rechnung in FddTddModel.ts
   * (Bandgrenzen aus $lib/data/mobileNetworks).
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { formatDistance, formatFixed, formatFrequency, formatNumber, formatPercentage } from '$lib/utils/formatting';
  import {
    blockWidthHz,
    duplexGapHz,
    duplexSpacingHz,
    findBand,
    guardRangeM,
    guardTimeS,
    isReversedDuplex,
    patternString,
    periodDurationS,
    slotDurationS,
    slotPattern,
    slotShares,
    symbolDurationS,
    FDD_BANDS,
    FDD_TDD_DEFAULTS,
    FDD_TDD_LIMITS,
    SCS_OPTIONS_HZ,
    SYMBOLS_PER_SLOT,
    TDD_BANDS
  } from './FddTddModel';

  const W = 800;
  const H = 330;
  const PLOT_X = 76;
  const PLOT_W = W - PLOT_X - 16;
  /** Oberkante und Höhe der Frequenzachse des FDD-Bildes */
  const FDD_TOP = 34;
  const FDD_H = 118;
  /** Oberkante und Höhe der Slot-Zeile des TDD-Bildes */
  const TDD_TOP = 238;
  const TDD_H = 50;
  const KIND_COLOR = {
    D: 'var(--color-series-1)',
    S: 'var(--color-series-7)',
    U: 'var(--color-series-3)'
  } as const;

  let fddBandId = $state<string>(FDD_TDD_DEFAULTS.fddBandId);
  let tddBandId = $state<string>(FDD_TDD_DEFAULTS.tddBandId);
  let scsHz = $state<number>(FDD_TDD_DEFAULTS.subcarrierSpacingHz);
  let dlSlots = $state<number>(FDD_TDD_DEFAULTS.dlSlots);
  let ulSlots = $state<number>(FDD_TDD_DEFAULTS.ulSlots);
  let guardSymbols = $state<number>(FDD_TDD_DEFAULTS.guardSymbols);

  const fddBand = $derived(findBand(FDD_BANDS, fddBandId));
  const tddBand = $derived(findBand(TDD_BANDS, tddBandId));
  const spacingHz = $derived(duplexSpacingHz(fddBand));
  const pattern = $derived(slotPattern(dlSlots, ulSlots));
  const shares = $derived(slotShares(pattern));
  const guardS = $derived(guardTimeS(guardSymbols, scsHz));
  const periodS = $derived(periodDurationS(pattern, scsHz));

  /** Frequenzachse des FDD-Bildes: etwas Rand über und unter den Blöcken */
  const fMin = $derived(Math.min(fddBand.uplinkMinHz, fddBand.downlinkMinHz));
  const fMax = $derived(Math.max(fddBand.uplinkMaxHz, fddBand.downlinkMaxHz));
  const span = $derived(Math.max(1, (fMax - fMin) * 1.18));
  const base = $derived(fMin - (fMax - fMin) * 0.09);
  const yFreq = (hz: number) => FDD_TOP + FDD_H - ((hz - base) / span) * FDD_H;

  const slotW = $derived(PLOT_W / Math.max(1, pattern.length));
  const guardFraction = $derived(guardSymbols / SYMBOLS_PER_SLOT);

  const ms = (seconds: number) => `${formatFixed(seconds * 1000, 3)} ms`;
  const us = (seconds: number) => `${formatFixed(seconds * 1e6, 1)} µs`;
</script>

<WidgetFrame
  title="FDD und TDD im Zeit-Frequenz-Bild"
  description="Oben das Frequenzduplex: zwei getrennte Blöcke für Uplink und Downlink, beide über die ganze Zeit belegt, dazwischen der Duplexabstand. Unten das Zeitduplex: ein einziger Träger, dessen Zeitschlitze abwechselnd Downlink, Sonderslot und Uplink tragen."
  footnote="Bandgrenzen nach 3GPP TS 36.101 Tab. 5.5-1 und TS 38.101-1; Numerologie (14 Symbole je Slot, Slotdauer 1 ms bei 15 kHz) nach TS 38.211 §4.3, Slot-Format und Sonderslot nach TS 38.213 §11.1. Die Schutzzeit begrenzt die Zellgröße, weil das letzte Downlink-Symbol den entferntesten Teilnehmer erreichen und dessen Antwort zurücklaufen muss."
  stacked
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <text x="8" y="20" class="chart-axis-text" font-weight="600">
      FDD · {fddBand.band} ({fddBand.nameDE}) — Duplexabstand {formatFrequency(spacingHz, 0)}
    </text>

    <!-- Frequenzachse -->
    <line x1={PLOT_X} y1={FDD_TOP} x2={PLOT_X} y2={FDD_TOP + FDD_H} class="chart-axis-line" />
    <line x1={PLOT_X} y1={FDD_TOP + FDD_H} x2={PLOT_X + PLOT_W} y2={FDD_TOP + FDD_H} class="chart-axis-line" />

    {#each [{ min: fddBand.downlinkMinHz, max: fddBand.downlinkMaxHz, label: 'Downlink', color: KIND_COLOR.D }, { min: fddBand.uplinkMinHz, max: fddBand.uplinkMaxHz, label: 'Uplink', color: KIND_COLOR.U }] as block (block.label)}
      <rect
        x={PLOT_X}
        y={yFreq(block.max)}
        width={PLOT_W}
        height={Math.max(6, yFreq(block.min) - yFreq(block.max))}
        fill={block.color}
        opacity="0.3"
        stroke={block.color}
      />
      <text x={PLOT_X + 8} y={(yFreq(block.min) + yFreq(block.max)) / 2 + 4} class="chart-axis-text">
        {block.label} · {formatFrequency(block.min, 0)} bis {formatFrequency(block.max, 0)} ({formatFrequency(
          blockWidthHz(block.min, block.max),
          0
        )})
      </text>
      <text x={PLOT_X - 8} y={yFreq(block.max) + 4} text-anchor="end" class="chart-legend-text">
        {formatNumber(block.max / 1e6, 0)}
      </text>
      <text x={PLOT_X - 8} y={yFreq(block.min) + 4} text-anchor="end" class="chart-legend-text">
        {formatNumber(block.min / 1e6, 0)}
      </text>
    {/each}

    <!-- Duplexabstand zwischen den unteren Kanten -->
    <line
      x1={PLOT_X + PLOT_W - 60}
      y1={yFreq(fddBand.uplinkMinHz)}
      x2={PLOT_X + PLOT_W - 60}
      y2={yFreq(fddBand.downlinkMinHz)}
      stroke="var(--color-marker)"
      stroke-width="2"
    />
    <text
      x={PLOT_X + PLOT_W - 54}
      y={(yFreq(fddBand.uplinkMinHz) + yFreq(fddBand.downlinkMinHz)) / 2 + 4}
      class="chart-legend-text"
    >
      Δf = {formatFrequency(spacingHz, 0)}
    </text>
    <text x={PLOT_X} y={FDD_TOP + FDD_H + 18} class="chart-legend-text">
      Zeit → beide Richtungen senden gleichzeitig; die Duplexweiche im Gerät trennt sie.
    </text>
    <text x={PLOT_X} y={FDD_TOP + FDD_H + 33} class="chart-legend-text">
      Lücke zwischen den Blöcken: {formatFrequency(duplexGapHz(fddBand), 0)}{isReversedDuplex(fddBand)
        ? ' · Downlink liegt unter dem Uplink'
        : ''}
    </text>

    <text x="8" y={TDD_TOP - 22} class="chart-axis-text" font-weight="600">
      TDD · {tddBand.band} ({tddBand.nameDE}) — Muster {patternString(pattern)} bei {formatNumber(scsHz / 1000, 0)} kHz Unterträgerabstand
    </text>

    {#each pattern as kind, index (index)}
      {@const x = PLOT_X + index * slotW}
      <rect
        {x}
        y={TDD_TOP}
        width={slotW - 2}
        height={TDD_H}
        fill={KIND_COLOR[kind]}
        opacity="0.3"
        stroke={KIND_COLOR[kind]}
      />
      <text x={x + slotW / 2 - 1} y={TDD_TOP + TDD_H / 2 + 5} text-anchor="middle" class="chart-axis-text">
        {kind}
      </text>
      {#if kind === 'S'}
        <rect
          x={x + (slotW - 2) * (1 - guardFraction) * 0.7}
          y={TDD_TOP}
          width={(slotW - 2) * guardFraction}
          height={TDD_H}
          fill="var(--color-ink-faint)"
          opacity="0.55"
        />
      {/if}
    {/each}
    <line x1={PLOT_X} y1={TDD_TOP + TDD_H} x2={PLOT_X + PLOT_W} y2={TDD_TOP + TDD_H} class="chart-axis-line" />
    <text x={PLOT_X - 8} y={TDD_TOP + TDD_H / 2 + 4} text-anchor="end" class="chart-legend-text"> ein Träger </text>
    <text x={PLOT_X} y={TDD_TOP + TDD_H + 18} class="chart-legend-text">
      Slot {ms(slotDurationS(scsHz))} · Periode {ms(periodS)} · Schutzzeit im Sonderslot (grau) {us(guardS)} — Zellgrenze
      {formatDistance(guardRangeM(guardS), 1)}
    </text>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Duplexverfahren im Vergleich</caption>
      <tbody>
        <tr><th>FDD-Band</th><td>{fddBand.band} ({fddBand.nameDE})</td></tr>
        <tr
          ><th>Uplink</th><td
            >{formatFrequency(fddBand.uplinkMinHz, 0)} bis {formatFrequency(fddBand.uplinkMaxHz, 0)}</td
          ></tr
        >
        <tr
          ><th>Downlink</th><td
            >{formatFrequency(fddBand.downlinkMinHz, 0)} bis {formatFrequency(fddBand.downlinkMaxHz, 0)}</td
          ></tr
        >
        <tr><th>Duplexabstand</th><td>{formatFrequency(spacingHz, 0)}</td></tr>
        <tr><th>TDD-Band</th><td>{tddBand.band} ({tddBand.nameDE})</td></tr>
        <tr><th>Slot-Muster</th><td>{patternString(pattern)}</td></tr>
        <tr><th>Anteil Downlink</th><td>{formatPercentage(shares.dl * 100, 0)}</td></tr>
        <tr><th>Anteil Sonderslot</th><td>{formatPercentage(shares.special * 100, 0)}</td></tr>
        <tr><th>Anteil Uplink</th><td>{formatPercentage(shares.ul * 100, 0)}</td></tr>
        <tr><th>Slotdauer</th><td>{ms(slotDurationS(scsHz))}</td></tr>
        <tr><th>Symboldauer</th><td>{us(symbolDurationS(scsHz))}</td></tr>
        <tr><th>Schutzzeit</th><td>{us(guardS)}</td></tr>
        <tr><th>Zellgrenze aus der Schutzzeit</th><td>{formatDistance(guardRangeM(guardS), 1)}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Select
      label="Gepaartes Band (FDD)"
      bind:value={fddBandId}
      options={FDD_BANDS.map((band) => ({ value: band.id, label: `${band.band} — ${band.nameDE}` }))}
    />
    <Select
      label="Ungepaartes Band (TDD)"
      bind:value={tddBandId}
      options={TDD_BANDS.map((band) => ({ value: band.id, label: `${band.band} — ${band.nameDE}` }))}
    />
    <Select
      label="Unterträgerabstand"
      value={String(scsHz)}
      options={SCS_OPTIONS_HZ.map((hz) => ({
        value: String(hz),
        label: `${formatNumber(hz / 1000, 0)} kHz — Slot ${ms(slotDurationS(hz))}`
      }))}
      onchange={(value) => (scsHz = Number(value))}
    />
    <Slider
      label="Downlink-Slots je Periode"
      bind:value={dlSlots}
      min={FDD_TDD_LIMITS.dlSlots.min}
      max={FDD_TDD_LIMITS.dlSlots.max}
      step={1}
      format={(v) => formatNumber(v, 0)}
    />
    <Slider
      label="Uplink-Slots je Periode"
      bind:value={ulSlots}
      min={FDD_TDD_LIMITS.ulSlots.min}
      max={FDD_TDD_LIMITS.ulSlots.max}
      step={1}
      format={(v) => formatNumber(v, 0)}
    />
    <Slider
      label="Schutzsymbole im Sonderslot"
      bind:value={guardSymbols}
      min={FDD_TDD_LIMITS.guardSymbols.min}
      max={FDD_TDD_LIMITS.guardSymbols.max}
      step={1}
      format={(v) => `${formatNumber(v, 0)} von ${formatNumber(SYMBOLS_PER_SLOT, 0)}`}
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Duplexabstand {fddBand.band}"
      value={formatFrequency(spacingHz, 0)}
      hint="fest verdrahtet, keine Umverteilung möglich"
      emphasis="hero"
      tone="success"
      copyable={false}
    />
    <ResultCard
      label="Aufteilung {patternString(pattern)}"
      value="{formatPercentage(shares.dl * 100, 0)} DL"
      hint="{formatPercentage(shares.ul * 100, 0)} UL, {formatPercentage(shares.special * 100, 0)} Sonderslot"
      copyable={false}
    />
    <ResultCard
      label="Schutzzeit → Zellgrenze"
      value={formatDistance(guardRangeM(guardS), 1)}
      hint="{us(guardS)} bei {formatNumber(guardSymbols, 0)} Symbolen"
      tone={guardRangeM(guardS) < 5000 ? 'warning' : 'neutral'}
      copyable={false}
    />
    <Callout tone="info" title="Was jedes Verfahren teuer macht">
      FDD braucht ein gepaartes Spektrum und im Gerät eine Duplexweiche, die zwei Blöcke im Abstand von {formatFrequency(
        spacingHz,
        0
      )} sauber trennt. Dafür ist die Aufteilung fest bei 50 zu 50 — auch dann, wenn fast alle Daten in eine Richtung fließen.
      TDD kommt mit einem Block und einem Umschalter aus und lässt sich beliebig verteilen; dafür müssen benachbarte Netze
      dasselbe Muster synchron fahren, und die Schutzzeit begrenzt die Zellgröße.
    </Callout>
  {/snippet}
</WidgetFrame>
