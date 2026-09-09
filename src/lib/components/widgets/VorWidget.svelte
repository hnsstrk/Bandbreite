<script lang="ts">
  /**
   * VOR: Das rotierende Richtdiagramm erzeugt ein 30-Hz-Signal, dessen Phase
   * gegenüber dem rundstrahlenden Referenzsignal den Radial angibt. Rechts die
   * Kursablageanzeige mit TO/FROM. Rechnung in VorModel.ts (ICAO Annex 10 Vol. I).
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import { AnimationLoop } from '$lib/components/knowledge/animationLoop.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { formatAngle, formatFrequency, formatNumber } from '$lib/utils/formatting';
  import {
    bearingToStation,
    signalSample,
    vorIndication,
    VOR_DEGREES_PER_DOT,
    VOR_FULL_SCALE_DEG,
    VOR_ROTATION_HZ,
    VOR_SUBCARRIER_HZ
  } from './VorModel';

  const W = 800;
  const H = 340;
  /** Kompassrose */
  const ROSE = { cx: 160, cy: 175, r: 128 };
  /** Kurvenfeld der beiden 30-Hz-Signale */
  const WAVE = { x0: 330, x1: 620, refY: 95, varY: 205, amp: 42 };
  /** Kursablageanzeige */
  const CDI = { cx: 715, cy: 175, r: 62 };
  /** Eine Umdrehung in Millisekunden — stark verlangsamt gegenüber 30 Hz */
  const TURN_MS = 4000;
  /** Stützstellen je Kurve */
  const SAMPLES = 160;
  /** Dargestellte Umdrehungen im Kurvenfeld */
  const TURNS = 2;

  let radialDeg = $state(60);
  let obsDeg = $state(60);

  const loop = new AnimationLoop();
  $effect(() => loop.attach());

  const indication = $derived(vorIndication(radialDeg, obsDeg));
  /** Anteil der laufenden Umdrehung (0 … 1) */
  const turn = $derived((loop.elapsedMs % TURN_MS) / TURN_MS);
  /** Zeigerrichtung der Keule: bei Phase 0 nach Norden */
  const beamDeg = $derived(turn * 360);

  const point = (bearingDeg: number, radius: number) => ({
    x: ROSE.cx + radius * Math.sin((bearingDeg * Math.PI) / 180),
    y: ROSE.cy - radius * Math.cos((bearingDeg * Math.PI) / 180)
  });

  function wavePath(phaseDeg: number, baseY: number): string {
    const parts: string[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const fraction = (i / SAMPLES) * TURNS;
      const px = WAVE.x0 + (i / SAMPLES) * (WAVE.x1 - WAVE.x0);
      const py = baseY - signalSample(fraction, phaseDeg) * WAVE.amp;
      parts.push(`${i === 0 ? 'M' : 'L'}${px.toFixed(2)},${py.toFixed(2)}`);
    }
    return parts.join(' ');
  }

  const beam = $derived(point(beamDeg, ROSE.r - 16));
  const plane = $derived(point(indication.radialDeg, ROSE.r - 30));
  const cursorX = $derived(WAVE.x0 + (turn / TURNS) * (WAVE.x1 - WAVE.x0));
  const phaseX = $derived(WAVE.x0 + (indication.radialDeg / 360 / TURNS) * (WAVE.x1 - WAVE.x0));
  const needleX = $derived(CDI.cx + indication.deflection * (CDI.r - 12));
</script>

<WidgetFrame
  title="VOR: Radial aus dem Phasenvergleich"
  description="Links die Kompassrose mit dem umlaufenden Richtdiagramm und dem Luftfahrzeug auf seinem Radial, in der Mitte Referenz- und veränderliches Signal mit ihrer Phasendifferenz, rechts die Kursablageanzeige mit TO- oder FROM-Kennung."
  playable
  playing={loop.playing}
  reducedMotion={loop.reducedMotion}
  ontoggle={() => loop.toggle()}
  footnote="Die Umdrehung ist stark verlangsamt: real dreht das Diagramm {formatNumber(
    VOR_ROTATION_HZ,
    0
  )}-mal je Sekunde, das Referenzsignal liegt frequenzmoduliert auf {formatFrequency(
    VOR_SUBCARRIER_HZ,
    2
  )}. Vollausschlag der Anzeige ±{formatNumber(VOR_FULL_SCALE_DEG, 0)}°, ein Punkt {formatNumber(
    VOR_DEGREES_PER_DOT,
    0
  )}°. Quelle: ICAO Annex 10 Vol. I, §3.3."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <!-- Kompassrose -->
    <circle cx={ROSE.cx} cy={ROSE.cy} r={ROSE.r} fill="none" stroke="var(--color-line)" />
    {#each [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as tick (tick)}
      {@const outer = point(tick, ROSE.r)}
      {@const inner = point(tick, ROSE.r - 10)}
      {@const label = point(tick, ROSE.r + 14)}
      <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} class="chart-axis-line" />
      <text x={label.x} y={label.y + 4} text-anchor="middle" class="chart-axis-text">
        {tick === 0 ? 'N' : tick === 90 ? 'E' : tick === 180 ? 'S' : tick === 270 ? 'W' : formatNumber(tick, 0)}
      </text>
    {/each}

    <!-- Umlaufendes Richtdiagramm (schematische Keule) -->
    <line
      x1={ROSE.cx}
      y1={ROSE.cy}
      x2={beam.x}
      y2={beam.y}
      stroke="var(--color-series-2)"
      stroke-width="8"
      opacity="0.55"
    />
    <circle cx={beam.x} cy={beam.y} r="7" fill="var(--color-series-2)" />

    <!-- Radial und Luftfahrzeug -->
    <line
      x1={ROSE.cx}
      y1={ROSE.cy}
      x2={plane.x}
      y2={plane.y}
      stroke="var(--color-marker)"
      stroke-width="2.5"
      stroke-dasharray="6 4"
    />
    <circle cx={plane.x} cy={plane.y} r="8" fill="var(--color-marker)" stroke="var(--color-ink)" />
    <circle cx={ROSE.cx} cy={ROSE.cy} r="7" fill="var(--color-series-1)" />
    <text x={ROSE.cx} y={ROSE.cy + 26} text-anchor="middle" class="chart-legend-text">VOR</text>
    <text x={plane.x} y={plane.y + 22} text-anchor="middle" class="chart-legend-text">
      Radial {formatNumber(indication.radialDeg, 0)}°
    </text>

    <!-- Signale -->
    <text x={WAVE.x0} y={WAVE.refY - WAVE.amp - 14} class="chart-axis-text">Referenzsignal 30 Hz (rundstrahlend)</text>
    <line x1={WAVE.x0} y1={WAVE.refY} x2={WAVE.x1} y2={WAVE.refY} class="chart-axis-line" />
    <path d={wavePath(0, WAVE.refY)} fill="none" stroke="var(--color-series-1)" stroke-width="2" />

    <text x={WAVE.x0} y={WAVE.varY - WAVE.amp - 14} class="chart-axis-text"
      >Veränderliches Signal 30 Hz (aus der Drehung)</text
    >
    <line x1={WAVE.x0} y1={WAVE.varY} x2={WAVE.x1} y2={WAVE.varY} class="chart-axis-line" />
    <path d={wavePath(indication.radialDeg, WAVE.varY)} fill="none" stroke="var(--color-series-2)" stroke-width="2" />

    <line
      x1={WAVE.x0}
      y1={WAVE.varY + WAVE.amp + 20}
      x2={phaseX}
      y2={WAVE.varY + WAVE.amp + 20}
      stroke="var(--color-series-3)"
      stroke-width="3"
    />
    <text x={WAVE.x0} y={WAVE.varY + WAVE.amp + 38} class="chart-legend-text">
      Phasendifferenz = {formatNumber(indication.radialDeg, 0)}°
    </text>
    <line
      x1={cursorX}
      y1={WAVE.refY - WAVE.amp}
      x2={cursorX}
      y2={WAVE.varY + WAVE.amp}
      stroke="var(--color-marker)"
      stroke-dasharray="3 3"
    />

    <!-- Kursablageanzeige -->
    <circle cx={CDI.cx} cy={CDI.cy} r={CDI.r} fill="none" stroke="var(--color-line)" />
    {#each [-2, -1, 0, 1, 2] as dot (dot)}
      <circle cx={CDI.cx + (dot * (CDI.r - 12)) / 2.5} cy={CDI.cy} r="3" fill="var(--color-ink-subtle)" />
    {/each}
    <line
      x1={needleX}
      y1={CDI.cy - CDI.r + 10}
      x2={needleX}
      y2={CDI.cy + CDI.r - 10}
      stroke="var(--color-series-3)"
      stroke-width="4"
    />
    <text x={CDI.cx} y={CDI.cy - CDI.r - 10} text-anchor="middle" class="chart-legend-text">
      Kurs {formatNumber(obsDeg, 0)}°
    </text>
    <text x={CDI.cx} y={CDI.cy + CDI.r + 22} text-anchor="middle" class="chart-legend-text">
      {indication.flag} · {formatAngle(Math.abs(indication.deviationDeg), 0)} Ablage
    </text>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Aktuelle Anzeige des VOR-Empfängers</caption>
      <tbody>
        <tr><th>Radial (Standlinie vom Funkfeuer)</th><td>{formatAngle(indication.radialDeg, 0)}</td></tr>
        <tr><th>Richtung zum Funkfeuer</th><td>{formatAngle(bearingToStation(indication.radialDeg), 0)}</td></tr>
        <tr><th>Eingestellter Kurs (OBS)</th><td>{formatAngle(obsDeg, 0)}</td></tr>
        <tr><th>Kennung</th><td>{indication.flag}</td></tr>
        <tr><th>Kursablage</th><td>{formatAngle(indication.deviationDeg, 1)}</td></tr>
        <tr><th>Ausschlag in Punkten</th><td>{formatNumber(indication.dots, 1)}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Radial des Luftfahrzeugs"
      bind:value={radialDeg}
      min={0}
      max={359}
      step={1}
      format={(v) => formatAngle(v, 0)}
      unitSymbol="Grad"
    />
    <Slider
      label="Eingestellter Kurs (OBS)"
      bind:value={obsDeg}
      min={0}
      max={359}
      step={1}
      format={(v) => formatAngle(v, 0)}
      unitSymbol="Grad"
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Radial = Phasendifferenz"
      value={formatAngle(indication.radialDeg, 0)}
      hint="zum Funkfeuer {formatAngle(bearingToStation(indication.radialDeg), 0)}"
      emphasis="hero"
      tone="success"
      copyable={false}
    />
    <ResultCard
      label="Anzeige"
      value={indication.flag}
      hint="Ablage {formatAngle(indication.deviationDeg, 1)} · {formatNumber(indication.dots, 1)} Punkte"
      tone={indication.fullScale ? 'warning' : 'neutral'}
      copyable={false}
    />
    <Callout tone="info" title="Warum der Phasenvergleich genügt">
      Das Referenzsignal ist überall gleich; das veränderliche Signal entsteht erst durch die Drehung des Richtdiagramms
      und läuft dem Referenzsignal deshalb genau um den Winkel hinterher, unter dem der Empfänger steht. Der
      eingestellte Kurs ändert daran nichts — er legt nur fest, worauf die Anzeige die Ablage bezieht: innerhalb von
      ±90° zeigt sie FROM, sonst TO.
    </Callout>
  {/snippet}
</WidgetFrame>
