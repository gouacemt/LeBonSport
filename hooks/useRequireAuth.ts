import { useEffect } from 'react'
import { router } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'

export function useRequireAuth() {
  const { session, sessionLoading } = useAuth()

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.replace('/(auth)/login')
    }
  }, [sessionLoading, session])

  return { session, sessionLoading }
}
