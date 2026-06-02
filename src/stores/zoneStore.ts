import { create } from "zustand";

/**
 * Asignación local de zonas a dispositivos (sensores y actuadores).
 *
 * Confirmado por LibreAgro: el hub NO almacena zonas. Toda la asignación
 * vive en el celular del usuario. Estructura: `deviceId -> zonas[]`.
 *
 * La clave de asignación combina el hub y el id de dispositivo de la app
 * (`device.id`), para que sea única aun con múltiples hubs:
 *   `zoneAssignmentKey(hubHash, deviceId)` → `<hubHash>:<deviceId>`
 *   (ej. `AABBCCDDEEFF:sensor-scd30-0`, `AABBCCDDEEFF:relay-1`)
 *
 * La lista global de zonas conocidas (`knownZones`) se mantiene aparte para
 * que la UI ofrezca autocompletar / multi-select sin duplicar strings.
 */

interface ZoneState {
  readonly knownZones: readonly string[];
  readonly assignments: Readonly<Record<string, readonly string[]>>;
}

interface ZoneActions {
  readonly addZone: (zone: string) => void;
  readonly removeZone: (zone: string) => void;
  readonly setDeviceZones: (deviceId: string, zones: readonly string[]) => void;
  readonly getDeviceZones: (deviceId: string) => readonly string[];
}

function dedupe(values: readonly string[]): readonly string[] {
  return Array.from(new Set(values.map((v) => v.trim()).filter((v) => v !== "")));
}

export const useZoneStore = create<ZoneState & ZoneActions>((set, get) => ({
  knownZones: [],
  assignments: {},

  addZone: (zone) =>
    set((state) => ({
      knownZones: dedupe([...state.knownZones, zone]),
    })),

  removeZone: (zone) =>
    set((state) => {
      const trimmed = zone.trim();
      const nextAssignments: Record<string, readonly string[]> = {};
      for (const [deviceId, zones] of Object.entries(state.assignments)) {
        nextAssignments[deviceId] = zones.filter((z) => z !== trimmed);
      }
      return {
        knownZones: state.knownZones.filter((z) => z !== trimmed),
        assignments: nextAssignments,
      };
    }),

  setDeviceZones: (deviceId, zones) =>
    set((state) => {
      const normalized = dedupe(zones);
      return {
        knownZones: dedupe([...state.knownZones, ...normalized]),
        assignments: {
          ...state.assignments,
          [deviceId]: normalized,
        },
      };
    }),

  getDeviceZones: (deviceId) => get().assignments[deviceId] ?? [],
}));

/** Clave única de asignación de zonas: hub + id de dispositivo de la app. */
export function zoneAssignmentKey(hubHash: string, deviceId: string): string {
  return `${hubHash}:${deviceId}`;
}

/**
 * Une zonas asignadas localmente con las que provea el hub (fallback), sin
 * duplicar. Hoy el hub no expone zonas, pero los mocks sí; este merge permite
 * que la asignación local conviva con esos datos sin romper la demo.
 */
export function mergeDeviceZones(
  local: readonly string[],
  fallback: readonly string[]
): readonly string[] {
  return Array.from(new Set([...local, ...fallback]));
}
