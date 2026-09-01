import { supabase } from '@/services/supabase'
import * as Location from 'expo-location'
import { useEffect, useState } from 'react'

export type MapAnnonce = {
  id:          string
  titre:       string
  sport:       string
  niveau:      string | null
  ville:       string
  description: string
  places:      number | null
  user_id:     string | null
  latitude:    number | null
  longitude:   number | null
}

export type Region = {
  latitude:        number
  longitude:       number
  latitudeDelta:   number
  longitudeDelta:  number
}

// Repli quand la géolocalisation est indisponible / refusée (centre France, Lyon).
const DEFAULT_REGION: Region = {
  latitude: 45.7640,
  longitude: 4.8357,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
}

export function useMap() {
  const [annonces, setAnnonces]               = useState<MapAnnonce[]>([])
  const [position, setPosition]               = useState<Region>(DEFAULT_REGION)
  const [rayon, setRayon]                      = useState(10)
  const [loading, setLoading]                  = useState(true)
  const [error, setError]                      = useState<string | null>(null)
  const [locationDenied, setLocationDenied]    = useState(false)
  const [annonceSelectee, setAnnonceSelectee]  = useState<MapAnnonce | null>(null)
  const [sportFiltre, setSportFiltre]          = useState<string | null>(null)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    setLoading(true)
    setError(null)

    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        setPosition({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        })
      } else {
        setLocationDenied(true)
      }
    } catch {
      // permission refusée, timeout, navigateur sans géoloc… on garde le repli
      setLocationDenied(true)
    }

    await chargerAnnonces(sportFiltre)
    setLoading(false)
  }

  // Les annonces n'ont pas (encore) de coordonnées : on charge les plus récentes
  // et on les affiche en liste. Les marqueurs ne sont posés que si une annonce
  // possède réellement latitude/longitude.
  const chargerAnnonces = async (sport: string | null) => {
    setError(null)

    let req = supabase
      .from('annonces')
      .select('id, titre, sport, niveau, ville, description, places, user_id, latitude, longitude')
      .order('created_at', { ascending: false })
      .limit(60)

    if (sport) req = req.eq('sport', sport)

    const { data, error: reqError } = await req
    if (reqError) {
      setError(reqError.message)
      return
    }
    setAnnonces((data ?? []) as MapAnnonce[])
  }

  const changerRayon = async (nouveauRayon: number) => {
    setRayon(nouveauRayon)
  }

  const filtrerParSport = async (sport: string | null) => {
    setSportFiltre(sport)
    await chargerAnnonces(sport)
  }

  const retry = async () => {
    setLocationDenied(false)
    await init()
  }

  return {
    annonces,
    position,
    rayon,
    loading,
    error,
    locationDenied,
    annonceSelectee,
    sportFiltre,
    setAnnonceSelectee,
    changerRayon,
    filtrerParSport,
    retry,
  }
}
