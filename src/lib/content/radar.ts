/**
 * Sammelmodul des Radar-Kapitels.
 *
 * Die Inhalte liegen seit der Aufteilung in `content/radar/`:
 * `index.ts` (Kapitel-Hub), `grundlagen.ts`, `verfahren.ts` und
 * `sekundaerradar.ts`. Diese Datei bündelt sie, damit
 * (a) bestehende Importe von `$lib/content/radar` weiter funktionieren und
 * (b) `widgetLocations()` in `$lib/data/widgets.ts` — das nur
 *     `/src/lib/content/*.ts` einliest — alle vier Kapitel findet.
 */
export {
  radarHubArticle,
  radarGrundlagenArticle,
  radarVerfahrenArticle,
  radarSekundaerArticle
} from './radar/index';

export { radarHubArticle as radarArticle } from './radar/index';
