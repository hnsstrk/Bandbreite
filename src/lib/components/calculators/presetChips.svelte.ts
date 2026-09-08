/**
 * Gemeinsames Modell für Preset-Chips aller Rechner.
 *
 * Der Aktiv-Zustand hängt an einer **ID**, nicht am Zahlenwert: sonst leuchten
 * zwei Chips mit gleichem Wert (etwa „PKW" und „Verkehrsflugzeug" mit je
 * 100 m² Radarquerschnitt) gleichzeitig auf.
 */

/** Ein Chip mit stabiler Kennung. */
export interface PresetChip {
  id: string;
  label: string;
  /** Wert in der Basiseinheit des zugehörigen Feldes */
  value: number;
  hint?: string;
}

/**
 * Bestimmt den aktiven Chip.
 * Mit gemerkter ID gewinnt diese, sofern ihr Wert noch stimmt; sonst ist genau
 * der erste passende Chip aktiv — nie zwei gleichzeitig.
 */
export function activePresetId(
  presets: PresetChip[],
  value: number,
  chosenId: string | null
): string | null {
  if (chosenId) {
    const chosen = presets.find((preset) => preset.id === chosenId);
    if (chosen && chosen.value === value) return chosen.id;
  }
  return presets.find((preset) => preset.value === value)?.id ?? null;
}
