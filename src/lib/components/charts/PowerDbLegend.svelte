<script lang="ts">
  import { POWER_CHART_CATEGORY_COLORS } from '$lib/data/presets';

  interface Props {
    chartWidth: number;
    chartHeight: number;
    bandMode: 'ieee' | 'nato';
  }

  let { chartWidth, chartHeight, bandMode }: Props = $props();

  const categoryColors = POWER_CHART_CATEGORY_COLORS;
</script>

<g transform="translate({chartWidth / 2 - 300}, {chartHeight + 65})">
  <!-- Communication legend -->
  <circle cx="0" cy="0" r="6" fill={categoryColors.communication} stroke="#1e293b" stroke-width="1.5" />
  <text x="12" y="4" style="fill: var(--color-chart-text-secondary)" font-size="11">Kommunikation</text>

  <!-- Radar legend -->
  <rect x="115" y="-6" width="12" height="12" rx="2" fill={categoryColors.radar} stroke="#1e293b" stroke-width="1.5" />
  <text x="132" y="4" style="fill: var(--color-chart-text-secondary)" font-size="11">RADAR</text>

  <!-- Satellite legend -->
  <polygon points="200,-6 206,4 194,4" fill={categoryColors.satellite} stroke="#1e293b" stroke-width="1.5" />
  <text x="214" y="4" style="fill: var(--color-chart-text-secondary)" font-size="11">Satellit</text>

  <!-- IoT legend -->
  <polygon points="285,0 293,-6 301,0 293,6" fill={categoryColors.iot} stroke="#1e293b" stroke-width="1.5" />
  <text x="308" y="4" style="fill: var(--color-chart-text-secondary)" font-size="11">IoT/RFID</text>

  <!-- Industrial legend -->
  <g transform="translate(390, 0)">
    <circle cx="0" cy="0" r="6" fill={categoryColors.industrial} stroke="#1e293b" stroke-width="1.5" />
    <circle cx="0" cy="0" r="2.5" fill="#1e293b" />
  </g>
  <text x="402" y="4" style="fill: var(--color-chart-text-secondary)" font-size="11">Industrie</text>

  <!-- Current band system indicator -->
  <rect x="480" y="-6" width="12" height="12" rx="1" fill={bandMode === 'ieee' ? '#6366f1' : '#22c55e'} opacity="0.5" />
  <text x="498" y="4" style="fill: var(--color-text-tertiary)" font-size="11">{bandMode === 'ieee' ? 'IEEE' : 'NATO'}-Bänder</text>
</g>
