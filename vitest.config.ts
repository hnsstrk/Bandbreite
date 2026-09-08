import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  // Komponententests (@testing-library/svelte) brauchen die Client-Variante
  // von `svelte`, sonst ist `mount()` nicht verfügbar. Gilt nur unter Vitest;
  // die SSR-Render-Tests (`@vitest-environment node`) bleiben davon unberührt.
  resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/**/*.svelte', 'src/lib/**/*.d.ts']
    }
  }
  // Kein manueller $lib-Alias: das sveltekit()-Plugin liefert ihn maschinenunabhängig.
});
