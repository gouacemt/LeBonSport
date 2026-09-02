/** Géométrie sur sphère — logique pure, testable. */

export type LatLng = { lat: number; lng: number }

const R_KM = 6371

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/** Distance du grand cercle (formule de haversine), en kilomètres. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** "900 m", "4,2 km", "37 km" */
export function formatDistance(km: number): string {
  if (!Number.isFinite(km) || km < 0) return ''
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`
  return `${Math.round(km)} km`
}

export function hasCoords(
  v: { lat?: number | null; lng?: number | null } | null | undefined,
): v is LatLng {
  return !!v && typeof v.lat === 'number' && typeof v.lng === 'number' && !Number.isNaN(v.lat) && !Number.isNaN(v.lng)
}

/** Distance en km entre `from` et un objet potentiellement sans coordonnées. */
export function distanceTo(from: LatLng, to: { lat?: number | null; lng?: number | null }): number | null {
  return hasCoords(to) ? haversineKm(from, to) : null
}
