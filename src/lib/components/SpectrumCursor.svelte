<script lang="ts">
  interface Props {
    cursorX: number;
    frequencyLabel: string;
    wavelengthLabel: string;
    topY: number;
    bottomY: number;
    innerWidth: number;
  }

  let { cursorX, frequencyLabel, wavelengthLabel, topY, bottomY, innerWidth }: Props = $props();

  // Label-Breite schätzen für Positionierung
  const LABEL_WIDTH = 80;
  const LABEL_HEIGHT = 22;
  const LABEL_PADDING_X = 8;

  // Clamp für Labels am linken und rechten Rand
  let clampedLabelX = $derived(
    Math.max(LABEL_WIDTH / 2 + 4, Math.min(cursorX, innerWidth - LABEL_WIDTH / 2 - 4))
  );
</script>

<!-- Cursor group - nicht klickbar -->
<g pointer-events="none">
  <!-- Gestrichelte vertikale Linie -->
  <line
    x1={cursorX}
    y1={topY}
    x2={cursorX}
    y2={bottomY}
    stroke="#94a3b8"
    stroke-width="1"
    stroke-dasharray="4 3"
    opacity="0.5"
  />

  <!-- Kleiner Kreis oben -->
  <circle
    cx={cursorX}
    cy={topY}
    r="3"
    fill="#94a3b8"
    opacity="0.7"
  />

  <!-- Kleiner Kreis unten -->
  <circle
    cx={cursorX}
    cy={bottomY}
    r="3"
    fill="#94a3b8"
    opacity="0.7"
  />

  <!-- Wellenlängen-Label (oben) -->
  {#if wavelengthLabel}
    <g transform="translate({clampedLabelX}, {topY - 30})">
      <rect
        x={-LABEL_WIDTH / 2 - LABEL_PADDING_X}
        y={-LABEL_HEIGHT / 2}
        width={LABEL_WIDTH + LABEL_PADDING_X * 2}
        height={LABEL_HEIGHT}
        rx="4"
        ry="4"
        fill="rgba(15, 23, 42, 0.9)"
        stroke="#475569"
        stroke-width="0.5"
      />
      <text
        y="1"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="#e2e8f0"
        style="font-size: 11px; font-weight: 500; font-family: 'JetBrains Mono', 'Fira Code', monospace;"
      >
        λ = {wavelengthLabel}
      </text>
    </g>
  {/if}

  <!-- Frequenz-Label (unten) -->
  {#if frequencyLabel}
    <g transform="translate({clampedLabelX}, {bottomY + 30})">
      <rect
        x={-LABEL_WIDTH / 2 - LABEL_PADDING_X}
        y={-LABEL_HEIGHT / 2}
        width={LABEL_WIDTH + LABEL_PADDING_X * 2}
        height={LABEL_HEIGHT}
        rx="4"
        ry="4"
        fill="rgba(15, 23, 42, 0.9)"
        stroke="#475569"
        stroke-width="0.5"
      />
      <text
        y="1"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="#e2e8f0"
        style="font-size: 11px; font-weight: 500; font-family: 'JetBrains Mono', 'Fira Code', monospace;"
      >
        f = {frequencyLabel}
      </text>
    </g>
  {/if}
</g>
