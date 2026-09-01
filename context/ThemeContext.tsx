import { createContext, useContext } from 'react'
import { Colors } from '@/constants/theme'

type ThemeContextValue = {
  theme: 'light'
  colors: typeof Colors.light
}

const value: ThemeContextValue = { theme: 'light', colors: Colors.light }

const ThemeContext = createContext<ThemeContextValue>(value)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
