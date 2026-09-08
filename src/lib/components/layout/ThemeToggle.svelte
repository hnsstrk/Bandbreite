<script lang="ts">
	/**
	 * Theme-Umschalter mit drei Zuständen: hell, dunkel, System.
	 *
	 * Die Klasse `.dark` wird bereits vom Inline-Skript in `app.html`
	 * gesetzt, bevor die Seite gerendert wird — diese Komponente liest
	 * den gespeicherten Wert nur noch aus und schreibt Änderungen zurück.
	 *
	 * Bedienung: eine Gruppe aus drei Schaltflächen mit `aria-pressed`,
	 * jede einzeln per Tabulator erreichbar und mit Leertaste/Enter
	 * auslösbar (natives `<button>`).
	 */
	import { browser } from '$app/environment';
	import Icon from '../ui/Icon.svelte';
	import type { IconName } from '../ui/icons';

	type ThemeChoice = 'light' | 'dark' | 'system';

	const OPTIONS: { value: ThemeChoice; label: string; icon: IconName }[] = [
		{ value: 'light', label: 'Hell', icon: 'sun' },
		{ value: 'dark', label: 'Dunkel', icon: 'moon' },
		{ value: 'system', label: 'System', icon: 'monitor' }
	];

	const STORAGE_KEY = 'theme';

	function readStoredChoice(): ThemeChoice {
		if (!browser) return 'system';
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
		} catch {
			/* localStorage kann blockiert sein */
		}
		return 'system';
	}

	function prefersDark(): boolean {
		return browser && window.matchMedia('(prefers-color-scheme: dark)').matches;
	}

	let choice = $state<ThemeChoice>('system');

	/** Wendet die Wahl auf das Dokument an und aktualisiert die Statusleisten-Farbe. */
	function applyChoice(next: ThemeChoice) {
		if (!browser) return;
		const dark = next === 'dark' || (next === 'system' && prefersDark());
		const root = document.documentElement;
		root.classList.toggle('dark', dark);
		root.style.colorScheme = dark ? 'dark' : 'light';

		// Statusleisten-Farbe aus dem Token übernehmen — kein fester Farbwert.
		const meta = document.querySelector('meta[name="theme-color"]');
		const background = getComputedStyle(root).getPropertyValue('--color-base').trim();
		if (meta && background) meta.setAttribute('content', background);
	}

	function setChoice(next: ThemeChoice) {
		choice = next;
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch {
			/* Ohne Speicher bleibt die Wahl nur für diese Sitzung bestehen */
		}
		applyChoice(next);
	}

	$effect(() => {
		// Einmalige Initialisierung nach der Hydration und Nachführen der
		// Systemeinstellung, solange „System" gewählt ist.
		const initial = readStoredChoice();
		choice = initial;
		applyChoice(initial);

		const query = window.matchMedia('(prefers-color-scheme: dark)');
		const onSystemChange = () => {
			if (choice === 'system') applyChoice('system');
		};
		query.addEventListener('change', onSystemChange);
		return () => query.removeEventListener('change', onSystemChange);
	});
</script>

<div class="theme-toggle" role="group" aria-label="Farbschema">
	{#each OPTIONS as option (option.value)}
		<button
			type="button"
			class="theme-toggle__button"
			aria-pressed={choice === option.value}
			aria-label="Farbschema: {option.label}"
			title="Farbschema: {option.label}"
			onclick={() => setChoice(option.value)}
		>
			<Icon name={option.icon} size={18} />
		</button>
	{/each}
</div>

<style>
	.theme-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.125rem;
		padding: 0.125rem;
		border: 1px solid var(--color-line);
		border-radius: var(--radius-control);
		background-color: var(--color-surface);
	}

	.theme-toggle__button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: none;
		border-radius: var(--radius-sm);
		background-color: transparent;
		color: var(--color-ink-subtle);
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			color var(--transition-fast);
	}

	.theme-toggle__button:hover {
		background-color: var(--color-elevated);
		color: var(--color-ink);
	}

	.theme-toggle__button[aria-pressed='true'] {
		background-color: var(--color-brand-soft);
		color: var(--color-brand-ink);
	}
</style>
