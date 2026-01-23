<script lang="ts">
  import { page } from '$app/state';

  interface NavItem {
    href: string;
    label: string;
    disabled: boolean;
  }

  const navItems: NavItem[] = [
    { href: '/', label: 'Frequenz-Konverter', disabled: false },
    { href: '/fspl', label: 'FSPL-Rechner', disabled: true },
    { href: '/radar', label: 'Radar-Rechner', disabled: true },
    { href: '/referenz', label: 'Referenz-Tabellen', disabled: true }
  ];
</script>

<nav class="bg-slate-700 border-b border-slate-600">
  <div class="max-w-7xl mx-auto px-4">
    <ul class="flex flex-wrap gap-1 py-2">
      {#each navItems as item (item.href)}
        {#if item.disabled}
          <li>
            <span class="block px-4 py-2 text-slate-500 cursor-not-allowed text-sm">
              {item.label}
            </span>
          </li>
        {:else}
          <li>
            <a
              href={item.href}
              class="block px-4 py-2 rounded text-sm transition-colors {page.url.pathname === item.href
                ? 'bg-slate-600 text-white'
                : 'text-slate-300 hover:bg-slate-600 hover:text-white'}"
            >
              {item.label}
            </a>
          </li>
        {/if}
      {/each}
    </ul>
  </div>
</nav>
