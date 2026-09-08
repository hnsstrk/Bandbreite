import { redirect } from '@sveltejs/kit';

/** Das Kapitel steht jetzt unter Wissen › Wellenausbreitung. */
export function load() {
  redirect(308, '/wissen/wellenausbreitung/ionosphaere/');
}
