import { supabase } from '@/services/supabase'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

/**
 * Enregistre le jeton push Expo de l'appareil pour l'utilisateur connecté.
 * À monter une fois près de la racine de l'app.
 */
export function usePushRegistration(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !Device.isDevice) return
    let cancelled = false

    const register = async () => {
      try {
        const existing = await Notifications.getPermissionsAsync()
        let status = existing.status
        if (status !== 'granted') {
          status = (await Notifications.requestPermissionsAsync()).status
        }
        if (status !== 'granted') return

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Général',
            importance: Notifications.AndroidImportance.DEFAULT,
          })
        }

        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
        const tokenResponse = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined,
        )
        const token = tokenResponse.data
        if (cancelled || !token) return

        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return

        await supabase.from('push_tokens').upsert(
          { user_id: userData.user.id, token, platform: Platform.OS, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,token' },
        )
      } catch {
        /* pas bloquant : l'app fonctionne sans push */
      }
    }

    register()
    return () => {
      cancelled = true
    }
  }, [enabled])
}
