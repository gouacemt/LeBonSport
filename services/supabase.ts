import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'

const storage = Platform.OS === 'web'
  ? {
      getItem: (key: string) =>
        typeof localStorage !== 'undefined'
          ? Promise.resolve(localStorage.getItem(key))
          : Promise.resolve(null),
      setItem: (key: string, value: string) =>
        typeof localStorage !== 'undefined'
          ? Promise.resolve(localStorage.setItem(key, value))
          : Promise.resolve(),
      removeItem: (key: string) =>
        typeof localStorage !== 'undefined'
          ? Promise.resolve(localStorage.removeItem(key))
          : Promise.resolve(),
    }
  : AsyncStorage

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)