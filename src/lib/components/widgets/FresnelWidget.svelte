<script lang="ts">
  /**
   * W5 – Fresnel-Zone: Seitenriss einer Funkstrecke mit zwei Antennen, Ellipse der
   * 1. Fresnel-Zone, verschiebbarem Hindernis, 60-%-Regel und Knife-Edge-Dämpfung.
   * Rechnung in FresnelModel.ts (calculateFresnelRadius, evaluateFresnelClearance).
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import {
    formatDistance,
    formatFrequency,
    formatNumber,
    formatPercentage,
    formatWavelength
  } from '$lib/utils/formatting';
  import { FRESNEL_CLEARANCE_FRACTION } from '$lib/utils/calculations';
  import { computeFresnelScene, FRESNEL_LIMITS } from './FresnelModel';

  const W = 800;
  const H = 276;
  const X0 = 60;
  const X1 = 740;
  const GROUND_Y = 230;
  /** Höhe des Zeichenbereichs für Antennen und Hindernis (px) */
  const HEIGHT_PX = 150;

  let distanceM = $state<number>(FRESNEL_LIMITS.distanceM.default);
  let frequencyHz = $state<number>(FRESNEL_LIMITS.frequencyHz.default);
  let obstaclePosition = $state<number>(FRESNEL_LIMITS.obstaclePosition.default);
  let obstacleHeightM = $state<number>(FRESNEL_LIMITS.obstacleHeightM.default);
  let antennaHeightM = $state<number>(FRESNEL_LIMITS.antennaHeightM.default);

  const scene = $derived(
    computeFresnelScene(distanceM, frequencyHz, obstaclePosition, obstacleHeightM, antennaHeightM)
  );
  /** Gemeinsamer Höhenmaßstab: höchster Punkt (Antenne + Radius oder Hindernis) füllt HEIGHT_PX */
  const maxHeightM = $derived(Math.max(antennaHeightM + scene.midRadiusM, obstacleHeightM, 1));
  const pxPerM = $derived(HEIGHT_PX / maxHeightM);
  const losY = $derived(GROUND_Y - antennaHeightM * pxPerM);
  const xOf = (xM: number) => X0 + (xM / distanceM) * (X1 - X0);
  const ellipsePath = $derived.by(() => {
    const upper = scene.ellipse.map((p) => `${xOf(p.xM).toFixed(1)},${(losY - p.rM * pxPerM).toFixed(1)}`);
    const lower = [...scene.ellipse]
      .reverse()
      .map((p) => `${xOf(p.xM).toFixed(1)},${(losY + p.rM * pxPerM).toFixed(1)}`);
    return `M${upper.join(' L')} L${lower.join(' L')} Z`;
  });
  const clearancePath = $derived.by(() => {
    const f = FRESNEL_CLEARANCE_FRACTION;
    const upper = scene.ellipse.map((p) => `${xOf(p.xM).toFixed(1)},${(losY - p.rM * f * pxPerM).toFixed(1)}`);
    const lower = [...scene.ellipse]
      .reverse()
      .map((p) => `${xOf(p.xM).toFixed(1)},${(losY + p.rM * f * pxPerM).toFixed(1)}`);
    return `M${upper.join(' L')} L${lower.join(' L')} Z`;
  });
  const obstacleX = $derived(xOf(scene.d1M));
  const obstacleTopY = $derived(GROUND_Y - obstacleHeightM * pxPerM);
  const status = $derived(scene.clearance.status);
  const statusColor = $derived(
    status === 'frei'
      ? 'var(--color-success)'
      : status === 'eingeschraenkt'
        ? 'var(--color-warning)'
        : 'var(--color-danger)'
  );
  const statusLabel = $derived(
    status === 'frei'
      ? 'frei (≥ 60 %)'
      : status === 'eingeschraenkt'
        ? 'eingeschränkt (< 60 %)'
        : 'Sichtlinie blockiert'
  );
  const statusTone = $derived(status === 'frei' ? 'success' : status === 'eingeschraenkt' ? 'warning' : 'danger');
</script>

<WidgetFrame
  title="Fresnel-Zone und Hindernis"
  description="Seitenriss einer Funkstrecke: Ellipse der ersten Fresnel-Zone zwischen zwei Antennen, ein Hindernis ragt je nach Höhe in die Zone hinein."
  footnote="r₁ = √(λ·d₁·d₂/(d₁+d₂)); Freihaltung nach ITU-R P.530 ≥ 60 % von r₁. Zusatzdämpfung als Knife-Edge-Näherung nach ITU-R P.526 (Höhen überhöht dargestellt)."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <rect x="0" y={GROUND_Y} width={W} height={H - GROUND_Y} fill="var(--color-elevated)" />
    <line x1="0" y1={GROUND_Y} x2={W} y2={GROUND_Y} class="chart-axis-line" />
    <path
      d={ellipsePath}
      fill="var(--color-series-1)"
      opacity="0.18"
      stroke="var(--color-series-1)"
      stroke-width="1.5"
    />
    <path d={clearancePath} fill="none" stroke={statusColor} stroke-width="1.5" stroke-dasharray="6,4" />
    <line x1={X0} y1={losY} x2={X1} y2={losY} stroke="var(--color-ink)" stroke-width="1.5" stroke-dasharray="2,3" />
    <!-- Antennen -->
    {#each [X0, X1] as x, i (i)}
      <line x1={x} y1={GROUND_Y} x2={x} y2={losY} stroke="var(--color-ink-subtle)" stroke-width="4" />
      <path
        d="M{x - 14},{losY - 10} L{x},{losY + 2} L{x + 14},{losY - 10}"
        fill="none"
        stroke="var(--color-series-1-solid)"
        stroke-width="2.5"
      />
    {/each}
    <text x={X0} y={GROUND_Y + 18} text-anchor="middle" class="chart-axis-text"
      >Sender ({formatDistance(antennaHeightM, 0)})</text
    >
    <text x={X1} y={GROUND_Y + 18} text-anchor="middle" class="chart-axis-text"
      >Empfänger ({formatDistance(antennaHeightM, 0)})</text
    >
    <!-- Hindernis -->
    <polygon
      points="{obstacleX - 26},{GROUND_Y} {obstacleX},{obstacleTopY} {obstacleX + 26},{GROUND_Y}"
      fill={statusColor}
      opacity="0.85"
    />
    <text x={obstacleX} y={GROUND_Y + 36} text-anchor="middle" class="chart-axis-text">
      Hindernis {formatDistance(obstacleHeightM, 0)} · {formatDistance(scene.d1M, 1)} vom Sender
    </text>
    <text x={(X0 + X1) / 2} y={losY - scene.midRadiusM * pxPerM - 6} text-anchor="middle" class="chart-legend-text">
      r₁ (Mitte) = {formatDistance(scene.midRadiusM, 1)}
    </text>
    <text x={X0} y="16" class="chart-axis-text"
      >Strecke {formatDistance(distanceM, 1)} · {formatFrequency(frequencyHz, 2)} · λ = {formatWavelength(
        scene.wavelengthM,
        2
      )}</text
    >
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Aktuelle Werte des Fresnel-Widgets</caption>
      <tbody>
        <tr><th>Streckenlänge</th><td>{formatDistance(distanceM, 1)}</td></tr>
        <tr><th>Frequenz</th><td>{formatFrequency(frequencyHz, 2)}</td></tr>
        <tr><th>Radius 1. Fresnel-Zone am Hindernis</th><td>{formatDistance(scene.clearance.radiusM, 2)}</td></tr>
        <tr
          ><th>Freier Anteil</th><td>{formatPercentage(scene.clearance.clearanceFraction * 100, 0)} – {statusLabel}</td
          ></tr
        >
        <tr><th>Zusatzdämpfung</th><td>{formatNumber(scene.clearance.lossDb, 1)} dB</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Streckenlänge"
      bind:value={distanceM}
      min={FRESNEL_LIMITS.distanceM.min}
      max={FRESNEL_LIMITS.distanceM.max}
      scale="log"
      format={(v) => formatDistance(v, 1)}
      unitSymbol="m"
    />
    <Slider
      label="Frequenz"
      bind:value={frequencyHz}
      min={FRESNEL_LIMITS.frequencyHz.min}
      max={FRESNEL_LIMITS.frequencyHz.max}
      scale="log"
      format={(v) => formatFrequency(v, 2)}
      unitSymbol="Hz"
    />
    <Slider
      label="Antennenhöhe (beide)"
      bind:value={antennaHeightM}
      min={FRESNEL_LIMITS.antennaHeightM.min}
      max={FRESNEL_LIMITS.antennaHeightM.max}
      step={1}
      format={(v) => formatDistance(v, 0)}
      unitSymbol="m"
    />
    <Slider
      label="Hindernishöhe"
      bind:value={obstacleHeightM}
      min={FRESNEL_LIMITS.obstacleHeightM.min}
      max={FRESNEL_LIMITS.obstacleHeightM.max}
      step={1}
      format={(v) => formatDistance(v, 0)}
      unitSymbol="m"
    />
    <Slider
      label="Hindernisposition"
      bind:value={obstaclePosition}
      min={FRESNEL_LIMITS.obstaclePosition.min}
      max={FRESNEL_LIMITS.obstaclePosition.max}
      step={0.01}
      format={(v) => formatPercentage(v * 100, 0)}
      unitSymbol="% der Strecke"
    />
  {/snippet}

  {#snippet results()}
    <ResultCard label="r₁ am Hindernis" value={formatDistance(scene.clearance.radiusM, 2)} copyable={false} />
    <ResultCard
      label="Freier Anteil von r₁"
      value={formatPercentage(Math.max(0, scene.clearance.clearanceFraction) * 100, 0)}
      tone={statusTone}
      secondary={statusLabel}
      copyable={false}
    />
    <ResultCard
      label="Zusatzdämpfung (Knife-Edge)"
      value={formatNumber(scene.clearance.lossDb, 1)}
      unit="dB"
      tone={scene.clearance.lossDb > 0 ? 'warning' : 'success'}
      copyable={false}
    />
    {#if status !== 'frei'}
      <Callout tone="warning" title="60-%-Regel verletzt">
        Mindestens 60 % des Fresnel-Radius sollten frei bleiben, sonst wird die Verbindung durch Beugung merklich
        gedämpft. Antennen höher setzen oder eine höhere Frequenz (kleinere Zone) wählen.
      </Callout>
    {/if}
  {/snippet}
</WidgetFrame>
