<script lang="ts">
  /**
   * Frequenzmarker: senkrechte Linie über alle sichtbaren Reihen mit
   * Endpunkten oben und unten.
   */
  interface Props {
    markerX: number;
    topY: number;
    bottomY: number;
  }

  let { markerX, topY, bottomY }: Props = $props();
</script>

<!-- Single marker line spanning all visible rows -->
<line x1={markerX} y1={topY} x2={markerX} y2={bottomY} stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" />
<circle cx={markerX} cy={topY} r="5" fill="#fbbf24" stroke="#0f172a" stroke-width="1.5" />
<circle cx={markerX} cy={bottomY} r="5" fill="#fbbf24" stroke="#0f172a" stroke-width="1.5" />
