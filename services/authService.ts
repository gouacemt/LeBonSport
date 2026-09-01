import { supabase } from '@/services/supabase'

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  return password.length >= 6
}

export const signUpService = async (
  email: string,
  password: string,
  type: 'sportif' | 'coach' | 'club'
) => {
  if (!validateEmail(email)) {
    return { success: false, error: 'Adresse email invalide' }
  }
  if (!validatePassword(password)) {
    return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' }
  }

  const { error, data } = await supabase.auth.signUp({ email, password })
  if (error) return { success: false, error: error.message }

  if (data.user) {
    await supabase.from('profiles').upsert({
      id:         data.user.id,
      is_sportif: type === 'sportif',
      is_coach:   type === 'coach',
      is_club:    type === 'club',
    })
    await supabase.from('notification_settings').upsert({ user_id: data.user.id })
  }

  return { success: true, error: null }
}

export const signInService = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}

export const signOutService = async () => {
  await supabase.auth.signOut()
  return { success: true }
}

export const resetPasswordService = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}