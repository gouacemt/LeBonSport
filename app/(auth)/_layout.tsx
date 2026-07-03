import { Stack, Redirect } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'

export default function AuthLayout() {
  const { session, loading } = useAuth()

  if (loading) return null
  if (session) return <Redirect href="/(tabs)" />

  return <Stack screenOptions={{ headerShown: false }} />
}