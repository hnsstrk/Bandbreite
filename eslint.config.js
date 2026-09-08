/**
 * ESLint (Flat Config) für Bandbreite.
 *
 * Ziel ist ein knapper Satz Regeln, der echte Fehler findet, ohne den
 * bestehenden Stil umzuschreiben: Formatierung macht Prettier (`npm run
 * format`), ESLint prüft Logik, ungenutzte Bindungen und Svelte-Eigenheiten.
 */
import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import svelteConfig from './svelte.config.js';

export default ts.config(
  {
    // Erzeugte, fremde und binäre Verzeichnisse
    ignores: [
      'build/',
      '.svelte-kit/',
      'node_modules/',
      'static/',
      'coverage/',
      'package-lock.json'
    ]
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    },
    rules: {
      // Ungenutztes ist ein Fehler; ein führender Unterstrich sagt „absichtlich".
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_'
        }
      ],
      // `any` bleibt die Ausnahme, blockiert aber keinen Lauf.
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig
      }
    },
    rules: {
      // Inline-HTML gibt es nur für eigene Inhalte (Kapiteltexte) — bewusst.
      'svelte/no-at-html-tags': 'warn',
      /*
       * `resolve()` aus `$app/paths` brauchte es nur bei gesetztem `base`.
       * Die Anwendung liegt an der Wurzel, und jeder interne Link stammt aus
       * `data/navigation.ts` (Trailing Slash und Existenz sind dort getestet).
       */
      'svelte/no-navigation-without-resolve': 'off',
      /*
       * Alle Fundstellen ersetzen ihre Instanz vollständig (`x = new Set(…)`)
       * oder sind lokale Zwischenwerte (`new URL(…)` beim Linkbau) — die
       * reaktiven Hüllen aus `svelte/reactivity` brächten dort nichts.
       */
      'svelte/prefer-svelte-reactivity': 'off',
      /*
       * `$bindable()`-Vorgaben und defensive Startwerte in Tastaturhandlern
       * sehen für die Regel wie tote Zuweisungen aus.
       */
      'no-useless-assignment': 'off',
      // Runen-bewusste Fassung: `$derived`/`$props` bleiben `let`.
      'prefer-const': 'off',
      'svelte/prefer-const': 'error',
      /*
       * `/konverter/frequenz/`: der Startwert wird bewusst über `$state` +
       * `$effect.pre` gesetzt (Konverter-Synchronisation, Bericht 41).
       */
      'svelte/prefer-writable-derived': 'warn'
    }
  },
  {
    // Tests und Skripte laufen in Node und dürfen ausgeben.
    files: ['src/tests/**', 'scripts/**', 'e2e/**', '*.config.{js,ts}'],
    rules: { 'no-console': 'off' }
  },
  {
    /*
     * `BandInfo.svelte` ist eine geschützte Kernkomponente, über deren Zukunft
     * der Besitzer noch entscheidet (CLAUDE.md). Bis dahin bleibt die Datei
     * unangetastet; ihr einziger Befund ist ein ungenutzter Typ-Import.
     */
    files: ['src/lib/components/converters/BandInfo.svelte'],
    rules: { '@typescript-eslint/no-unused-vars': 'warn' }
  }
);
