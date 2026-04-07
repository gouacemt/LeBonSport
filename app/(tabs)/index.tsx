import { useEffect } from 'react'
import { router } from 'expo-router'
import { supabase } from '@/services/supabase'

export default function Index() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(tabs)')
      } else {
        router.replace('/login')
      }
    })
  }, [])

  return null
}