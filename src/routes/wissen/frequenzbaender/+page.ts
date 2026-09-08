import { redirect } from '@sveltejs/kit';

/** Umzug in den Datenbanken-Bereich (Rework, Phase 1). */
export function load() {
	redirect(308, '/datenbanken/frequenzbaender/');
}
