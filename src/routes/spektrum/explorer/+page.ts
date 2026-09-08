import { redirect } from '@sveltejs/kit';

/** Der Frequenzband-Explorer ist im Spektrum-Dashboard aufgegangen. */
export function load() {
  redirect(308, '/spektrum/');
}
