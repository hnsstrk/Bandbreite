<script lang="ts">
  /**
   * Pulskompression: langer Chirp senden, kurzen Impuls auswerten.
   * Oben der Sendeimpuls mit ansteigender Momentanfrequenz, unten der Ausgang
   * des angepassten Filters — maßstäblich zur Sendedauer, damit der Gewinn
   * B·τ sichtbar wird. Rechnung in PulseCompressionModel.ts.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { formatDistance, formatFrequency, formatNumber, formatPowerDb } from '$lib/utils/formatting';
  import {
    chirpSample,
    computePulseCompression,
    matchedFilterAmplitude,
    FIRST_SIDELOBE_AT,
    FIRST_SIDELOBE_DB,
    PULSE_COMPRESSION_LIMITS
  } from './PulseCompressionModel';

  const W = 800;
  const H = 330;
  const PAD = { left: 56, right: 20 };
  const PLOT_W = W - PAD.left - PAD.right;
  /** Mittellinien der beiden Zeilen */
  const TX_Y = 76;
  const RX_Y = 258;
  const AMP = 36;
  /** Gezeichnete Schwingungen am Anfang und am Ende des Chirps (schematisch) */
  const CYCLES_START = 6;
  const CYCLES_END = 26;
  /** Stützstellen der Kurven */
  const TX_SAMPLES = 480;
  const RX_SAMPLES = 601;

  let bandwidthHz = $state<number>(PULSE_COMPRESSION_LIMITS.bandwidthHz.default);
  let pulseWidthS = $state<number>(PULSE_COMPRESSION_LIMITS.pulseWidthS.default);

  const result = $derived(computePulseCompression(bandwidthHz, pulseWidthS));

  const chirpPath = $derived.by(() => {
    const parts: string[] = [];
    for (let i = 0; i <= TX_SAMPLES; i++) {
      const u = i / TX_SAMPLES;
      const px = PAD.left + u * PLOT_W;
      const py = TX_Y - chirpSample(u, CYCLES_START, CYCLES_END) * AMP;
      parts.push(`${i === 0 ? 'M' : 'L'}${px.toFixed(2)},${py.toFixed(2)}`);
    }
    return parts.join(' ');
  });

  /**
   * Filterausgang über derselben Zeitachse. Die Stützstellen liegen kubisch
   * verdichtet um die Mitte, damit die schmale Hauptkeule auch bei großem
   * Zeit-Bandbreite-Produkt getroffen wird.
   */
  const filterPath = $derived.by(() => {
    const halfU = Math.max(1, (result.gain || 1) / 2);
    const parts: string[] = [];
    for (let i = 0; i <= RX_SAMPLES; i++) {
      const s = (i / RX_SAMPLES) * 2 - 1;
      const u = Math.sign(s) * Math.pow(Math.abs(s), 3) * halfU;
      const px = PAD.left + (0.5 + u / (2 * halfU)) * PLOT_W;
      const py = RX_Y - Math.abs(matchedFilterAmplitude(u)) * AMP * 2;
      parts.push(`${i === 0 ? 'M' : 'L'}${px.toFixed(2)},${py.toFixed(2)}`);
    }
    return parts.join(' ');
  });

  /** Breite der Hauptkeule in Pixeln (2/B, maßstäblich zur Sendedauer τ) */
  const mainLobePx = $derived(Math.max(1.5, result.compressedFraction * PLOT_W));
  const us = (seconds: number) => `${formatNumber(seconds * 1e6, 2)} µs`;
</script>

<WidgetFrame
  title="Pulskompression: Chirp und angepasstes Filter"
  description="Oben ein langer Sendeimpuls, dessen Frequenz linear ansteigt. Unten der Ausgang des angepassten Filters auf derselben Zeitachse: ein schmaler Impuls der Dauer 1 durch B mit Nebenzipfeln."
  footnote="Die Schwingungen des Chirps sind schematisch gezeichnet — real liegen bei {formatFrequency(
    bandwidthHz,
    1
  )} Hub und {us(pulseWidthS)} Dauer weit mehr Perioden im Impuls. Nebenzipfel: {formatPowerDb(
    FIRST_SIDELOBE_DB,
    1
  )} bei ungewichtetem Chirp (Skolnik §6.5)."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <!-- Sendeimpuls -->
    <text x={PAD.left} y="24" class="chart-axis-text">Sendeimpuls: Dauer τ = {us(pulseWidthS)}, Frequenzhub B</text>
    <rect
      x={PAD.left}
      y={TX_Y - AMP - 6}
      width={PLOT_W}
      height={2 * (AMP + 6)}
      fill="none"
      stroke="var(--color-line)"
      stroke-dasharray="5 4"
    />
    <path d={chirpPath} fill="none" stroke="var(--color-series-1)" stroke-width="1.6" />
    <text x={PAD.left + 6} y={TX_Y + AMP + 22} class="chart-axis-text">niedrige Frequenz</text>
    <text x={W - PAD.right - 6} y={TX_Y + AMP + 22} text-anchor="end" class="chart-axis-text">hohe Frequenz</text>

    <!-- Filterausgang -->
    <text x={PAD.left} y={RX_Y - AMP * 2 - 24} class="chart-axis-text">
      Nach dem angepassten Filter: Hauptkeule ≈ 1/B = {us(result.compressedS)}
    </text>
    <line x1={PAD.left} y1={RX_Y} x2={W - PAD.right} y2={RX_Y} class="chart-axis-line" />
    <rect x={PAD.left} y={RX_Y - 10} width={PLOT_W} height="10" fill="var(--color-series-8)" opacity="0.35" />
    <text x={PAD.left + 6} y={RX_Y - 14} class="chart-legend-text">unkomprimiert: Echo über die volle Dauer τ</text>
    <path d={filterPath} fill="none" stroke="var(--color-series-3)" stroke-width="2" />
    <line
      x1={PAD.left + PLOT_W / 2 - mainLobePx / 2}
      y1={RX_Y + 16}
      x2={PAD.left + PLOT_W / 2 + mainLobePx / 2}
      y2={RX_Y + 16}
      stroke="var(--color-series-3)"
      stroke-width="3"
    />
    <text x={PAD.left + PLOT_W / 2 + mainLobePx / 2 + 8} y={RX_Y + 20} class="chart-legend-text">
      {formatDistance(result.compressedResolutionM, 0)} statt {formatDistance(result.rawResolutionM, 0)}
    </text>
    <text x={W - PAD.right} y={H - 8} text-anchor="end" class="chart-axis-text">Zeit (gleiche Achse wie oben) →</text>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Aktuelle Werte der Pulskompression</caption>
      <tbody>
        <tr><th>Chirp-Bandbreite B</th><td>{formatFrequency(bandwidthHz, 2)}</td></tr>
        <tr><th>Sendeimpulsdauer τ</th><td>{us(pulseWidthS)}</td></tr>
        <tr><th>Kompressionsgewinn B·τ</th><td>{formatNumber(result.gain, 0)}</td></tr>
        <tr><th>Kompressionsgewinn in dB</th><td>{formatPowerDb(result.gainDb, 1)}</td></tr>
        <tr><th>Komprimierte Dauer 1/B</th><td>{us(result.compressedS)}</td></tr>
        <tr><th>Auflösung ohne Kompression</th><td>{formatDistance(result.rawResolutionM, 0)}</td></tr>
        <tr><th>Auflösung mit Kompression</th><td>{formatDistance(result.compressedResolutionM, 0)}</td></tr>
        <tr
          ><th>Erster Nebenzipfel</th><td
            >{formatPowerDb(FIRST_SIDELOBE_DB, 1)} bei {formatNumber(FIRST_SIDELOBE_AT, 2)}/B</td
          ></tr
        >
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Chirp-Bandbreite B"
      bind:value={bandwidthHz}
      min={PULSE_COMPRESSION_LIMITS.bandwidthHz.min}
      max={PULSE_COMPRESSION_LIMITS.bandwidthHz.max}
      scale="log"
      format={(v) => formatFrequency(v, 2)}
      unitSymbol="Hz"
    />
    <Slider
      label="Sendeimpulsdauer τ"
      bind:value={pulseWidthS}
      min={PULSE_COMPRESSION_LIMITS.pulseWidthS.min}
      max={PULSE_COMPRESSION_LIMITS.pulseWidthS.max}
      step={1e-6}
      format={(v) => us(v)}
      unitSymbol="µs"
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Kompressionsgewinn G_c = B·τ"
      value={formatNumber(result.gain, 0)}
      hint={formatPowerDb(result.gainDb, 1)}
      emphasis="hero"
      tone="success"
      copyable={false}
    />
    <ResultCard
      label="Auflösung ΔR = c/(2·B)"
      value={formatDistance(result.compressedResolutionM, 0)}
      hint="ohne Kompression {formatDistance(result.rawResolutionM, 0)}"
      copyable={false}
    />
    <ResultCard label="Komprimierte Dauer 1/B" value={us(result.compressedS)} copyable={false} />
    <Callout tone="tip" title="Was der Handel bringt">
      Die Sendeenergie bleibt unverändert — sie steckt weiterhin in der Dauer τ. Das Filter bündelt sie in einen Impuls
      von {us(result.compressedS)}: Der Störabstand steigt um {formatPowerDb(result.gainDb, 0)}, und die Auflösung folgt
      nicht mehr der Sendedauer, sondern der Bandbreite. Bezahlt wird das mit Nebenzipfeln, unter denen ein starkes Ziel
      ein schwaches verdecken kann.
    </Callout>
  {/snippet}
</WidgetFrame>
