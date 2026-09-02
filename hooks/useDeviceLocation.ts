import * as Location from 'expo-location'
import { useState } from 'react'
import type { LatLng } from '@/utils/geo'

/** Position GPS de l'appareil, à la demande (permission + éventuel reverse-geocode). */
export function useDeviceLocation() {
  const [coords, setCoords] = useState<LatLng | null>(null)
  const [city, setCity] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const request = async (): Promise<{ coords: LatLng; city: string | null } | null> => {
    setLoading(true)
    setError(null)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setError("L'accès à la localisation a été refusé.")
        return null
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      const next = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      setCoords(next)

      let resolvedCity: string | null = null
      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude: next.lat, longitude: next.lng })
        resolvedCity = place?.city ?? place?.subregion ?? null
        if (resolvedCity) setCity(resolvedCity)
      } catch {
        /* reverse-geocode indisponible : on garde juste les coordonnées */
      }

      return { coords: next, city: resolvedCity }
    } catch (e: any) {
      setError(e?.message ?? 'Localisation indisponible')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { coords, city, loading, error, request }
}
