/**
 * Kennung des gerade gerenderten Widgets für seinen Rahmen.
 *
 * `ArticleBlock` weiß, welche Widget-ID ein Block trägt; `WidgetFrame` sitzt
 * darin, kennt sie aber nicht. Statt jede Widget-Komponente um eine
 * durchgereichte Eigenschaft zu erweitern, stellt der Block die ID über den
 * Svelte-Kontext bereit. Widgets außerhalb eines Kapitels (etwa auf einer
 * Rechnerseite) bekommen `undefined` — dort gibt es keinen Deep-Link.
 */
import { getContext, hasContext, setContext } from 'svelte';

const WIDGET_ID_KEY = Symbol.for('bandbreite:widget-id');

/** Während der Initialisierung eines Blocks setzen. */
export function setWidgetId(id: string): void {
  setContext(WIDGET_ID_KEY, id);
}

/** ID des umgebenden Widget-Blocks, sofern vorhanden. */
export function getWidgetId(): string | undefined {
  return hasContext(WIDGET_ID_KEY) ? getContext<string>(WIDGET_ID_KEY) : undefined;
}
