/**
 * Rechenkern der Modulations-Widgets.
 *
 * Die Datei enthält ausschließlich reine Funktionen ohne Zustand und ohne
 * DOM-Bezug, damit sie in Vitest geprüft werden können. Die Widgets rufen
 * sie in `$derived`-Ausdrücken auf.
 *
 * Quellen der Formeln:
 * - Carson-Regel und Modulationsindex: ITU-R SM.328
 * - Besselreihe des frequenzmodulierten Signals: Abramowitz/Stegun 9.1.10
 * - Gray-Codierung und Symbolabbildung: ITU-T V.29 sowie 3GPP TS 36.211
 */

import { safeDivide, safeLog } from './handlers';
import { carsonBandwidthHz, fmModulationIndex } from '$lib/data/modulation';

// ============================================================================
// Konstanten
// ============================================================================

/** Vollkreis im Bogenmaß. */
export const TWO_PI = 2 * Math.PI;

/** Grenzwert, unterhalb dessen eine Amplitude als Null gilt. */
export const AMPLITUDE_EPSILON = 1e-6;

/** Höchster Modulationsindex, für den die Besselreihe noch ausgewertet wird. */
export const BESSEL_MAX_INDEX = 20;

/** Höchste Ordnung der ausgewerteten Seitenbandpaare. */
export const BESSEL_MAX_ORDER = 24;

/** Zahl der Reihenglieder der Besselnäherung. */
const BESSEL_TERMS = 40;

/** Amplitudenschwelle, ab der eine Spektrallinie gezeichnet wird. */
export const SPECTRUM_LINE_THRESHOLD = 0.01;

/** Zahl der berücksichtigten ungeraden Harmonischen bei Rechteck-Nachrichten. */
export const SQUARE_HARMONICS = 5;

/** Kleinster darstellbarer Pegel eines Spektrums in dB. */
export const SPECTRUM_FLOOR_DB = -40;

// ============================================================================
// Zeitbereich
// ============================================================================

/** Von den Widgets unterstützte Modulationsarten. */
export type ModulationKind = 'am' | 'fm' | 'pm' | 'ask' | 'fsk' | 'bpsk';

export interface WaveformParams {
  /** Trägerfrequenz in Hertz */
  carrierHz: number;
  /** Nachrichtenfrequenz (analog) bzw. Symbolrate (digital) in Hertz */
  messageHz: number;
  /** Modulationsgrad m der Amplitudenmodulation (0 … 1,5) */
  amDepth: number;
  /** Frequenzhub Δf in Hertz für FM und FSK */
  deviationHz: number;
  /** Phasenhub Δφ im Bogenmaß für PM */
  phaseDeviationRad: number;
}

export interface Waveform {
  /** Zeitpunkte in Sekunden */
  time: number[];
  /** Nachrichtensignal, auf −1 … 1 normiert */
  message: number[];
  /** Unmodulierter Träger, auf −1 … 1 normiert */
  carrier: number[];
  /** Moduliertes Signal, auf −1 … 1 normiert */
  modulated: number[];
}

/** Gibt an, ob eine Modulationsart ein digitales Nachrichtensignal verwendet. */
export function isDigitalKind(kind: ModulationKind): boolean {
  return kind === 'ask' || kind === 'fsk' || kind === 'bpsk';
}

/**
 * Nachrichtensignal zum Zeitpunkt t.
 *
 * Analoge Verfahren nutzen einen Sinus, digitale eine Rechteckfolge mit den
 * Pegeln −1 und +1 (NRZ). Ein Symbol dauert 1 / messageHz.
 */
export function messageSample(kind: ModulationKind, timeS: number, params: WaveformParams): number {
  if (isDigitalKind(kind)) {
    const phase = timeS * params.messageHz;
    return Math.floor(phase) % 2 === 0 ? 1 : -1;
  }
  return Math.sin(TWO_PI * params.messageHz * timeS);
}

/**
 * Integral der Nachricht ∫₀ᵗ m(τ) dτ in Sekunden.
 *
 * Es bestimmt die Phase der frequenzmodulierten Verfahren:
 * φ(t) = 2π·(f_c·t + Δf·∫m). Weil das Integral geschlossen vorliegt, ist die
 * Phase auch dann stetig, wenn die Laufanimation das Fenster verschiebt —
 * eine Integration ab dem Fensteranfang würde bei jedem Bild anders beginnen.
 *
 * Analog (Sinus): ∫₀ᵗ sin(ωτ)dτ = (1 − cos(ωt)) / ω.
 * Digital (NRZ ±1, Symboldauer T): vollständige Symbolpaare heben sich auf,
 * es bleiben das angebrochene Symbol und ein halbes Paar.
 */
export function messageIntegral(
  kind: ModulationKind,
  timeS: number,
  params: WaveformParams
): number {
  if (!Number.isFinite(timeS) || params.messageHz <= 0) return 0;

  if (isDigitalKind(kind)) {
    const symbolS = safeDivide(1, params.messageHz, 0);
    if (symbolS <= 0) return 0;
    const completed = Math.floor(safeDivide(timeS, symbolS, 0));
    const rest = timeS - completed * symbolS;
    // Symbol k trägt +1 für gerades k, sonst −1.
    const sign = completed % 2 === 0 ? 1 : -1;
    return (Math.abs(completed % 2) === 1 ? symbolS : 0) + sign * rest;
  }

  const omega = TWO_PI * params.messageHz;
  return safeDivide(1 - Math.cos(omega * timeS), omega, 0);
}

/**
 * Erzeugt die drei Spuren des Zeitbereichs.
 *
 * Für FM und FSK folgt die Phase der geschlossenen Form
 * φ(t) = 2π·(f_c·t + Δf·∫₀ᵗ m), damit sie über Framegrenzen hinweg stetig
 * bleibt; alle übrigen Verfahren nutzen ohnehin die geschlossene Form.
 *
 * @param kind Modulationsart
 * @param params Signalparameter
 * @param sampleCount Zahl der Stützstellen (mindestens 2)
 * @param durationS Dargestellte Zeitspanne in Sekunden
 * @param startS Beginn des dargestellten Zeitfensters in Sekunden; wird für
 *   die Laufanimation verwendet
 */
export function generateWaveform(
  kind: ModulationKind,
  params: WaveformParams,
  sampleCount: number,
  durationS: number,
  startS: number = 0
): Waveform {
  const count = Math.max(2, Math.floor(sampleCount));
  const time: number[] = new Array(count);
  const message: number[] = new Array(count);
  const carrier: number[] = new Array(count);
  const modulated: number[] = new Array(count);

  const dt = safeDivide(durationS, count - 1, 0);

  for (let index = 0; index < count; index += 1) {
    const t = startS + index * dt;
    const msg = messageSample(kind, t, params);
    time[index] = t;
    message[index] = msg;
    carrier[index] = Math.sin(TWO_PI * params.carrierHz * t);

    switch (kind) {
      case 'am':
        modulated[index] = amEnvelope(params.amDepth, msg) * carrier[index];
        break;
      case 'pm':
        modulated[index] = Math.sin(TWO_PI * params.carrierHz * t + params.phaseDeviationRad * msg);
        break;
      case 'ask':
        modulated[index] = msg > 0 ? carrier[index] : 0;
        break;
      case 'bpsk':
        modulated[index] = msg * carrier[index];
        break;
      case 'fm':
      case 'fsk':
      default: {
        // Absolute Phase statt Aufsummierung: kein Versatz zum Träger und
        // stetig, egal wo das Fenster beginnt.
        const phase =
          TWO_PI * (params.carrierHz * t + params.deviationHz * messageIntegral(kind, t, params));
        modulated[index] = Math.sin(phase);
        break;
      }
    }
  }

  return { time, message, carrier, modulated };
}

/**
 * Hüllkurve der Amplitudenmodulation, 1 + m · s(t).
 * Werte kleiner als null bedeuten Übermodulation.
 */
export function amEnvelope(depth: number, messageValue: number): number {
  return 1 + depth * messageValue;
}

/** Übermodulation liegt ab einem Modulationsgrad über 1 vor. */
export function isOvermodulated(depth: number): boolean {
  return depth > 1;
}

/**
 * Wirkungsgrad der Amplitudenmodulation: Anteil der Sendeleistung, der in den
 * Seitenbändern und damit in der Information steckt.
 *
 * η = m² / (2 + m²)
 */
export function amSidebandPowerRatio(depth: number): number {
  const m2 = depth * depth;
  return safeDivide(m2, 2 + m2, 0);
}

// ============================================================================
// Besselfunktionen und Spektren
// ============================================================================

/**
 * Besselfunktion erster Gattung, Ordnung n, über die Potenzreihe.
 *
 * Für Argumente über {@link BESSEL_MAX_INDEX} liefert die Reihe wegen
 * Auslöschung keine brauchbaren Werte mehr; dort ist die Carson-Bandbreite
 * die passende Darstellung.
 *
 * @param order Ordnung n (n ≥ 0)
 * @param argument Argument x
 */
export function besselJ(order: number, argument: number): number {
  const n = Math.abs(Math.round(order));
  const x = argument;
  if (x === 0) return n === 0 ? 1 : 0;

  const half = x / 2;
  let factorial = 1;
  for (let k = 2; k <= n; k += 1) factorial *= k;

  let term = Math.pow(half, n) / factorial;
  let sum = term;
  for (let k = 0; k < BESSEL_TERMS; k += 1) {
    term = (-term * half * half) / ((k + 1) * (n + k + 1));
    sum += term;
    if (Math.abs(term) < 1e-15) break;
  }
  // J_-n(x) = (-1)^n J_n(x); die Widgets werten nur Beträge aus.
  return sum;
}

export interface SpectrumLine {
  /** Ablage von der Trägerfrequenz in Hertz */
  offsetHz: number;
  /** Amplitude, bezogen auf den unmodulierten Träger */
  amplitude: number;
  /** Beschriftung der Linie */
  label: string;
}

/**
 * Vereinfachtes Linienspektrum des modulierten Signals.
 *
 * AM und ASK behalten den Träger, DSB-artige Verfahren (BPSK) nicht.
 * Für FM und PM liefert die Besselreihe die Seitenbandpaare; FSK wird als
 * Paar zweier Träger im Abstand des Hubs dargestellt.
 */
export function spectrumLines(kind: ModulationKind, params: WaveformParams): SpectrumLine[] {
  const fm = params.messageHz;
  switch (kind) {
    case 'am': {
      const side = params.amDepth / 2;
      return [
        { offsetHz: -fm, amplitude: side, label: 'unteres Seitenband' },
        { offsetHz: 0, amplitude: 1, label: 'Träger' },
        { offsetHz: fm, amplitude: side, label: 'oberes Seitenband' }
      ];
    }
    case 'ask': {
      // Unipolares NRZ (0/1, Tastverhältnis 50 %): ½ + Σ 2/(πn)·sin(nωt) für
      // die Nachricht, nach der Mischung also 1/(πn) je Seitenlinie — halb so
      // viel wie bei BPSK mit seinem bipolaren Signal.
      const lines: SpectrumLine[] = [{ offsetHz: 0, amplitude: 0.5, label: 'Träger' }];
      for (let n = 1; n <= SQUARE_HARMONICS * 2; n += 2) {
        const amplitude = Math.abs(safeDivide(1, Math.PI * n, 0));
        lines.push({ offsetHz: -n * fm, amplitude, label: `${n}. Seitenlinie unten` });
        lines.push({ offsetHz: n * fm, amplitude, label: `${n}. Seitenlinie oben` });
      }
      return lines.sort((a, b) => a.offsetHz - b.offsetHz);
    }
    case 'bpsk': {
      const lines: SpectrumLine[] = [];
      for (let n = 1; n <= SQUARE_HARMONICS * 2; n += 2) {
        const amplitude = Math.abs(safeDivide(2, Math.PI * n, 0));
        lines.push({ offsetHz: -n * fm, amplitude, label: `${n}. Seitenlinie unten` });
        lines.push({ offsetHz: n * fm, amplitude, label: `${n}. Seitenlinie oben` });
      }
      return lines.sort((a, b) => a.offsetHz - b.offsetHz);
    }
    case 'fsk':
      return [
        { offsetHz: -params.deviationHz, amplitude: 0.7, label: 'Space-Frequenz' },
        { offsetHz: params.deviationHz, amplitude: 0.7, label: 'Mark-Frequenz' }
      ];
    case 'fm':
    case 'pm':
    default: {
      const beta =
        kind === 'pm' ? params.phaseDeviationRad : fmModulationIndex(params.deviationHz, fm);
      const limited = Math.min(beta, BESSEL_MAX_INDEX);
      const lines: SpectrumLine[] = [
        { offsetHz: 0, amplitude: Math.abs(besselJ(0, limited)), label: 'Träger' }
      ];
      for (let n = 1; n <= BESSEL_MAX_ORDER; n += 1) {
        const amplitude = Math.abs(besselJ(n, limited));
        if (amplitude < SPECTRUM_LINE_THRESHOLD) continue;
        lines.push({ offsetHz: -n * fm, amplitude, label: `Seitenband −${n}` });
        lines.push({ offsetHz: n * fm, amplitude, label: `Seitenband +${n}` });
      }
      return lines.sort((a, b) => a.offsetHz - b.offsetHz);
    }
  }
}

/**
 * Belegte Bandbreite des Signals in Hertz.
 *
 * AM, ASK und BPSK belegen die doppelte Nachrichten- bzw. Symbolrate,
 * FM, PM und FSK folgen der Carson-Regel B = 2 · (Δf + f_max).
 */
export function occupiedBandwidthHz(kind: ModulationKind, params: WaveformParams): number {
  switch (kind) {
    case 'am':
    case 'ask':
    case 'bpsk':
      return 2 * params.messageHz;
    case 'pm':
      return carsonBandwidthHz(params.phaseDeviationRad * params.messageHz, params.messageHz);
    case 'fm':
    case 'fsk':
    default:
      return carsonBandwidthHz(params.deviationHz, params.messageHz);
  }
}

/** Wandelt eine auf 1 bezogene Amplitude in einen Pegel in dB um. */
export function amplitudeToDb(amplitude: number, floorDb: number = SPECTRUM_FLOOR_DB): number {
  if (amplitude <= AMPLITUDE_EPSILON) return floorDb;
  return Math.max(floorDb, 20 * safeLog(amplitude, 10, floorDb / 20));
}

// ============================================================================
// Konstellationen
// ============================================================================

/** Von {@link constellationPoints} unterstützte Verfahren. */
export type ConstellationScheme = 'bpsk' | 'qpsk' | 'psk8' | 'qam16' | 'qam64';

export interface ConstellationPoint {
  /** Symbolnummer vor der Gray-Codierung */
  index: number;
  /** Inphase-Komponente, mittlere Symbolleistung auf 1 normiert */
  i: number;
  /** Quadratur-Komponente */
  q: number;
  /** Bitmuster in Gray-Codierung */
  bits: string;
}

/** Zahl der Symbolzustände eines Verfahrens. */
export const SCHEME_STATES: Record<ConstellationScheme, number> = {
  bpsk: 2,
  qpsk: 4,
  psk8: 8,
  qam16: 16,
  qam64: 64
};

/** Gray-Codierung einer Zahl: g = i XOR (i >> 1). */
export function grayEncode(value: number): number {
  return value ^ (value >> 1);
}

/** Binärdarstellung fester Länge, führende Nullen inklusive. */
export function toBitString(value: number, length: number): string {
  return value.toString(2).padStart(length, '0');
}

/** Bit je Symbol des Verfahrens: k = log2(M). */
export function schemeBitsPerSymbol(scheme: ConstellationScheme): number {
  return Math.round(safeLog(SCHEME_STATES[scheme], 2, 0));
}

/**
 * Punkte des Konstellationsdiagramms mit Gray-codierten Bitmustern.
 *
 * PSK-Verfahren liegen auf dem Einheitskreis, QAM auf einem quadratischen
 * Raster. Beide werden auf die mittlere Symbolleistung 1 normiert, damit der
 * Rausch-Regler für alle Verfahren dieselbe Bedeutung hat.
 */
export function constellationPoints(scheme: ConstellationScheme): ConstellationPoint[] {
  const states = SCHEME_STATES[scheme];
  const bits = schemeBitsPerSymbol(scheme);
  const isQam = scheme === 'qam16' || scheme === 'qam64';

  if (!isQam) {
    const points: ConstellationPoint[] = [];
    for (let index = 0; index < states; index += 1) {
      const angle = safeDivide(TWO_PI * index, states, 0);
      points.push({
        index,
        i: Math.cos(angle),
        q: Math.sin(angle),
        bits: toBitString(grayEncode(index), bits)
      });
    }
    return points;
  }

  const levels = Math.round(Math.sqrt(states));
  const halfBits = bits / 2;
  // Mittlere Leistung eines quadratischen Rasters mit den Pegeln ±1, ±3, …
  const meanPower = (2 * (states - 1)) / 3;
  const scale = safeDivide(1, Math.sqrt(meanPower), 1);
  const points: ConstellationPoint[] = [];

  for (let qIndex = 0; qIndex < levels; qIndex += 1) {
    for (let iIndex = 0; iIndex < levels; iIndex += 1) {
      const index = qIndex * levels + iIndex;
      points.push({
        index,
        i: (2 * iIndex - (levels - 1)) * scale,
        q: ((levels - 1) - 2 * qIndex) * scale,
        bits:
          toBitString(grayEncode(iIndex), halfBits) + toBitString(grayEncode(qIndex), halfBits)
      });
    }
  }
  return points;
}

/**
 * Deterministischer Pseudozufallsgenerator (mulberry32).
 * Gleicher Startwert ergibt immer dieselbe Folge — Voraussetzung für Tests
 * und für ein ruhiges Bild beim erneuten Zeichnen.
 */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Normalverteilte Zufallszahl nach Box-Muller aus zwei Gleichverteilten. */
export function gaussianFrom(random: () => number): number {
  const u1 = Math.max(random(), Number.EPSILON);
  const u2 = random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(TWO_PI * u2);
}

/**
 * Standardabweichung je Quadraturkomponente bei gegebenem Störabstand.
 * Bei mittlerer Symbolleistung 1 gilt σ = sqrt(1 / (2 · SNR_linear)).
 */
export function noiseSigmaFromSnrDb(snrDb: number): number {
  const linear = Math.pow(10, snrDb / 10);
  return Math.sqrt(safeDivide(1, 2 * linear, 0));
}

export interface NoisySample {
  i: number;
  q: number;
  /** Symbolnummer des ungestörten Punktes */
  index: number;
}

/**
 * Streut jeden Konstellationspunkt mit additivem weißem Rauschen.
 *
 * @param points Ideale Konstellation
 * @param snrDb Störabstand in dB
 * @param seed Startwert des Pseudozufalls
 * @param samplesPerPoint Zahl der Empfangspunkte je Symbol
 */
export function noisyConstellation(
  points: ConstellationPoint[],
  snrDb: number,
  seed: number,
  samplesPerPoint: number
): NoisySample[] {
  const random = mulberry32(seed);
  const sigma = noiseSigmaFromSnrDb(snrDb);
  const samples: NoisySample[] = [];
  for (const point of points) {
    for (let n = 0; n < samplesPerPoint; n += 1) {
      samples.push({
        i: point.i + sigma * gaussianFrom(random),
        q: point.q + sigma * gaussianFrom(random),
        index: point.index
      });
    }
  }
  return samples;
}

/** Symbolrate aus Bitrate und Bit je Symbol. */
export function symbolRateFromBitRate(bitRate: number, bitsPerSymbol: number): number {
  return safeDivide(bitRate, bitsPerSymbol, 0);
}

/**
 * Ideale spektrale Effizienz eines Verfahrens in Bit/s/Hz.
 * Entspricht bei Nyquist-Formung genau den Bit je Symbol.
 */
export function idealSpectralEfficiency(scheme: ConstellationScheme): number {
  return schemeBitsPerSymbol(scheme);
}

/**
 * Grober Richtwert des benötigten Störabstands für eine Symbolfehlerrate von
 * etwa 10⁻⁵: je Verdopplung der Zustandszahl rund 3 dB, je Verdopplung der
 * Bit je Symbol rund 6 dB.
 */
export function requiredSnrDb(scheme: ConstellationScheme): number {
  const REFERENCE_SNR_DB = 9.6;
  const DB_PER_BIT = 3;
  return REFERENCE_SNR_DB + DB_PER_BIT * (schemeBitsPerSymbol(scheme) - 1);
}

export { carsonBandwidthHz, fmModulationIndex };
