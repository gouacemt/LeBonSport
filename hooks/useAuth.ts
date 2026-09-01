import * as AppleAuthentication from 'expo-apple-authentication'
import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import { supabase } from '@/services/supabase'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  /*GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  })*/

  const signUp = async (email: string, password: string, type?: 'sportif' | 'coach' | 'club') => {
    setLoading(true)
    setError(null)

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Adresse email invalide')
      setLoading(false)
      return false
    }

    // Validation mot de passe
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return false
    }

    const { error, data } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }
    if (data.user) {
    await supabase
      .from('profiles')
      .upsert({
        id:          data.user.id,
        is_sportif:  type === 'sportif',
        is_coach:    type === 'coach',
        is_club:     type === 'club',
      })

    await supabase
      .from('notification_settings')
      .upsert({ user_id: data.user.id })
    }
    setLoading(false)
    return true
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }
    setLoading(false)
    return true
  }

  const signIn_Apple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })
      // Sign in via Supabase Auth.
      if (credential.identityToken) {
        const {error,data: { user },} = await supabase.auth.signInWithIdToken({provider: 'apple',token: credential.identityToken,})
        if (error) {
          setError(error.message)
          return false
        }
      }
      if (credential.fullName) {
        // Apple only provides the user's full name on the first sign-in
        // Save it to user metadata if available
        const nameParts = []
        if (credential.fullName.givenName) nameParts.push(credential.fullName.givenName)
        if (credential.fullName.middleName) nameParts.push(credential.fullName.middleName)
        if (credential.fullName.familyName) nameParts.push(credential.fullName.familyName)
        const fullName = nameParts.join(' ')
        await supabase.auth.updateUser({
          data: {
            full_name: fullName,
            given_name: credential.fullName.givenName,
            family_name: credential.fullName.familyName,
          }
        })
        // User is signed in.
      }
      return true

    } catch (e : any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        setError('Erreur lors de la connexion Apple')
      }
      return false
    }
  }

 /* const signIn_Google = async () => {
    try {
      setLoading(true)
      setError(null)

      // Vérifie que Google Play Services est disponible (Android)
      await GoogleSignin.hasPlayServices()

      // Ouvre la popup Google native
      const response = await GoogleSignin.signIn()

      if (!response.data?.idToken) {
        setError('Connexion Google échouée')
        setLoading(false)
        return false
      }

      // Connecte l'utilisateur dans Supabase avec le token Google
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.data.idToken,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return false
      }

      setLoading(false)
      return true

    } catch (e: any) {
      if (e.code === statusCodes.SIGN_IN_CANCELLED) {
        // utilisateur a annulé — pas d'erreur à afficher
      } else if (e.code === statusCodes.IN_PROGRESS) {
        setError('Connexion déjà en cours')
      } else if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services non disponible')
      } else {
        setError('Erreur lors de la connexion Google')
      }
      setLoading(false)
      return false
    }
  } */

  const resetPassword = async (email: string) => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }
    setLoading(false)
    return true
  }

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    if (error) {
      setLoading(false)
      return false
    }
    setLoading(false)
    return true
  }

return { signUp, signIn, signIn_Apple, /*signIn_Google, */signOut, resetPassword, session, sessionLoading, loading, error }
}
