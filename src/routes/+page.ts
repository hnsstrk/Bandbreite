import { SITE_NAME, pageMeta } from '$lib/data/navigation';

/**
 * Titel und Beschreibung der Portalseite stammen — wie überall — aus der
 * Navigations-Registry (Knoten `start`). Der Titel ist der Seitenname selbst,
 * damit `Metadata.svelte` ihn nicht ein zweites Mal anhängt.
 */
export const load = () => pageMeta('/', { title: SITE_NAME });
