/**
 * Aufbereitung der ITU-Funkdienste für die Spektrumsleiste.
 *
 * Trennt die Rechenarbeit (Filter, Geometrie, Trefferermittlung) von der
 * Darstellung, damit sie ohne DOM getestet werden kann.
 */

import {
  RADIO_SERVICES,
  RADIO_SERVICE_GROUP_LABELS,
  type AllocationStatus,
  type RadioService,
  type RadioServiceGroup,
  type ServiceAllocation
} from '$lib/data/radioServices';
import { segmentGeometry, type SegmentGeometry } from './spectrumScale.svelte';

/** Untere Grenze der Darstellung: unterhalb liegt keine Zuweisung dieses Datensatzes. */
export const SERVICE_SCALE_MIN_HZ = 9e3;

/** Obere Grenze der Darstellung. */
export const SERVICE_SCALE_MAX_HZ = 100e9;

/** Anzeigetexte der Zuweisungsstatus. */
export const ALLOCATION_STATUS_LABELS: Record<AllocationStatus, string> = {
  primaer: 'primär',
  sekundaer: 'sekundär',
  gemischt: 'primär und sekundär'
};

/** Ein Balkensegment einer Dienstzeile. */
export interface ServiceSegment extends SegmentGeometry {
  allocation: ServiceAllocation;
}

/** Eine Zeile der Spektrumsleiste. */
export interface ServiceRow {
  service: RadioService;
  groupLabel: string;
  segments: ServiceSegment[];
  /** Kleinste und größte zugewiesene Frequenz des Dienstes in Hz. */
  minHz: number;
  maxHz: number;
}

/** Alle Gruppen in fester Reihenfolge, mit Anzahl der Dienste. */
export function serviceGroups(
  services: RadioService[] = RADIO_SERVICES
): { id: RadioServiceGroup; label: string; count: number }[] {
  const order = Object.keys(RADIO_SERVICE_GROUP_LABELS) as RadioServiceGroup[];
  return order
    .map((id) => ({
      id,
      label: RADIO_SERVICE_GROUP_LABELS[id],
      count: services.filter((service) => service.group === id).length
    }))
    .filter((group) => group.count > 0);
}

/** Dienste einer Gruppe; `'alle'` liefert den unveränderten Datensatz. */
export function filterServices(
  group: RadioServiceGroup | 'alle',
  services: RadioService[] = RADIO_SERVICES
): RadioService[] {
  return group === 'alle' ? [...services] : services.filter((s) => s.group === group);
}

/** Zeilen mit fertiger Balkengeometrie, sortiert nach der tiefsten Zuweisung. */
export function buildServiceRows(
  services: RadioService[],
  minHz: number = SERVICE_SCALE_MIN_HZ,
  maxHz: number = SERVICE_SCALE_MAX_HZ
): ServiceRow[] {
  return services
    .map((service) => {
      const bounds = service.allocations.map((a) => a.minHz);
      const uppers = service.allocations.map((a) => a.maxHz);
      return {
        service,
        groupLabel: RADIO_SERVICE_GROUP_LABELS[service.group],
        segments: service.allocations.map((allocation) => ({
          allocation,
          ...segmentGeometry(allocation.minHz, allocation.maxHz, minHz, maxHz)
        })),
        minHz: Math.min(...bounds),
        maxHz: Math.max(...uppers)
      };
    })
    .sort((a, b) => a.minHz - b.minHz);
}

/** Zuweisungen eines Dienstes, die eine Frequenz enthalten. */
export function allocationsAtFrequency(
  service: RadioService,
  frequencyHz: number
): ServiceAllocation[] {
  if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) return [];
  return service.allocations.filter((a) => frequencyHz >= a.minHz && frequencyHz <= a.maxHz);
}

/** Enthält der Dienst die Frequenz in mindestens einer Zuweisung? */
export function serviceCoversFrequency(service: RadioService, frequencyHz: number): boolean {
  return allocationsAtFrequency(service, frequencyHz).length > 0;
}
