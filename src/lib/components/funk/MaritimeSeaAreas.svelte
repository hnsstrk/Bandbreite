<script lang="ts">
  /**
   * Schematische Karte der GMDSS-Seegebiete A1 bis A4.
   *
   * Die Darstellung ist bewusst nicht maßstäblich: Sie zeigt, welches
   * Funksystem ein Seegebiet trägt, nicht seine geografische Ausdehnung. Die
   * Daten stehen in `data/maritimeChannels.ts`.
   */
  import WidgetFrame from '$lib/components/knowledge/WidgetFrame.svelte';
  import { GMDSS_SEA_AREAS } from '$lib/data/maritimeChannels';

  /** Zeichenfläche */
  const W = 800;
  const H = 300;
  /** Linker Rand: Land und Küstenfunkstelle */
  const COAST_X = 96;
  /** Oberkante und Unterkante der Wasserfläche */
  const SEA_TOP = 96;
  const SEA_BOTTOM = 252;

  /**
   * Relative Breite der vier Gebiete auf der Zeichenfläche.
   * Nicht maßstäblich — A3 wäre sonst um Größenordnungen breiter.
   */
  const WIDTH_SHARE = [0.18, 0.22, 0.36, 0.24];

  const AVAILABLE = W - COAST_X;

  /** Vorberechnete Geometrie je Seegebiet. */
  const segments = GMDSS_SEA_AREAS.map((area, index) => {
    const start = COAST_X + AVAILABLE * WIDTH_SHARE.slice(0, index).reduce((a, b) => a + b, 0);
    const width = AVAILABLE * WIDTH_SHARE[index];
    return { area, x: start, width, center: start + width / 2, index };
  });

  /** Vier Serienfarben aus dem Token-System, damit die Gebiete unterscheidbar bleiben. */
  const FILLS = ['var(--color-series-1)', 'var(--color-series-2)', 'var(--color-series-3)', 'var(--color-series-4)'];
</script>

<WidgetFrame
  title="Die vier GMDSS-Seegebiete"
  description="Schematischer Schnitt von der Küste auf die offene See: Seegebiet A1 wird von der UKW-Küstenfunkstelle getragen, A2 von der Grenzwelle, A3 von geostationären Satelliten und A4 von der Kurzwelle in den Polargebieten."
  stacked
  footnote="Schematisch, nicht maßstäblich. Die tatsächlichen Grenzen legt jede Verwaltung anhand der Funkabdeckung ihrer Küstenfunkstellen fest und veröffentlicht sie in der ITU List of Coast Stations."
>
  <svg viewBox="0 0 {W} {H}" aria-hidden="true">
    <!-- Wasserfläche -->
    <rect x="0" y={SEA_TOP} width={W} height={SEA_BOTTOM - SEA_TOP} fill="var(--color-elevated)" />

    <!-- Gebiete -->
    {#each segments as segment (segment.area.id)}
      <rect
        x={segment.x}
        y={SEA_TOP}
        width={segment.width}
        height={SEA_BOTTOM - SEA_TOP}
        fill={FILLS[segment.index]}
        opacity="0.22"
      />
      <line
        x1={segment.x}
        y1={SEA_TOP}
        x2={segment.x}
        y2={SEA_BOTTOM}
        stroke="var(--color-line-strong)"
        stroke-width="1"
        stroke-dasharray="4,4"
      />
      <text x={segment.center} y={SEA_TOP + 30} text-anchor="middle" class="area-label">
        {segment.area.id}
      </text>
      <text x={segment.center} y={SEA_TOP + 52} text-anchor="middle" class="chart-axis-text">
        {segment.area.systemDE.split(' ')[0]}
      </text>
    {/each}

    <!-- Land und Küstenfunkstelle -->
    <rect x="0" y={SEA_TOP} width={COAST_X} height={SEA_BOTTOM - SEA_TOP} fill="var(--color-surface)" />
    <line x1={COAST_X} y1={SEA_TOP} x2={COAST_X} y2={SEA_BOTTOM} stroke="var(--color-ink)" stroke-width="2" />
    <line x1="52" y1={SEA_BOTTOM - 12} x2="52" y2={SEA_TOP + 24} stroke="var(--color-ink-subtle)" stroke-width="4" />
    <path
      d="M38,{SEA_TOP + 34} L52,{SEA_TOP + 22} L66,{SEA_TOP + 34}"
      fill="none"
      stroke="var(--color-series-1-solid)"
      stroke-width="2.5"
    />
    <text x="52" y={SEA_BOTTOM + 20} text-anchor="middle" class="chart-axis-text">Küstenfunkstelle</text>

    <!-- Satellit über dem A3-Gebiet -->
    <g transform="translate({segments[2].center}, 44)">
      <rect x="-16" y="-10" width="32" height="20" rx="3" fill="var(--color-series-3-solid)" />
      <rect x="-34" y="-5" width="14" height="10" fill="var(--color-series-3-solid)" opacity="0.7" />
      <rect x="20" y="-5" width="14" height="10" fill="var(--color-series-3-solid)" opacity="0.7" />
    </g>
    <line
      x1={segments[2].center}
      y1="58"
      x2={segments[2].center}
      y2={SEA_TOP - 4}
      stroke="var(--color-series-3-solid)"
      stroke-width="1.5"
      stroke-dasharray="5,4"
    />
    <text x={segments[2].center} y="24" text-anchor="middle" class="chart-axis-text"> geostationärer Satellit </text>

    <!-- Hinweis auf die Polargebiete über A4 -->
    <text x={segments[3].center} y="44" text-anchor="middle" class="chart-axis-text">
      Polargebiete: kein geostationärer Satellit
    </text>
    <text x={segments[3].center} y="64" text-anchor="middle" class="chart-axis-text"> Kurzwelle trägt allein </text>

    <!-- Entfernungsachse -->
    <line x1={COAST_X} y1={SEA_BOTTOM + 34} x2={W - 8} y2={SEA_BOTTOM + 34} class="chart-axis-line" />
    <text x={W - 8} y={SEA_BOTTOM + 24} text-anchor="end" class="chart-axis-text">
      zunehmende Entfernung von der Küste
    </text>
  </svg>

  {#snippet dataTable()}
    <table>
      <caption>Seegebiete des GMDSS mit tragendem Funksystem</caption>
      <thead>
        <tr>
          <th scope="col">Seegebiet</th>
          <th scope="col">Ausdehnung</th>
          <th scope="col">Tragendes System</th>
          <th scope="col">Zusätzliche Ausrüstung</th>
        </tr>
      </thead>
      <tbody>
        {#each GMDSS_SEA_AREAS as area (area.id)}
          <tr>
            <th scope="row">{area.nameDE}</th>
            <td>{area.extentDE}</td>
            <td>{area.systemDE}</td>
            <td>{area.equipmentDE.join('; ')}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/snippet}
</WidgetFrame>

<style>
  .area-label {
    font-size: 1.25rem;
    font-weight: var(--font-weight-semibold);
    fill: var(--color-ink);
  }
</style>
