import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import * as AppleAuthentication from 'expo-apple-authentication'
import { supabase } from '@/services/supabase'

// 🔧 MODE DEV : passer à false pour réactiver Supabase
const DEV_BYPASS_AUTH = true

const DEV_SESSION: Session = {
  user: {
    id: 'dev-user-id',
    email: 'dev@lebonsport.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  },
  access_token: 'dev-token',
  refresh_token: 'dev-refresh-token',
  expires_in: 9999,
  expires_at: 9999999999,
  token_type: 'bearer',
} as unknown as Session

export function useAuth() {
  const [session, setSession] = useState<Session | null>(DEV_BYPASS_AUTH ? DEV_SESSION : null)
  const [loading, setLoading] = useState(!DEV_BYPASS_AUTH)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (DEV_BYPASS_AUTH) return

    const timeout = setTimeout(() => setLoading(false), 5000)

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout)
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    setError(null)
    if (DEV_BYPASS_AUTH) { setSession(DEV_SESSION); return true }
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); return false }
    return true
  }

  const signIn = async (email: string, password: string) => {
    setError(null)
    if (DEV_BYPASS_AUTH) { setSession(DEV_SESSION); return true }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); return false }
    return true
  }

  const signIn_Apple = async () => {
    if (DEV_BYPASS_AUTH) { setSession(DEV_SESSION); return true }
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })
      if (credential.identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        })
        if (error) { setError(error.message); return false }
      }
      if (credential.fullName) {
        const nameParts = [
          credential.fullName.givenName,
          credential.fullName.middleName,
          credential.fullName.familyName,
        ].filter(Boolean)
        await supabase.auth.updateUser({
          data: {
            full_name: nameParts.join(' '),
            given_name: credential.fullName.givenName,
            family_name: credential.fullName.familyName,
          }
        })
      }
      return true
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') setError('Connexion Apple annulée')
      return false
    }
  }

  const resetPassword = async (email: string) => {
    setError(null)
    if (DEV_BYPASS_AUTH) return true
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) { setError(error.message); return false }
    return true
  }

  const signOut = async () => {
    if (DEV_BYPASS_AUTH) { setSession(null); return }
    await supabase.auth.signOut()
  }

  return { session, loading, error, signUp, signIn, signIn_Apple, signOut, resetPassword }
}