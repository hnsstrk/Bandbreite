<script lang="ts">
  /**
   * Bandöffnungen im Tagesgang: MUF und FOT über 24 Stunden für eine wählbare
   * Sprungdistanz, dazu die acht Kurzwellenbänder als waagerechte Linien mit
   * Zustand zur gewählten Uhrzeit. Rechnung in AmateurBandOpeningsModel.ts —
   * Ionosphäre und MUF stammen aus IonosphereDayNightModel/data/propagation.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import Callout from '$lib/components/ui/Callout.svelte';
  import { formatFixed, formatNumber, formatPercentage } from '$lib/utils/formatting';
  import { absorptionIndex, mufMHz, SUNRISE_HOUR, SUNSET_HOUR } from './IonosphereDayNightModel';
  import {
    bandOpenings,
    dayCurve,
    lufMHz,
    owfMHz,
    peakMufMHz,
    BAND_OPENING_LIMITS,
    OWF_FACTOR,
    STATUS_LABEL,
    type BandStatus
  } from './AmateurBandOpeningsModel';

  const W = 800;
  const H = 336;
  const PAD = { left: 46, right: 66, top: 18, bottom: 42 };
  const PLOT_W = W - PAD.left - PAD.right;
  const PLOT_H = H - PAD.top - PAD.bottom;
  /** Stützstellen der Tageskurve */
  const SAMPLES = 145;
  const STATUS_COLOR: Record<BandStatus, string> = {
    offen: 'var(--color-series-2)',
    gedaempft: 'var(--color-series-7)',
    geschlossen: 'var(--color-series-8)'
  };

  let hourOfDay = $state<number>(BAND_OPENING_LIMITS.hourOfDay.default);
  let distanceKm = $state<number>(BAND_OPENING_LIMITS.distanceKm.default);

  const curve = $derived(dayCurve(distanceKm, SAMPLES));
  const openings = $derived(bandOpenings(hourOfDay, distanceKm));
  const muf = $derived(mufMHz(hourOfDay, distanceKm));
  const owf = $derived(owfMHz(hourOfDay, distanceKm));
  const luf = $derived(lufMHz(hourOfDay));
  const yMax = $derived(Math.max(32, peakMufMHz(distanceKm) * 1.08));
  const openCount = $derived(openings.filter((band) => band.status === 'offen').length);

  const x = (hour: number) => PAD.left + (hour / 24) * PLOT_W;
  const y = (mhz: number) => PAD.top + PLOT_H - (Math.max(0, mhz) / yMax) * PLOT_H;

  const linePath = (key: 'mufMHz' | 'owfMHz' | 'lufMHz') =>
    curve
      .map((point, i) => `${i === 0 ? 'M' : 'L'}${x(point.hourOfDay).toFixed(2)},${y(point[key]).toFixed(2)}`)
      .join(' ');

  const mufPath = $derived(linePath('mufMHz'));
  const owfPath = $derived(linePath('owfMHz'));
  const lufArea = $derived(
    `${linePath('lufMHz')} L${x(24).toFixed(2)},${y(0).toFixed(2)} L${x(0).toFixed(2)},${y(0).toFixed(2)} Z`
  );

  const clock = (hour: number) => {
    const h = Math.floor(hour) % 24;
    const m = Math.round((hour - Math.floor(hour)) * 60);
    return `${String(h).padStart(2, '0')}:${String(m === 60 ? 0 : m).padStart(2, '0')} Uhr`;
  };
  const mhz = (value: number) => `${formatFixed(value, 1)} MHz`;
</script>

<WidgetFrame
  title="Bandöffnungen im Tagesgang"
  description="Kurve der höchsten nutzbaren Frequenz über 24 Stunden für die gewählte Sprungdistanz, darunter die günstigste Arbeitsfrequenz und die von der D-Schicht bestimmte untere Schranke. Acht waagerechte Linien zeigen die Kurzwellenbänder; ihre Farbe nennt den Zustand zur eingestellten Uhrzeit."
  footnote="Richtwerte mittlerer Breiten bei mittlerer Sonnenaktivität. MUF aus estimateMUF (Sekantengesetz, Reflexionshöhe 300 km) und dem Tagesgang von foF2 aus dem Ionosphären-Widget; FOT = {formatPercentage(
    OWF_FACTOR * 100,
    0
  )} der MUF. Die untere Schranke ist eine Annahme: geradliniger Übergang zwischen Nacht- und Tageswert, gesteuert vom Absorptionsmaß der D-Schicht — die echte LUF hängt zusätzlich von Leistung, Antennen und Störpegel ab. Quellen: Davies, Ionospheric Radio §6; ITU-R P.1239 und P.373."
  stacked
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <!-- Nachtstunden hinterlegen -->
    <rect x={x(0)} y={PAD.top} width={x(SUNRISE_HOUR) - x(0)} height={PLOT_H} fill="var(--color-ink)" opacity="0.06" />
    <rect
      x={x(SUNSET_HOUR)}
      y={PAD.top}
      width={x(24) - x(SUNSET_HOUR)}
      height={PLOT_H}
      fill="var(--color-ink)"
      opacity="0.06"
    />

    {#each [0, 5, 10, 15, 20, 25, 30] as tick (tick)}
      {#if tick <= yMax}
        <line x1={PAD.left} y1={y(tick)} x2={PAD.left + PLOT_W} y2={y(tick)} class="chart-grid-line" />
        <text x={PAD.left - 8} y={y(tick) + 4} text-anchor="end" class="chart-axis-text">{tick}</text>
      {/if}
    {/each}
    <text x={PAD.left - 8} y={PAD.top - 4} text-anchor="end" class="chart-legend-text">MHz</text>

    {#each [0, 3, 6, 9, 12, 15, 18, 21, 24] as tick (tick)}
      <line x1={x(tick)} y1={PAD.top} x2={x(tick)} y2={PAD.top + PLOT_H} class="chart-grid-line" />
      <text x={x(tick)} y={PAD.top + PLOT_H + 16} text-anchor="middle" class="chart-axis-text">{tick}</text>
    {/each}
    <text x={PAD.left + PLOT_W / 2} y={H - 8} text-anchor="middle" class="chart-legend-text">
      Ortszeit in Stunden · Sprungdistanz {formatNumber(distanceKm, 0)} km
    </text>

    <!-- Von der D-Schicht gedämpfter Bereich -->
    <path d={lufArea} fill="var(--color-series-7)" opacity="0.18" />

    {#each openings as band (band.id)}
      <line
        x1={PAD.left}
        y1={y(band.centerMHz)}
        x2={PAD.left + PLOT_W}
        y2={y(band.centerMHz)}
        stroke={STATUS_COLOR[band.status]}
        stroke-width={band.status === 'offen' ? 2 : 1}
        stroke-dasharray={band.status === 'offen' ? undefined : '4 4'}
        opacity={band.status === 'geschlossen' ? 0.6 : 1}
      />
      <text x={PAD.left + PLOT_W + 8} y={y(band.centerMHz) + 4} class="chart-legend-text">
        {band.nameDE}
      </text>
    {/each}

    <path d={owfPath} fill="none" stroke="var(--color-series-2)" stroke-width="1.5" stroke-dasharray="6 4" />
    <path d={mufPath} fill="none" stroke="var(--color-series-1)" stroke-width="2.5" />

    <!-- Arbeitspunkt -->
    <line
      x1={x(hourOfDay)}
      y1={PAD.top}
      x2={x(hourOfDay)}
      y2={PAD.top + PLOT_H}
      stroke="var(--color-marker)"
      stroke-width="2"
    />
    <circle cx={x(hourOfDay)} cy={y(muf)} r="5" fill="var(--color-series-1)" />
    {#each openings as band (band.id)}
      <circle
        cx={x(hourOfDay)}
        cy={y(band.centerMHz)}
        r="4"
        fill={STATUS_COLOR[band.status]}
        stroke="var(--color-surface)"
      />
    {/each}

    <g transform="translate({PAD.left + 10}, {PAD.top + 14})">
      <line x1="0" y1="0" x2="18" y2="0" stroke="var(--color-series-1)" stroke-width="2.5" />
      <text x="24" y="4" class="chart-legend-text">MUF {mhz(muf)}</text>
      <line x1="120" y1="0" x2="138" y2="0" stroke="var(--color-series-2)" stroke-width="1.5" stroke-dasharray="6 4" />
      <text x="144" y="4" class="chart-legend-text">FOT {mhz(owf)}</text>
      <rect x="240" y="-5" width="16" height="10" fill="var(--color-series-7)" opacity="0.4" />
      <text x="262" y="4" class="chart-legend-text">D-Schicht bis {mhz(luf)}</text>
      <text x="410" y="4" class="chart-legend-text">{clock(hourOfDay)} · {openCount} von 8 Bändern offen</text>
    </g>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Zustand der Kurzwellenbänder um {clock(hourOfDay)} bei {formatNumber(distanceKm, 0)} km</caption>
      <thead><tr><th>Band</th><th>Bandmitte</th><th>Zustand</th><th>Anteil an der MUF</th></tr></thead>
      <tbody>
        {#each openings as band (band.id)}
          <tr>
            <td>{band.nameDE}</td>
            <td>{mhz(band.centerMHz)}</td>
            <td>{STATUS_LABEL[band.status]}</td>
            <td>{formatPercentage(band.mufRatio * 100, 0)}</td>
          </tr>
        {/each}
        <tr><th>MUF</th><td colspan="3">{mhz(muf)}</td></tr>
        <tr><th>FOT</th><td colspan="3">{mhz(owf)}</td></tr>
        <tr><th>Untere Schranke (Annahme)</th><td colspan="3">{mhz(luf)}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Ortszeit"
      bind:value={hourOfDay}
      min={BAND_OPENING_LIMITS.hourOfDay.min}
      max={BAND_OPENING_LIMITS.hourOfDay.max}
      step={0.25}
      format={(v) => clock(v)}
      unitSymbol="Uhr"
    />
    <Slider
      label="Sprungdistanz"
      bind:value={distanceKm}
      min={BAND_OPENING_LIMITS.distanceKm.min}
      max={BAND_OPENING_LIMITS.distanceKm.max}
      step={100}
      format={(v) => `${formatNumber(v, 0)} km`}
      unitSymbol="km"
      hint="Flacher Einfallswinkel: je größer der Sprung, desto höher die MUF."
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="MUF über {formatNumber(distanceKm, 0)} km"
      value={mhz(muf)}
      hint="FOT {mhz(owf)} — darüber wird es unzuverlässig"
      emphasis="hero"
      tone="success"
      copyable={false}
    />
    <ResultCard
      label="Offene Bänder"
      value="{formatNumber(openCount, 0)} von 8"
      hint="um {clock(hourOfDay)}"
      copyable={false}
    />
    <ResultCard
      label="D-Schicht-Absorption"
      value={formatPercentage(absorptionIndex(hourOfDay) * 100, 0)}
      hint="dämpft bis {mhz(luf)}"
      tone={absorptionIndex(hourOfDay) > 0.5 ? 'warning' : 'neutral'}
      copyable={false}
    />
    <Callout tone="info" title="Warum 80 m und 40 m am Tag schweigen">
      Die D-Schicht entsteht nur unter Sonneneinstrahlung und dämpft umgekehrt zum Quadrat der Frequenz — die unteren
      Bänder trifft es deshalb am härtesten. Nach Sonnenuntergang verschwindet sie binnen einer Stunde, und dieselbe
      Station, die mittags nur 300 km weit kam, arbeitet nachts über den Atlantik. Nach oben setzt die F2-Schicht die
      Grenze: Oberhalb der MUF durchstößt die Welle die Schicht und kommt nicht zurück.
    </Callout>
    <Callout tone="warning" title="Richtwerte, keine Vorhersage">
      Der Tagesgang ist sinusförmig genähert und gilt für mittlere Breiten bei mittlerer Sonnenaktivität. Im Maximum des
      elfjährigen Zyklus liegt die MUF deutlich höher, im Minimum darunter; Jahreszeit, Störungen des Erdmagnetfelds und
      sporadische E-Schichten kommen hinzu. Verlässlich ist nur der Blick auf die Baken und die Empfangsberichte der
      Digimodes.
    </Callout>
  {/snippet}
</WidgetFrame>
