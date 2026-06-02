import { DIRECT_MODE_IP } from "../constants";
import type { ConnectionMode, Hub } from "../types";

/**
 * Resuelve el "target" que se pasa a los servicios del hub según el modo de
 * conexión, siguiendo lo confirmado por LibreAgro:
 *
 * - **Directo**: la IP del hub es FIJA (`192.168.4.1`, AP del hub). No se
 *   descubre ni se persiste; siempre es la misma mientras se esté conectado
 *   directo. Por eso ignoramos `hub.ip` y usamos la constante.
 *
 * - **Online**: el acceso NO es contra la IP del hub sino contra el backend,
 *   que identifica cada hub por su `hash`. No hay descubrimiento de IP. Hasta
 *   que el backend exista, el cliente mock ignora este valor (la app sigue
 *   funcionando con datos mock).
 *
 * El valor devuelto es opaco para las pantallas: solo lo reenvían a la capa de
 * servicio. La interpretación (IP directa vs. ruteo por hash en el backend)
 * vive en el cliente HTTP correspondiente.
 */
export function resolveHubTarget(mode: ConnectionMode, hub: Hub): string {
  return mode === "directo" ? DIRECT_MODE_IP : hub.hash;
}
