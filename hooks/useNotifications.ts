import {supabase} from '@/services/supabase'
import {useEffect, useState} from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import {Platform} from 'react-native'

// Peremet de configurer comment les notifs s'affichent quand l'application est ouverte
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldPlaySound:  true,
    shouldSetBadge:   true,
    shouldShowBanner: true,  // ← ajoute ça
    shouldShowList:   true,  // ← ajoute ça
  }),
})

type NotificationSettings = {
  messages:     boolean
  seances:      boolean
  candidatures: boolean
}

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>({
    messages:     true,
    seances:      true,
    candidatures: true,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(function() {
    loadSettings()
    demanderPermission() 
  }, [])

  // ─── Charger les paramètres ─────────────────────────────────
  const loadSettings = async () => {
    setLoading(true)
    setError(null)

    const reponse = await supabase.auth.getUser()
    const user = reponse.data.user

    if (user === null) {
      setError('Utilisateur non connecté')
      setLoading(false)
      return false
    }

    const {data, error} = await supabase.from('notification_settings').select('messages, seances, candidatures').eq('user_id', user.id).single()

    // Si pas encore de ligne → on en crée une avec les valeurs par défaut
    if (error) {
      if (error.code === 'PGRST116') {
        await supabase .from('notification_settings').insert({ user_id: user.id })
        setLoading(false)
        return true
      }
      setError(error.message)
      setLoading(false)
      return false
    }

    if (data !== null) {
      setSettings({
        messages:     data.messages,
        seances:      data.seances,
        candidatures: data.candidatures,
      })
    }
    setLoading(false)
    return true
  }

  // ─── Modifier un champ pour les notifs ─────────────────────────────────────
  const FieldSetting = async (champ: keyof NotificationSettings) => {
    const reponse = await supabase.auth.getUser()
    const user = reponse.data.user

    if (user === null) return false

    // On inverse la valeur du champs
    const nouvelleValeur = !settings[champ]

    // Met à jour la valeur
    const nouveauxSettings = { ...settings }
    nouveauxSettings[champ] = nouvelleValeur
    setSettings(nouveauxSettings)

    // Sauvegarde dans Supabase
    const { error } = await supabase.from('notification_settings').update({[champ]: nouvelleValeur, updated_at: new Date().toISOString()}).eq('user_id', user.id)

    if (error) {
      // En cas d'erreur on remet l'ancienne valeur
      setSettings(settings)
      setError(error.message)
      return false
    }

    return true
  }

  // ─── Demander la permission + récupérer le token ────────────
  const demanderPermission = async () => {
    setError(null)

    // Les notifs push ne fonctionnent que sur un vrai device
    if (!Device.isDevice) {
      setError('Les notifications push nécessitent un vrai appareil')
      return null
    }

    // Vérifie la permission actuelle
    const {status: statutActuel} = await Notifications.getPermissionsAsync()
    let statutFinal = statutActuel

    // Demande la permission si pas encore accordée
    if (statutActuel !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      statutFinal = status
    }

    if (statutFinal !== 'granted') {
      setError('Permission de notifications refusée')
      return null
    }

    // Récupère le token push unique de l'appareil
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    })

    // Sauvegarde le token dans Supabase
    const reponse = await supabase.auth.getUser()
    const user = reponse.data.user

    if (user !== null) {
      await supabase.from('notification_settings').update({push_token: token.data}).eq('user_id', user.id)
    }

    // Android nécessite un canal de notification
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      })
    }
    return token.data
  }

  return {
    settings,
    loading,
    error,
    loadSettings,
    FieldSetting,
  }
}