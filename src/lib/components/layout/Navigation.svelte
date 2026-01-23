<script lang="ts">
  import { page } from '$app/state';

  interface NavItem {
    href: string;
    label: string;
  }

  const navItems: NavItem[] = [
    { href: '/', label: 'Startseite' },
    { href: '/konverter', label: 'Konverter' },
    { href: '/spektrum', label: 'Spektrum' },
    { href: '/daempfung', label: 'Daempfung' }
  ];

  let mobileMenuOpen = $state(false);

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
</script>

<nav class="bg-slate-700 border-b border-slate-600">
  <div class="max-w-7xl mx-auto px-4">
    <div class="flex items-center justify-between py-3">
      <!-- Logo / Brand -->
      <a href="/" class="text-white font-semibold text-lg">Bandbreite</a>

      <!-- Desktop Navigation -->
      <ul class="hidden md:flex gap-1">
        {#each navItems as item (item.href)}
          <li>
            <a
              href={item.href}
              class="block px-4 py-2 rounded text-sm transition-colors {page.url.pathname === item.href
                ? 'bg-slate-600 text-white font-medium'
                : 'text-slate-300 hover:bg-slate-600 hover:text-white'}"
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>

      <!-- Mobile Hamburger Button -->
      <button
        type="button"
        class="md:hidden p-2 rounded text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
        onclick={toggleMobileMenu}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-menu"
        aria-label={mobileMenuOpen ? 'Menue schliessen' : 'Menue oeffnen'}
      >
        {#if mobileMenuOpen}
          <!-- Close Icon (X) -->
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        {:else}
          <!-- Hamburger Icon -->
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        {/if}
      </button>
    </div>

    <!-- Mobile Navigation Menu -->
    {#if mobileMenuOpen}
      <div id="mobile-menu" class="md:hidden pb-4">
        <ul class="flex flex-col gap-1">
          {#each navItems as item (item.href)}
            <li>
              <a
                href={item.href}
                onclick={closeMobileMenu}
                class="block px-4 py-3 rounded text-sm transition-colors {page.url.pathname === item.href
                  ? 'bg-slate-600 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-600 hover:text-white'}"
              >
                {item.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</nav>
