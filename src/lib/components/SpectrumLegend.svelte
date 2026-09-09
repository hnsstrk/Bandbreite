<script lang="ts">
  /**
   * Legende der EM-Bereiche. In schmalen Containern bleibt sie in einer
   * Zeile und wird bei Bedarf waagerecht gescrollt: die EM-Reihe zeigt bei
   * 340 px Zeichenbreite nur noch zwei bis drei Namen, die Farbzuordnung
   * muss also lesbar bleiben.
   */
  interface Props {
    /** true in schmalen Containern (< 640 px) */
    compact?: boolean;
  }

  let { compact = false }: Props = $props();
</script>

<div class="mt-4 flex flex-wrap gap-3 text-xs text-slate-400" class:legend--compact={compact}>
  <div class="flex items-center gap-1">
    <div class="h-3 w-3 rounded bg-blue-500"></div>
    <span>Radio</span>
  </div>
  <div class="flex items-center gap-1">
    <div class="h-3 w-3 rounded bg-indigo-500"></div>
    <span>Mikrowellen</span>
  </div>
  <div class="flex items-center gap-1">
    <div class="h-3 w-3 rounded bg-red-700"></div>
    <span>Infrarot</span>
  </div>
  <div class="flex items-center gap-1">
    <div
      class="h-3 w-3 rounded"
      style="background: linear-gradient(to right, #dc2626, #eab308, #22c55e, #3b82f6, #8b5cf6);"
    ></div>
    <span>Sichtbar</span>
  </div>
  <div class="flex items-center gap-1">
    <div class="h-3 w-3 rounded bg-violet-700"></div>
    <span>Ultraviolett</span>
  </div>
  <div class="flex items-center gap-1">
    <div class="h-3 w-3 rounded bg-cyan-600"></div>
    <span>Röntgen</span>
  </div>
  <div class="flex items-center gap-1">
    <div class="h-3 w-3 rounded bg-pink-500"></div>
    <span>Gamma</span>
  </div>
</div>

<style>
  .legend--compact {
    margin-top: 0.25rem;
    flex-wrap: nowrap;
    gap: 0.5rem;
    overflow-x: auto;
    font-size: 0.65rem;
    scrollbar-width: none;
  }

  .legend--compact::-webkit-scrollbar {
    display: none;
  }
</style>
