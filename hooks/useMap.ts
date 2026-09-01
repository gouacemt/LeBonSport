import { useState, useEffect } from 'react'
import * as Location from 'expo-location'
import { supabase } from '@/services/supabase'

type Annonce = {
  id:          string
  titre:       string
  sport:       string
  niveau:      string
  ville:       string
  description: string
  places:      number
  latitude:    number
  longitude:   number
  user_id:     string
}

type Region = {
  latitude:        number
  longitude:       number
  latitudeDelta:   number
  longitudeDelta:  number
}

export function useMap() {
  const [annonces, setAnnonces]         = useState<Annonce[]>([])
  const [position, setPosition]         = useState<Region | null>(null)
  const [rayon, setRayon]               = useState(10)  // km par défaut
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [annonceSelectee, setAnnonceSelectee] = useState<Annonce | null>(null)
  const [sportFiltre, setSportFiltre]   = useState<string | null>(null)

  useEffect(function() {
    demanderPermission()
  }, [])

  // ─── Demander la permission de géolocalisation ──────────────
  const demanderPermission = async () => {
    setLoading(true)
    setError(null)

    const { status } = await Location.requestForegroundPermissionsAsync()

    if (status !== 'granted') {
      setError('Permission de géolocalisation refusée')
      setLoading(false)
      return false
    }

    // Récupère la position actuelle
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    })

    const region: Region = {
      latitude:       location.coords.latitude,
      longitude:      location.coords.longitude,
      latitudeDelta:  0.05,
      longitudeDelta: 0.05,
    }

    setPosition(region)
    await chargerAnnonces(location.coords.latitude, location.coords.longitude)
    setLoading(false)
    return true
  }

  // ─── Charger les annonces dans le rayon ────────────────────
  const chargerAnnonces = async (lat: number, lng: number) => {
    setError(null)

    // Calcule les bornes du rayon en degrés
    const delta = rayon / 111  // 1 degré ≈ 111 km

    let requete = supabase
      .from('annonces')
      .select('id, titre, sport, niveau, ville, description, places, latitude, longitude, user_id')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .gte('latitude',  lat - delta)
      .lte('latitude',  lat + delta)
      .gte('longitude', lng - delta)
      .lte('longitude', lng + delta)

    // Filtre par sport si sélectionné
    if (sportFiltre !== null) {
      requete = requete.eq('sport', sportFiltre)
    }

    const { data, error } = await requete

    if (error) {
      setError(error.message)
      return false
    }

    if (data !== null) {
      setAnnonces(data)
    }

    return true
  }

  // ─── Changer le rayon de recherche ─────────────────────────
  const changerRayon = async (nouveauRayon: number) => {
    setRayon(nouveauRayon)
    if (position !== null) {
      await chargerAnnonces(position.latitude, position.longitude)
    }
  }

  // ─── Filtrer par sport ──────────────────────────────────────
  const filtrerParSport = async (sport: string | null) => {
    setSportFiltre(sport)
    if (position !== null) {
      await chargerAnnonces(position.latitude, position.longitude)
    }
  }

  return {
    annonces,
    position,
    rayon,
    loading,
    error,
    annonceSelectee,
    sportFiltre,
    setAnnonceSelectee,
    changerRayon,
    filtrerParSport,
    chargerAnnonces,
  }
}