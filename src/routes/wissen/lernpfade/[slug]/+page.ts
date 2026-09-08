import { error } from '@sveltejs/kit';
import { LEARNING_PATHS, findLearningPath } from '$lib/data/learningPaths';
import { pageMeta } from '$lib/data/navigation';
import type { EntryGenerator, PageLoad } from './$types';

/** Prerender-Ziele: je Lernpfad eine statische Seite. */
export const entries: EntryGenerator = () => LEARNING_PATHS.map((path) => ({ slug: path.id }));

/**
 * Titel und Beschreibung kommen aus dem Lernpfad selbst; `pageMeta` liefert
 * die Vorgaben der übergeordneten Übersicht, damit auch dynamische Seiten
 * dieselbe Quelle nutzen.
 */
export const load: PageLoad = ({ params }) => {
  const path = findLearningPath(params.slug);
  if (!path) error(404, `Unbekannter Lernpfad: ${params.slug}`);
  return {
    ...pageMeta('/wissen/lernpfade/', {
      title: `Lernpfad: ${path.title}`,
      description: path.lead
    }),
    pathId: path.id
  };
};
