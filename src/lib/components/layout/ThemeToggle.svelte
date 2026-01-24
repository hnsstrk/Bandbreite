<script lang="ts">
  import { browser } from '$app/environment';

  // Theme state
  let isDark = $state(true); // Default to dark theme

  // Initialize theme from localStorage or system preference
  $effect(() => {
    if (browser) {
      const stored = localStorage.getItem('theme');
      if (stored) {
        isDark = stored === 'dark';
      } else {
        // Check system preference
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      applyTheme();
    }
  });

  // Apply theme to document
  function applyTheme() {
    if (browser) {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  // Toggle theme
  function toggleTheme() {
    isDark = !isDark;
    if (browser) {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      applyTheme();
    }
  }

  // Keyboard handler
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTheme();
    }
  }
</script>

<button
  type="button"
  onclick={toggleTheme}
  onkeydown={handleKeyDown}
  class="theme-toggle"
  aria-label={isDark ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'}
  title={isDark ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'}
>
  {#if isDark}
    <!-- Sun icon for switching to light mode -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  {:else}
    <!-- Moon icon for switching to dark mode -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  {/if}
</button>

<style>
  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0.5rem;
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    background-color: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .theme-toggle:hover {
    background-color: var(--color-bg-elevated);
    color: var(--color-text-primary);
    border-color: var(--color-border-strong);
  }

  .theme-toggle:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    border-color: var(--color-border-focus);
  }

  .icon {
    width: 1.25rem;
    height: 1.25rem;
  }
</style>
