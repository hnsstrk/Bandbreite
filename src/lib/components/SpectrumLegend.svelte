<script lang="ts">
  // Legend component for the EM spectrum regions
  // No props needed - displays a static legend
</script>

<div class="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
  <div class="flex items-center gap-1">
    <div class="w-3 h-3 rounded bg-blue-500"></div>
    <span>Radio</span>
  </div>
  <div class="flex items-center gap-1">
    <div class="w-3 h-3 rounded bg-indigo-500"></div>
    <span>Mikrowellen</span>
  </div>
  <div class="flex items-center gap-1">
    <div class="w-3 h-3 rounded bg-red-700"></div>
    <span>Infrarot</span>
  </div>
  <div class="flex items-center gap-1">
    <div class="w-3 h-3 rounded" style="background: linear-gradient(to right, #dc2626, #eab308, #22c55e, #3b82f6, #8b5cf6);"></div>
    <span>Sichtbar</span>
  </div>
  <div class="flex items-center gap-1">
    <div class="w-3 h-3 rounded bg-violet-700"></div>
    <span>Ultraviolett</span>
  </div>
  <div class="flex items-center gap-1">
    <div class="w-3 h-3 rounded bg-cyan-600"></div>
    <span>Röntgen</span>
  </div>
  <div class="flex items-center gap-1">
    <div class="w-3 h-3 rounded bg-pink-500"></div>
    <span>Gamma</span>
  </div>
</div>
