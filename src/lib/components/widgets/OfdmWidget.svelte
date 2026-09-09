<script lang="ts">
  /**
   * OFDM-Unterträger: si-förmige Spektren im Abstand Δf = 1/T_s. Jede
   * Nullstelle eines Trägers liegt auf den Maxima aller anderen — deshalb
   * dürfen sie sich überlappen. Gerechnet wird in OfdmModel.ts.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import Slider from '$lib/components/ui/Slider.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import ResultCard from '$lib/components/ui/ResultCard.svelte';
  import { formatDataRate, formatFrequency, formatNumber } from '$lib/utils/formatting';
  import {
    BITS_PER_SYMBOL_OPTIONS,
    LTE_SUBCARRIER_SPACING_HZ,
    OFDM_LIMITS,
    crosstalkAtCenter,
    grossBitRateBps,
    nominalBandwidthHz,
    nullToNullBandwidthHz,
    spectrumSamples,
    subcarrierFrequencies,
    symbolDurationS
  } from './OfdmModel';

  const W = 800;
  const H = 260;
  const X0 = 56;
  const X1 = 768;
  const Y0 = 44;
  const Y1 = 200;

  let subcarriers = $state<number>(OFDM_LIMITS.subcarriers.default);
  let spacingHz = $state<number>(OFDM_LIMITS.spacingHz.default);
  let bitsValue = $state<string>('4');

  const bitsPerSymbol = $derived(Number(bitsValue));
  const centers = $derived(subcarrierFrequencies(subcarriers, spacingHz));
  const samples = $derived(spectrumSamples(subcarriers, spacingHz));
  const symbolS = $derived(symbolDurationS(spacingHz));
  const nominalHz = $derived(nominalBandwidthHz(subcarriers, spacingHz));
  const nullToNullHz = $derived(nullToNullBandwidthHz(subcarriers, spacingHz));
  const bitRate = $derived(grossBitRateBps(subcarriers, bitsPerSymbol, spacingHz));
  const crosstalk = $derived(crosstalkAtCenter(subcarriers, spacingHz));

  const range = $derived({
    min: samples.length ? samples[0].frequencyHz : -1,
    max: samples.length ? samples[samples.length - 1].frequencyHz : 1
  });
  function fx(frequencyHz: number): number {
    const span = range.max - range.min || 1;
    return X0 + ((frequencyHz - range.min) / span) * (X1 - X0);
  }
  function ay(amplitude: number): number {
    return Y1 - Math.abs(amplitude) * (Y1 - Y0);
  }
  function carrierPath(index: number): string {
    return samples
      .map((s, i) => `${i === 0 ? 'M' : 'L'}${fx(s.frequencyHz).toFixed(1)},${ay(s.amplitudes[index]).toFixed(1)}`)
      .join(' ');
  }
  /** Symboldauer lesbar: Sekunden mit passender Vorsilbe. */
  function formatDuration(seconds: number): string {
    if (seconds >= 1e-3) return `${formatNumber(seconds * 1e3, 3)} ms`;
    if (seconds >= 1e-6) return `${formatNumber(seconds * 1e6, 2)} µs`;
    return `${formatNumber(seconds * 1e9, 1)} ns`;
  }
  /** Frequenzachse relativ zur Mitte, in Vielfachen von Δf. */
  const axisTicks = $derived(centers.map((center, index) => ({ center, index })));
</script>

<WidgetFrame
  title="OFDM: orthogonale Unterträger"
  description="Mehrere si-förmige Trägerspektren liegen im Abstand Delta f nebeneinander und überlappen sich stark. Auf der Mittenfrequenz jedes Trägers haben alle anderen genau eine Nullstelle — deshalb stören sie einander nicht, obwohl sie sich überlappen."
  stacked
  footnote="Δf = 1/T_s ist die Orthogonalitätsbedingung. Amplituden auf 1 normiert; Schutzintervall (Cyclic Prefix) und Filterung sind nicht dargestellt. Referenz: LTE mit Δf = 15 kHz (3GPP TS 36.211)."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <line x1={X0} y1={Y1} x2={X1} y2={Y1} class="chart-axis-line" />
    <line x1={X0} y1={Y0} x2={X0} y2={Y1} class="chart-axis-line" />
    <line x1={X0} y1={Y0} x2={X1} y2={Y0} class="chart-grid-line" />
    <text x={X0 - 8} y={Y0 + 4} text-anchor="end" class="chart-axis-text">1</text>
    <text x={X0 - 8} y={Y1 + 4} text-anchor="end" class="chart-axis-text">0</text>

    {#each centers as center, index (center)}
      <path
        d={carrierPath(index)}
        fill="none"
        stroke={index === Math.floor(centers.length / 2) ? 'var(--color-series-6)' : 'var(--color-series-1)'}
        stroke-width={index === Math.floor(centers.length / 2) ? 2.5 : 1.5}
        opacity={index === Math.floor(centers.length / 2) ? 1 : 0.65}
      />
      <line x1={fx(center)} y1={Y0} x2={fx(center)} y2={Y1} class="chart-grid-line" />
    {/each}

    {#each axisTicks as tick (tick.center)}
      <circle cx={fx(tick.center)} cy={ay(1)} r="3.5" fill="var(--color-series-2)" />
      <text x={fx(tick.center)} y={Y1 + 18} text-anchor="middle" class="chart-axis-text">{tick.index + 1}</text>
    {/each}

    <!-- Belegte Bandbreite -->
    <line
      x1={fx(centers[0] - spacingHz / 2)}
      y1={Y1 + 34}
      x2={fx(centers[centers.length - 1] + spacingHz / 2)}
      y2={Y1 + 34}
      stroke="var(--color-series-3)"
      stroke-width="2"
    />
    <text
      x={(fx(centers[0]) + fx(centers[centers.length - 1])) / 2}
      y={Y1 + 52}
      text-anchor="middle"
      class="chart-axis-text"
    >
      N·Δf = {formatFrequency(nominalHz, 1)}
    </text>
    <text x={X1} y={Y0 - 12} text-anchor="end" class="chart-axis-text">
      Δf = {formatFrequency(spacingHz, 1)} · T_s = {formatDuration(symbolS)}
    </text>
    <text x={X0} y={Y0 - 12} class="chart-axis-text">normierte Amplitude · Unterträgernummer</text>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>OFDM-Parameter bei den eingestellten Werten</caption>
      <tbody>
        <tr><th>Zahl der Unterträger N</th><td>{formatNumber(subcarriers, 0)}</td></tr>
        <tr><th>Trägerabstand Δf</th><td>{formatFrequency(spacingHz, 2)}</td></tr>
        <tr><th>Symboldauer T_s = 1/Δf</th><td>{formatDuration(symbolS)}</td></tr>
        <tr><th>Nominelle Bandbreite N·Δf</th><td>{formatFrequency(nominalHz, 2)}</td></tr>
        <tr><th>Bandbreite von Null zu Null</th><td>{formatFrequency(nullToNullHz, 2)}</td></tr>
        <tr><th>Bit je Unterträgersymbol</th><td>{formatNumber(bitsPerSymbol, 0)}</td></tr>
        <tr><th>Bruttodatenrate</th><td>{formatDataRate(bitRate)}</td></tr>
        <tr><th>Übersprechen in der Trägermitte</th><td>{formatNumber(crosstalk, 6)}</td></tr>
      </tbody>
    </table>
  {/snippet}

  {#snippet controls()}
    <Slider
      label="Zahl der Unterträger N"
      bind:value={subcarriers}
      min={OFDM_LIMITS.subcarriers.min}
      max={OFDM_LIMITS.subcarriers.max}
      step={1}
      format={(v) => formatNumber(v, 0)}
      unitSymbol="Träger"
    />
    <Slider
      label="Trägerabstand Δf"
      bind:value={spacingHz}
      min={OFDM_LIMITS.spacingHz.min}
      max={OFDM_LIMITS.spacingHz.max}
      step={500}
      format={(v) => formatFrequency(v, 1)}
      unitSymbol="Hz"
      ticks={[{ at: LTE_SUBCARRIER_SPACING_HZ, label: 'LTE 15 kHz' }]}
    />
    <Select
      label="Modulation je Unterträger"
      bind:value={bitsValue}
      options={BITS_PER_SYMBOL_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
    />
  {/snippet}

  {#snippet results()}
    <ResultCard
      label="Symboldauer T_s = 1/Δf"
      value={formatDuration(symbolS)}
      emphasis="hero"
      hint="je länger das Symbol, desto enger die Träger"
      copyable={false}
    />
    <ResultCard label="Belegte Bandbreite N·Δf" value={formatFrequency(nominalHz, 2)} copyable={false} />
    <ResultCard
      label="Bruttodatenrate"
      value={formatDataRate(bitRate)}
      hint="N · {formatNumber(bitsPerSymbol, 0)} Bit · Δf, ohne Schutzintervall"
      copyable={false}
    />
    <ResultCard
      label="Übersprechen in der Trägermitte"
      value={formatNumber(crosstalk, 6)}
      tone="success"
      hint="null: die Träger sind orthogonal"
      copyable={false}
    />
  {/snippet}
</WidgetFrame>
