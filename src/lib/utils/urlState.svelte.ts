/**
 * Rechnerzustand in der Adresszeile.
 *
 * Ziel: jedes Ergebnis ist verlinkbar. Die Eingaben eines Rechners werden als
 * Suchparameter geschrieben (`?f=2.4e9&d=1000`), beim Laden zurückgelesen und
 * bei Änderungen entprellt per `replaceState` aktualisiert — ohne neuen
 * Verlaufseintrag und ohne Navigation.
 *
 * Die reine Logik (Lesen, Schreiben, Serialisieren) ist DOM-frei und in
 * `src/tests/urlState.test.ts` getestet; nur {@link UrlStateSync} und
 * {@link buildShareLink} berühren Browser-APIs und sind SSR-sicher gekapselt.
 */

import { browser } from '$app/environment';
import { clamp } from '$lib/utils/handlers';

/** Entprellzeit in Millisekunden, bevor die Adresszeile nachgeführt wird. */
export const URL_SYNC_DELAY_MS = 250;

/** Ab dieser Länge lohnt sich die Exponentialschreibweise einer Zahl. */
const PLAIN_NUMBER_MAX_LENGTH = 6;

/** Zulässige Werttypen eines Suchparameters. */
export type ParamValue = number | string | boolean;

/** Beschreibung eines einzelnen Suchparameters. */
export interface ParamSpec<T extends ParamValue = ParamValue> {
	/** Standardwert. Gleiche Werte landen nicht in der URL. */
	default: T;
	/** Untergrenze (nur Zahlen) */
	min?: number;
	/** Obergrenze (nur Zahlen) */
	max?: number;
	/** Erlaubte Werte (nur Zeichenketten); alles andere fällt auf `default` zurück */
	options?: readonly string[];
}

/** Abbildung Parametername → Beschreibung. */
export type ParamSpecs = Record<string, ParamSpec>;

/**
 * Weitet Literaltypen auf ihren Basistyp — `default: true` beschreibt einen
 * Wahrheitswert, nicht ausschließlich `true`.
 */
type Widen<T> = T extends boolean
	? boolean
	: T extends number
		? number
		: T extends string
			? string
			: T;

/** Aus den Beschreibungen abgeleitetes Wertobjekt. */
export type ParamValues<S extends ParamSpecs> = {
	[K in keyof S]: Widen<S[K]['default']>;
};

/**
 * Serialisiert eine Zahl möglichst kurz.
 * Große und sehr kleine Beträge werden exponentiell geschrieben (`2.4e9`),
 * alltägliche Werte bleiben lesbar (`1000`).
 */
export function serializeNumber(value: number): string {
	if (!Number.isFinite(value)) return '';
	if (value === 0) return '0';

	const plain = String(value);
	if (plain.length <= PLAIN_NUMBER_MAX_LENGTH) return plain;

	const exponential = value.toExponential().replace('e+', 'e');
	return exponential.length < plain.length ? exponential : plain;
}

/** Serialisiert einen beliebigen Parameterwert. */
export function serializeParam(value: ParamValue): string {
	if (typeof value === 'number') return serializeNumber(value);
	if (typeof value === 'boolean') return value ? '1' : '0';
	return value;
}

/**
 * Liest einen einzelnen Parameter. Ungültige Eingaben liefern den Standardwert,
 * Zahlen werden auf `min`/`max` begrenzt.
 */
export function parseParam<T extends ParamValue>(raw: string | null, spec: ParamSpec<T>): T {
	if (raw === null || raw === '') return spec.default;

	if (typeof spec.default === 'number') {
		const value = Number(raw);
		if (!Number.isFinite(value)) return spec.default;
		const min = spec.min ?? -Infinity;
		const max = spec.max ?? Infinity;
		return clamp(value, min, max) as T;
	}

	if (typeof spec.default === 'boolean') {
		if (raw === '1' || raw === 'true') return true as T;
		if (raw === '0' || raw === 'false') return false as T;
		return spec.default;
	}

	if (spec.options && !spec.options.includes(raw)) return spec.default;
	return raw as T;
}

/** Nimmt eine `URLSearchParams`, einen Query-String oder eine URL entgegen. */
function toSearchParams(source: URLSearchParams | URL | string): URLSearchParams {
	if (source instanceof URLSearchParams) return source;
	if (typeof source !== 'string') return source.searchParams;
	const query = source.includes('?') ? source.slice(source.indexOf('?')) : source;
	return new URLSearchParams(query);
}

/**
 * Liest alle beschriebenen Parameter aus einer Quelle.
 * Fehlende oder ungültige Werte werden durch die Standardwerte ersetzt.
 */
export function readParams<S extends ParamSpecs>(
	source: URLSearchParams | URL | string,
	specs: S
): ParamValues<S> {
	const params = toSearchParams(source);
	const values = {} as ParamValues<S>;
	for (const key of Object.keys(specs)) {
		values[key as keyof S] = parseParam(params.get(key), specs[key]) as ParamValues<S>[keyof S];
	}
	return values;
}

/**
 * Baut den Query-String aus den Werten. Werte, die dem Standard entsprechen,
 * werden weggelassen — geteilte Links bleiben dadurch kurz und lesbar.
 * Die Reihenfolge folgt der Reihenfolge in `specs` und ist damit stabil.
 */
export function buildSearch<S extends ParamSpecs>(
	values: Partial<ParamValues<S>>,
	specs: S
): string {
	const parts: string[] = [];
	for (const key of Object.keys(specs)) {
		const value = values[key as keyof S];
		if (value === undefined || value === null) continue;
		if (value === specs[key].default) continue;
		const serialized = serializeParam(value as ParamValue);
		if (serialized === '') continue;
		parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(serialized)}`);
	}
	return parts.join('&');
}

/** Setzt Pfad und Query zu einem teilbaren Ziel zusammen. */
export function buildUrl<S extends ParamSpecs>(
	pathname: string,
	values: Partial<ParamValues<S>>,
	specs: S
): string {
	const search = buildSearch(values, specs);
	return search ? `${pathname}?${search}` : pathname;
}

/** Prüft, ob die Werte vom Standard abweichen (steuert „Zurücksetzen"). */
export function hasNonDefaults<S extends ParamSpecs>(
	values: Partial<ParamValues<S>>,
	specs: S
): boolean {
	return buildSearch(values, specs).length > 0;
}

/** Liefert alle Standardwerte als Wertobjekt. */
export function defaultValues<S extends ParamSpecs>(specs: S): ParamValues<S> {
	const values = {} as ParamValues<S>;
	for (const key of Object.keys(specs)) {
		values[key as keyof S] = specs[key].default as ParamValues<S>[keyof S];
	}
	return values;
}

/**
 * Führt die Adresszeile entprellt nach.
 *
 * Serverseitig ist jede Methode ein No-Op. Im Browser wird bevorzugt
 * `replaceState` aus `$app/navigation` verwendet; ist der Router noch nicht
 * bereit, greift `history.replaceState` als Rückfallebene.
 */
export class UrlStateSync<S extends ParamSpecs> {
	#specs: S;
	#delay: number;
	#timer: ReturnType<typeof setTimeout> | undefined;
	#lastSearch: string | null = null;

	constructor(specs: S, delay: number = URL_SYNC_DELAY_MS) {
		this.#specs = specs;
		this.#delay = delay;
	}

	/** Der aktuell geschriebene Query-String (für Tests und „Link kopieren"). */
	get search(): string | null {
		return this.#lastSearch;
	}

	/** Plant das Nachführen der Adresszeile. Mehrfachaufrufe werden entprellt. */
	push(values: Partial<ParamValues<S>>): void {
		if (!browser) return;
		const search = buildSearch(values, this.#specs);
		if (search === this.#lastSearch) return;
		this.#lastSearch = search;

		if (this.#timer !== undefined) clearTimeout(this.#timer);
		this.#timer = setTimeout(() => {
			this.#timer = undefined;
			void applySearch(search);
		}, this.#delay);
	}

	/** Bricht eine geplante Aktualisierung ab (Aufräumen im `$effect`). */
	cancel(): void {
		if (this.#timer !== undefined) {
			clearTimeout(this.#timer);
			this.#timer = undefined;
		}
	}
}

/** Schreibt den Query-String ohne neuen Verlaufseintrag. */
async function applySearch(search: string): Promise<void> {
	if (!browser) return;
	const target = `${window.location.pathname}${search ? `?${search}` : ''}`;
	try {
		const { replaceState } = await import('$app/navigation');
		replaceState(target, {});
	} catch {
		// Router noch nicht bereit — direkte Rückfallebene.
		window.history.replaceState(window.history.state, '', target);
	}
}

/**
 * Baut den teilbaren Link zur aktuellen Seite.
 * Im Browser absolut, serverseitig relativ (dort gibt es keinen Ursprung).
 */
export function buildShareLink<S extends ParamSpecs>(
	pathname: string,
	values: Partial<ParamValues<S>>,
	specs: S
): string {
	const relative = buildUrl(pathname, values, specs);
	if (!browser) return relative;
	return new URL(relative, window.location.origin).toString();
}

/**
 * Kopiert einen Text in die Zwischenablage.
 * Liefert `false`, wenn die Zwischenablage nicht verfügbar ist.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	if (!browser || !navigator.clipboard) return false;
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
}
